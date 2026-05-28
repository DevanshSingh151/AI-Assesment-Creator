import mongoose, { Schema, Document } from 'mongoose';
import { IGeneratedPaper } from '../types';

export interface IAssignmentDocument extends Document {
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
  status: 'pending' | 'processing' | 'completed' | 'failed';
  generatedPaper?: IGeneratedPaper;
  jobId?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignmentDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    grade: {
      type: String,
      required: true,
      trim: true,
    },
    dueDate: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
    },
    questionTypes: {
      type: [String],
      required: true,
    },
    numberOfQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    difficultyDistribution: {
      type: {
        easy: { type: Number, default: 30 },
        medium: { type: Number, default: 40 },
        hard: { type: Number, default: 30 },
      },
      default: { easy: 30, medium: 40, hard: 30 },
    },
    additionalInstructions: {
      type: String,
    },
    uploadedFileContent: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    generatedPaper: {
      type: Schema.Types.Mixed,
    },
    jobId: {
      type: String,
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Assignment = mongoose.model<IAssignmentDocument>('Assignment', AssignmentSchema);
