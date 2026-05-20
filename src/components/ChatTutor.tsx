import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Subject } from '../types';
import { getTutorResponse } from '../services/geminiService';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

interface ChatTutorProps {
  subject: Subject;
}

export default function ChatTutor({ subject }: ChatTutorProps) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      parts: [{ text: `Hello! I am your AI tutor for **${subject.name}** (${subject.nameSi}). How can I help you today? You can ask me questions in English or Sinhala.` }] 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Map history for the API (only role and parts)
      const history = messages.slice(1).map(m => ({
        role: m.role,
        parts: m.parts
      }));

      const responseText = await getTutorResponse(input, subject.id, history);
      
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: responseText }] }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: "I'm sorry, I encountered an error. Please try again soon." }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Subject Header - Bento Style */}
      <div className="p-6 bg-white border-b-2 border-indigo-950 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-950 rounded-2xl flex items-center justify-center text-white shadow-[4px_4px_0px_0px_rgba(6,182,212,1)]">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-indigo-950 uppercase tracking-tighter leading-none mb-1">AI Expert / විද්වත් සහායක</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Specialized in G.C.E. O/L {subject.name}</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 border-2 border-emerald-500 rounded-2xl text-emerald-700 font-black text-[9px] uppercase tracking-widest">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Active Session
        </div>
      </div>

      {/* Messages Area - Bento Style */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth"
      >
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex flex-col max-w-[85%] space-y-2",
              msg.role === 'user' ? "ml-auto items-end" : "items-start"
            )}
          >
            <div className={cn(
              "px-6 py-4 rounded-3xl border-2 font-bold text-sm leading-relaxed shadow-[4px_4px_0px_0px_rgba(30,27,75,1)]",
              msg.role === 'user' 
                ? "bg-indigo-950 text-white border-indigo-950 rounded-tr-none shadow-[4px_4px_0px_0px_rgba(249,115,22,1)]" 
                : "bg-white text-indigo-950 border-indigo-950 rounded-tl-none"
            )}>
              <div className="markdown-content prose prose-sm max-w-none prose-p:my-1 prose-headings:text-indigo-950 prose-headings:font-black prose-strong:text-indigo-700">
                <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
              </div>
            </div>
            <div className="flex items-center gap-2 px-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                {msg.role === 'user' ? 'Student' : 'AI Tutor'}
              </span>
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                msg.role === 'user' ? "bg-orange-500" : "bg-indigo-600"
              )} />
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex flex-col items-start max-w-[85%] space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="px-6 py-4 bg-white border-2 border-indigo-950 rounded-3xl rounded-tl-none shadow-[4px_4px_0px_0px_rgba(30,27,75,1)] flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" />
              </div>
              <span className="text-xs font-black text-indigo-950 uppercase tracking-widest ml-2">Analysing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area - Bento Style */}
      <div className="p-6 bg-white border-t-2 border-indigo-950">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="max-w-5xl mx-auto flex gap-4"
        >
          <div className="flex-1 relative group">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything in English or Sinhala..."
              className="w-full bg-slate-50 border-2 border-indigo-950 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
              disabled={isLoading}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">En / සිං</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-8 bg-indigo-950 text-white rounded-2xl hover:bg-slate-800 disabled:opacity-30 transition-all active:scale-95 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(6,182,212,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
          >
            <Send size={24} />
          </button>
        </form>
        <div className="text-[10px] text-center font-black text-slate-300 mt-4 uppercase tracking-[0.2em] flex items-center justify-center gap-3">
          <Sparkles size={12} className="text-orange-400" /> 
          AI Learning Assistant • Verify with Syllabus 
          <Sparkles size={12} className="text-orange-400" />
        </div>
      </div>
    </div>
  );
}
