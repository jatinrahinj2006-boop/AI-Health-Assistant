import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Search, 
  Loader2, 
  AlertOctagon, 
  ShieldAlert, 
  Bookmark, 
  BookmarkCheck,
  CheckCircle,
  FileText,
  History,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

const AUTO_SUGGESTIONS = [
  "Ibuprofen",
  "Amoxicillin",
  "Metformin",
  "Atorvastatin",
  "Lisinopril"
];

export default function MedicationLookup() {
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    // Load recent medication searches from localStorage
    const saved = localStorage.getItem('medication_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  useEffect(() => {
    // Check if current drug is bookmarked
    if (!details) return;
    const saved = localStorage.getItem('health_assistant_bookmarks') || '[]';
    const bookmarks = JSON.parse(saved);
    const found = bookmarks.some(b => b.type === 'medication' && b.title.toLowerCase() === details.name.toLowerCase());
    setIsBookmarked(found);
  }, [details]);

  const handleSearch = async (term) => {
    const query = term || searchTerm.trim();
    if (!query) return;

    if (!term) setSearchTerm('');
    
    setLoading(true);
    try {
      const data = await api.lookupMedication(query, language);
      setDetails(data);
      
      // Save search term to recent searches
      const saved = localStorage.getItem('medication_searches') || '[]';
      const searches = JSON.parse(saved);
      const filtered = searches.filter(s => s.toLowerCase() !== query.toLowerCase());
      const updated = [query, ...filtered].slice(0, 5);
      localStorage.setItem('medication_searches', JSON.stringify(updated));
      setRecentSearches(updated);

    } catch (err) {
      console.error("Failed medication search", err);
      alert("Error finding medication facts: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = () => {
    if (!details) return;
    const saved = localStorage.getItem('health_assistant_bookmarks') || '[]';
    const bookmarks = JSON.parse(saved);
    
    if (isBookmarked) {
      const filtered = bookmarks.filter(b => !(b.type === 'medication' && b.title.toLowerCase() === details.name.toLowerCase()));
      localStorage.setItem('health_assistant_bookmarks', JSON.stringify(filtered));
      setIsBookmarked(false);
    } else {
      const newBookmark = {
        type: 'medication',
        title: details.name,
        date: new Date().toLocaleDateString(),
        category: 'Medication Details'
      };
      localStorage.setItem('health_assistant_bookmarks', JSON.stringify([newBookmark, ...bookmarks]));
      setIsBookmarked(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Search Dashboard */}
      <div className="glass-panel p-6 mb-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-indigoaccent-500/10 rounded-2xl text-indigoaccent-500">
            <Pill className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold dark:text-white font-sans">{t('medicationPortal')}</h2>
          </div>
        </div>

        {/* Form Search Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex space-x-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/50 dark:border-slate-800/40 bg-slate-500/5 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-indigoaccent-500 transition-all"
              placeholder={t('searchMedication')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigoaccent-600 hover:bg-indigoaccent-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg hover:shadow-glow-indigo hover:scale-[1.02] cursor-pointer flex items-center space-x-1.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{t('search')}</span>
          </button>
        </form>

        {/* Autofill suggestions chips */}
        <div className="flex flex-wrap items-center gap-1.5 mt-4">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Suggestions:</span>
          {AUTO_SUGGESTIONS.map((sug) => (
            <button
              key={sug}
              onClick={() => handleSearch(sug)}
              className="text-[10px] px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-slate-800/40 hover:bg-slate-500/10 text-slate-500 dark:text-slate-400 font-medium transition-all cursor-pointer"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column - search history (4 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-panel p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
              <History className="w-3.5 h-3.5 mr-1.5" /> {t('recentSearches')}
            </h3>
            {recentSearches.length === 0 ? (
              <p className="text-[11px] text-slate-400 py-2">No medication searched recently.</p>
            ) : (
              <div className="space-y-2">
                {recentSearches.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(s)}
                    className="w-full p-2.5 text-left text-xs text-slate-600 dark:text-slate-300 bg-slate-500/5 hover:bg-slate-500/10 border border-slate-200/20 dark:border-slate-800/20 rounded-lg truncate cursor-pointer transition-all block font-medium"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column - details panel (9 cols) */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading-details"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel p-12 flex flex-col items-center justify-center text-center"
              >
                <Loader2 className="w-8 h-8 text-indigoaccent-500 animate-spin mb-4" />
                <p className="text-sm font-semibold dark:text-white">{t('loading')}</p>
                <p className="text-xs text-slate-400 mt-1">Sourcing pharmacological side effects and interaction warnings.</p>
              </motion.div>
            ) : details ? (
              <motion.div
                key="medication-details"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="glass-panel p-6 md:p-8 bg-white dark:bg-slate-900/60 shadow-xl border border-slate-200/80 dark:border-slate-800/50"
              >
                {/* Header detail */}
                <div className="flex justify-between items-start border-b border-slate-200/40 dark:border-slate-800/40 pb-5 mb-6">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-indigoaccent-500/10 border border-indigoaccent-500/20 text-indigoaccent-500 font-bold uppercase tracking-wider">
                        Verified Drug Profile
                      </span>
                      {details.source === 'mock' && (
                        <span className="text-[8px] px-1.5 py-0.5 bg-amber-500/15 border border-amber-500/20 text-amber-500 rounded font-bold uppercase tracking-wider">
                          Simulated
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold dark:text-white font-sans mt-2">{details.name}</h3>
                  </div>

                  <button
                    onClick={handleBookmark}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                      isBookmarked 
                        ? 'border-indigoaccent-500/30 bg-indigoaccent-500/10 text-indigoaccent-500' 
                        : 'border-slate-200/50 dark:border-slate-800/40 text-slate-400 hover:bg-slate-500/5'
                    }`}
                  >
                    {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Uses */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-sans flex items-center">
                      <FileText className="w-3.5 h-3.5 mr-1.5" /> Indicated Uses
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {details.uses.map((use, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-850 dark:text-slate-200">
                          {use}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Dosage */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-sans flex items-center">
                      <Info className="w-3.5 h-3.5 mr-1.5" /> {t('dosageLimits')}
                    </h4>
                    <p className="p-4 bg-slate-500/5 rounded-xl border border-slate-200/30 dark:border-slate-800/30 text-xs md:text-sm text-slate-700 dark:text-slate-350 leading-relaxed font-sans">
                      {details.typical_dosage}
                    </p>
                  </div>

                  {/* Side effects grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Common Side Effects */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 font-sans flex items-center">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 mr-1.5" /> {t('sideEffects')}
                      </h4>
                      <ul className="space-y-2">
                        {details.common_side_effects.map((se, i) => (
                          <li key={i} className="flex items-start text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2.5 mt-2 flex-shrink-0"></span>
                            <span>{se}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Serious Side Effects */}
                    <div>
                      <h4 className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-3 font-sans flex items-center">
                        <ShieldAlert className="w-3.5 h-3.5 mr-1.5 animate-pulse" /> {t('warnings')}
                      </h4>
                      <ul className="space-y-2">
                        {details.serious_side_effects.map((se, i) => (
                          <li key={i} className="flex items-start text-xs md:text-sm text-rose-700 dark:text-rose-350 leading-relaxed font-medium">
                            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2.5 mt-2 flex-shrink-0"></span>
                            <span>{se}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Interaction warnings */}
                  <div>
                    <h4 className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2 font-sans flex items-center">
                      <AlertOctagon className="w-4 h-4 mr-1.5" /> Crucial Interaction Warnings
                    </h4>
                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2">
                      {details.interaction_warnings.map((warn, i) => (
                        <div key={i} className="flex items-start text-xs md:text-sm text-amber-700 dark:text-amber-300 font-medium">
                          <span className="mr-2 flex-shrink-0">•</span>
                          <span>{warn}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="text-[10px] text-slate-400 italic pt-6 border-t border-slate-200/50 dark:border-slate-800/50 text-center leading-relaxed">
                    {details.disclaimer}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty-details"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel p-12 text-center"
              >
                <Pill className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-50" />
                <p className="text-sm font-semibold dark:text-white">No Medication Loaded</p>
                <p className="text-xs text-slate-400 mt-1">Use the search bar above or choose a suggested drug to load facts.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
