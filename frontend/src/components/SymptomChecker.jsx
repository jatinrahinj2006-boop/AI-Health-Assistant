import React, { useState } from 'react';
import { 
  Stethoscope, 
  ArrowRight, 
  ArrowLeft,
  Loader,
  AlertTriangle,
  Heart,
  ChevronRight,
  ShieldCheck,
  Check,
  Printer,
  Bookmark,
  Activity,
  Mic
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import StructuredResultCard from './StructuredResultCard';
import { useLanguage } from '../context/LanguageContext';
import { useVoice } from '../hooks/useVoice';

export default function SymptomChecker({ onTriggerEmergency, resetNavReport, initialReport }) {
  const { language, t } = useLanguage();
  const { isListening, voiceSupported, startListening, stopListening } = useVoice();
  const [activeMicField, setActiveMicField] = useState(null); // 'symptom' or 'custom'

  const [step, setStep] = useState(initialReport ? 'report' : 'input'); // 'input', 'questions', 'report'
  const [symptomText, setSymptomText] = useState(initialReport ? 'Saved Report' : '');
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null); // of type FollowUpQuestion (question_text, options)
  const [history, setHistory] = useState([]); // of type list of SymptomQA (question, answer)
  const [selectedOption, setSelectedOption] = useState('');
  const [customTextAnswer, setCustomTextAnswer] = useState('');
  
  // Final Report state
  const [report, setReport] = useState(initialReport || null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Triggered on first submit
  const handleStartChecker = async (e) => {
    e.preventDefault();
    if (!symptomText.trim()) return;

    setLoading(true);
    try {
      const response = await api.startSymptomCheck(symptomText, language);
      
      if (response.done) {
        if (response.assessment.is_emergency) {
          onTriggerEmergency(true, false, response.assessment.emergency_message, '');
        }
        setReport(response.assessment);
        setStep('report');
        return;
      }

      setCurrentQuestion(response.next_question);
      setHistory([]);
      setSelectedOption('');
      setCustomTextAnswer('');
      setStep('questions');
    } catch (err) {
      console.error("Failed to start symptom checker", err);
      alert("Error starting intake: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    const answer = selectedOption || customTextAnswer.trim();
    if (!answer) {
      alert("Please select or type an answer to continue.");
      return;
    }

    const newQA = {
      question: currentQuestion.question_text,
      answer: answer
    };
    
    const updatedHistory = [...history, newQA];
    setHistory(updatedHistory);
    
    setLoading(true);
    try {
      const response = await api.followUpSymptomCheck(symptomText, updatedHistory, language);
      
      if (response.done) {
        if (response.assessment.is_emergency) {
          onTriggerEmergency(true, false, response.assessment.emergency_message, '');
        }
        setReport(response.assessment);
        setStep('report');
        setIsBookmarked(false);

        // Save to recent consultations in localStorage
        const saved = localStorage.getItem('health_assistant_consults') || '[]';
        const consults = JSON.parse(saved);
        const newEntry = {
          symptom: symptomText,
          report: response.assessment,
          date: new Date().toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        };
        localStorage.setItem('health_assistant_consults', JSON.stringify([newEntry, ...consults]));
      } else {
        setCurrentQuestion(response.next_question);
        setSelectedOption('');
        setCustomTextAnswer('');
      }
    } catch (err) {
      console.error("Failed to send follow-up", err);
      alert("Error sending answer: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevQuestion = () => {
    if (history.length > 0) {
      const popped = [...history];
      popped.pop();
      setHistory(popped);
      setStep('input');
    } else {
      setStep('input');
    }
  };

  const handleBookmark = () => {
    if (!report) return;
    const saved = localStorage.getItem('health_assistant_bookmarks') || '[]';
    const list = JSON.parse(saved);
    
    if (isBookmarked) {
      const filtered = list.filter(item => item.title !== symptomText);
      localStorage.setItem('health_assistant_bookmarks', JSON.stringify(filtered));
      setIsBookmarked(false);
    } else {
      const newBookmark = {
        type: 'symptom report',
        title: symptomText,
        report: report,
        date: new Date().toLocaleDateString()
      };
      localStorage.setItem('health_assistant_bookmarks', JSON.stringify([newBookmark, ...list]));
      setIsBookmarked(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRestart = () => {
    setStep('input');
    setSymptomText('');
    setReport(null);
    if (resetNavReport) resetNavReport();
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* Dynamic State Layouts */}
      <AnimatePresence mode="wait">
        
        {/* STEP 1: Symptom Input Form */}
        {step === 'input' && (
          <motion.div 
            key="input-step"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="glass-panel p-6 md:p-8"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-health-500/10 rounded-2xl text-health-500">
                <Stethoscope className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold dark:text-white font-sans">{t('clinicalSymptomAssessment')}</h2>
              </div>
            </div>

            <form onSubmit={handleStartChecker} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Primary Symptom & Duration
                </label>
                <div className="relative">
                  <textarea
                    rows={4}
                    className="w-full p-4 pr-12 rounded-xl border border-slate-200/50 dark:border-slate-800/40 bg-slate-500/5 focus:bg-slate-500/10 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-health-500 transition-all font-sans leading-relaxed"
                    placeholder={t('enterSymptom')}
                    value={symptomText}
                    onChange={(e) => setSymptomText(e.target.value)}
                  />
                  {voiceSupported && (
                    <button
                      type="button"
                      onClick={() => {
                        if (isListening && activeMicField === 'symptom') {
                          stopListening();
                          setActiveMicField(null);
                        } else {
                          setActiveMicField('symptom');
                          startListening((text) => {
                            setSymptomText(prev => prev ? prev + ' ' + text : text);
                            setActiveMicField(null);
                          });
                        }
                      }}
                      className={`absolute right-3 bottom-4 p-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                        isListening && activeMicField === 'symptom'
                          ? 'bg-red-500 text-white animate-pulse shadow-glow-red'
                          : 'bg-slate-500/10 text-slate-400 hover:text-slate-200'
                      }`}
                      title="Voice Input"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 bg-health-500/5 rounded-xl border border-health-500/10 flex items-start space-x-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                <ShieldCheck className="w-5 h-5 text-health-500 flex-shrink-0 mt-0.5" />
                <span>
                  Our safety screening scans your input locally to trigger rapid emergency banners if critical cardiovascular or respiratory symptoms are detected.
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading || !symptomText.trim()}
                  className={`px-6 py-3 rounded-xl font-semibold text-sm flex items-center space-x-2 transition-all shadow-lg ${
                    symptomText.trim() && !loading
                      ? 'bg-health-500 text-white hover:bg-health-600 hover:shadow-glow-teal hover:scale-[1.02] cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>{t('loading')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('startIntake')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* STEP 2: Intake Follow-up Questions */}
        {step === 'questions' && currentQuestion && (
          <motion.div 
            key="questions-step"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="glass-panel p-6 md:p-8"
          >
            {/* Top progress bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold mb-2">
                <span className="uppercase tracking-wider">{t('clinicalFollowUp')}</span>
                <span>{t('nextQuestion')} {history.length + 1}</span>
              </div>
              <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-health-500" 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(90, (history.length / 4) * 100)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <h3 className="text-base md:text-lg font-bold dark:text-white font-sans leading-snug mb-6">
              {currentQuestion.question_text}
            </h3>

            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options && currentQuestion.options.length > 0 ? (
                <div className="grid grid-cols-1 gap-2.5">
                  {currentQuestion.options.map((option) => {
                    const isSelected = selectedOption === option;
                    return (
                      <button
                        key={option}
                        onClick={() => {
                          setSelectedOption(option);
                          setCustomTextAnswer(''); // Clear custom
                        }}
                        className={`w-full p-4 rounded-xl border text-left text-xs md:text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                          isSelected 
                            ? 'bg-health-500/10 border-health-500 text-health-600 dark:text-health-300' 
                            : 'border-slate-200/50 dark:border-slate-800/40 hover:bg-slate-500/5 dark:text-slate-200'
                        }`}
                      >
                        <span>{option}</span>
                        {isSelected && (
                          <div className="p-1 bg-health-500 rounded-full text-white">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {/* Custom Text/Add details input */}
              <div className="pt-2">
                <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Or specify custom details:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full p-3.5 pr-12 rounded-xl border border-slate-200/50 dark:border-slate-800/40 bg-slate-500/5 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-health-500"
                    placeholder="Type your own answer here if none of the above match..."
                    value={selectedOption && !customTextAnswer ? '' : customTextAnswer}
                    onChange={(e) => {
                      setCustomTextAnswer(e.target.value);
                      setSelectedOption(''); // Clear option selection
                    }}
                  />
                  {voiceSupported && (
                    <button
                      type="button"
                      onClick={() => {
                        if (isListening && activeMicField === 'custom') {
                          stopListening();
                          setActiveMicField(null);
                        } else {
                          setActiveMicField('custom');
                          startListening((text) => {
                            setCustomTextAnswer(prev => prev ? prev + ' ' + text : text);
                            setSelectedOption('');
                            setActiveMicField(null);
                          });
                        }
                      }}
                      className={`absolute right-2 top-2 p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                        isListening && activeMicField === 'custom'
                          ? 'bg-red-500 text-white animate-pulse shadow-glow-red'
                          : 'bg-slate-500/10 text-slate-400 hover:text-slate-200'
                      }`}
                      title="Voice Input"
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Nav controls */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200/25 dark:border-slate-800/25">
              <button
                onClick={handlePrevQuestion}
                className="px-4 py-2 border border-slate-200/50 dark:border-slate-800/40 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-500/5 flex items-center space-x-1 cursor-pointer transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('back')}</span>
              </button>

              <button
                onClick={handleNextQuestion}
                disabled={loading}
                className="px-5 py-2.5 bg-health-500 hover:bg-health-600 text-white rounded-xl text-xs font-semibold hover:shadow-glow-teal flex items-center space-x-1 cursor-pointer transition-all hover:scale-[1.02]"
              >
                {loading ? (
                  <>
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                    <span>{t('loading')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('submit')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: final assessment structured report */}
        {step === 'report' && report && (
          <motion.div 
            key="report-step"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6 print:space-y-4 print:p-0"
          >
            {/* Header controls (Screen only) */}
            <div className="flex justify-between items-center print:hidden">
              <button 
                onClick={handleRestart}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center space-x-1 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('startNewAssessment')}</span>
              </button>

              <div className="flex space-x-2">
                <button
                  onClick={handleBookmark}
                  className={`p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/40 hover:bg-slate-500/5 transition-all flex items-center justify-center ${
                    isBookmarked ? 'text-rose-500 bg-rose-500/5 border-rose-500/20' : 'text-slate-400'
                  }`}
                  title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Report'}
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                </button>
                <button
                  onClick={handlePrint}
                  className="p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/40 hover:bg-slate-500/5 text-slate-400 transition-all flex items-center justify-center"
                  title="Print Report"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            <StructuredResultCard 
              result={report} 
              onBookmark={handleBookmark} 
              isBookmarked={isBookmarked} 
            />

            {/* Restart button screen only */}
            <div className="flex justify-center print:hidden">
              <button
                onClick={handleRestart}
                className="px-6 py-3 bg-health-500 hover:bg-health-600 hover:shadow-glow-teal text-white rounded-xl font-bold text-sm flex items-center space-x-2 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Stethoscope className="w-4 h-4" />
                <span>{t('restartChecker')}</span>
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
