import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Search, 
  Loader2, 
  Navigation, 
  Star, 
  AlertTriangle, 
  Compass, 
  ChevronRight, 
  Info,
  Map as MapIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

const SPECIALTIES = [
  { id: 'general_physician', labelKey: 'spec_general_physician', query: 'General Doctor' },
  { id: 'pediatrician', labelKey: 'spec_pediatrician', query: 'Child Doctor' },
  { id: 'cardiologist', labelKey: 'spec_cardiologist', query: 'Heart Doctor' },
  { id: 'orthopedist', labelKey: 'spec_orthopedist', query: 'Bone & Joint Doctor' },
  { id: 'dermatologist', labelKey: 'spec_dermatologist', query: 'Skin Doctor' },
  { id: 'ent', labelKey: 'spec_ent', query: 'Ear/Nose/Throat Doctor' },
  { id: 'ophthalmologist', labelKey: 'spec_ophthalmologist', query: 'Eye Doctor' },
  { id: 'gastroenterologist', labelKey: 'spec_gastroenterologist', query: 'Stomach & Digestion Doctor' },
  { id: 'neurologist', labelKey: 'spec_neurologist', query: 'Brain & Nerve Doctor' },
  { id: 'neurosurgeon', labelKey: 'spec_neurosurgeon', query: 'Brain Surgeon' },
  { id: 'oncologist', labelKey: 'spec_oncologist', query: 'Cancer Doctor' },
  { id: 'nephrologist', labelKey: 'spec_nephrologist', query: 'Kidney Doctor' },
  { id: 'pulmonologist', labelKey: 'spec_pulmonologist', query: 'Lung Doctor' },
  { id: 'gynecologist', labelKey: 'spec_gynecologist', query: "Women's Health Doctor" },
  { id: 'psychiatrist', labelKey: 'spec_psychiatrist', query: 'Mental Health Doctor' },
  { id: 'dentist', labelKey: 'spec_dentist', query: 'Dentist' }
];

