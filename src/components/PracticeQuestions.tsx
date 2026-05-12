import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  RefreshCcw, 
  Loader2, 
  HelpCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { Subject, Question } from '../types';
import { generatePracticeQuestions } from '../services/geminiService';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

interface PracticeQuestionsProps {
  subject: Subject;
  isMock?: boolean;
  onComplete: (score: number, total: number) => void;
}

export default function PracticeQuestions({ subject, isMock = false, onComplete }: PracticeQuestionsProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuestions();
  }, [subject.id]);

  const loadQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const q = await generatePracticeQuestions(subject.id, isMock ? 10 : 5);
      setQuestions(q);
      setCurrentIndex(0);
      setIsFinished(false);
      setScore(0);
      setIsAnswered(false);
      setSelectedOption(null);
    } catch (err) {
      setError('Failed to load questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleCheck = () => {
    if (selectedOption === null || isAnswered) return;
    
    setIsAnswered(true);
    if (selectedOption === questions[currentIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      onComplete(score, questions.length);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-64">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Assembling questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <h3 className="text-xl font-black text-indigo-950 mb-2 uppercase">Sync Error</h3>
        <p className="text-slate-400 text-xs font-bold mb-6">{error}</p>
        <button 
          onClick={loadQuestions}
          className="px-8 py-3 bg-indigo-950 text-white rounded-2xl flex items-center gap-2 hover:bg-slate-800 transition-all shadow-[4px_4px_0px_0px_rgba(30,27,75,0.2)]"
        >
          <RefreshCcw size={18} /> Try Again
        </button>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="p-12 max-w-2xl mx-auto text-center">
        <div className="w-32 h-32 rounded-3xl bg-indigo-50 border-4 border-indigo-950 text-indigo-950 flex flex-col items-center justify-center mx-auto mb-8 shadow-[6px_6px_0px_0px_rgba(30,27,75,1)]">
          <div className="text-4xl font-black">{score}/{questions.length}</div>
          <div className="text-[10px] font-black uppercase tracking-widest mt-1">Score</div>
        </div>
        <h3 className="text-3xl font-black text-indigo-950 mb-2 tracking-tighter uppercase">Session Complete!</h3>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-10">G.C.E. O/L {subject.name} Preparation Stats</p>
        
        <div className="bg-white border-2 border-indigo-950 rounded-3xl p-8 mb-10 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
             <Sparkles size={100} />
          </div>
          <h4 className="font-black text-indigo-950 uppercase tracking-widest text-sm flex items-center gap-2 mb-6">
            <HelpCircle size={18} className="text-indigo-600" /> AI Insights / අදහස්
          </h4>
          <ul className="space-y-4 text-sm text-indigo-900/80 font-bold leading-relaxed">
            {percentage < 50 ? (
              <>
                <li className="border-l-4 border-red-500 pl-4">• Review the core concepts using the AI Tutor.</li>
                <li className="border-l-4 border-red-500 pl-4">• Focus on basic fundamentals first.</li>
              </>
            ) : percentage < 80 ? (
              <>
                <li className="border-l-4 border-amber-500 pl-4">• Great progress. Study the explanations carefully.</li>
                <li className="border-l-4 border-amber-500 pl-4">• Try another set to target 90%+ Mastery.</li>
              </>
            ) : (
              <>
                <li className="border-l-4 border-emerald-500 pl-4">• Elite performance! You are exam-ready.</li>
                <li className="border-l-4 border-emerald-500 pl-4">• Try a full Mock Exam for final validation.</li>
              </>
            )}
          </ul>
        </div>

        <button 
          onClick={loadQuestions}
          className="w-full px-8 py-5 bg-indigo-950 text-white rounded-2xl font-black tracking-widest uppercase shadow-[6px_6px_0px_0px_rgba(249,115,22,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          Try Another Set (නැවත උත්සාහ කරන්න)
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Progress */}
      <div className="p-4 border-b-2 border-slate-100 flex items-center justify-between bg-white px-8">
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-black text-indigo-950 uppercase tracking-widest">Question {currentIndex + 1} / {questions.length}</span>
          <div className="w-48 h-3 bg-slate-100 border border-indigo-950 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              className="h-full bg-indigo-600"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 font-black text-emerald-600 bg-emerald-50 px-4 py-1 rounded-full border border-emerald-100 text-sm">
          <CheckCircle2 size={16} /> {score} Correct
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-10 pb-12">
          {/* Question */}
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Problem Statement</div>
            <h3 className="text-2xl font-black text-indigo-950 leading-tight">
              {currentQ.question}
            </h3>
            <p className="text-lg font-bold text-slate-400 leading-relaxed italic pr-12">
              {currentQ.questionSi}
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-4">
            {currentQ.options.map((opt, i) => {
              const isSelected = selectedOption === i;
              const isCorrect = currentQ.correctAnswer === i;
              
              let statusClasses = "border-slate-100 hover:border-indigo-950 hover:bg-slate-50";
              if (isAnswered) {
                if (isCorrect) statusClasses = "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20";
                else if (isSelected) statusClasses = "border-red-500 bg-red-50 ring-2 ring-red-500/20";
                else statusClasses = "border-slate-50 opacity-40";
              } else if (isSelected) {
                statusClasses = "border-indigo-950 bg-indigo-50/50 ring-2 ring-indigo-950/10";
              }

              return (
                <motion.button
                  key={i}
                  onClick={() => handleSelect(i)}
                  whileHover={!isAnswered ? { x: 4 } : {}}
                  className={cn(
                    "p-5 rounded-2xl border-2 text-left flex items-start gap-4 transition-all group relative overflow-hidden",
                    statusClasses
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-xs border-2 border-indigo-950",
                    isSelected ? "bg-indigo-950 text-white" : "bg-white text-indigo-950 group-hover:bg-indigo-50"
                  )}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <div className="flex-1 space-y-1 pt-1">
                    <div className="font-black text-indigo-950 text-sm leading-tight">{opt}</div>
                    <div className="text-xs font-bold text-slate-400 leading-snug">{currentQ.optionsSi[i]}</div>
                  </div>
                  {isAnswered && isCorrect && <CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={24} />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="text-red-500 shrink-0 mt-1" size={24} />}
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-8 rounded-3xl border-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)]",
                  selectedOption === currentQ.correctAnswer ? "bg-emerald-50 border-emerald-500" : "bg-orange-50 border-orange-500"
                )}
              >
                <h4 className={cn("font-black mb-4 flex items-center gap-2 uppercase tracking-tighter", selectedOption === currentQ.correctAnswer ? "text-emerald-900" : "text-orange-950")}>
                  {selectedOption === currentQ.correctAnswer ? <CheckCircle2 size={20} /> : <Info size={20} />}
                  Expert Explanation / විවරණය
                </h4>
                <div className="space-y-4 text-indigo-950 text-sm font-bold leading-relaxed">
                   <div className="prose prose-sm prose-slate">
                      <ReactMarkdown>{currentQ.explanation}</ReactMarkdown>
                   </div>
                   <div className="pt-4 border-t border-indigo-950/10 text-indigo-900/60 font-black tracking-tight leading-relaxed">
                      {currentQ.explanationSi}
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Button */}
          <div className="pt-4 flex justify-between items-center bg-white sticky bottom-0 py-4">
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest hidden sm:block">
               {isAnswered ? "Reviewing Answer" : "Selection Required"}
            </div>
            {!isAnswered ? (
              <button
                onClick={handleCheck}
                disabled={selectedOption === null}
                className="px-10 py-4 bg-indigo-950 text-white rounded-2xl font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(79,70,229,0.3)] disabled:opacity-30 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95"
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-10 py-4 bg-indigo-950 text-white rounded-2xl font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(16,185,129,0.3)] flex items-center gap-2 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95"
              >
                {currentIndex < questions.length - 1 ? 'Next Problem' : 'Complete View'} <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
