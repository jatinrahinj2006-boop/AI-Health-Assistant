import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ChevronRight, 
  Activity, 
  Bookmark, 
  BookmarkCheck,
  Shield, 
  Calendar, 
  Loader2, 
  Utensils, 
  Moon, 
  Dumbbell, 
  Smile, 
  ClipboardCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';

const AGE_GROUPS = [
  { id: '20s', label: '20s - 30s', range: '20-39' },
  { id: '40s', label: '40s - 50s', range: '40-59' },
  { id: '60s', label: '60s+', range: '60+' }
];

const SCREENINGS = {
  '20s': [
    { test: 'Blood Pressure Check', frequency: 'Every 2 years', description: 'Screening for hypertension.' },
    { test: 'Cholesterol Panel', frequency: 'Every 5 years', description: 'Assesses cardiovascular risk markers.' },
    { test: 'Dental Examination & Clean', frequency: 'Every 6-12 months', description: 'Prevents periodontal disease and cavities.' },
    { test: 'Vision screening', frequency: 'Every 2 years', description: 'Basic refractive error check.' }
  ],
  '40s': [
    { test: 'Blood Pressure Check', frequency: 'Annually', description: 'Hypertension monitoring.' },
    { test: 'Diabetes Screening (A1C)', frequency: 'Every 3 years starting at 45', description: 'Evaluates fasting glucose and HbA1C values.' },
    { test: 'Cardiovascular Risk Assessment', frequency: 'Every 2-3 years', description: 'Coronary risk scoring.' },
    { test: 'Colorectal Cancer Screening', frequency: 'Every 5-10 years starting at 45', description: 'Colonoscopy or FIT testing.' },
    { test: 'Mammogram (Women)', frequency: 'Every 1-2 years starting at 40', description: 'Breast cancer early screening.' }
  ],
  '60s': [
    { test: 'Colorectal Cancer Screening', frequency: 'Regular interval to age 75', description: 'Colon cancer screening.' },
    { test: 'Bone Density Scan (Osteoporosis)', frequency: 'Once at 65 (or earlier if high risk)', description: 'DEXA scan for bone mineral density.' },
    { test: 'Diabetes screening', frequency: 'Every 3 years', description: 'Type 2 diabetes monitoring.' },
    { test: 'Shingles & Pneumonia Vaccine', frequency: 'One-time/Intervals', description: 'Protective adult vaccinations.' },
    { test: 'Abdominal Aortic Aneurysm (Men)', frequency: 'Once between 65-75 if ever smoked', description: 'Ultrasound screening.' }
  ]
};

