import React from 'react';
import { Languages, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'en', label: 'English (EN)' },
    { code: 'hi', label: 'हिन्दी (HI)' },
    { code: 'mr', label: 'मराठी (MR)' }
  ];

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center space-x-1 p-2 rounded-xl border border-slate-200/50 dark:border-slate-800/40 bg-slate-500/5 text-slate-600 dark:text-slate-300">
        <Languages className="w-4 h-4 text-health-500" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-transparent text-xs font-semibold outline-none border-none cursor-pointer pr-1 py-0.5"
        >
          {languages.map((lang) => (
            <option 
              key={lang.code} 
              value={lang.code} 
              className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold"
            >
              {lang.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
