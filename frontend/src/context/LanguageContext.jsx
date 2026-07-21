import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Nav / Sidebar / Header
    dashboard: "Dashboard",
    symptomChecker: "Symptom Checker",
    aiChat: "AI Chat Q&A",
    medicationInfo: "Medications",
    visualAnalyzer: "Visual Analyzer",
    preventiveCare: "Preventive Care",
    bookmarks: "Bookmarks",
    settings: "Settings",
    careHub: "CuraHealth AI Care Hub",
    safetyScanner: "Local 911 Safety Scanner Active",

    // Dashboard
    encryptedCare: "Encrypted & Confidential AI Care",
    heroTitle: "Digital Health Intelligence at Your Service",
    heroDesc: "Get instant clinical evaluations, check medication facts, or speak with our AI wellness assistant. All insights are structured and backed by safety filters.",
    symptomAssessment: "Symptom Assessment",
    askAIChat: "Ask AI Chat",
    runSymptomCheck: "Run Symptom Check",
    lookupMedication: "Lookup Medication",
    analyzeImage: "Analyze Image",
    dailyTips: "Daily Preventative Health Tips",
    tipCategory: "Tip Category",
    recentActivity: "Recent Activity Log",
    cardSymptomDesc: "Engage in an adaptive questionnaire clarifying symptoms to generate a structured clinical assessment report.",
    cardMedDesc: "Analyze dosage limits, generic names, potential drug interactions, and warning disclaimers.",
    cardVisionDesc: "Upload prescription labels, pill packaging, or visible skin irritation details for vision analysis.",
    consultations: "Consultations",
    chats: "Chats",
    bookmarksSaved: "Bookmarks & Saved Info",

    // Symptom Checker
    clinicalSymptomAssessment: "Clinical Symptom Assessment",
    enterSymptom: "Describe your symptoms in detail (e.g. fever for 3 days)...",
    emergencyWarning: "CRITICAL EMERGENCY WARNING",
    callEmergency: "Call Emergency Services (911)",
    back: "Back",
    submit: "Submit",
    loading: "Analyzing...",
    clear: "Clear",
    search: "Search",
    startIntake: "Start Intake",
    intakeFollowUp: "Intake Follow-up",
    clinicalFollowUp: "Clinical Follow-up",
    nextQuestion: "Next Question",
    prevQuestion: "Previous Question",
    generateFinalAssessment: "Generate Final Assessment",
    symptomCheckerReport: "Symptom Checker Report",
    bookmarkReport: "Bookmark Report",
    printSummary: "Print Summary",
    startNewAssessment: "Start New Assessment",
    restartChecker: "Restart Checker",
    selectOptionError: "Please select or type an answer to continue.",

    // AI Chat
    aiHealthExploration: "AI Health Exploration",
    commonExplorations: "Common Health Explorations",
    askAssistant: "Ask general health questions or symptoms...",
    clearHistory: "Clear History",
    speakResponse: "Speak Response",
    stopSpeaking: "Stop Speaking",
    thinking: "Thinking and structuring response...",
    send: "Send",

    // Medications
    medicationPortal: "Medication Information Portal",
    searchMedication: "Search Medication...",
    recentSearches: "Recent Searches",
    dosageLimits: "Dosage Limits",
    activeIngredients: "Active Ingredients",
    drugInteractions: "Drug Interactions",
    sideEffects: "Side Effects",
    warnings: "Warnings & Contraindications",

    // Visual Analyzer
    visualHealthAnalyzer: "Visual Health Analyzer",
    visualUploadDesc: "Upload an image of a medication label, pill bottle, or visible skin condition for detailed AI analysis.",
    category: "Category",
    medicationLabel: "Medication Label",
    skinCondition: "Skin Condition",
    dragDropText: "Drag and drop your image here, or click to browse",
    analyzingImage: "Analyzing image...",
    visionAnalysisResult: "Vision Analysis Result",

    // Bookmarks
    savedBookmarks: "Bookmarked Materials",
    noBookmarks: "No bookmarked items yet.",

    // Settings
    settingsCustomization: "Settings & Customization",
    themeMode: "Theme Mode",
    activeTheme: "Active Theme",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    dbManagement: "Database Management",
    clearSaved: "Clear Saved History",
    clearSavedDesc: "This will permanently delete all local consultation reports, bookmarks, and chat histories.",
    deleteAllData: "Delete All Data",

    // Nearby Specialists
    nearbySpecialists: "Nearby Specialists",
    findSpecialist: "Find Nearby Specialists",
    findCareText: "Search for nearby doctors and hospitals by specialty",
    geoPrompt: "CuraHealth would like to access your location to show you nearby care.",
    allowLocation: "Allow Location Access",
    enterAddress: "Or enter city or pincode:",
    searchRadius: "Search Radius",
    km: "km",
    noSpecialists: "No results found nearby. Try a wider radius or adjust your criteria.",
    findNearbyCareBtn: "Find a Specialist Near You",
    demoMockBadge: "Demo Mode: Simulated Specialists",
    rating: "Rating",
    getDirections: "Get Directions",
    viewOnMap: "View on Map",
    providerSearchDisclaimer: "Results are sourced from Google Places and are not a medical referral or endorsement; always verify credentials directly with the facility.",
    spec_neurologist: "Brain & Nerve Doctor (Neurologist)",
    spec_neurosurgeon: "Brain Surgeon (Neurosurgeon)",
    spec_cardiologist: "Heart Doctor (Cardiologist)",
    spec_orthopedist: "Bone & Joint Doctor (Orthopedist)",
    spec_dermatologist: "Skin Doctor (Dermatologist)",
    spec_ent: "Ear/Nose/Throat Doctor (ENT)",
    spec_ophthalmologist: "Eye Doctor (Ophthalmologist)",
    spec_gastroenterologist: "Stomach & Digestion Doctor (Gastroenterologist)",
    spec_oncologist: "Cancer Doctor (Oncologist)",
    spec_nephrologist: "Kidney Doctor (Nephrologist)",
    spec_pulmonologist: "Lung Doctor (Pulmonologist)",
    spec_gynecologist: "Women's Health Doctor (Gynecologist)",
    spec_pediatrician: "Child Doctor (Pediatrician)",
    spec_psychiatrist: "Mental Health Doctor (Psychiatrist)",
    spec_dentist: "Dentist",
    spec_general_physician: "General Doctor"
  },
  hi: {
    // Nav / Sidebar / Header
    dashboard: "डैशबोर्ड",
    symptomChecker: "लक्षण जाँचक",
    aiChat: "एआई चैट",
    medicationInfo: "दवाएं",
    visualAnalyzer: "विजुअल विश्लेषक",
    preventiveCare: "निवारक देखभाल",
    bookmarks: "बुकमार्क",
    settings: "सेटिंग्स",
    careHub: "क्यूराहेल्थ एआई केयर हब",
    safetyScanner: "स्थानीय 911 सुरक्षा स्कैनर सक्रिय",

    // Dashboard
    encryptedCare: "एन्क्रिप्टेड और गोपनीय एआई केयर",
    heroTitle: "आपकी सेवा में डिजिटल स्वास्थ्य बुद्धिमत्ता",
    heroDesc: "तुरंत नैदानिक मूल्यांकन प्राप्त करें, दवा के तथ्यों की जांच करें, या हमारे एआई कल्याण सहायक से बात करें। सभी अंतर्दृष्टि संरचित हैं और सुरक्षा फिल्टर द्वारा समर्थित हैं।",
    symptomAssessment: "लक्षण मूल्यांकन",
    askAIChat: "एआई चैट से पूछें",
    runSymptomCheck: "लक्षण जाँच चलाएं",
    lookupMedication: "दवा खोजें",
    analyzeImage: "छवि का विश्लेषण करें",
    dailyTips: "दैनिक निवारक स्वास्थ्य सुझाव",
    tipCategory: "सुझाव श्रेणी",
    recentActivity: "हाल की गतिविधि लॉग",
    cardSymptomDesc: "एक संरचित नैदानिक मूल्यांकन रिपोर्ट तैयार करने के लिए लक्षणों को स्पष्ट करने वाली एक अनुकूलन प्रश्नावली में शामिल हों।",
    cardMedDesc: "खुराक सीमा, जेनेरिक नाम, संभावित दवा पारस्परिक क्रिया और चेतावनी अस्वीकरण का विश्लेषण करें।",
    cardVisionDesc: "दृष्टि विश्लेषण के लिए प्रिस्क्रिप्शन लेबल, दवा पैकेजिंग, या दिखाई देने वाले त्वचा संक्रमण विवरण अपलोड करें।",
    consultations: "परामर्श",
    chats: "चैट",
    bookmarksSaved: "बुकमार्क और सहेजी गई जानकारी",

    // Symptom Checker
    clinicalSymptomAssessment: "नैदानिक लक्षण मूल्यांकन",
    enterSymptom: "अपने लक्षणों का विस्तार से वर्णन करें (जैसे 3 दिनों से बुखार)...",
    emergencyWarning: "गंभीर आपातकालीन चेतावनी",
    callEmergency: "आपातकालीन सेवाओं को कॉल करें (911)",
    back: "पीछे",
    submit: "जमा करें",
    loading: "विश्लेषण किया जा रहा है...",
    clear: "साफ़ करें",
    search: "खोजें",
    startIntake: "इंटेक शुरू करें",
    intakeFollowUp: "इंटेक फॉलो-अप",
    clinicalFollowUp: "नैदानिक फॉलो-अप",
    nextQuestion: "अगला प्रश्न",
    prevQuestion: "पिछला प्रश्न",
    generateFinalAssessment: "अंतिम मूल्यांकन उत्पन्न करें",
    symptomCheckerReport: "लक्षण जाँचक रिपोर्ट",
    bookmarkReport: "रिपोर्ट बुकमार्क करें",
    printSummary: "सारांश प्रिंट करें",
    startNewAssessment: "नया मूल्यांकन शुरू करें",
    restartChecker: "जाँचक पुनरारंभ करें",
    selectOptionError: "जारी रखने के लिए कृपया एक उत्तर चुनें या टाइप करें।",

    // AI Chat
    aiHealthExploration: "एआई स्वास्थ्य अन्वेषण",
    commonExplorations: "सामान्य स्वास्थ्य अन्वेषण",
    askAssistant: "सामान्य स्वास्थ्य प्रश्न या लक्षण पूछें...",
    clearHistory: "इतिहास साफ़ करें",
    speakResponse: "उत्तर बोलें",
    stopSpeaking: "बोलना बंद करें",
    thinking: "सोच रहा है और प्रतिक्रिया तैयार कर रहा है...",
    send: "भेजें",

    // Medications
    medicationPortal: "दवा सूचना पोर्टल",
    searchMedication: "दवा खोजें...",
    recentSearches: "हाल की खोजें",
    dosageLimits: "खुराक की सीमाएं",
    activeIngredients: "सक्रिय सामग्री",
    drugInteractions: "दवा पारस्परिक क्रिया",
    sideEffects: "दुष्प्रभाव",
    warnings: "चेतावनी और मतभेद",

    // Visual Analyzer
    visualHealthAnalyzer: "विजुअल स्वास्थ्य विश्लेषक",
    visualUploadDesc: "विस्तृत एआई विश्लेषण के लिए दवा के लेबल, गोली की बोतल, या दिखाई देने वाली त्वचा की स्थिति की एक छवि अपलोड करें।",
    category: "श्रेणी",
    medicationLabel: "दवा का लेबल",
    skinCondition: "त्वचा की स्थिति",
    dragDropText: "अपनी छवि यहाँ खींचें और छोड़ें, या ब्राउज़ करने के लिए क्लिक करें",
    analyzingImage: "छवि का विश्लेषण किया जा रहा है...",
    visionAnalysisResult: "विजुअल विश्लेषण परिणाम",

    // Bookmarks
    savedBookmarks: "सहेजी गई सामग्री",
    noBookmarks: "अभी तक कोई बुकमार्क की गई सामग्री नहीं है।",

    // Settings
    settingsCustomization: "सेटिंग्स और अनुकूलन",
    themeMode: "थीम मोड",
    activeTheme: "सक्रिय थीम",
    lightMode: "लाइट मोड",
    darkMode: "डार्क मोड",
    dbManagement: "डेटाबेस प्रबंधन",
    clearSaved: "सहेजे गए इतिहास को साफ़ करें",
    clearSavedDesc: "यह स्थायी रूप से सभी स्थानीय परामर्श रिपोर्ट, बुकमार्क और चैट इतिहास को हटा देगा।",
    deleteAllData: "सारा डेटा हटाएं",

    // Nearby Specialists
    nearbySpecialists: "आसपास के विशेषज्ञ",
    findSpecialist: "आसपास के विशेषज्ञ खोजें",
    findCareText: "विशेषता द्वारा आसपास के डॉक्टरों और अस्पतालों की खोज करें",
    geoPrompt: "क्यूराहेल्थ आपके आसपास की देखभाल दिखाने के लिए आपके स्थान तक पहुंचना चाहता है।",
    allowLocation: "स्थान पहुंच की अनुमति दें",
    enterAddress: "या अपना शहर या पिनकोड दर्ज करें:",
    searchRadius: "खोज का दायरा",
    km: "किमी",
    noSpecialists: "आसपास कोई परिणाम नहीं मिला। बड़ा दायरा आज़माएं या मापदंड बदलें।",
    findNearbyCareBtn: "अपने पास विशेषज्ञ खोजें",
    demoMockBadge: "डेमो मोड: सिमुलेटेड विशेषज्ञ",
    rating: "रेटिंग",
    getDirections: "दिशा-निर्देश प्राप्त करें",
    viewOnMap: "मानचित्र पर देखें",
    providerSearchDisclaimer: "परिणाम Google Places से प्राप्त किए गए हैं और ये कोई चिकित्सा रेफरल या समर्थन नहीं हैं; हमेशा सीधे सुविधा के साथ क्रेडेंशियल सत्यापित करें।",
    spec_neurologist: "मस्तिष्क और तंत्रिका डॉक्टर (न्यूरोलॉजिस्ट)",
    spec_neurosurgeon: "मस्तिष्क सर्जन (न्यूरोसर्जन)",
    spec_cardiologist: "हृदय रोग डॉक्टर (कार्डियोलॉजिस्ट)",
    spec_orthopedist: "हड्डी और जोड़ डॉक्टर (ऑर्थोपेडिस्ट)",
    spec_dermatologist: "त्वचा रोग डॉक्टर (डर्मेटोलॉजिस्ट)",
    spec_ent: "कान/नाक/गला डॉक्टर (ईएनटी)",
    spec_ophthalmologist: "आंखों के डॉक्टर (ऑप्थल्मोलॉजिस्ट)",
    spec_gastroenterologist: "पेट और पाचन डॉक्टर (गैस्ट्रोएंटेरोलॉजिस्ट)",
    spec_oncologist: "कैंसर डॉक्टर (ऑन्कोलॉजिस्ट)",
    spec_nephrologist: "किडनी डॉक्टर (नेफ्रोलॉजिस्ट)",
    spec_pulmonologist: "फेफड़ों के डॉक्टर (पल्मोनोलॉजिस्ट)",
    spec_gynecologist: "महिला स्वास्थ्य डॉक्टर (गाइनोकोलॉजिस्ट)",
    spec_pediatrician: "बच्चों के डॉक्टर (पीडियाट्रिशियन)",
    spec_psychiatrist: "मानसिक स्वास्थ्य डॉक्टर (साइकियाट्रिस्ट)",
    spec_dentist: "दंत चिकित्सक (डेंटिस्ट)",
    spec_general_physician: "सामान्य डॉक्टर (जनरल फिजिशियन)"
  },
  mr: {
    // Nav / Sidebar / Header
    dashboard: "डॅशबोर्ड",
    symptomChecker: "लक्षण तपासक",
    aiChat: "एआय चॅट Q&A",
    medicationInfo: "औषधे",
    visualAnalyzer: "व्हिज्युअल विश्लेषक",
    preventiveCare: "प्रतिबंधात्मक काळजी",
    bookmarks: "बुकमार्क",
    settings: "सेटिंग्ज",
    careHub: "क्युराहेल्थ एआय केअर हब",
    safetyScanner: "स्थानिक 911 सुरक्षा स्कॅनर सक्रिय",

    // Dashboard
    encryptedCare: "एनक्रिप्टेड आणि गोपनीय एआय केअर",
    heroTitle: "तुमच्या सेवेत डिजिटल आरोग्य बुद्धिमत्ता",
    heroDesc: "त्वरित वैद्यकीय मूल्यमापन मिळवा, औषधांची माहिती तपासा किंवा आमच्या एआय कल्याण सहाय्यकाशी बोला। सर्व अंतर्दृष्टी संरचित आहेत आणि सुरक्षा फिल्टरद्वारे समर्थित आहेत।",
    symptomAssessment: "लक्षण मूल्यमापन",
    askAIChat: "एआय चॅट विचारा",
    runSymptomCheck: "लक्षण तपासणी करा",
    lookupMedication: "औषध शोधा",
    analyzeImage: "प्रतिमेचे विश्लेषण करा",
    dailyTips: "दैनिक प्रतिबंधात्मक आरोग्य टिप्स",
    tipCategory: "टिप श्रेणी",
    recentActivity: "अलीकडील क्रियाकलाप लॉग",
    cardSymptomDesc: "एक संरचित क्लिनिकल मूल्यांकन अहवाल तयार करण्यासाठी लक्षणे स्पष्ट करणाऱ्या प्रश्नावलीमध्ये सहभागी व्हा।",
    cardMedDesc: "डोस मर्यादा, जेनेरिक नावे, संभाव्य औषध परस्पर क्रिया आणि चेतावणी अस्वीकरणांचे विश्लेषण करा।",
    cardVisionDesc: "दृष्टी विश्लेषणासाठी प्रिस्क्रिप्शन लेबल, औषध पॅकेजिंग किंवा त्वचा संसर्ग तपशील अपलोड करा।",
    consultations: "सल्लामसलत",
    chats: "चॅट्स",
    bookmarksSaved: "बुकमार्क आणि जतन केलेली माहिती",

    // Symptom Checker
    clinicalSymptomAssessment: "क्लिनिकल लक्षण मूल्यमापन",
    enterSymptom: "तुमच्या लक्षणांचे तपशीलवार वर्णन करा (उदा. ३ दिवस ताप)...",
    emergencyWarning: "गंभीर आणीबाणीची चेतावणी",
    callEmergency: "आणीबाणी सेवांना कॉल करा (911)",
    back: "मागे",
    submit: "सबमिट करा",
    loading: "विश्लेषण करत आहे...",
    clear: "साफ करा",
    search: "शोधा",
    startIntake: "तपासणी सुरू करा",
    intakeFollowUp: "तपासणी फॉलो-अप",
    clinicalFollowUp: "क्लिनिकल फॉलो-अप",
    nextQuestion: "पुढील प्रश्न",
    prevQuestion: "मागील प्रश्न",
    generateFinalAssessment: "अंतिम मूल्यमापन तयार करा",
    symptomCheckerReport: "लक्षण तपासक अहवाल",
    bookmarkReport: "अहवाल बुकमार्क करा",
    printSummary: "सारांश प्रिंट करा",
    startNewAssessment: "नवीन मूल्यमापन सुरू करा",
    restartChecker: "तपासक पुन्हा सुरू करा",
    selectOptionError: "सुरू ठेवण्यासाठी कृपया एक उत्तर निवडा किंवा टाईप करा।",

    // AI Chat
    aiHealthExploration: "एआय आरोग्य अन्वेषण",
    commonExplorations: "सामान्य आरोग्य अन्वेषण",
    askAssistant: "सामान्य आरोग्य प्रश्न किंवा लक्षणे विचारा...",
    clearHistory: "इतिहास साफ करा",
    speakResponse: "उत्तर बोला",
    stopSpeaking: "बोलणे थांबवा",
    thinking: "विचार करत आहे आणि उत्तर तयार करत आहे...",
    send: "पाठवा",

    // Medications
    medicationPortal: "औषध माहिती पोर्टल",
    searchMedication: "औषध शोधा...",
    recentSearches: "अलीकडील शोध",
    dosageLimits: "डोस मर्यादा",
    activeIngredients: "सक्रिय घटक",
    drugInteractions: "औषध परस्पर क्रिया",
    sideEffects: "दुष्परिणाम",
    warnings: "इशारे आणि विरोधाभास",

    // Visual Analyzer
    visualHealthAnalyzer: "व्हिज्युअल आरोग्य विश्लेषक",
    visualUploadDesc: "तपशीलवार एआय विश्लेषणासाठी औषध लेबल, गोळ्यांची बाटली किंवा त्वचेच्या स्थितीची प्रतिमा अपलोड करा।",
    category: "श्रेणी",
    medicationLabel: "औषध लेबल",
    skinCondition: "त्वचेची स्थिती",
    dragDropText: "तुमची प्रतिमा येथे ड्रॅग आणि ड्रॉप करा किंवा ब्राउझ करण्यासाठी क्लिक करा",
    analyzingImage: "प्रतिमेचे विश्लेषण केले जात आहे...",
    visionAnalysisResult: "व्हिज्युअल विश्लेषण परिणाम",

    // Bookmarks
    savedBookmarks: "बुकमार्क केलेले साहित्य",
    noBookmarks: "अद्याप कोणतीही बुकमार्क केलेली सामग्री नाही।",

    // Settings
    settingsCustomization: "सेटिंग्ज आणि सानुकूलन",
    themeMode: "थीम मोड",
    activeTheme: "सक्रिय थीम",
    lightMode: "लाइट मोड",
    darkMode: "डार्क मोड",
    dbManagement: "डेटाबेस व्यवस्थापन",
    clearSaved: "जतन केलेला इतिहास साफ करा",
    clearSavedDesc: "यामुळे सर्व स्थानिक सल्लामसलत अहवाल, बुकमार्क आणि चॅट इतिहास कायमचे हटवले जातील।",
    deleteAllData: "सर्व डेटा हटवा",

    // Nearby Specialists
    nearbySpecialists: "जवळचे तज्ञ",
    findSpecialist: "जवळचे तज्ञ शोधा",
    findCareText: "स्पेशालिटीनुसार जवळचे डॉक्टर आणि रुग्णालये शोधा",
    geoPrompt: "क्युराहेल्थ तुम्हाला जवळचे उपचार दाखवण्यासाठी तुमच्या स्थानाचा ॲक्सेस मिळवू इच्छितो.",
    allowLocation: "लोकेशन ॲक्सेस द्या",
    enterAddress: "किंवा तुमचे शहर किंवा पिनकोड प्रविष्ट करा:",
    searchRadius: "शोध त्रिज्या",
    km: "किमी",
    noSpecialists: "जवळ कोणतेही निकाल आढळले नाहीत. मोठी त्रिज्या वापरून पहा किंवा मापदंड बदला.",
    findNearbyCareBtn: "तुमच्या जवळ तज्ञ शोधा",
    demoMockBadge: "डेमो मोड: सिम्युलेटेड तज्ञ",
    rating: "रेटिंग",
    getDirections: "दिशा-निर्देश मिळवा",
    viewOnMap: "नकाशावर पहा",
    providerSearchDisclaimer: "निकाल Google Places कडून मिळवले आहेत आणि ते वैद्यकीय शिफारस किंवा मान्यता नाहीत; नेहमी थेट सुविधेकडून क्रेडेंशियल्स सत्यापित करा.",
    spec_neurologist: "मेंदू आणि मज्जासंस्था डॉक्टर (न्यूरोलॉजिस्ट)",
    spec_neurosurgeon: "मेंदू शल्यचिकित्सक (न्यूरोसर्जन)",
    spec_cardiologist: "हृदय रोग डॉक्टर (कार्डियोलॉजिस्ट)",
    spec_orthopedist: "हाडे आणि सांधे डॉक्टर (ऑर्थोपेडिस्ट)",
    spec_dermatologist: "त्वचा रोग डॉक्टर (डर्मेटोलॉजिस्ट)",
    spec_ent: "कान/नाक/घसा डॉक्टर (ईएनटी)",
    spec_ophthalmologist: "डोळ्यांचे डॉक्टर (ऑप्थल्मोलॉजिस्ट)",
    spec_gastroenterologist: "पोट आणि पचन डॉक्टर (गैस्ट्रोएंटेरोलॉजिस्ट)",
    spec_oncologist: "कर्करोग डॉक्टर (ऑन्कोलॉजिस्ट)",
    spec_nephrologist: "किडनी डॉक्टर (नेफ्रोलॉजिस्ट)",
    spec_pulmonologist: "फुफ्फुसाचे डॉक्टर (पल्मोनोलॉजिस्ट)",
    spec_gynecologist: "महिला आरोग्य डॉक्टर (गायनोकोलॉजिस्ट)",
    spec_pediatrician: "बच्चों के डॉक्टर (बालरोगतज्ञ)",
    spec_psychiatrist: "मानसिक आरोग्य डॉक्टर (साइकियाट्रिस्ट)",
    spec_dentist: "दंतवैद्य (डेंटिस्ट)",
    spec_general_physician: "सामान्य डॉक्टर (जनरल फिजिशियन)"
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
