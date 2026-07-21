import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  User, 
  Activity,
  Bot, 
  Loader2, 
  Sparkles,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Mic,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import StructuredResultCard from './StructuredResultCard';
import { useLanguage } from '../context/LanguageContext';
import { useVoice } from '../hooks/useVoice';

const PRESETS = [
  "What is hypertension & how is it managed?",
  "What side effects does Ibuprofen have?",
  "Explain the difference between Type 1 and Type 2 diabetes",
  "How can I improve my sleep cycle naturally?"
];

export default function AIChat({ onTriggerEmergency }) {
  const { language, t } = useLanguage();
  const { 
    isListening, 
    voiceSupported, 
    speaking, 
    startListening, 
    stopListening, 
    speak, 
    stopSpeaking 
  } = useVoice();

  const [readAloud, setReadAloud] = useState(false);

  const [conversationId, setConversationId] = useState(() => {
    return 'chat_' + Date.now();
  });
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your AI Health Assistant. Ask me general health questions, medication facts, or describe symptoms. Note that I am here to provide information, not medical diagnoses.',
      assessment: null
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  // Stop speaking when user navigates away
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Auto-save conversation to local storage on message additions
  useEffect(() => {
    if (messages.length > 1) {
      const saved = localStorage.getItem('health_assistant_chats') || '{}';
      const chats = JSON.parse(saved);
      
      const lastMsg = messages[messages.length - 1];
      const snippet = lastMsg ? (lastMsg.content.slice(0, 60) + (lastMsg.content.length > 60 ? '...' : '')) : '';
      
      const firstUserMsg = messages.find(m => m.role === 'user');
      const title = firstUserMsg ? (firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '')) : 'General Exploration';
      
      chats[conversationId] = {
        id: conversationId,
        title: title,
        snippet: snippet,
        timestamp: new Date().toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        messages: messages
      };
      
      localStorage.setItem('health_assistant_chats', JSON.stringify(chats));
    }
  }, [messages, conversationId]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (text) => {
    const query = text || inputValue.trim();
    if (!query) return;

    if (!text) setInputValue('');

    // 1. Client-side rapid keyword scan
    // We already do this via main APP hook or directly here for double-layered protection
    // Let's create user message bubble
    const userMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    
    setLoading(true);

    try {
      // 2. Call chat api
      // Pass last 5 messages as context history
      const historyContext = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.content }));

      const response = await api.sendChatMessage(query, historyContext, language);

      // 3. If an emergency was detected
      if (response.assessment && response.assessment.is_emergency) {
        onTriggerEmergency(
          true,
          false,
          response.assessment.emergency_message || response.chat_reply,
          ''
        );
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.chat_reply,
          assessment: response.assessment
        }
      ]);

      if (readAloud) {
        speak(response.chat_reply);
      }
    } catch (err) {
      console.error("Chat message failed to send", err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry, I encountered an error: ${err.message}. Please try again later.`,
          assessment: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (preset) => {
    handleSend(preset);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col justify-between pb-6">
      
      {/* 1. Chat Scroll Container */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
        
        {/* Preset chips on empty chat */}
        {messages.length === 1 && (
          <div className="py-6 text-center">
            <div className="p-3 bg-indigoaccent-500/10 text-indigoaccent-500 rounded-full w-fit mx-auto mb-3">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-sm font-bold dark:text-white mb-4">Common Health Explorations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl mx-auto px-4">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetClick(preset)}
                  className="p-3 text-left border border-slate-200/50 dark:border-slate-800/40 bg-slate-500/5 hover:bg-slate-500/10 rounded-xl text-xs text-slate-600 dark:text-slate-300 font-medium transition-all hover:scale-[1.01] cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const isExpanded = expandedAssessmentId === index;
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={index}
                className={`flex space-x-3 max-w-[85%] ${isUser ? 'ml-auto justify-end flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isUser 
                    ? 'bg-health-500 text-white' 
                    : 'bg-indigoaccent-500/10 text-indigoaccent-500 border border-indigoaccent-500/20'
                }`}>
                  {isUser ? <User className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5" />}
                </div>

                {/* Message Content Area */}
                <div className="space-y-3">
                  <div className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed font-sans ${
                    isUser
                      ? 'bg-gradient-to-br from-health-600 to-health-700 text-white shadow-sm'
                      : 'glass-panel border border-slate-200/40 dark:border-slate-800/20 text-slate-800 dark:text-slate-100'
                  }`}>
                    {msg.content}
                  </div>

                  {/* Structured Assessment Card (if attached to AI response) */}
                  {!isUser && msg.assessment && (
                    <div className="max-w-xl">
                      <StructuredResultCard result={msg.assessment} />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Loading/Typing Indicator Bubble */}
        {loading && (
          <div className="flex space-x-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-indigoaccent-500/10 text-indigoaccent-500 border border-indigoaccent-500/20 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl glass-panel border border-slate-200/40 dark:border-slate-800/20 text-slate-400 text-xs flex items-center space-x-2">
              <span>Thinking and structuring response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 2. Chat Input Form Panel */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="glass-panel p-3 flex items-center space-x-3 bg-white/90 dark:bg-slate-950/70 border border-slate-200/50 dark:border-slate-800/50 shadow-lg"
      >
        {/* Web Speech Dictation mic button */}
        {voiceSupported && (
          <button
            type="button"
            onClick={() => {
              if (isListening) {
                stopListening();
              } else {
                startListening((text) => {
                  setInputValue(prev => prev ? prev + ' ' + text : text);
                });
              }
            }}
            className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-glow-red'
                : 'bg-slate-500/10 text-slate-400 hover:text-slate-200'
            }`}
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            <Mic className="w-4.5 h-4.5" />
          </button>
        )}

        <input
          type="text"
          disabled={loading}
          className="flex-1 bg-transparent p-2 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-xs md:text-sm"
          placeholder={t('askAssistant')}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />

        {/* Read Aloud Toggle button */}
        <button
          type="button"
          onClick={() => {
            const nextVal = !readAloud;
            setReadAloud(nextVal);
            if (!nextVal) stopSpeaking();
          }}
          className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
            readAloud
              ? 'bg-health-500/10 border border-health-500/30 text-health-500'
              : 'bg-slate-500/10 text-slate-400 border border-transparent'
          }`}
          title={readAloud ? "Mute Read Aloud" : "Enable Read Aloud"}
        >
          {readAloud ? <Volume2 className="w-4.5 h-4.5" /> : <VolumeX className="w-4.5 h-4.5" />}
        </button>

        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className={`p-3 rounded-xl transition-all ${
            inputValue.trim() && !loading
              ? 'bg-health-500 text-white hover:bg-health-600 shadow-md hover:shadow-glow-teal hover:scale-105 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </form>
    </div>
  );
}
