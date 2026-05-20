export type SubjectId = 
  | 'mathematics' 
  | 'science' 
  | 'sinhala' 
  | 'english' 
  | 'history' 
  | 'buddhism' 
  | 'commercial' 
  | 'ict' 
  | 'geography'
  | 'citizenship'
  | 'entrepreneurship'
  | 'art'
  | 'music'
  | 'dancing'
  | 'drama'
  | 'health'
  | 'media'
  | 'agriculture'
  | 'home_economics'
  | 'tamil'
  | 'literature';

export interface Subject {
  id: SubjectId;
  name: string;
  nameSi: string;
  icon: string;
  color: string;
}

export interface Question {
  id: string;
  subjectId: SubjectId;
  question: string;
  questionSi: string;
  options: string[];
  optionsSi: string[];
  correctAnswer: number;
  explanation: string;
  explanationSi: string;
}

export interface UserPerformance {
  subjectId: SubjectId;
  score: number;
  totalQuestions: number;
  lastAttempt: number;
}

export interface StudyPlan {
  subjectId: SubjectId;
  recommendation: string;
  recommendationSi: string;
  priority: 'low' | 'medium' | 'high';
}
