import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Stethoscope, 
  MessageSquare, 
  Pill, 
  Camera, 
  Heart, 
  Bookmark, 
  Settings, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Activity,
  Shield,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme, isDark } = useTheme();
  const { t } = useLanguage();

  const menuItems = [
    { path: '/', label: t('dashboard'), icon: LayoutDashboard },
    { path: '/symptoms', label: t('symptomChecker'), icon: Stethoscope },
    { path: '/chat', label: t('aiChat'), icon: MessageSquare },
    { path: '/medication', label: t('medicationInfo'), icon: Pill },
    { path: '/vision', label: t('visualAnalyzer'), icon: Camera },
    { path: '/preventive', label: t('preventiveCare'), icon: Heart },
    { path: '/specialists', label: t('nearbySpecialists'), icon: MapPin },
    { path: '/bookmarks', label: t('bookmarks'), icon: Bookmark },
    { path: '/settings', label: t('settings'), icon: Settings },
  ];

  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  return (
    <>
      {/* Mobile Hamburger Header (Visible only on mobile/tablet) */}
      <header className="h-16 w-full bg-white/80 dark:bg-slate-950/40 border-b border-slate-200/50 dark:border-slate-900/60 backdrop-blur-md flex items-center justify-between px-6 md:hidden fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-health-500 rounded-lg text-white">
            <Activity className="w-4.5 h-4.5" />
          </div>
          <span className="font-bold text-sm dark:text-white font-sans">CuraHealth</span>
        </div>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-slate-500/10 text-slate-500 dark:text-slate-400 focus:outline-none"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Desktop Sidebar (Permanent left sidebar) */}
      <aside className="w-64 bg-white/70 dark:bg-slate-950/40 border-r border-slate-200/50 dark:border-slate-900/60 backdrop-blur-md hidden md:flex flex-col justify-between p-6 z-20 sticky top-0 h-screen">
        <div className="space-y-8">
          {/* Logo brand */}
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-health-400 to-health-600 rounded-xl text-white shadow-glow-teal flex-shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight dark:text-white block font-sans">CuraHealth</span>
              <span className="text-[10px] font-semibold text-health-500 uppercase tracking-widest block -mt-0.5">AI Care Platform</span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      isActive 
                        ? 'bg-health-500 text-white shadow-md shadow-health-500/10' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-500/5 dark:hover:bg-slate-800/20'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-4 pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/40 bg-slate-500/5 hover:bg-slate-500/10 text-slate-500 dark:text-slate-400 transition-all cursor-pointer text-xs font-medium"
          >
            <div className="flex items-center space-x-2">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
            </div>
            <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-slate-500/10 dark:bg-slate-700/30 rounded">Mode</span>
          </button>

          <div className="flex items-center space-x-2 text-[10px] text-slate-400">
            <Shield className="w-3.5 h-3.5 text-health-500" />
            <span>HIPAA Compliant Protocol</span>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (Overlay backdrop and side menu) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Sidebar drawer content */}
            <motion.aside
              initial="closed"
              animate="open"
              exit="closed"
              variants={sidebarVariants}
              className="fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-darkbg-card border-r border-slate-200 dark:border-slate-850 p-6 z-50 md:hidden flex flex-col justify-between shadow-2xl"
            >
              <div className="space-y-8">
                {/* Header brand + Close */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-health-500 rounded-xl text-white">
                      <Activity className="w-4.5 h-4.5" />
                    </div>
                    <span className="font-bold text-sm dark:text-white">CuraHealth</span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-500/10 text-slate-500 dark:text-slate-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Navigation Links */}
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          `w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                            isActive 
                              ? 'bg-health-500 text-white shadow-md' 
                              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-500/5 dark:hover:bg-slate-800/20'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              {/* Sidebar Footer */}
              <div className="space-y-4 pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
                <button
                  onClick={() => {
                    toggleTheme();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/40 bg-slate-500/5 text-slate-500 dark:text-slate-400 text-xs font-medium"
                >
                  <div className="flex items-center space-x-2">
                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
                  </div>
                </button>

                <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                  <Shield className="w-3.5 h-3.5 text-health-500" />
                  <span>HIPAA Compliant Protocol</span>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
