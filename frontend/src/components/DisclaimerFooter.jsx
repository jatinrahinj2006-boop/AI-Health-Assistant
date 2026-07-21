import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function DisclaimerFooter() {
  return (
    <footer className="w-full py-4 px-6 border-t border-slate-200/50 dark:border-slate-900/60 bg-white/30 dark:bg-slate-950/10 backdrop-blur-xs select-none">
      <div className="max-w-4xl mx-auto flex items-start space-x-2 text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-sans">
        <ShieldCheck className="w-4 h-4 text-health-500 flex-shrink-0 mt-0.5" />
        <span>
          <strong>Clinical Information Platform Disclaimer:</strong> AegisHealth AI provides structured clinical summaries, pharmacological profiles, and visual evaluations for educational and hackathon demonstration purposes only. It is <strong>not</strong> a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for any questions regarding a medical condition. If you think you may have a medical emergency, call your local emergency services (e.g. 911) or proceed to the nearest emergency room immediately.
        </span>
      </div>
    </footer>
  );
}
