import React, { useState } from 'react';
import { ShieldAlert, AlertOctagon, Phone, HeartHandshake, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmergencyBanner({ 
  isEmergency, 
  isSuicidal, 
  message, 
  crisisInfo, 
  onAcknowledge 
}) {
  const [acknowledged, setAcknowledged] = useState(false);

  if (!isEmergency) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`w-full max-w-2xl overflow-hidden glass-panel border-t-4 border-red-500 glow-effect-indigo`}
        >
          <div className="p-6 md:p-8">
            <div className="flex items-center space-x-3 mb-6">
              {isSuicidal ? (
                <div className="p-3 bg-indigo-500/10 rounded-full text-indigo-400">
                  <HeartHandshake className="w-8 h-8" />
                </div>
              ) : (
                <div className="p-3 bg-red-500/10 rounded-full text-red-500 animate-pulse">
                  <ShieldAlert className="w-8 h-8" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold font-sans tracking-tight dark:text-white">
                  {isSuicidal ? 'We Care About Your Safety' : 'CRITICAL EMERGENCY WARNING'}
                </h2>
                <p className="text-xs text-slate-400">Immediate Action Advised</p>
              </div>
            </div>

            <div className={`p-4 rounded-xl mb-6 text-sm leading-relaxed ${
              isSuicidal 
                ? 'bg-indigo-500/5 text-indigo-100 border border-indigo-500/20' 
                : 'bg-red-500/5 text-red-100 border border-red-500/20'
            }`}>
              {message}
            </div>

            {isSuicidal && (
              <div className="p-4 bg-indigo-950/40 rounded-xl border border-indigo-500/30 mb-6">
                <h3 className="font-semibold text-indigo-300 flex items-center mb-2 text-sm">
                  <Phone className="w-4 h-4 mr-2" /> Crisis Support Hotlines
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {crisisInfo}
                </p>
              </div>
            )}

            {!isSuicidal && (
              <div className="p-4 bg-red-950/40 rounded-xl border border-red-500/30 mb-6">
                <h3 className="font-semibold text-red-400 flex items-center mb-2 text-sm">
                  <AlertOctagon className="w-4 h-4 mr-2" /> Seek Help Instantly
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Please call 911 (USA/Canada), 999 (UK), 112 (Europe), or go immediately to the nearest Emergency Room. 
                  Do not wait for an online assessment. Every minute counts.
                </p>
              </div>
            )}

            {isSuicidal ? (
              <div className="space-y-4">
                <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border border-slate-700/50 hover:bg-slate-800/30 transition-all select-none">
                  <input 
                    type="checkbox" 
                    className="mt-1 accent-indigo-500 rounded" 
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                  />
                  <span className="text-xs text-slate-300 leading-tight">
                    I acknowledge this message and I promise to reach out to a support line, family member, or professional who can help me.
                  </span>
                </label>

                <button
                  disabled={!acknowledged}
                  onClick={() => {
                    if (acknowledged) {
                      onAcknowledge();
                    }
                  }}
                  className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center space-x-2 transition-all ${
                    acknowledged 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-indigo-500/20 shadow-lg cursor-pointer' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Acknowledge and Continue Safety Resources</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full">
                <a
                  href="tel:911"
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs md:text-sm text-center transition-all hover:shadow-lg cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Phone className="w-4 h-4 animate-bounce" />
                  <span>Call Emergency Services (911)</span>
                </a>
                <button
                  onClick={onAcknowledge}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-750/50 rounded-xl font-medium text-xs md:text-sm cursor-pointer transition-all text-center"
                >
                  Acknowledge & Close
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
