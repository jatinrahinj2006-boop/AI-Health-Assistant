import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Loader2, 
  AlertTriangle, 
  Bookmark, 
  BookmarkCheck,
  CheckCircle,
  FileText,
  ShieldCheck,
  Printer,
  ChevronRight,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';

export default function ImageAnalysis({ onTriggerEmergency }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [category, setCategory] = useState('medication_packaging'); // 'medication_packaging' or 'skin_condition'
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    // Check bookmark state
    if (!report) return;
    const title = `${category === 'medication_packaging' ? 'Pill Visual' : 'Skin Visual'}: ${report.summary.slice(0, 25)}...`;
    const saved = localStorage.getItem('health_assistant_bookmarks') || '[]';
    const bookmarks = JSON.parse(saved);
    const found = bookmarks.some(b => b.title === title);
    setIsBookmarked(found);
  }, [report, category]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setReport(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmitAnalysis = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const assessment = await api.analyzeImage(selectedFile, category);
      
      if (assessment.is_emergency) {
        onTriggerEmergency(true, false, assessment.emergency_message, '');
      }

      setReport(assessment);

      // Save to recent consultations in localStorage
      const title = `${category === 'medication_packaging' ? 'Pill Visual' : 'Skin Visual'} - ${selectedFile.name}`;
      const saved = localStorage.getItem('health_assistant_consults') || '[]';
      const history = JSON.parse(saved);
      const newEntry = {
        symptom: title,
        report: assessment,
        date: new Date().toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      localStorage.setItem('health_assistant_consults', JSON.stringify([newEntry, ...history]));

    } catch (err) {
      console.error('Image analysis failed', err);
      alert('Image analysis failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = () => {
    if (!report) return;
    const title = `${category === 'medication_packaging' ? 'Pill Visual' : 'Skin Visual'}: ${report.summary.slice(0, 25)}...`;
    const saved = localStorage.getItem('health_assistant_bookmarks') || '[]';
    const bookmarks = JSON.parse(saved);
    
    if (isBookmarked) {
      const filtered = bookmarks.filter(b => b.title !== title);
      localStorage.setItem('health_assistant_bookmarks', JSON.stringify(filtered));
      setIsBookmarked(false);
    } else {
      const newBookmark = {
        type: 'visual report',
        title: title,
        report: report,
        date: new Date().toLocaleDateString(),
        category: category === 'medication_packaging' ? 'Pill Visual' : 'Skin Visual'
      };
      localStorage.setItem('health_assistant_bookmarks', JSON.stringify([newBookmark, ...bookmarks]));
      setIsBookmarked(true);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setReport(null);
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* 1. Main Upload Panel */}
      {!report && (
        <div className="glass-panel p-6 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
              <Camera className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold dark:text-white font-sans">Visual Health Analyzer</h2>
              <p className="text-xs text-slate-400">Upload pill packaging, label contents, or visible skin conditions for diagnostic intelligence</p>
            </div>
          </div>

          {/* Toggle Category selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setCategory('medication_packaging')}
              className={`p-3.5 rounded-xl border text-center text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                category === 'medication_packaging'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                  : 'border-slate-200/50 dark:border-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-500/5'
              }`}
            >
              Medicine Packaging / Pill
            </button>
            <button
              onClick={() => setCategory('skin_condition')}
              className={`p-3.5 rounded-xl border text-center text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                category === 'skin_condition'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                  : 'border-slate-200/50 dark:border-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-500/5'
              }`}
            >
              Visible Skin Condition
            </button>
          </div>

          {/* Drag & Drop File Container */}
          {!previewUrl ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                dragOver 
                  ? 'border-amber-500 bg-amber-500/5' 
                  : 'border-slate-200 dark:border-slate-800 bg-slate-500/5 hover:bg-slate-500/10'
              }`}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <div className="p-4 bg-amber-500/10 rounded-full text-amber-500 mb-4 hover:scale-105 transition-all">
                  <Upload className="w-8 h-8" />
                </div>
                <span className="text-sm font-bold dark:text-white mb-1">Drag and Drop Image Here</span>
                <span className="text-xs text-slate-400 mb-4">Supports PNG, JPG, or WEBP (max 5MB)</span>
                <span className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl shadow transition-all">
                  Browse Files
                </span>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/40 bg-black/40 flex items-center justify-center max-h-80">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-h-80 object-contain w-auto rounded-lg"
                />
                <button
                  onClick={handleReset}
                  className="absolute top-4 right-4 p-2 bg-black/60 rounded-xl text-white hover:bg-black/80 transition-all cursor-pointer"
                  title="Remove Image"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/10 flex items-start space-x-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                <ShieldCheck className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>
                  Our Visual intelligence reads packaging labels or rash characteristics and returns structured guidance. Remember, this is NOT a replacement for a medical diagnosis.
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSubmitAnalysis}
                  disabled={loading}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-xl transition-all shadow-lg hover:shadow-glow-teal hover:scale-[1.02] flex items-center space-x-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing Visuals...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Image for Analysis</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Visual Analysis Report */}
      <AnimatePresence>
        {report && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Controls */}
            <div className="flex justify-between items-center print:hidden">
              <button 
                onClick={handleReset}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center space-x-1 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Upload Different Image</span>
              </button>

              <div className="flex space-x-2">
                <button
                  onClick={handleBookmark}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                    isBookmarked ? 'text-rose-500 bg-rose-500/5 border-rose-500/20' : 'text-slate-400 border-slate-200/50 dark:border-slate-800/40 hover:bg-slate-500/5'
                  }`}
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                </button>
                <button
                  onClick={() => window.print()}
                  className="p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/40 hover:bg-slate-500/5 text-slate-400 transition-all flex items-center justify-center cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Assessment Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Image Preview Left (4 cols) */}
              <div className="md:col-span-4 print:hidden">
                <div className="glass-panel p-4 sticky top-6">
                  <span className="text-[9px] px-2 py-0.5 rounded bg-slate-400/10 dark:bg-slate-700/30 text-slate-400 font-semibold mb-3 inline-block uppercase">
                    Analyzed Image
                  </span>
                  <div className="rounded-xl overflow-hidden border border-slate-200/50 dark:border-slate-800/40 bg-black/10">
                    <img src={previewUrl} alt="Analyzed" className="w-full object-cover max-h-60" />
                  </div>
                  <div className="mt-3 flex items-center space-x-1.5 text-xs text-slate-400">
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    <span className="truncate">{selectedFile.name}</span>
                  </div>
                </div>
              </div>

              {/* Assessment Report Right (8 cols) */}
              <div className="md:col-span-8 print:col-span-12">
                <div className="glass-panel p-6 md:p-8 bg-white dark:bg-slate-900/60 shadow-xl border border-slate-200/80 dark:border-slate-800/50 print:border-none print:shadow-none print:bg-white print:text-black">
                  
                  {/* Header */}
                  <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-slate-200/50 dark:border-slate-800/50">
                    <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                      <Camera className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold dark:text-white print:text-black font-sans leading-tight">Visual Analysis Report</h2>
                      <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">
                        {category === 'medication_packaging' ? 'Medicine Label Identification' : 'Dermatological Analysis'}
                      </p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-400 mb-2 uppercase tracking-wider font-sans">
                        Visual Findings Summary
                      </h3>
                      <p className="p-4 bg-slate-500/5 rounded-xl border border-slate-200/30 dark:border-slate-800/30 text-xs md:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
                        {report.summary}
                      </p>
                    </div>

                    {/* Causes */}
                    <div>
                      <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-400 mb-2.5 uppercase tracking-wider font-sans">
                        Possible Identifications
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {report.possible_causes.map((c, i) => (
                          <span key={i} className="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-sans">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Self Care / Warnings */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                      <div>
                        <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-400 mb-2.5 uppercase tracking-wider font-sans flex items-center">
                          <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                          Recommendations
                        </h3>
                        <ul className="space-y-2">
                          {report.self_care.map((tip, idx) => (
                            <li key={idx} className="flex items-start text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                              <ChevronRight className="w-4 h-4 text-amber-500 mr-1.5 flex-shrink-0 mt-0.5" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-400 mb-2.5 uppercase tracking-wider font-sans flex items-center text-rose-500">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Red Flag Safety Warnings
                        </h3>
                        <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-2">
                          {report.warning_signs.map((sign, idx) => (
                            <div key={idx} className="flex items-start text-xs md:text-sm text-rose-700 dark:text-rose-350 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2 flex-shrink-0 mt-2"></span>
                              <span>{sign}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Doctor visit advice */}
                    <div className="pt-2">
                      <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-400 mb-2 uppercase tracking-wider font-sans">
                        Next Steps Advice
                      </h3>
                      <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 text-xs md:text-sm text-slate-700 dark:text-slate-350 leading-relaxed font-sans">
                        {report.when_to_see_doctor}
                      </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
                      <div className="text-[10px] text-slate-400 leading-relaxed italic text-center px-4 font-sans">
                        {report.disclaimer}
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
