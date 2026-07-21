import React, { useState, useEffect } from 'react';
import { Bookmark, Trash2, ChevronRight, Pill, Stethoscope, Heart, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('health_assistant_bookmarks') || '[]';
    setBookmarks(JSON.parse(saved));
  }, []);

  const handleRemove = (title, e) => {
    e.stopPropagation();
    const updated = bookmarks.filter(b => b.title !== title);
    localStorage.setItem('health_assistant_bookmarks', JSON.stringify(updated));
    setBookmarks(updated);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'medication': return <Pill className="w-5 h-5 text-indigo-400" />;
      case 'symptom report': return <Stethoscope className="w-5 h-5 text-health-500" />;
      default: return <Heart className="w-5 h-5 text-rose-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-6">
      <div className="glass-panel p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-health-500/10 rounded-2xl text-health-500">
            <Bookmark className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold dark:text-white font-sans">Bookmarked Materials</h2>
            <p className="text-xs text-slate-400">Manage your saved consultations, medication facts sheets, and wellness tips</p>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6">
        {bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-50" />
            <p className="text-sm font-semibold dark:text-white">No Bookmarks Saved Yet</p>
            <p className="text-xs text-slate-400 mt-1">Bookmark medications, symptom reports, or wellness tips to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {bookmarks.map((b, idx) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-500/5 hover:bg-slate-500/10 transition-all flex items-start justify-between cursor-pointer"
                >
                  <div className="flex items-start space-x-3 overflow-hidden mr-3">
                    <div className="p-2.5 bg-slate-500/10 rounded-lg flex-shrink-0">
                      {getIcon(b.type)}
                    </div>
                    <div className="truncate">
                      <span className="text-[9px] px-2 py-0.5 rounded bg-slate-400/10 dark:bg-slate-700/30 text-slate-400 font-semibold mb-1 inline-block uppercase tracking-wider">
                        {b.type}
                      </span>
                      <h4 className="text-xs font-bold dark:text-white truncate">{b.title}</h4>
                      <p className="text-[10px] text-slate-400 flex items-center mt-1">
                        <Calendar className="w-3.5 h-3.5 mr-1" /> Saved {b.date}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleRemove(b.title, e)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer flex-shrink-0"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
