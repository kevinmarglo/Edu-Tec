import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { SUBJECTS } from '../constants';
import { Subject } from '../types';
import { cn } from '../lib/utils';

interface SubjectListProps {
  onSelect: (subject: Subject) => void;
}

export default function SubjectList({ onSelect }: SubjectListProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {SUBJECTS.map((subject, index) => {
        const IconComponent = (Icons as any)[subject.icon] || Icons.Book;
        
        return (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ y: -4 }}
            onClick={() => onSelect(subject)}
            className="group aspect-square bg-white border-2 border-indigo-950 rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-slate-50 transition-all shadow-[4px_4px_0px_0px_rgba(30,27,75,1)] hover:shadow-[2px_2px_0px_0px_rgba(30,27,75,1)] hover:translate-x-0.5 hover:translate-y-0.5"
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white mb-3 shadow-[3px_3px_0px_0px_rgba(30,27,75,0.2)]", subject.color)}>
              <IconComponent size={24} />
            </div>
            
            <h3 className="text-sm font-black text-indigo-950 text-center leading-tight uppercase tracking-tighter">
              {subject.name}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
              {subject.nameSi}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
