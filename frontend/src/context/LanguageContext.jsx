import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    dashboard: "Dashboard",
    symptomChecker: "Symptom Checker",
    aiChat: "AI Chat Q&A",
    medicationInfo: "Medications",
    visualAnalyzer: "Visual Analyzer",
    preventiveCare: "Preventive Care",
    bookmarks: "Bookmarks",
    settings: "Settings",
    askAssistant: "Ask general health questions or symptoms...",
    send: "Send",
    enterSymptom: "Describe your symptoms in detail (e.g. fever for 3 days)...",
    emergencyWarning: "CRITICAL EMERGENCY WARNING",
    callEmergency: "Call Emergency Services (911)",
    back: "Back",
    submit: "Submit",
    loading: "Analyzing...",
    clear: "Clear",
    search: "Search",
    savedBookmarks: "Bookmarked Materials",
    medicalDisclaimer: "Clinical Information Platform Disclaimer",
    startAssessment: "Start Symptom Assessment",
    clearHistory: "Clear History",
    recentActivity: "Recent Activity",
    intakeReports: "Intake Reports",
    aiConversations: "AI Conversations",
    themeMode: "Theme Mode",
    activeTheme: "Active Theme",
    clearSaved: "Clear Saved History",
    specifications: "Platform Specifications"
  },
  hi: {
    dashboard: "डैशबोर्ड",
    symptomChecker: "लक्षण जाँचक",
    aiChat: "एआई चैट",
    medicationInfo: "दवाएं",
    visualAnalyzer: "विजुअल विश्लेषक",
    preventiveCare: "निवारक देखभाल",
    bookmarks: "बुकमार्क",
    settings: "सेटिंग्स",
    askAssistant: "सामान्य स्वास्थ्य प्रश्न या लक्षण पूछें...",
    send: "भेजें",
    enterSymptom: "अपने लक्षणों का विस्तार से वर्णन करें (जैसे 3 दिनों से बुखार)...",
    emergencyWarning: "गंभीर आपातकालीन चेतावनी",
    callEmergency: "आपातकालीन सेवाओं को कॉल करें (911)",
    back: "पीछे",
    submit: "जमा करें",
    loading: "विश्लेषण किया जा रहा है...",
    clear: "साफ़ करें",
    search: "खोजें",
    savedBookmarks: "सहेजी गई सामग्री",
    medicalDisclaimer: "नैदानिक सूचना मंच अस्वीकरण",
    startAssessment: "लक्षण मूल्यांकन शुरू करें",
    clearHistory: "इतिहास साफ़ करें",
    recentActivity: "हाल की गतिविधि",
    intakeReports: "इनटेक रिपोर्ट",
    aiConversations: "एआई बातचीत",
    themeMode: "थीम मोड",
    activeTheme: "सक्रिय थीम",
    clearSaved: "सहेजे गए इतिहास को साफ़ करें",
    specifications: "प्लेटफ़ॉर्म विनिर्देशों"
  },
  mr: {
    dashboard: "डॅशबोर्ड",
    symptomChecker: "लक्षण तपासक",
    aiChat: "एआय चॅट Q&A",
    medicationInfo: "औषधे",
    visualAnalyzer: "व्हिज्युअल विश्लेषक",
    preventiveCare: "प्रतिबंधात्मक काळजी",
    bookmarks: "बुकमार्क",
    settings: "सेटिंग्ज",
    askAssistant: "सामान्य आरोग्य प्रश्न किंवा लक्षणे विचारा...",
    send: "पाठवा",
    enterSymptom: "तुमच्या लक्षणांचे तपशीलवार वर्णन करा (उदा. ३ दिवस ताप)...",
    emergencyWarning: "गंभीर आणीबाणीची चेतावणी",
    callEmergency: "आणीबाणी सेवांना कॉल करा (911)",
    back: "मागे",
    submit: "सबमिट करा",
    loading: "विश्लेषण करत आहे...",
    clear: "साफ करा",
    search: "शोधा",
    savedBookmarks: "बुकमार्क केलेले साहित्य",
    medicalDisclaimer: "वैद्यकीय माहिती मंच अस्वीकरण",
    startAssessment: "लक्षण मूल्यांकन सुरू करा",
    clearHistory: "इतिहास साफ करा",
    recentActivity: "अलीकडील क्रियाकलाप",
    intakeReports: "तपासणी अहवाल",
    aiConversations: "एआय संभाषणे",
    themeMode: "थीम मोड",
    activeTheme: "सक्रिय थीम",
    clearSaved: "जतन केलेला इतिहास साफ करा",
    specifications: "प्लॅटफॉर्म वैशिष्ट्ये"
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