export default function PreventiveCare() {
  const [selectedAge, setSelectedAge] = useState('20s');
  const [category, setCategory] = useState('General');
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookmarkedItems, setBookmarkedItems] = useState([]);

  useEffect(() => {
    // Fetch daily tips for wellness section
    const fetchTips = async () => {
      setLoading(true);
      try {
        const data = await api.getHealthTips(category);
        setTips(data.tips || []);
      } catch (err) {
        console.error('Failed to load wellness tips', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTips();
  }, [category]);

  useEffect(() => {
    // Load bookmarks
    const saved = localStorage.getItem('health_assistant_bookmarks') || '[]';
    setBookmarkedItems(JSON.parse(saved));
  }, []);

  const handleToggleBookmark = (title, content) => {
    const saved = localStorage.getItem('health_assistant_bookmarks') || '[]';
    const list = JSON.parse(saved);
    const found = list.some(b => b.title === title);

    let updated;
    if (found) {
      updated = list.filter(b => b.title !== title);
    } else {
      updated = [
        {
          type: 'wellness tip',
          title: title,
          content: content,
          category: category,
          date: new Date().toLocaleDateString()
        },
        ...list
      ];
    }
    localStorage.setItem('health_assistant_bookmarks', JSON.stringify(updated));
    setBookmarkedItems(updated);
  };

  const isBookmarked = (title) => {
    return bookmarkedItems.some(b => b.title === title);
  };

  const getCategoryIcon = (cat) => {
    switch (cat.toLowerCase()) {
      case 'nutrition': return <Utensils className="w-5 h-5 text-emerald-500" />;
      case 'sleep': return <Moon className="w-5 h-5 text-indigo-400" />;
      case 'fitness': return <Dumbbell className="w-5 h-5 text-amber-500" />;
      case 'mental health': return <Smile className="w-5 h-5 text-pink-500" />;
      default: return <Heart className="w-5 h-5 text-health-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-health-500/10 rounded-2xl text-health-500">
            <ClipboardCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold dark:text-white font-sans">Preventive Care & Wellness Center</h2>
            <p className="text-xs text-slate-400">Access personalized clinical screenings guidelines and daily evidence-based health actions</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Panel: Age-based screenings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-health-500" />
                <h3 className="text-base font-bold dark:text-white">Recommended Screenings</h3>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-500/5 px-2 py-1 rounded">Clinical Guidelines</span>
            </div>

            {/* Age selectors */}
            <div className="flex space-x-2 mb-6">
              {AGE_GROUPS.map((grp) => (
                <button
                  key={grp.id}
                  onClick={() => setSelectedAge(grp.id)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    selectedAge === grp.id
                      ? 'bg-health-500 border-health-500 text-white shadow-glow-teal hover:bg-health-600'
                      : 'border-slate-200/50 dark:border-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-500/5'
                  }`}
                >
                  {grp.label}
                </button>
              ))}
            </div>

            {/* Screening list */}
            <div className="space-y-4">
              {SCREENINGS[selectedAge].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-500/5 hover:bg-slate-500/10 transition-all flex items-start justify-between"
                >
                  <div className="pr-4 space-y-1">
                    <h4 className="text-xs font-bold dark:text-white flex items-center">
                      <span className="w-1.5 h-1.5 bg-health-500 rounded-full mr-2"></span>
                      {item.test}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-300 font-light leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-health-600 dark:text-health-400 bg-health-500/10 border border-health-500/20 px-2 py-1 rounded-lg flex-shrink-0">
                    {item.frequency}
                  </span>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-6 flex items-center space-x-2 text-[10px] text-slate-400 border-t border-slate-200/25 dark:border-slate-800/25 pt-4">
              <Calendar className="w-3.5 h-3.5" />
              <span>Guidelines sourced from USPSTF (US Preventive Services Task Force). Consult your physician.</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Daily Tips & Life Habits (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold dark:text-white">wellness Habits</h3>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-1.5 mb-6">
                {['General', 'Nutrition', 'Sleep', 'Fitness', 'Mental Health'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`text-[10px] px-2 py-2 rounded-lg transition-all cursor-pointer font-semibold ${
                      category === cat
                        ? 'bg-indigoaccent-500 text-white shadow-sm shadow-indigoaccent-500/10'
                        : 'bg-slate-500/10 text-slate-500 dark:text-slate-400 hover:bg-slate-500/20'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="space-y-4 py-8 flex flex-col items-center justify-center">
                  <Loader2 className="w-6 h-6 text-indigoaccent-500 animate-spin" />
                  <span className="text-xs text-slate-400">Loading daily habits...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {tips.map((tip, idx) => {
                    const saved = isBookmarked(tip.title);
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-500/5 hover:bg-slate-500/10 transition-all flex items-start justify-between"
                      >
                        <div className="flex items-start space-x-3 overflow-hidden mr-2">
                          <div className="p-2 bg-slate-500/10 dark:bg-slate-800/35 rounded-lg flex-shrink-0">
                            {getCategoryIcon(category)}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{tip.title}</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1 font-light">
                              {tip.content}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleBookmark(tip.title, tip.content)}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            saved ? 'text-rose-500' : 'text-slate-400 hover:bg-slate-500/10'
                          }`}
                        >
                          {saved ? <BookmarkCheck className="w-4.5 h-4.5" /> : <Bookmark className="w-4.5 h-4.5" />}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="text-center mt-6 pt-4 border-t border-slate-200/25 dark:border-slate-800/25">
              <span className="text-[9px] text-slate-400 italic">
                Wellness habits promote lifestyle modifications to improve clinical baseline indicators.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
