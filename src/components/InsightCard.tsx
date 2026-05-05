import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Stethoscope, 
  Zap, 
  Eye, 
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Quote,
  Info,
  Bookmark,
  Share2,
  Activity,
  ChevronDown
} from 'lucide-react';
import { HealthInsights } from '../services/geminiService';

interface InsightCardProps {
  insights: HealthInsights;
  onReset: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

const getScoreColor = (score: number) => {
  if (score <= 30) return 'text-rose-600 dark:text-rose-400';
  if (score <= 50) return 'text-orange-700 dark:text-orange-500';
  if (score <= 70) return 'text-orange-500 dark:text-orange-400';
  if (score <= 85) return 'text-lime-600 dark:text-lime-400';
  return 'text-emerald-600 dark:text-emerald-400';
};

const getScoreBg = (score: number) => {
  if (score <= 30) return 'stroke-rose-600';
  if (score <= 50) return 'stroke-orange-700';
  if (score <= 70) return 'stroke-orange-500';
  if (score <= 85) return 'stroke-lime-600';
  return 'stroke-emerald-600';
};

export default function InsightCard({ insights, onReset, isBookmarked, onToggleBookmark }: InsightCardProps) {
  const [expandedOrgan, setExpandedOrgan] = useState<number | null>(null);
  const [expandedHabit, setExpandedHabit] = useState<number | null>(null);
  const [expandedWatch, setExpandedWatch] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30';
      case 'amber': return 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-800/30';
      case 'red': return 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 border-rose-100 dark:border-rose-800/30';
      case 'null': return 'bg-slate-50 text-slate-300 dark:bg-slate-900 dark:text-slate-700 border-transparent transition-opacity opacity-60';
      default: return 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-100 dark:border-slate-800';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-12 pb-32" id="insights-page">
      <div className="flex items-center justify-between">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium group"
          id="back-btn"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Analyse another report
        </button>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleBookmark}
            className={`p-2 rounded-full transition-all ${isBookmarked ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
            title={isBookmarked ? "Saved" : "Save Insight"}
          >
            <Bookmark size={20} className={isBookmarked ? 'fill-blue-600' : ''} />
          </button>
        </div>
      </div>

      {/* Health Score Gauge */}
      <section className="flex flex-col items-center justify-center py-6 space-y-4">
        <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform">
                <circle
                    cx="96"
                    cy="96"
                    r="84"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-slate-100 dark:text-slate-800"
                />
                <motion.circle
                    initial={{ strokeDashoffset: 528 }}
                    animate={{ strokeDashoffset: 528 - (528 * insights.health_score) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx="96"
                    cy="96"
                    r="84"
                    fill="none"
                    strokeDasharray="528"
                    strokeWidth="12"
                    strokeLinecap="round"
                    className={getScoreBg(insights.health_score)}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-0.5">Health Score</span>
                <span className={`text-5xl font-black tabular-nums transition-colors ${getScoreColor(insights.health_score)}`}>
                    {insights.health_score}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${getScoreColor(insights.health_score)}`}>
                    {insights.score_label}
                </span>
            </div>
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-8 h-8 bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 flex items-center justify-center shadow-md">
                <Activity size={14} className="text-blue-500" />
            </div>
            <div className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-2 w-10 h-10 bg-white dark:bg-slate-900 rounded-full border border-emerald-500 flex items-center justify-center shadow-md">
                <Zap size={18} className="text-emerald-500" />
            </div>
        </div>
        <p className="max-w-[200px] text-center text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Personalized analysis based on your unique biometric data points.
        </p>
      </section>

