import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  MessageSquare, 
  FileText, 
  Trophy, 
  Info,
  Sparkles
} from 'lucide-react';
import { Subject, UserPerformance } from '../types';
import { cn } from '../lib/utils';

// Sub-components
import ChatTutor from './ChatTutor';
import PracticeQuestions from './PracticeQuestions';

interface SubjectViewProps {
  subject: Subject;
  onBack: () => void;
  onUpdatePerformance: (perf: UserPerformance) => void;
}

type Tab = 'chat' | 'practice' | 'mock';

export default function SubjectView({ subject, onBack, onUpdatePerformance }: SubjectViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  const tabs = [
    { id: 'chat', label: 'AI Tutor Chat', icon: MessageSquare, si: 'AI ගුරුතුමා' },
    { id: 'practice', label: 'Practice', icon: FileText, si: 'අභ්‍යාස' },
    { id: 'mock', label: 'Mock Exam', icon: Trophy, si: 'ආදර්ශ ප්රශ්න' },
  ];

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Subject Header Card */}
      <div className="bg-white border-2 border-indigo-950 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 border-2 border-indigo-950 hover:bg-slate-100 rounded-xl transition-all active:scale-95 bg-white"
          >
            <ArrowLeft size={18} className="text-indigo-950" />
          </button>
          <div>
            <h2 className="text-lg font-black text-indigo-950 uppercase tracking-tighter">{subject.name} | {subject.nameSi}</h2>
            <div className="flex items-center gap-2 text-[10px] text-indigo-500 font-black uppercase tracking-widest">
              <Sparkles size={10} /> O/L Preparation Mode
            </div>
          </div>
        </div>

        <div className="hidden sm:flex gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={cn(
                  "px-4 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border-2",
                  isActive 
                    ? "bg-indigo-950 text-white border-indigo-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]" 
                    : "bg-white text-indigo-950 border-slate-100 hover:border-indigo-950"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* Main Tab Content */}
        <div className="col-span-12 lg:col-span-12 h-full flex flex-col bg-white border-2 border-indigo-950 rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(30,27,75,1)]">
          <AnimatePresence mode="wait">
            {activeTab === 'chat' && (
              <motion.div 
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1"
              >
                <ChatTutor subject={subject} />
              </motion.div>
            )}

            {activeTab === 'practice' && (
              <motion.div 
                key="practice"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto"
              >
                <PracticeQuestions 
                  subject={subject} 
                  isMock={false} 
                  onComplete={(score, total) => onUpdatePerformance({ subjectId: subject.id, score, totalQuestions: total, lastAttempt: Date.now() })} 
                />
              </motion.div>
            )}

            {activeTab === 'mock' && (
              <motion.div 
                key="mock"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto p-12 bg-indigo-950 text-white"
              >
                <div className="max-w-xl mx-auto text-center">
                  <div className="w-24 h-24 bg-orange-400 border-4 border-white text-indigo-950 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3 shadow-xl">
                    <Trophy size={48} />
                  </div>
                  <h3 className="text-4xl font-black mb-4 tracking-tighter uppercase leading-tight">G.C.E. O/L<br/>{subject.name} Mock Exam</h3>
                  <p className="text-indigo-200 font-bold mb-10 tracking-wide uppercase text-sm">{subject.nameSi} ආදර්ශ ප්‍රශ්න පත්‍රය</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="p-4 bg-indigo-900 rounded-2xl border border-indigo-800">
                       <div className="text-orange-400 font-black text-2xl">40</div>
                       <div className="text-[10px] font-black uppercase text-indigo-400">Questions</div>
                    </div>
                    <div className="p-4 bg-indigo-900 rounded-2xl border border-indigo-800">
                       <div className="text-emerald-400 font-black text-2xl">60</div>
                       <div className="text-[10px] font-black uppercase text-indigo-400">Minutes</div>
                    </div>
                  </div>

                  <button 
                     onClick={() => setActiveTab('practice')}
                     className="w-full py-5 bg-white text-indigo-950 rounded-2xl font-black tracking-widest uppercase shadow-[6px_6px_0px_0px_rgba(251,146,60,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                  >
                    Start Exam Now (පටන් ගන්න)
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
