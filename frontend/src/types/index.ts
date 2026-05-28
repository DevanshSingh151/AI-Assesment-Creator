export interface IQuestion {
  id: string;
  questionNumber: number;
  text: string;
  type: 'MCQ' | 'Short Answer' | 'Long Answer' | 'True/False';
  options?: string[];
  correctAnswer?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
}

export interface ISection {
  id: string;
  title: string;
  description: string;
  instructions: string;
  totalMarks: number;
  questions: IQuestion[];
}

export interface IGeneratedPaper {
  title: string;
  subject: string;
  grade: string;
  duration: string;
  totalMarks: number;
  instructions: string[];
  sections: ISection[];
}

export interface IAssignment {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  duration?: string;
  questionTypes: string[];
  numberOfQuestions: number;
  totalMarks: number;
  difficultyDistribution?: {
    easy: number;
    medium: number;
    hard: number;
  };
  additionalInstructions?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  generatedPaper?: IGeneratedPaper;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormData {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  duration: string;
  questionTypes: string[];
  numberOfQuestions: number;
  totalMarks: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  additionalInstructions: string;
  uploadedFile: File | null;
}

export type GenerationStatus = 'idle' | 'submitting' | 'processing' | 'completed' | 'failed';
