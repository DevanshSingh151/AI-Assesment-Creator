export interface IQuestion {
  id: string;
  questionNumber: number;
  text: string;
  type: 'MCQ' | 'Short Answer' | 'Long Answer' | 'True/False';
  options?: string[]; // For MCQ
  correctAnswer?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
}

export interface ISection {
  id: string;
  title: string; // e.g., "Section A"
  description: string; // e.g., "Multiple Choice Questions"
  instructions: string; // e.g., "Attempt all questions"
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

export interface CreateAssignmentDTO {
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
  uploadedFileContent?: string;
}

export interface GenerationJobData {
  assignmentId: string;
  formData: CreateAssignmentDTO;
}
