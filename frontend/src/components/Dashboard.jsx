import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Stethoscope, 
  Pill, 
  Camera, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  Bookmark, 
  ChevronRight,
  ArrowRight,
  Shield,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const cardVariants = {
  hover: { scale: 1.02, y: -4, transition: { type: "spring", stiffness: 300 } }
};

export default function Dashboard({ onStartSymptomCheck }) {
  const navigate = useNavigate();
  const [dailyTips, setDailyTips] = useState([]);
  const [recentConsults, setRecentConsults] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loadingTips, setLoadingTips] = useState(true);
  const [tipCategory, setTipCategory] = useState("General");
  const [tipsSource, setTipsSource] = useState("live");
  const [activityTab, setActivityTab] = useState('symptoms'); // 'symptoms' or 'chats'

  useEffect(() => {
    // Fetch daily tips
    const fetchTips = async () => {
      setLoadingTips(true);
      try {
        const data = await api.getHealthTips(tipCategory);
        setDailyTips(data.tips || []);
        setTipsSource(data.source || "live");
      } catch (err) {
        console.error("Failed to load health tips", err);
      } finally {
        setLoadingTips(false);
      }
    };
    fetchTips();
  }, [tipCategory]);

  useEffect(() => {
    // Load recent consults from localStorage
    const saved = localStorage.getItem('health_assistant_consults');
    if (saved) {
      setRecentConsults(JSON.parse(saved).slice(0, 4));
    }

    // Load recent chats
    const savedChats = localStorage.getItem('health_assistant_chats');
    if (savedChats) {
      try {
        const chatDict = JSON.parse(savedChats);
        const chatList = Object.values(chatDict)
          .sort((a, b) => {
            const timeA = a.id.split('_')[1] || 0;
            const timeB = b.id.split('_')[1] || 0;
            return timeB - timeA;
          })
          .slice(0, 4);
        setRecentChats(chatList);
      } catch (e) {
        console.error("Failed to load chat history", e);
      }
    }

    // Load bookmarks
    const savedBooks = localStorage.getItem('health_assistant_bookmarks');
    if (savedBooks) {
      setBookmarks(JSON.parse(savedBooks).slice(0, 4));
    }
  }, []);

  const handleStartChecker = () => {
    navigate('/symptoms');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Welcoming Premium Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-6 md:p-8 border border-slate-200/50 dark:border-slate-800/40 bg-gradient-to-r from-health-950 via-darkbg-accent to-darkbg-base text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-health-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 rounded-full bg-indigoaccent-500/10 blur-3xl"></div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-health-500/10 border border-health-500/20 text-health-300 text-xs font-semibold mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>Encrypted & Confidential AI Care</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Digital Health <span className="text-glow-teal font-medium">Intelligence</span> at Your Service
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
            Get instant clinical evaluations, check medication facts, or speak with our AI wellness assistant. 
            All insights are structured and backed by safety filters.
          </p>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleStartChecker}
              className="px-5 py-3 rounded-xl bg-health-500 hover:bg-health-600 font-medium text-sm flex items-center space-x-2 transition-all hover:shadow-glow-teal hover:scale-[1.02] cursor-pointer"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Symptom Assessment</span>
            </button>
            <button 
              onClick={() => navigate('/chat')}
              className="px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/50 font-medium text-sm flex items-center space-x-2 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask AI Chat</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. Interactive Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Guided Symptom Checker */}
        <motion.div 
          whileHover="hover"
          variants={cardVariants}
          className="glass-panel p-6 flex flex-col justify-between"
        >
          <div>
            <div className="p-3 bg-health-500/10 dark:bg-health-500/5 text-health-500 dark:text-health-400 rounded-2xl w-fit mb-4">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2 dark:text-white font-sans">Guided Symptom Checker</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Engage in an adaptive questionnaire clarifying symptoms to generate a structured clinical assessment report.
            </p>
          </div>
          <button 
            onClick={() => navigate('/symptoms')}
            className="text-xs font-semibold text-health-500 dark:text-health-400 hover:text-health-600 dark:hover:text-health-300 flex items-center space-x-1 cursor-pointer transition-all self-start group"
          >
            <span>Run Symptom Check</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>

        {/* Card 2: Medication lookup */}
        <motion.div 
          whileHover="hover"
          variants={cardVariants}
          className="glass-panel p-6 flex flex-col justify-between"
        >
          <div>
            <div className="p-3 bg-indigoaccent-500/10 dark:bg-indigoaccent-500/5 text-indigoaccent-500 dark:text-indigoaccent-400 rounded-2xl w-fit mb-4">
              <Pill className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2 dark:text-white font-sans">Medication Facts Lookup</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Analyze dosage limits, generic names, potential drug interactions, and warning disclaimers.
            </p>
          </div>
          <button 
            onClick={() => navigate('/medication')}
            className="text-xs font-semibold text-indigoaccent-500 dark:text-indigoaccent-400 hover:text-indigoaccent-600 dark:hover:text-indigoaccent-300 flex items-center space-x-1 cursor-pointer transition-all self-start group"
          >
            <span>Lookup Medication</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>

        {/* Card 3: Camera Upload Vision LLM */}
        <motion.div 
          whileHover="hover"
          variants={cardVariants}
          className="glass-panel p-6 flex flex-col justify-between"
        >
          <div>
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 dark:text-amber-400 w-fit mb-4">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2 dark:text-white font-sans">Visual Health Analyzer</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Upload prescription labels, pill packaging, or visible skin irritation details for vision analysis.
            </p>
          </div>
          <button 
            onClick={() => navigate('/vision')}
            className="text-xs font-semibold text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 flex items-center space-x-1 cursor-pointer transition-all self-start group"
          >
            <span>Analyze Image</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>

      {/* 3. Bottom Panels: Recent Consults / Bookmarks & Daily Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Recent & Bookmarks (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Recent Activity */}
          <div className="glass-panel p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-slate-200/25 dark:border-slate-800/25 gap-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-health-500" />
                <h3 className="text-base font-bold dark:text-white">Recent Activity</h3>
              </div>

              {/* Sub-tabs selector */}
              <div className="flex space-x-1.5 p-1 bg-slate-500/5 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 rounded-xl">
                <button
                  onClick={() => setActivityTab('symptoms')}
                  className={`text-[10px] px-3 py-1.5 rounded-lg transition-all font-semibold cursor-pointer ${
                    activityTab === 'symptoms'
                      ? 'bg-health-500 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-500/10'
                  }`}
                >
                  Intake Reports
                </button>
                <button
                  onClick={() => setActivityTab('chats')}
                  className={`text-[10px] px-3 py-1.5 rounded-lg transition-all font-semibold cursor-pointer ${
                    activityTab === 'chats'
                      ? 'bg-health-500 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-500/10'
                  }`}
                >
                  AI Conversations
                </button>
              </div>
            </div>

            {/* Render Intake Reports Tab */}
            {activityTab === 'symptoms' && (
              <div>
                {recentConsults.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-slate-200/25 dark:border-slate-800/10 rounded-2xl">
                    <Activity className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-slate-400 font-medium">No recent symptom reports yet.</p>
                    <button 
                      onClick={() => navigate('/symptoms')}
                      className="text-xs text-health-500 hover:text-health-400 mt-2 font-bold cursor-pointer"
                    >
                      Start assessment
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentConsults.map((consult, index) => (
                      <div 
                        key={index}
                        onClick={() => {
                          onStartSymptomCheck(consult.symptom, consult.report);
                          navigate('/symptoms');
                        }}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/30 dark:border-slate-800/30 bg-slate-500/5 hover:bg-slate-500/10 cursor-pointer transition-all hover:translate-x-0.5"
                      >
                        <div className="flex items-center space-x-3 overflow-hidden mr-2">
                          <div className="p-2 bg-health-500/15 rounded-lg text-health-500 flex-shrink-0">
                            <Activity className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-semibold dark:text-white truncate">{consult.symptom}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{consult.date}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Render AI Chat Conversations Tab */}
            {activityTab === 'chats' && (
              <div>
                {recentChats.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-slate-200/25 dark:border-slate-800/10 rounded-2xl">
                    <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-slate-400 font-medium">No recent chat history yet.</p>
                    <button 
                      onClick={() => navigate('/chat')}
                      className="text-xs text-health-500 hover:text-health-400 mt-2 font-bold cursor-pointer"
                    >
                      Ask AI a question
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentChats.map((chat, index) => (
                      <div 
                        key={index}
                        onClick={() => navigate('/chat')}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/30 dark:border-slate-800/30 bg-slate-500/5 hover:bg-slate-500/10 cursor-pointer transition-all hover:translate-x-0.5"
                      >
                        <div className="flex items-center space-x-3 overflow-hidden mr-2">
                          <div className="p-2 bg-indigo-500/15 rounded-lg text-indigo-400 flex-shrink-0">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-semibold dark:text-white truncate">{chat.title}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{chat.snippet}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Saved Bookmarks */}
          <div className="glass-panel p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Bookmark className="w-4 h-4 text-indigoaccent-500" />
              <h3 className="text-base font-bold dark:text-white">Bookmarked Medications & Tips</h3>
            </div>

            {bookmarks.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-slate-200/20 dark:border-slate-800/10 rounded-2xl">
                <Bookmark className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                <p className="text-xs text-slate-400">Save medications or preventive tips to see them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bookmarks.map((bookmark, index) => (
                  <div 
                    key={index}
                    onClick={() => {
                      if (bookmark.type === 'medication') {
                        navigate('/medication');
                      } else {
                        setTipCategory(bookmark.category || 'General');
                      }
                    }}
                    className="p-3 rounded-xl border border-slate-200/30 dark:border-slate-800/30 bg-slate-500/5 hover:bg-slate-500/10 cursor-pointer transition-all flex justify-between items-center"
                  >
                    <div className="overflow-hidden pr-2">
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-400/10 dark:bg-slate-700/30 text-slate-400 font-semibold mb-1 inline-block uppercase">
                        {bookmark.type}
                      </span>
                      <p className="text-xs font-bold dark:text-white truncate">{bookmark.title}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Preventive Care & Daily Tips (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  <h3 className="text-base font-bold dark:text-white">Wellness & Tips</h3>
                  {tipsSource === 'mock' && (
                    <span className="text-[8px] px-1.5 py-0.5 bg-amber-500/15 border border-amber-500/20 text-amber-500 rounded font-bold uppercase tracking-wider">
                      Simulated
                    </span>
                  )}
                </div>
                <div className="pulse-indicator w-2 h-2 rounded-full bg-green-500"></div>
              </div>

              {/* Category Selector */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {["General", "Nutrition", "Sleep", "Fitness", "Mental Health"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTipCategory(cat)}
                    className={`text-[10px] px-2 py-1 rounded-lg transition-all cursor-pointer font-medium ${
                      tipCategory === cat 
                        ? 'bg-health-500 text-white shadow-sm' 
                        : 'bg-slate-500/10 text-slate-500 dark:text-slate-400 hover:bg-slate-500/20'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {loadingTips ? (
                <div className="space-y-3 py-6">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-full"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-5/6"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {dailyTips.map((tip, index) => (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      key={index}
                      className="p-3 bg-health-500/5 rounded-xl border border-health-500/10 hover:border-health-500/20 transition-all relative overflow-hidden"
                    >
                      <div className="absolute right-0 top-0 opacity-10 translate-x-2 -translate-y-2">
                        <Heart className="w-12 h-12 text-health-500" />
                      </div>
                      <h4 className="text-xs font-bold text-health-700 dark:text-health-400 mb-1 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-health-500 mr-1.5"></span>
                        {tip.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        {tip.content}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/25 dark:border-slate-800/25 text-center">
              <p className="text-[10px] text-slate-400 italic">
                Tips are AI-generated based on standard preventative clinical guidelines.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
