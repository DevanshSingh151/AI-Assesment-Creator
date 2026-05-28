import { create } from 'zustand';
import { FormData as AssessmentFormData, IAssignment, GenerationStatus } from '@/types';
import { createAssignment } from '@/lib/api';

export interface INotification {
  id: string;
  title: string;
  message: string;
  link: string;
  read: boolean;
  date: string;
}

interface AssessmentStore {
  formData: AssessmentFormData;
  currentAssessment: IAssignment | null;
  generationStatus: GenerationStatus;
  generationMessage: string;
  notifications: INotification[];

  setFormField: <K extends keyof AssessmentFormData>(field: K, value: AssessmentFormData[K]) => void;
  resetForm: () => void;
  setAssignment: (assignment: IAssignment | null) => void;
  setGenerationStatus: (status: GenerationStatus) => void;
  setGenerationMessage: (message: string) => void;
  submitAssignment: () => Promise<string>;
  addNotification: (notification: Omit<INotification, 'id' | 'read' | 'date'>) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const defaultFormData: AssessmentFormData = {
  title: '',
  subject: '',
  grade: '',
  dueDate: '',
  duration: '1 hour',
  questionTypes: [],
  numberOfQuestions: 10,
  totalMarks: 50,
  difficultyDistribution: {
    easy: 30,
    medium: 50,
    hard: 20,
  },
  additionalInstructions: '',
  uploadedFile: null,
};

export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
  formData: { ...defaultFormData },
  currentAssessment: null,
  generationStatus: 'idle',
  generationMessage: '',
  notifications: [
    {
      id: 'welcome',
      title: 'Welcome to VedaAI',
      message: 'Create your first assessment using the creation dashboard!',
      link: '/create',
      read: false,
      date: new Date().toISOString(),
    },
  ],

  setFormField: (field, value) => {
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    }));
  },

  resetForm: () => {
    set({ formData: { ...defaultFormData } });
  },

  setAssignment: (assignment) => {
    set({ currentAssessment: assignment });
  },

  setGenerationStatus: (status) => {
    set({ generationStatus: status });
  },

  setGenerationMessage: (message) => {
    set({ generationMessage: message });
  },

  submitAssignment: async () => {
    const { formData } = get();
    set({ generationStatus: 'submitting', generationMessage: 'Submitting your assessment...' });

    try {
      const res = await createAssignment(formData);
      const mockAssignment: IAssignment = {
        _id: res.assignmentId,
        title: formData.title,
        subject: formData.subject,
        grade: formData.grade,
        dueDate: formData.dueDate,
        duration: formData.duration,
        questionTypes: formData.questionTypes,
        numberOfQuestions: formData.numberOfQuestions,
        totalMarks: formData.totalMarks,
        difficultyDistribution: formData.difficultyDistribution,
        additionalInstructions: formData.additionalInstructions,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set({
        currentAssessment: mockAssignment,
        generationStatus: 'processing',
        generationMessage: 'Analyzing requirements...',
      });
      return res.assignmentId;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      set({ generationStatus: 'failed', generationMessage: message });
      throw error;
    }
  },

  addNotification: (noti) => {
    const newNoti: INotification = {
      ...noti,
      id: Math.random().toString(36).substring(7),
      read: false,
      date: new Date().toISOString(),
    };
    set((state) => ({
      notifications: [newNoti, ...state.notifications],
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },
}));
