import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Shield, Phone } from 'lucide-react';

import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import LanguageSelector from './components/LanguageSelector';
import Sidebar from './components/Sidebar';
import EmergencyBanner from './components/EmergencyBanner';
import DisclaimerFooter from './components/DisclaimerFooter';
import Dashboard from './components/Dashboard';
import SymptomChecker from './components/SymptomChecker';
import AIChat from './components/AIChat';
import MedicationLookup from './components/MedicationLookup';
import ImageAnalysis from './components/ImageAnalysis';
import PreventiveCare from './components/PreventiveCare';
import Bookmarks from './components/Bookmarks';
import SettingsPage from './components/Settings';
import NearbySpecialists from './components/NearbySpecialists';
import { useEmergencyCheck } from './hooks/useEmergencyCheck';

// Reusable transition wrapper for page route animations
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
    className="h-full flex flex-col justify-between min-h-[calc(100vh-10rem)]"
  >
    <div className="flex-1 pb-8">
      {children}
    </div>
    <DisclaimerFooter />
  </motion.div>
);

function AppContent() {
  const location = useLocation();
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedSymptom, setSelectedSymptom] = useState('');

  // Emergency safety hook
  const { 
    isEmergency, 
    isSuicidal, 
    emergencyMessage, 
    crisisInfo, 
    checkText, 
    resetEmergency 
  } = useEmergencyCheck();

  const handleStartSymptomCheck = (symptom, report) => {
    setSelectedSymptom(symptom);
    setSelectedReport(report);
  };

  const handleClearSelectedReport = () => {
    setSelectedReport(null);
    setSelectedSymptom('');
  };

  // Programmatic emergency trigger
  const triggerEmergencyBanner = (active, suicidal, msg, crisis) => {
    if (active) {
      const triggerPhrase = suicidal ? 'suicid' : 'chest pain';
      checkText(triggerPhrase);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg-base transition-colors duration-300 flex flex-col md:flex-row">
      {/* 1. Global Safety Interceptor Banner */}
      <EmergencyBanner 
        isEmergency={isEmergency}
        isSuicidal={isSuicidal}
        message={emergencyMessage}
        crisisInfo={crisisInfo}
        onAcknowledge={resetEmergency}
      />

      {/* 2. Mobile-collapsible Collapsible Navigation Sidebar */}
      <Sidebar />

      {/* 3. Main Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pt-16 md:pt-0">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-white/70 dark:bg-slate-950/20 border-b border-slate-200/50 dark:border-slate-900/60 backdrop-blur-md flex items-center justify-between px-6 z-10">
          <div className="hidden md:flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">
            <span>CuraHealth AI Care Hub</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>Local 911 Safety Scanner Active</span>
            </div>
            <LanguageSelector />
            
            <button 
              onClick={() => alert("CuraHealth Assistant v1.0.0\nCreated for clinical hackathon submission. Sourced with local safety keywords pre-filter scanning and structured JSON LLM output validation.")}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-500/5 cursor-pointer"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Core Scroll Viewport with Framer Motion Routing */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={
                <PageWrapper>
                  <Dashboard onStartSymptomCheck={handleStartSymptomCheck} />
                </PageWrapper>
              } />
              
              <Route path="/symptoms" element={
                <PageWrapper>
                  <SymptomChecker 
                    onTriggerEmergency={triggerEmergencyBanner}
                    initialReport={selectedReport}
                    resetNavReport={handleClearSelectedReport}
                  />
                </PageWrapper>
              } />
              
              <Route path="/chat" element={
                <PageWrapper>
                  <AIChat onTriggerEmergency={triggerEmergencyBanner} />
                </PageWrapper>
              } />
              
              <Route path="/medication" element={
                <PageWrapper>
                  <MedicationLookup />
                </PageWrapper>
              } />
              
              <Route path="/vision" element={
                <PageWrapper>
                  <ImageAnalysis onTriggerEmergency={triggerEmergencyBanner} />
                </PageWrapper>
              } />
              
              <Route path="/preventive" element={
                <PageWrapper>
                  <PreventiveCare />
                </PageWrapper>
              } />
              
              <Route path="/bookmarks" element={
                <PageWrapper>
                  <Bookmarks />
                </PageWrapper>
              } />
              
              <Route path="/settings" element={
                <PageWrapper>
                  <SettingsPage />
                </PageWrapper>
              } />

              <Route path="/specialists" element={
                <PageWrapper>
                  <NearbySpecialists />
                </PageWrapper>
              } />
            </Routes>
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}
