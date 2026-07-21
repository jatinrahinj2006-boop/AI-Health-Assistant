import os
import json
import datetime
import logging

logger = logging.getLogger("app.places_limiter")

# Target persistent JSON file at backend/data/places_usage.json
USAGE_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "data",
    "places_usage.json"
)

def get_places_usage() -> dict:
    """
    Retrieves the current usage count data.
    """
    current_month = datetime.date.today().strftime("%Y-%m")
    default_data = {"month": current_month, "count": 0}
    
    if os.path.exists(USAGE_FILE):
        try:
            with open(USAGE_FILE, "r") as f:
                data = json.load(f)
                if data.get("month") == current_month:
                    return data
        except Exception:
            pass
    return default_data

def check_and_increment_places_cap() -> bool:
    """
    Checks the monthly Places API usage cap.
    Returns True if query is allowed (and increments the count), False if limit is exceeded.
    """
    os.makedirs(os.path.dirname(USAGE_FILE), exist_ok=True)
    current_month = datetime.date.today().strftime("%Y-%m")
    
    # Read current stats
    data = {"month": current_month, "count": 0}
    if os.path.exists(USAGE_FILE):
        try:
            with open(USAGE_FILE, "r") as f:
                data = json.load(f)
        except Exception as e:
            logger.error(f"Error reading places usage file: {e}")
            
    # Reset count if it is a new month
    if data.get("month") != current_month:
        data = {"month": current_month, "count": 0}
        
    from app.config import MAX_MONTHLY_PLACES_CALLS
    
    # Deny and return False if the limit has been hit
    if data["count"] >= MAX_MONTHLY_PLACES_CALLS:
        logger.warning(f"Google Places API monthly cap of {MAX_MONTHLY_PLACES_CALLS} hit!")
        return False
        
    # Increment count
    data["count"] += 1
    
    # Warn in logs if we hit 80% usage
    warning_threshold = int(MAX_MONTHLY_PLACES_CALLS * 0.8)
    if data["count"] == warning_threshold:
        logger.warning(
            f"Google Places API monthly usage reached 80% ({data['count']}/{MAX_MONTHLY_PLACES_CALLS})"
        )
        
    try:
        with open(USAGE_FILE, "w") as f:
            json.dump(data, f)
    except Exception as e:
        logger.error(f"Error writing places usage file: {e}")
        
    return True