      {/* Section 1: Snapshot - Grid of 6 Organ Systems */}
      <section className="space-y-6">
        <div className="flex flex-col gap-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Functional Snapshot</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Key biometric systems categorized from your report</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {insights.clusters.map((cluster, i) => {
            const isNA = cluster.status === 'null';
            const isExpanded = expandedOrgan === i;
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex flex-col border rounded-[24px] shadow-sm overflow-hidden transition-all ${
                  isNA ? getStatusColor('null') : 'bg-white dark:bg-slate-950'
                } ${!isNA ? 'hover:shadow-md' : ''}`}
              >
                <button
                  disabled={isNA}
                  onClick={() => setExpandedOrgan(isExpanded ? null : i)}
                  className={`w-full p-5 flex items-center justify-between transition-colors ${
                    !isNA ? getStatusColor(cluster.status) : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xl ${isNA ? 'grayscale opacity-30 shadow-none' : ''}`}>{cluster.icon}</span>
                    <div className="text-left">
                      <h4 className={`font-bold ${isNA ? 'text-slate-400 dark:text-slate-600' : 'text-slate-900 dark:text-white dark:bg-transparent'}`}>
                        {cluster.name}
                      </h4>
                      {isNA && <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Not Available</span>}
                    </div>
                  </div>
                  {!isNA && (
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      className="text-slate-400"
                    >
                      <ChevronDown size={18} />
                    </motion.div>
                  )}
                </button>
                
                <AnimatePresence>
                  {isExpanded && !isNA && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal italic">
                        {cluster.summary}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Section 2: Cards Reordered - Habits, Watchlist, Doctor Questions */}
      <section className="grid grid-cols-1 gap-8">
        {/* Card 1: Habits (Replaced with expanding logic) */}
        {insights.cards.micro_habits.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[40px] overflow-hidden flex flex-col md:flex-row shadow-sm">
            <div className="p-8 sm:p-10 md:w-1/3 bg-emerald-50/30 dark:bg-emerald-950/5 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-[24px] flex items-center justify-center text-emerald-600 mb-6">
                <Zap size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Small Habits, Big Change</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Specific actions tied to your results. Progress is built daily.</p>
            </div>
            <div className="p-6 sm:p-10 flex-1">
              <div className="space-y-4">
                {insights.cards.micro_habits.map((h, i) => (
                  <div key={i} className="border border-slate-100 dark:border-slate-800 rounded-[24px] overflow-hidden">
                    <button 
                      onClick={() => setExpandedHabit(expandedHabit === i ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <div className="flex gap-4 items-center">
                        <span className="shrink-0 w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl flex items-center justify-center text-[10px] font-bold">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-base text-slate-800 dark:text-slate-200 font-bold leading-snug">{h.habit}</p>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/70">{h.metric_target}</span>
                        </div>
                      </div>
                      <ChevronDown size={18} className={`text-slate-300 transition-transform ${expandedHabit === i ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {expandedHabit === i && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="overflow-hidden bg-slate-50/50 dark:bg-slate-900/50"
                        >
                          <div className="px-12 pb-5 pt-1">
                            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                              {h.expected_outcome}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Card 2: Watch List (Expanding logic) */}
        {insights.cards.watch_list.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[40px] overflow-hidden flex flex-col md:flex-row shadow-sm">
            <div className="p-8 sm:p-10 md:w-1/3 bg-amber-50/30 dark:bg-amber-950/5 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
              <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-[24px] flex items-center justify-center text-amber-600 mb-6">
                <Eye size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Health Watchlist</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Simplified insights for borderline or trending metrics.</p>
            </div>
            <div className="p-6 sm:p-10 flex-1">
              <div className="space-y-4">
                {insights.cards.watch_list.map((m, i) => (
                  <div key={i} className="border border-slate-100 dark:border-slate-800 rounded-[24px] overflow-hidden transition-all">
                    <button 
                      onClick={() => setExpandedWatch(expandedWatch === i ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white text-base">{m.simplified_name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.metric}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <ChevronDown size={18} className={`text-slate-300 transition-transform ${expandedWatch === i ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    <AnimatePresence>
                      {expandedWatch === i && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="overflow-hidden bg-slate-50/50 dark:bg-slate-900/50"
                        >
                          <div className="p-5 space-y-4">
                            <div className="flex gap-4 text-[10px] font-bold">
                              <div className="px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                <span className="text-slate-400 mr-2">Result:</span>
                                <span className="text-slate-900 dark:text-slate-100">{m.result}</span>
                              </div>
                              <div className="px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                <span className="text-slate-400 mr-2">Range:</span>
                                <span className="text-slate-900 dark:text-slate-100">{m.range}</span>
                              </div>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal bg-white/80 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                              {m.note}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Card 3: Doctor Questions (Previously Card 1) */}
        {insights.cards.doctor_questions.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[40px] overflow-hidden flex flex-col md:flex-row shadow-sm">
            <div className="p-8 sm:p-10 md:w-1/3 bg-rose-50/30 dark:bg-rose-950/5 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
              <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/30 rounded-[24px] flex items-center justify-center text-rose-600 mb-6">
                <Stethoscope size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Top 3 Questions for your Doctor Consultation</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Prioritize these talking points to get clear guidance.</p>
            </div>
            <div className="p-8 sm:p-10 flex-1">
              <ul className="space-y-6">
                {insights.cards.doctor_questions.slice(0, 3).map((q, i) => (
                  <li key={i} className="flex gap-4 group">
                    <span className="shrink-0 w-8 h-8 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-110">{i+1}</span>
                    <p className="text-base text-slate-700 dark:text-slate-300 font-medium leading-relaxed pt-1">{q}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* Footer Actions */}
      <section className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onToggleBookmark}
          className={`w-full sm:w-auto group flex items-center justify-center gap-3 px-10 py-5 rounded-[24px] font-bold transition-all shadow-xl ${
            isBookmarked 
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100' 
              : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 active:scale-95 shadow-slate-200 dark:shadow-none'
          }`}
        >
          {isBookmarked ? (
            <>
              <Bookmark size={20} className="fill-current" />
              Insights Saved
            </>
          ) : (
            <>
              <Bookmark size={20} className="group-hover:translate-x-1 transition-transform" />
              Save to My Bookmarks
            </>
          )}
        </button>
      </section>

      {/* Motivational Quote */}
      <section className="pt-24 text-center space-y-8 max-w-4xl mx-auto">
          <div className="relative inline-block px-12 py-10">
              <Quote className="absolute -top-10 -left-6 text-blue-50 dark:text-blue-900/20 scale-[7] rotate-12 transition-transform group-hover:rotate-0" size={60} />
              <p className="relative z-10 text-3xl sm:text-5xl font-serif italic text-slate-800 dark:text-slate-100 leading-tight">
                  "{insights.closing_quote}"
              </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30" />
            <p className="italic text-slate-400 dark:text-slate-500 text-base font-medium max-w-lg">
                Your awareness is your greatest asset. By understanding your data, you've already started the journey to a healthier you.
            </p>
          </div>
      </section>

      {/* Footer Disclaimer */}
      <footer className="pt-12 sm:pt-32 pb-16 text-center border-t border-slate-100 dark:border-slate-800">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] font-bold max-w-xl mx-auto leading-loose px-4">
          HealthLens is an AI-powered insights engine, not a medical professional. All content is for informational purposes. Always consult with a licensed doctor before making medical decisions.
        </p>
      </footer>
    </div>
  );
}