export default function NearbySpecialists() {
  const { language, t } = useLanguage();
  
  // Location States
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState('');
  const [geoRequested, setGeoRequested] = useState(false);
  const [geoDenied, setGeoDenied] = useState(false);
  const [locating, setLocating] = useState(false);
  
  // Search States
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [radius, setRadius] = useState(10);
  const [loading, setLoading] = useState(false);
  const [specialists, setSpecialists] = useState([]);
  const [dataSource, setDataSource] = useState('live');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [searchTriggered, setSearchTriggered] = useState(false);

  // Check if coordinates were pre-saved this session or check URL params
  useEffect(() => {
    // Check if auto-redirected with a specialty from symptom checker
    const params = new URLSearchParams(window.location.search);
    const specParam = params.get('specialty');
    
    const cachedLat = sessionStorage.getItem('user_lat');
    const cachedLng = sessionStorage.getItem('user_lng');
    const cachedAddr = sessionStorage.getItem('user_address');
    
    if (cachedLat && cachedLng) {
      const parsedCoords = {
        latitude: parseFloat(cachedLat),
        longitude: parseFloat(cachedLng)
      };
      setCoords(parsedCoords);
      setGeoRequested(true);
      
      if (specParam) {
        const found = SPECIALTIES.find(s => s.query.toLowerCase() === specParam.toLowerCase());
        if (found) {
          setSelectedSpecialty(found);
          triggerSearch(parsedCoords, '', found, radius);
        }
      }
    } else if (cachedAddr) {
      setAddress(cachedAddr);
      setGeoRequested(true);
      setGeoDenied(true);
      
      if (specParam) {
        const found = SPECIALTIES.find(s => s.query.toLowerCase() === specParam.toLowerCase());
        if (found) {
          setSelectedSpecialty(found);
          triggerSearch(null, cachedAddr, found, radius);
        }
      }
    }
  }, []);

  const handleRequestGeolocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      setGeoDenied(true);
      setLocating(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userCoords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        };
        setCoords(userCoords);
        sessionStorage.setItem('user_lat', pos.coords.latitude.toString());
        sessionStorage.setItem('user_lng', pos.coords.longitude.toString());
        setGeoRequested(true);
        setGeoDenied(false);
        setLocating(false);
        
        // If specialty was already selected, trigger search
        if (selectedSpecialty) {
          triggerSearch(userCoords, '', selectedSpecialty, radius);
        }
      },
      (err) => {
        console.warn("Geolocation permission denied or failed:", err);
        setGeoDenied(true);
        setGeoRequested(true);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!address.trim()) return;
    
    sessionStorage.setItem('user_address', address.trim());
    sessionStorage.removeItem('user_lat');
    sessionStorage.removeItem('user_lng');
    setCoords(null);
    
    if (selectedSpecialty) {
      triggerSearch(null, address.trim(), selectedSpecialty, radius);
    }
  };

  const handleSpecialtyClick = (specialty) => {
    setSelectedSpecialty(specialty);
    if (!geoRequested) {
      // Prompt for geolocation first
      return;
    }
    triggerSearch(coords, address, specialty, radius);
  };

  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius);
    if (selectedSpecialty) {
      triggerSearch(coords, address, selectedSpecialty, newRadius);
    }
  };

  const triggerSearch = async (userCoords, userAddress, specialty, searchRadius) => {
    if (!userCoords && (!userAddress || !userAddress.trim())) {
      setSpecialists([]);
      setSelectedPlace(null);
      setSearchTriggered(true);
      return;
    }
    setLoading(true);
    setSearchTriggered(true);
    try {
      const lat = userCoords ? userCoords.latitude : null;
      const lng = userCoords ? userCoords.longitude : null;
      const data = await api.searchNearbySpecialists(lat, lng, userAddress || null, specialty.query, searchRadius);
      
      setSpecialists(data.specialists || []);
      setDataSource(data.source || 'live');
      
      if (data.specialists && data.specialists.length > 0) {
        setSelectedPlace(data.specialists[0]);
      } else {
        setSelectedPlace(null);
      }
    } catch (err) {
      console.error("Failed to query nearby specialists", err);
      // Empty out results gracefully instead of crashing
      setSpecialists([]);
      setSelectedPlace(null);
    } finally {
      setLoading(false);
    }
  };

  // Build the Keyless Google Map Embed URL
  const getMapUrl = () => {
    if (!selectedPlace) return '';
    const hl = language === 'hi' ? 'hi' : language === 'mr' ? 'mr' : 'en';
    return `https://maps.google.com/maps?q=${selectedPlace.latitude},${selectedPlace.longitude}&hl=${hl}&z=15&output=embed`;
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-6">
      
      {/* 1. Header Area */}
      <div className="glass-panel p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-health-500/10 rounded-2xl text-health-500">
            <Compass className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold dark:text-white font-sans">{t('findSpecialist')}</h2>
            <p className="text-xs text-slate-400">{t('findCareText')}</p>
          </div>
        </div>
      </div>

      {/* 2. Geolocation Request Widget */}
      {!geoRequested && (
        <div className="glass-panel p-8 text-center max-w-xl mx-auto space-y-6 border border-health-500/20 shadow-xl bg-gradient-to-b from-health-950/20 to-transparent">
          <div className="p-4 bg-health-500/10 text-health-500 rounded-full w-fit mx-auto animate-bounce">
            <MapPin className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold dark:text-white">{t('findSpecialist')}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t('geoPrompt')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={handleRequestGeolocation}
              disabled={locating}
              className="px-6 py-3 bg-health-500 hover:bg-health-600 text-white font-semibold text-sm rounded-xl transition-all shadow-lg hover:shadow-glow-teal flex items-center space-x-2 cursor-pointer"
            >
              {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
              <span>{t('allowLocation')}</span>
            </button>
            <button
              onClick={() => {
                setGeoRequested(true);
                setGeoDenied(true);
              }}
              className="px-4 py-3 bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 hover:text-slate-200 text-sm font-semibold rounded-xl transition-all cursor-pointer"
            >
              Enter manually
            </button>
          </div>
        </div>
      )}

      {geoRequested && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Controls column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Location & Radius Control Panel */}
            <div className="glass-panel p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Search Origin</span>
                {!geoDenied && (
                  <span className="text-[10px] px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-500 rounded-full font-bold">GPS Active</span>
                )}
              </div>

              {geoDenied ? (
                <form onSubmit={handleManualSearch} className="flex space-x-2">
                  <input
                    type="text"
                    required
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200/50 dark:border-slate-800/40 bg-slate-500/5 text-slate-850 dark:text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-health-500"
                    placeholder={t('enterAddress')}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="p-2 bg-health-500 text-white rounded-lg hover:bg-health-600 cursor-pointer flex items-center justify-center"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between p-3 bg-slate-500/5 rounded-xl border border-slate-200/30 dark:border-slate-800/30 text-xs">
                  <span className="text-slate-400 truncate max-w-[200px]">Latitude: {coords?.latitude.toFixed(4)}, Longitude: {coords?.longitude.toFixed(4)}</span>
                  <button 
                    onClick={() => setGeoDenied(true)}
                    className="text-[10px] text-health-500 font-bold hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* Radius slider */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200/25 dark:border-slate-800/25">
                <div className="flex justify-between text-xs font-semibold text-slate-400">
                  <span>{t('searchRadius')}</span>
                  <span className="text-health-500 font-bold">{radius} {t('km')}</span>
                </div>
                <div className="flex space-x-2">
                  {[5, 10, 25, 50].map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRadiusChange(r)}
                      className={`flex-1 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                        radius === r
                          ? 'bg-health-500 border-health-500 text-white'
                          : 'border-slate-200/50 dark:border-slate-800/40 text-slate-400 hover:bg-slate-500/5'
                      }`}
                    >
                      {r} {t('km')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Specialties Chips List */}
            <div className="glass-panel p-5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-4">Select Specialist Type</span>
              <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                {SPECIALTIES.map((spec) => {
                  const isSelected = selectedSpecialty?.id === spec.id;
                  return (
                    <button
                      key={spec.id}
                      onClick={() => handleSpecialtyClick(spec)}
                      className={`w-full p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                        isSelected 
                          ? 'bg-health-500 border-health-500 text-white shadow-glow-teal hover:bg-health-600' 
                          : 'border-slate-200/50 dark:border-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-500/5 bg-slate-500/5'
                      }`}
                    >
                      <span>{t(spec.labelKey)}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Results column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Warnings/Mock Indicator */}
            {dataSource === 'mock' && searchTriggered && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-center space-x-2 text-amber-500 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-pulse" />
                <span>{t('demoMockBadge')}</span>
              </div>
            )}

            {!searchTriggered ? (
              <div className="glass-panel p-12 text-center text-slate-400 flex flex-col items-center justify-center h-[450px]">
                <MapIcon className="w-16 h-16 text-slate-500 mb-4 opacity-40" />
                <h3 className="text-base font-bold dark:text-white mb-1">Select a specialty to begin search</h3>
                <p className="text-xs max-w-sm">Choose one of the specialized plain-language doctor filters on the left to locate local clinics and hospitals.</p>
              </div>
            ) : (!coords && !address.trim()) ? (
              <div className="glass-panel p-12 text-center text-slate-400 flex flex-col items-center justify-center h-[450px]">
                <MapPin className="w-16 h-16 text-health-500 mb-4 opacity-40" />
                <h3 className="text-base font-bold dark:text-white mb-1">Location Required</h3>
                <p className="text-xs max-w-sm">Please allow location access or type a city/pincode in the left panel to search for specialists.</p>
              </div>
            ) : loading ? (
              <div className="glass-panel p-12 text-center text-slate-400 flex flex-col items-center justify-center h-[450px]">
                <Loader2 className="w-12 h-12 text-health-500 animate-spin mb-4" />
                <h3 className="text-sm font-bold dark:text-white">
                  Finding {selectedSpecialty ? t(selectedSpecialty.labelKey) : 'Doctors'} near you...
                </h3>
              </div>
            ) : specialists.length === 0 ? (
              <div className="glass-panel p-12 text-center text-slate-400 flex flex-col items-center justify-center h-[450px]">
                <AlertTriangle className="w-12 h-12 text-amber-500 mb-4 opacity-60" />
                <h3 className="text-sm font-semibold dark:text-white mb-2">{t('noSpecialists')}</h3>
                <button
                  onClick={() => handleRadiusChange(radius === 50 ? 10 : 50)}
                  className="px-4 py-2 bg-health-500 hover:bg-health-600 text-white rounded-xl text-xs font-semibold"
                >
                  Expand Search Radius
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px]">
                
                {/* List View */}
                <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2">
                  {specialists.map((place) => {
                    const isSelected = selectedPlace?.place_id === place.place_id;
                    return (
                      <div
                        key={place.place_id}
                        onClick={() => setSelectedPlace(place)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-[160px] ${
                          isSelected
                            ? 'bg-health-500/10 border-health-500 shadow-sm'
                            : 'border-slate-200/40 dark:border-slate-800/40 bg-slate-500/5 hover:bg-slate-500/10'
                        }`}
                      >
                        <div>
                          <h4 className="text-xs md:text-sm font-bold dark:text-white line-clamp-1">{place.name}</h4>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-1">{place.address}</p>
                          
                          {/* Rating and Distance */}
                          <div className="flex items-center space-x-3 mt-2 text-[10px]">
                            {place.rating !== null && (
                              <div className="flex items-center text-amber-500 font-bold">
                                <Star className="w-3.5 h-3.5 fill-current mr-1" />
                                <span>{place.rating} ({place.user_ratings_total})</span>
                              </div>
                            )}
                            {place.distance_km !== null && (
                              <span className="text-slate-400 font-semibold">{place.distance_km} {t('km')} away</span>
                            )}
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="flex space-x-2 pt-2 border-t border-slate-200/25 dark:border-slate-800/25">
                          <button
                            onClick={() => setSelectedPlace(place)}
                            className="flex-1 py-1.5 bg-slate-850 hover:bg-slate-800 dark:hover:bg-slate-800/50 text-[10px] font-semibold text-slate-300 rounded-lg text-center cursor-pointer transition-all border border-slate-700/30"
                          >
                            {t('viewOnMap')}
                          </button>
                          <a
                            href={place.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-1.5 bg-health-500 hover:bg-health-600 text-[10px] font-semibold text-white rounded-lg text-center cursor-pointer transition-all block"
                          >
                            {t('getDirections')}
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Map View */}
                <div className="rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800/40 shadow-xl bg-slate-900/50 relative h-full flex flex-col">
                  {selectedPlace ? (
                    <>
                      <div className="p-3 bg-slate-500/5 border-b border-slate-200/30 dark:border-slate-800/30 text-[10px] flex items-center justify-between">
                        <span className="font-bold dark:text-white truncate pr-2">{selectedPlace.name}</span>
                        <a 
                          href={selectedPlace.google_maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-health-500 hover:underline flex-shrink-0 font-bold"
                        >
                          Directions
                        </a>
                      </div>
                      <iframe
                        title="Embedded Doctor Location Map"
                        src={getMapUrl()}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        className="flex-1 invert-[0.88] hue-rotate-[180deg] dark:invert-0 dark:hue-rotate-0"
                      />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 p-6 text-center">
                      <MapIcon className="w-12 h-12 mb-2 opacity-50" />
                      <p className="text-xs">No clinic selected to map.</p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Disclaimer block */}
            <div className="p-4 bg-slate-500/5 border border-slate-200/30 dark:border-slate-800/30 rounded-2xl flex items-start space-x-2 text-[10px] leading-relaxed text-slate-400">
              <Info className="w-4 h-4 text-health-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong>{t('medicalDisclaimer')}:</strong> {t('providerSearchDisclaimer')}
              </span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
