from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional
import math
import httpx
import logging
import urllib.parse
from app.config import GOOGLE_PLACES_API_KEY, MAX_MONTHLY_PLACES_CALLS
from app.services.places_limiter import check_and_increment_places_cap, get_places_usage

logger = logging.getLogger("app.nearby_specialists")

router = APIRouter(prefix="/api/nearby-specialists", tags=["Nearby Specialists"])

# Closed list of specialties plain-language mapping to clinical search keywords
SPECIALTY_MAPPING = {
    "Brain & Nerve Doctor": "neurologist",
    "Brain Surgeon": "neurosurgeon",
    "Heart Doctor": "cardiologist",
    "Bone & Joint Doctor": "orthopedist",
    "Skin Doctor": "dermatologist",
    "Ear/Nose/Throat Doctor": "ent specialist",
    "Eye Doctor": "ophthalmologist",
    "Stomach & Digestion Doctor": "gastroenterologist",
    "Cancer Doctor": "oncologist",
    "Kidney Doctor": "nephrologist",
    "Lung Doctor": "pulmonologist",
    "Women's Health Doctor": "gynecologist",
    "Child Doctor": "pediatrician",
    "Mental Health Doctor": "psychiatrist",
    "Dentist": "dentist",
    "General Doctor": "general physician"
}

