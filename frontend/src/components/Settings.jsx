import React, { useState } from 'react';
import { Settings, Shield, RefreshCw, Server, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function SettingsPage() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { t } = useLanguage();
  const [clearing, setClearing] = useState(false);

  const handleClearCache = () => {
    setClearing(true);
    localStorage.clear();
    setTimeout(() => {
      setClearing(false);
      alert('Local storage preferences, history, and bookmarks have been successfully cleared.');
      window.location.reload();
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto pb-12 space-y-6">
      <div className="glass-panel p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-health-500/10 rounded-2xl text-health-500">
            <Settings className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold dark:text-white font-sans">{t('settingsCustomization')}</h2>
            <p className="text-xs text-slate-400">Configure layout themes, clear diagnostic histories, and inspect active configurations</p>
          </div>
        </div>
      </div>

      {/* Preferences group */}
      <div className="glass-panel p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold dark:text-white mb-4">{t('themeMode')}</h3>
          <div className="flex justify-between items-center p-4 bg-slate-500/5 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
            <div>
              <h4 className="text-xs font-bold dark:text-white">{t('activeTheme')}: {theme.toUpperCase()}</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Toggle between light clinical contrast or premium dark styling</p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 bg-health-500 hover:bg-health-600 text-white rounded-lg text-xs font-semibold shadow-md cursor-pointer transition-all"
            >
              Toggle Mode
            </button>
          </div>
        </div>

        {/* Data control */}
        <div>
          <h3 className="text-sm font-bold dark:text-white mb-4">{t('dbManagement')}</h3>
          <div className="flex justify-between items-center p-4 bg-slate-500/5 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
            <div>
              <h4 className="text-xs font-bold text-rose-500">{t('clearSaved')}</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">{t('clearSavedDesc')}</p>
            </div>
            <button
              onClick={handleClearCache}
              disabled={clearing}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-md cursor-pointer transition-all flex items-center space-x-1.5"
            >
              {clearing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>{t('clearHistory')}</span>
            </button>
          </div>
        </div>

        {/* Info panel */}
        <div>
          <h3 className="text-sm font-bold dark:text-white mb-4">{t('platformSpec')}</h3>
          <div className="p-4 bg-slate-500/5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium flex items-center"><Server className="w-3.5 h-3.5 mr-1 text-health-500" /> API Gateway:</span>
              <span className="font-semibold dark:text-white">Active (Localhost Proxy)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium flex items-center"><Shield className="w-3.5 h-3.5 mr-1 text-indigo-400" /> Data Storage Protocol:</span>
              <span className="font-semibold dark:text-white">In-Browser LocalStorage</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-500" /> Health System Status:</span>
              <span className="font-semibold text-green-500">Operational</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
