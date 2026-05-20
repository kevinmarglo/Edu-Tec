import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Sparkles, 
  Clock, 
  ChevronRight,
  AlertCircle,
  Loader2,
  Trophy
} from 'lucide-react';
import { UserPerformance, StudyPlan } from '../types';
import { SUBJECTS } from '../constants';
import { generatePersonalizedStudyPlan } from '../services/geminiService';
import { cn } from '../lib/utils';

interface DashboardProps {
  performances: UserPerformance[];
}

export default function Dashboard({ performances }: DashboardProps) {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (performances.length > 0) {
      loadStudyPlan();
    }
  }, [performances]);

  const loadStudyPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await generatePersonalizedStudyPlan(performances);
      setPlans(p);
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.message || '';
      if (errMsg.toLowerCase().includes("leaked")) {
        setError('Your Gemini API key has been flagged as leaked by Google and deactivated immediately for security. Please generate a new key in Google AI Studio and configure VITE_GEMINI_API_KEY with it.');
      } else if (errMsg.toLowerCase().includes("api_key") || errMsg.toLowerCase().includes("key") || errMsg.toLowerCase().includes("api key") || errMsg.toLowerCase().includes("forbidden") || errMsg.toLowerCase().includes("unauthorized")) {
        setError('Your Gemini API Key is missing, restricted, or invalid. Please check configured VITE_GEMINI_API_KEY environment variable.');
      } else {
        setError(`Failed to load study plan: ${errMsg || 'Connection Error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const totalScore = performances.reduce((acc, curr) => acc + curr.score, 0);
  const totalQuestions = performances.reduce((acc, curr) => acc + curr.totalQuestions, 0);
  const averagePercentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="bg-white p-6 rounded-3xl border-2 border-indigo-950 shadow-[4px_4px_0px_0px_rgba(30,27,75,1)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Overall Mastery</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Target size={18} />
            </div>
          </div>
          <div className="text-5xl font-black text-indigo-950 tracking-tighter">{averagePercentage}%</div>
          <div className="w-full h-3 bg-slate-100 border border-indigo-950 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${averagePercentage}%` }} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-indigo-950 shadow-[4px_4px_0px_0px_rgba(30,27,75,1)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Questions Solved</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-5xl font-black text-indigo-950 tracking-tighter">{totalQuestions}</div>
          <p className="text-[10px] font-black text-emerald-600 uppercase mt-4">Growth +{performances.length * 5}% this week</p>
        </div>

        <div className="bg-indigo-950 p-6 rounded-3xl border-2 border-indigo-950 shadow-[4px_4px_0px_0px_rgba(30,27,75,1)] text-white">
          <div className="flex items-center justify-between mb-4">
             <span className="text-indigo-400 text-[10px] font-black uppercase tracking-widest text-opacity-100">Study Streak</span>
             <div className="p-2 bg-indigo-900 text-amber-400 rounded-xl">
               <Clock size={18} />
             </div>
          </div>
          <div className="text-5xl font-black text-white tracking-tighter">02 DAYS</div>
          <div className="mt-4 flex gap-1">
             {[1, 2, 3, 4, 5, 6, 7].map(d => (
               <div key={d} className={cn("flex-1 h-1.5 rounded-full", d <= 2 ? "bg-amber-400" : "bg-indigo-900")} />
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Personalized Study Plan */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-indigo-950 tracking-tighter uppercase">AI Study Plan</h3>
            {loading && <Loader2 className="animate-spin text-indigo-600" size={20} />}
          </div>

          <div className="space-y-4">
            {error ? (
              <div className="bg-red-50 border-2 border-red-200 p-6 rounded-3xl text-left">
                <AlertCircle size={24} className="text-red-500 mb-2" />
                <h4 className="font-black text-red-950 mb-1 uppercase tracking-tight text-sm">AI Study Plan Generation Failed</h4>
                <p className="text-slate-600 text-xs font-bold leading-relaxed">{error}</p>
                <button 
                  onClick={loadStudyPlan}
                  className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 border border-red-300 text-red-800 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Retry Plan Generation
                </button>
              </div>
            ) : performances.length === 0 ? (
              <div className="bg-white border-2 border-indigo-950 border-dashed p-12 rounded-3xl text-center">
                <AlertCircle size={40} className="text-slate-200 mx-auto mb-4" />
                <h4 className="font-black text-indigo-950 mb-2 uppercase tracking-tight">No Data Detected</h4>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Complete practice questions to unlock plan</p>
              </div>
            ) : (
              plans.map((plan, i) => {
                const subject = SUBJECTS.find(s => s.id === plan.subjectId);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white border-2 border-indigo-950 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(226,232,240,1)] hover:shadow-[4px_4px_0px_0px_rgba(30,27,75,1)] transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white border-2 border-indigo-950", subject?.color)}>
                          <Clock size={18} />
                        </div>
                        <div>
                          <h4 className="font-black text-indigo-950 text-sm uppercase tracking-tighter">{subject?.name}</h4>
                          <span className={cn(
                            "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                            plan.priority === 'high' ? "bg-red-50 text-red-600 border-red-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"
                          )}>{plan.priority} Priority</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-indigo-900 text-sm font-bold leading-relaxed border-l-4 border-indigo-100 pl-4">"{plan.recommendation}"</p>
                      <div className="pt-3 text-[11px] text-slate-400 font-bold uppercase tracking-wide">
                        {plan.recommendationSi}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Subject wise Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-2xl font-black text-indigo-950 tracking-tighter uppercase">Mastery Grid</h3>
          <div className="bg-white border-2 border-indigo-950 rounded-3xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(30,27,75,1)]">
            {performances.length === 0 ? (
              <div className="p-16 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">
                Performance Data Pending
              </div>
            ) : (
              <div className="divide-y-2 divide-slate-100">
                {performances.map((perf, i) => {
                  const subject = SUBJECTS.find(s => s.id === perf.subjectId);
                  const acc = Math.round((perf.score / perf.totalQuestions) * 100);
                  return (
                    <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white border-2 border-indigo-950", subject?.color)}>
                          <TrendingUp size={18} />
                        </div>
                        <div>
                          <div className="font-black text-indigo-950 text-xs uppercase tracking-tighter">{subject?.name}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{acc}% Accuracy</div>
                        </div>
                      </div>
                      <div className="text-right">
                         <div className="text-xs font-black text-indigo-950">{perf.score}/{perf.totalQuestions}</div>
                         <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Questions</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
