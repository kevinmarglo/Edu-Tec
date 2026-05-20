import { Settings, Wrench, Hammer } from 'lucide-react';
import { cn } from '../lib/utils';

interface TechnicalCollegeLogoProps {
  className?: string;
}

export default function TechnicalCollegeLogo({ className = "w-12 h-12" }: TechnicalCollegeLogoProps) {
  return (
    <div className={cn("relative rounded-xl overflow-hidden bg-gradient-to-br from-rose-900 via-rose-950 to-indigo-950 border-2 border-indigo-950 flex items-center justify-center shadow-md shrink-0", className)}>
      {/* Rotating Golden Gear */}
      <Settings className="w-4/5 h-4/5 text-amber-400 absolute animate-[spin_30s_linear_infinite] opacity-90" strokeWidth={2.5} />
      
      {/* Crossed Tools (Wrench and Hammer) */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Wrench */}
        <Wrench className="w-[45%] h-[45%] text-white absolute -rotate-45 translate-x-[-8%] translate-y-[8%] drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)]" strokeWidth={3} />
        {/* Hammer */}
        <Hammer className="w-[45%] h-[45%] text-slate-100 absolute rotate-45 translate-x-[8%] translate-y-[8%] drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)]" strokeWidth={3} />
      </div>
    </div>
  );
}
