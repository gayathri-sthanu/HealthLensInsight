import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, AlertCircle, Bookmark, Share2 } from 'lucide-react';
import FileUploader from './components/FileUploader';
import InsightCard from './components/InsightCard';
import ThemeToggle from './components/ThemeToggle';
import { analyzeHealthReport, HealthInsights } from './services/geminiService';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<HealthInsights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedInsights, setSavedInsights] = useState<HealthInsights[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('saved_insights');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('saved_insights', JSON.stringify(savedInsights));
  }, [savedInsights]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const resultBase64 = e.target?.result as string;
        if (!resultBase64) {
            setError("Failed to read file.");
            setLoading(false);
            return;
        }
        const base64 = resultBase64.split(',')[1];
        try {
          const result = await analyzeHealthReport(base64, selectedFile.type);
          const insightWithId = {
            ...result,
            id: Math.random().toString(36).substring(7),
            timestamp: Date.now()
          };
          setInsights(insightWithId);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to analyze report. Please try again.");
        } finally {
          setLoading(false);
        }
      };
      reader.onerror = () => {
        setError("Error reading file. Please try another one.");
        setLoading(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      setError("An unexpected error occurred. Please refresh and try again.");
      setLoading(false);
    }
  };

  const [view, setView] = useState<'home' | 'history'>('home');

  const handleReset = () => {
    setInsights(null);
    setError(null);
    setSelectedFile(null);
    setView('home');
  };

  const handleShare = async (customInsights?: HealthInsights) => {
    const dataToShare = customInsights || insights;
    if (!dataToShare) return;
    const shareData = {
      title: 'HealthLens Insights',
      text: `My Health Score is ${dataToShare.health_score} (${dataToShare.score_label}). Check out my health insights!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const toggleBookmark = (insight: HealthInsights) => {
    setSavedInsights(prev => {
      const isBookmarked = prev.some(s => s.id === insight.id);
      if (isBookmarked) {
        return prev.filter(s => s.id !== insight.id);
      } else {
        return [insight, ...prev];
      }
    });
  };

  const isCurrentBookmarked = insights ? savedInsights.some(s => s.id === insights.id) : false;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900 transition-colors duration-300">
      {/* Header */}
      <header className="p-6 sm:p-10 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={handleReset} id="app-logo">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-none group-hover:rotate-12 transition-transform">
            <Activity size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Health<span className="text-blue-600">Lens</span>
          </span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setView(view === 'history' ? 'home' : 'history')}
            className={`relative p-2 transition-all rounded-full ${view === 'history' ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"}`}
            title="Saved Insights"
          >
            <Bookmark size={20} className={view === 'history' ? "fill-blue-600" : ""} />
            {savedInsights.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white border-2 border-[#F8FAFC] dark:border-slate-950">
                {savedInsights.length}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => handleShare()}
            className="p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors rounded-full"
            title="Share Insights"
          >
            <Share2 size={20} />
          </button>

          <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 sm:pt-16">
        <AnimatePresence mode="wait">
          {view === 'history' ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-12 pb-32"
            >
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Saved Insights</h1>
                <p className="text-slate-500 dark:text-slate-400">Review your past health report analyses.</p>
              </div>

              {savedInsights.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white dark:bg-slate-900/50 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800">
                  <Bookmark size={48} className="text-slate-200 dark:text-slate-800" />
                  <p className="text-slate-400 font-medium font-sans">No saved reports yet. Analyze a report to save it here.</p>
                  <button 
                    onClick={() => setView('home')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold text-sm hover:bg-blue-700 transition-colors"
                  >
                    Start Analysis
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedInsights.map((saved) => (
                    <motion.div
                      key={saved.id}
                      layout
                      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-6 shadow-sm flex flex-col gap-4 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                            saved.health_score > 70 ? 'bg-emerald-100 text-emerald-600' : 
                            saved.health_score > 50 ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
                          }`}>
                            {saved.health_score}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">Report Analysis</h3>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                              {saved.timestamp ? new Date(saved.timestamp).toLocaleDateString() : 'Unknown date'}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => toggleBookmark(saved)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                        "{saved.closing_quote}"
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setInsights(saved); setView('home'); }}
                          className="flex-1 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors"
                        >
                          View Full
                        </button>
                        <button
                          onClick={() => handleShare(saved)}
                          className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 transition-colors"
                        >
                          <Share2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : !insights ? (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center text-center space-y-12"
            >
              <div className="space-y-4 max-w-2xl px-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                    <Activity size={14} />
                    AI-Powered Diagnostics
                </div>
                <h1 className="text-4xl sm:text-7xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                  Understand your health with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Precision</span>
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl mx-auto">
                  Upload your medical report and let our AI transform complex metrics into actionable behavioral guidance.
                </p>
              </div>

              <FileUploader 
                onFileSelect={handleFileSelect} 
                onAnalyze={handleAnalyze}
                isLoading={loading} 
              />

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-100 dark:border-rose-900/30 text-sm font-medium"
                  id="error-message"
                >
                  <AlertCircle size={18} />
                  {error}
                  <button onClick={() => setError(null)} className="ml-2 hover:opacity-70 transition-opacity">✕</button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="insights"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring', damping: 20 }}
            >
              <InsightCard 
                insights={insights} 
                onReset={handleReset} 
                isBookmarked={isCurrentBookmarked}
                onToggleBookmark={() => toggleBookmark(insights)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-50/50 dark:bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}
