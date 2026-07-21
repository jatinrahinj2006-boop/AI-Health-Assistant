import React from 'react';
import { 
  AlertTriangle, 
  Activity, 
  HelpCircle, 
  HeartHandshake, 
  Info, 
  ChevronRight,
  ShieldCheck,
  Bookmark
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function StructuredResultCard({ 
  result, 
  loading = false, 
  empty = false, 
  emptyMessage = "Enter details to generate clinical guidance.",
  onBookmark = null,
  isBookmarked = false
}) {
  
  // 1. Skeleton Loading State
  if (loading) {
    return (
      <div className="glass-panel p-6 md:p-8 space-y-6 animate-pulse select-none">
        <div className="flex justify-between items-center pb-4 border-b border-slate-200/30 dark:border-slate-800/30">
          <div className="h-6 w-1/3 bg-slate-300 dark:bg-slate-800 rounded-md"></div>
          <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-300 dark:bg-slate-800 rounded"></div>
          <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="p-4 border border-slate-200/20 dark:border-slate-800/20 rounded-xl space-y-2">
            <div className="h-4 w-1/2 bg-slate-300 dark:bg-slate-800 rounded"></div>
            <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-3 w-4/5 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
          <div className="p-4 border border-slate-200/20 dark:border-slate-800/20 rounded-xl space-y-2">
            <div className="h-4 w-1/2 bg-slate-300 dark:bg-slate-800 rounded"></div>
            <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-3 w-4/5 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
        <div className="h-10 w-full bg-slate-300 dark:bg-slate-800 rounded-xl"></div>
      </div>
    );
  }

  // 2. Empty State
  if (empty || !result) {
    return (
      <div className="glass-panel p-10 text-center flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-health-500/10 rounded-full text-health-500">
          <Activity className="w-10 h-10 animate-pulse" />
        </div>
        <h3 className="text-base font-bold dark:text-white font-sans">No Assessment Available</h3>
        <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
          {emptyMessage}
        </p>
      </div>
    );
  }

  const {
    summary,
    possible_causes = [],
    self_care = [],
    warning_signs = [],
    when_to_see_doctor,
    disclaimer,
    is_emergency = false,
    source = "live"
  } = result;

  const isMock = source === 'mock';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-panel overflow-hidden border-t-4 ${
        is_emergency 
          ? 'border-red-500 shadow-lg shadow-red-500/5' 
          : 'border-health-500'
      }`}
    >
      {/* Header bar with badges */}
      <div className="px-6 py-4 border-b border-slate-200/50 dark:border-slate-850 bg-slate-500/5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <Activity className={`w-5 h-5 ${is_emergency ? 'text-red-500 animate-pulse' : 'text-health-500'}`} />
          <span className="text-xs font-bold font-sans dark:text-white">
            {is_emergency ? 'Critical Health Assessment' : 'AI Health Assessment'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {isMock && (
            <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[9px] font-bold uppercase tracking-wider">
              Simulated AI Profile
            </span>
          )}
          {!isMock && (
            <span className="px-2 py-0.5 rounded bg-green-500/15 border border-green-500/30 text-green-600 dark:text-green-400 text-[9px] font-bold uppercase tracking-wider">
              Live LLM Response
            </span>
          )}
          {onBookmark && (
            <button
              onClick={onBookmark}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isBookmarked 
                  ? 'bg-health-500/10 border-health-500 text-health-500 dark:text-health-400' 
                  : 'border-slate-200/50 dark:border-slate-850 text-slate-400 hover:text-slate-200'
              }`}
              title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
            >
              <Bookmark className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        
        {/* 1. Clinical Summary */}
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Clinical Intake Summary</h4>
          <p className="text-xs md:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans font-medium">
            {summary}
          </p>
        </div>

        {/* 2. Causes & Care Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Causes */}
          <div className="p-4 rounded-2xl bg-slate-500/5 border border-slate-200/30 dark:border-slate-850">
            <h5 className="text-xs font-bold dark:text-white flex items-center mb-3">
              <HelpCircle className="w-4 h-4 text-health-500 mr-2" />
              <span>Possible Conditions</span>
            </h5>
            <ul className="space-y-2">
              {possible_causes.map((cause, idx) => (
                <li key={idx} className="flex items-start text-xs text-slate-600 dark:text-slate-300">
                  <ChevronRight className="w-3.5 h-3.5 text-health-500 mt-0.5 mr-1.5 flex-shrink-0" />
                  <span>{cause}</span>
                </li>
              ))}
              {possible_causes.length === 0 && (
                <li className="text-xs text-slate-500 italic">No specific causes identified.</li>
              )}
            </ul>
          </div>

          {/* Care Guidelines */}
          <div className="p-4 rounded-2xl bg-slate-500/5 border border-slate-200/30 dark:border-slate-850">
            <h5 className="text-xs font-bold dark:text-white flex items-center mb-3">
              <HeartHandshake className="w-4 h-4 text-indigoaccent-500 mr-2" />
              <span>Self-Care & Home Guidelines</span>
            </h5>
            <ul className="space-y-2">
              {self_care.map((tip, idx) => (
                <li key={idx} className="flex items-start text-xs text-slate-600 dark:text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 mt-0.5 mr-1.5 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
              {self_care.length === 0 && (
                <li className="text-xs text-slate-500 italic">No guidelines available.</li>
              )}
            </ul>
          </div>
        </div>

        {/* 3. Warning Signs (High visibility) */}
        {warning_signs.length > 0 && (
          <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
            <h5 className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center mb-2">
              <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
              <span>Critical Red Flags & Warning Signs</span>
            </h5>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
              {warning_signs.map((sign, idx) => (
                <li key={idx} className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>
                  <span>{sign}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 4. When to See a Doctor */}
        <div className="p-4 bg-slate-500/5 border border-slate-200/30 dark:border-slate-850 rounded-2xl">
          <h5 className="text-xs font-bold dark:text-white flex items-center mb-1.5">
            <Info className="w-4 h-4 text-health-500 mr-2" />
            <span>Recommended Professional Care Guidance</span>
          </h5>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
            {when_to_see_doctor}
          </p>
        </div>

        {/* 5. Fine Disclaimer */}
        <div className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center pt-4 border-t border-slate-200/20 dark:border-slate-850">
          {disclaimer}
        </div>

      </div>
    </motion.div>
  );
}
