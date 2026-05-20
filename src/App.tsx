import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  MessageSquare, 
  LayoutDashboard, 
  Search,
  Menu,
  X,
  GraduationCap
} from 'lucide-react';
import { SUBJECTS } from './constants';
import { Subject, UserPerformance } from './types';
import { cn } from './lib/utils';

// Components
import SubjectList from './components/SubjectList';
import SubjectView from './components/SubjectView';
import Dashboard from './components/Dashboard';
import TechnicalCollegeLogo from './components/TechnicalCollegeLogo';

type View = 'landing' | 'subject' | 'dashboard' | 'profile';

export default function App() {
  const [activeView, setActiveView] = useState<View>('landing');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [performances, setPerformances] = useState<UserPerformance[]>([]);

  // Load performance from localStorage for now (until Firebase is ready)
  useEffect(() => {
    const saved = localStorage.getItem('ol_performance');
    if (saved) {
      setPerformances(JSON.parse(saved));
    }
  }, []);

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setActiveView('subject');
  };

  const updatePerformance = (perf: UserPerformance) => {
    setPerformances(prev => {
      const idx = prev.findIndex(p => p.subjectId === perf.subjectId);
      let next;
      if (idx >= 0) {
        next = [...prev];
        next[idx] = {
          ...next[idx],
          score: next[idx].score + perf.score,
          totalQuestions: next[idx].totalQuestions + perf.totalQuestions,
          lastAttempt: Date.now()
        };
      } else {
        next = [...prev, perf];
      }
      localStorage.setItem('ol_performance', JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F1F5F9]">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 bg-white border-r-2 border-indigo-950 flex-col p-8 space-y-8">
        <div className="flex items-center cursor-pointer select-none" onClick={() => setActiveView('landing')}>
          <TechnicalCollegeLogo className="w-12 h-12 shadow-lg" />
          <div className="ml-3">
            <h1 className="text-2xl font-black text-indigo-950 tracking-tighter leading-none">LANKAED</h1>
            <p className="text-[10px] uppercase font-black text-rose-600 tracking-widest mt-1">O/L AI Companion</p>
          </div>
        </div>
        
        <nav className="flex-1 space-y-3">
          <button 
            onClick={() => setActiveView('landing')}
            className={cn(
              "w-full text-left p-4 flex items-center gap-3 transition-all font-bold text-sm",
              activeView === 'landing' || activeView === 'subject' 
                ? "bg-indigo-50 border-2 border-indigo-950 rounded-2xl text-indigo-950 shadow-[4px_4px_0px_0px_rgba(30,27,75,1)]" 
                : "text-slate-500 hover:bg-slate-50 rounded-2xl border-2 border-transparent"
            )}
          >
            <BookOpen size={20} />
            විෂයයන් (Subjects)
          </button>
          
          <button 
            onClick={() => setActiveView('dashboard')}
            className={cn(
              "w-full text-left p-4 flex items-center gap-3 transition-all font-bold text-sm",
              activeView === 'dashboard'
                ? "bg-indigo-50 border-2 border-indigo-950 rounded-2xl text-indigo-950 shadow-[4px_4px_0px_0px_rgba(30,27,75,1)]" 
                : "text-slate-500 hover:bg-slate-50 rounded-2xl border-2 border-transparent"
            )}
          >
            <LayoutDashboard size={20} />
            ප්රගතිය (Dashboard)
          </button>
        </nav>

        <div className="space-y-4">
          <div className="p-5 bg-orange-50 border-2 border-indigo-950 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-200/20 rounded-full -mr-8 -mt-8" />
            <p className="text-[10px] font-black text-orange-600 uppercase mb-2 tracking-widest">Exam Countdown</p>
            <p className="text-sm font-black text-indigo-950">12 Days until Exam</p>
            <div className="w-full h-3 bg-white border border-indigo-950 rounded-full mt-3 overflow-hidden">
              <div className="w-3/4 h-full bg-orange-500" />
            </div>
          </div>

          {/* Creator Credit Badge */}
          <div className="p-4 bg-rose-50 border-2 border-indigo-950 rounded-2xl flex items-center gap-3 shadow-[3px_3px_0px_0px_rgba(30,27,75,1)]">
            <TechnicalCollegeLogo className="w-10 h-10 shadow-sm" />
            <div>
              <p className="text-[9px] font-black text-rose-700 uppercase tracking-widest">Created By</p>
              <p className="text-xs font-black text-indigo-950">ICT - 4</p>
              <p className="text-[9px] font-black text-slate-500 leading-none mt-0.5">Technical College Nuwara Eliya</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b-2 border-indigo-950">
        <div className="flex items-center cursor-pointer select-none" onClick={() => setActiveView('landing')}>
          <TechnicalCollegeLogo className="w-8 h-8 rounded-lg" />
          <div className="ml-2">
            <span className="font-black text-indigo-950 tracking-tighter leading-none block">LANKAED</span>
            <span className="text-[7px] font-black text-rose-600 uppercase tracking-wider block mt-0.5">ICT - 4 (TC Nuwara Eliya)</span>
          </div>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 border-2 border-indigo-950 rounded-lg bg-indigo-50">
          <Menu size={20} />
        </button>
      </div>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* Top Header Bento Card */}
        <header className="mb-8 flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-white border-2 border-indigo-950 rounded-3xl p-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl md:text-2xl font-black text-indigo-950">ආයුබෝවන්, Student! 👋</h2>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-lg border-2 border-emerald-300">Sinhala / English Mode</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">O/L Target</p>
              <p className="text-sm font-black text-indigo-950">9 A's Pursuit</p>
            </div>
            <div className="w-12 h-12 rounded-2xl border-2 border-indigo-950 bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-[3px_3px_0px_0px_rgba(30,27,75,1)]">
               <GraduationCap size={24} />
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeView === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-indigo-950 underline decoration-indigo-500/30 decoration-4 underline-offset-4">Browse Subjects</h3>
                <div className="bg-white border-2 border-indigo-950 rounded-xl px-4 py-2 flex items-center gap-2">
                   <Search size={16} className="text-slate-400" />
                   <input type="text" placeholder="Find a subject..." className="bg-transparent border-none outline-none text-xs font-bold" />
                </div>
              </div>
              <SubjectList onSelect={handleSubjectSelect} />
            </motion.div>
          )}

          {activeView === 'subject' && selectedSubject && (
            <motion.div
              key="subject"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="h-full"
            >
              <SubjectView 
                subject={selectedSubject} 
                onBack={() => setActiveView('landing')} 
                onUpdatePerformance={updatePerformance}
              />
            </motion.div>
          )}

          {activeView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <Dashboard performances={performances} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-indigo-950/40 z-[100] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white z-[110] p-8 border-l-4 border-indigo-950"
            >
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center">
                  <TechnicalCollegeLogo className="w-10 h-10 rounded-lg" />
                  <div className="ml-2">
                    <span className="font-black text-indigo-950 block leading-none">LANKAED</span>
                    <span className="text-[8px] font-black text-rose-600 uppercase tracking-widest mt-1 block">ICT - 4 Creator</span>
                  </div>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 border-2 border-indigo-950 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <nav className="space-y-4">
                <button 
                  onClick={() => { setActiveView('landing'); setIsSidebarOpen(false); }}
                  className="w-full text-left p-4 border-2 border-indigo-950 rounded-2xl font-bold flex items-center gap-3 bg-indigo-50"
                >
                  <BookOpen size={20} /> විෂයයන්
                </button>
                <button 
                  onClick={() => { setActiveView('dashboard'); setIsSidebarOpen(false); }}
                  className="w-full text-left p-4 border-2 border-indigo-950 rounded-2xl font-bold flex items-center gap-3"
                >
                  <LayoutDashboard size={20} /> ප්රගතිය
                </button>
              </nav>

              {/* Mobile overlay creator info */}
              <div className="mt-8 p-4 bg-rose-50 border-2 border-indigo-950 rounded-2xl flex items-center gap-3">
                <TechnicalCollegeLogo className="w-10 h-10 shadow-sm" />
                <div>
                  <p className="text-[9px] font-black text-rose-700 uppercase tracking-widest">Created By</p>
                  <p className="text-xs font-black text-indigo-950">ICT - 4</p>
                  <p className="text-[9px] font-black text-slate-500 leading-none mt-0.5">Technical College Nuwara Eliya</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