class NearbySpecialistsRequest(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None  # city or pincode manual entry fallback
    specialty: str = Field(..., description="Plain-language specialty from the closed set")
    radius_km: float = Field(default=10.0, description="Search radius in kilometers")

class SpecialistPlace(BaseModel):
    name: str
    address: str
    distance_km: Optional[float] = None
    rating: Optional[float] = None
    user_ratings_total: Optional[int] = None
    google_maps_url: str
    latitude: float
    longitude: float
    place_id: Optional[str] = None

class NearbySpecialistsResponse(BaseModel):
    specialists: List[SpecialistPlace]
    usage_count: int
    limit_reached: bool
    source: str = Field("live", description="'live' or 'mock'")

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Haversine formula to compute straight-line distance in km.
    """
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def generate_mock_specialists(
    lat: float, lon: float, specialty: str
) -> List[SpecialistPlace]:
    """
    Generates dynamic mock specialists near a given coordinate.
    """
    # 5 Mock clinics with random offsets
    mock_names = [
        f"CuraHealth {specialty} Care Clinic",
        f"Apex Health {specialty} Specialists",
        f"City Medical {specialty} Center",
        f"Metro Care {specialty} & Diagnostics",
        f"Saint Jude {specialty} Hospital"
    ]
    
    # 5 Coordinate offsets (lat offset, lon offset)
    offsets = [
        (0.012, -0.008),
        (-0.018, 0.014),
        (0.009, 0.021),
        (-0.025, -0.019),
        (0.003, -0.002)
    ]
    
    places = []
    for i, name in enumerate(mock_names):
        o_lat = lat + offsets[i][0]
        o_lon = lon + offsets[i][1]
        dist = calculate_distance(lat, lon, o_lat, o_lon)
        
        place_id = f"mock_place_{specialty.replace(' ', '_').lower()}_{i}"
        maps_url = f"https://www.google.com/maps/search/?api=1&query={urllib.parse.quote(name)}&query_place_id={place_id}"
        
        places.append(SpecialistPlace(
            name=name,
            address=f"Suite {100 + i * 24}, Healthcare Boulevard, Ward 4, Mumbai, MH",
            distance_km=dist,
            rating=round(4.0 + (i % 10) * 0.1, 1),
            user_ratings_total=12 + i * 37,
            google_maps_url=maps_url,
            latitude=round(o_lat, 6),
            longitude=round(o_lon, 6),
            place_id=place_id
        ))
        
    return places

@router.post("", response_model=NearbySpecialistsResponse)
async def get_nearby_specialists(payload: NearbySpecialistsRequest):
    # Validate specialty
    if payload.specialty not in SPECIALTY_MAPPING:
        raise HTTPException(
            status_code=400,
            detail=f"Specialty must be one of the plain-language strings from the closed set."
        )

    # 1. Enforce Server-Side Request Monthly Cap
    allowed = check_and_increment_places_cap()
    usage = get_places_usage()
    
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="Nearby specialist search is temporarily unavailable — monthly limit reached. Try again next month."
        )

    clinical_query = SPECIALTY_MAPPING[payload.specialty]
    
    # 2. Key Check and Mock Fallback
    is_placeholder = (
        not GOOGLE_PLACES_API_KEY or 
        GOOGLE_PLACES_API_KEY.lower().strip() in ["", "your_places_api_key", "change_me", "placeholder", "your_api_key_here"]
    )
    if is_placeholder:
        # Generate mock lists centered around Mumbai or user coordinate
        center_lat = payload.latitude if payload.latitude is not None else 19.0760
        center_lon = payload.longitude if payload.longitude is not None else 72.8777
        
        specialists = generate_mock_specialists(center_lat, center_lon, payload.specialty)
        # Sort ascending by distance
        specialists.sort(key=lambda x: x.distance_km if x.distance_km is not None else 9999)
        
        return NearbySpecialistsResponse(
            specialists=specialists,
            usage_count=usage["count"],
            limit_reached=False,
            source="mock"
        )

    # 3. Live Google Places API Text Search Call
    try:
        # Build search query
        if payload.address:
            query = f"{clinical_query} doctor in {payload.address}"
        else:
            query = f"{clinical_query} doctor"

        url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
        params = {
            "query": query,
            "key": GOOGLE_PLACES_API_KEY
        }
        
        # Add location biasing if user coords are present
        if payload.latitude is not None and payload.longitude is not None:
            params["location"] = f"{payload.latitude},{payload.longitude}"
            params["radius"] = str(int(payload.radius_km * 1000)) # in meters

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=10.0)
            
        if response.status_code != 200:
            logger.error(f"Google Places API error: {response.text}")
            raise HTTPException(status_code=502, detail="Failed to fetch details from Google Places API.")
            
        data = response.json()
        status = data.get("status")
        if status not in ["OK", "ZERO_RESULTS"]:
            error_msg = data.get("error_message", "Google Places API error status.")
            raise Exception(f"Google Places API error: {status} - {error_msg}")
            
        results = data.get("results", [])
        
        places = []
        for r in results:
            geom = r.get("geometry", {})
            loc = geom.get("location", {})
            p_lat = loc.get("lat")
            p_lng = loc.get("lng")
            
            # Compute distance if user coordinates are available
            dist = None
            if payload.latitude is not None and payload.longitude is not None and p_lat is not None and p_lng is not None:
                dist = calculate_distance(payload.latitude, payload.longitude, p_lat, p_lng)
                
            place_id = r.get("place_id")
            maps_url = f"https://www.google.com/maps/search/?api=1&query={urllib.parse.quote(r.get('name', ''))}&query_place_id={place_id}"
            
            places.append(SpecialistPlace(
                name=r.get("name", "Unknown Practice"),
                address=r.get("formatted_address", "No Address Listed"),
                distance_km=dist,
                rating=r.get("rating"),
                user_ratings_total=r.get("user_ratings_total"),
                google_maps_url=maps_url,
                latitude=p_lat or 0.0,
                longitude=p_lng or 0.0,
                place_id=place_id
            ))
            
        # 4. Sort results by distance ascending
        places.sort(key=lambda x: x.distance_km if x.distance_km is not None else 9999)
        
        return NearbySpecialistsResponse(
            specialists=places,
            usage_count=usage["count"],
            limit_reached=False,
            source="live"
        )
        
    except Exception as e:
        logger.error(f"Places query failed: {e}")
        # Graceful fallback to mock instead of complete crash
        center_lat = payload.latitude if payload.latitude is not None else 19.0760
        center_lon = payload.longitude if payload.longitude is not None else 72.8777
        specialists = generate_mock_specialists(center_lat, center_lon, payload.specialty)
        specialists.sort(key=lambda x: x.distance_km if x.distance_km is not None else 9999)
        
        return NearbySpecialistsResponse(
            specialists=specialists,
            usage_count=usage["count"],
            limit_reached=False,
            source="mock"
        )
