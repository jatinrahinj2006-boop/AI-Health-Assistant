import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

export function useVoice() {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      recognitionRef.current = rec;
    }
  }, []);

  // Map language codes to regional SpeechSynthesis locales
  const getLanguageLocale = () => {
    switch (language) {
      case 'hi': return 'hi-IN';
      case 'mr': return 'mr-IN';
      default: return 'en-US';
    }
  };

  const startListening = (onResult) => {
    if (!voiceSupported || !recognitionRef.current) return;
    
    recognitionRef.current.lang = getLanguageLocale();
    
    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onResult) onResult(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    try {
      recognitionRef.current.start();
    } catch (e) {
      console.warn("Speech recognition already active:", e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = (text, onEnd = null) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Stop any current speech
    
    // Clean text by stripping markdown or formatting characters for cleaner audio reading
    const cleanText = text
      .replace(/[*#_`~]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .slice(0, 500); // Read first 500 characters to keep it brief

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = getLanguageLocale();

    utterance.onstart = () => setSpeaking(true);
    
    utterance.onend = () => {
      setSpeaking(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.error("Speech synthesis error:", e);
      setSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  return {
    isListening,
    voiceSupported,
    speaking,
    startListening,
    stopListening,
    speak,
    stopSpeaking
  };
}
