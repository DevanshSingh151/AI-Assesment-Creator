'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { FileUpload } from './FileUpload';
import { QuestionConfig } from './QuestionConfig';

const subjects = [
  'Mathematics',
  'Science',
  'English',
  'History',
  'Geography',
  'Computer Science',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
];

const grades = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`);

interface FormErrors {
  title?: string;
  subject?: string;
  grade?: string;
  dueDate?: string;
  questionTypes?: string;
  numberOfQuestions?: string;
  totalMarks?: string;
}

export function AssignmentForm() {
  const router = useRouter();
  const {
    formData,
    setFormField,
    submitAssignment,
    generationStatus,
  } = useAssessmentStore();

  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title || formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.subject) {
      newErrors.subject = 'Please select a subject';
    }

    if (!formData.grade) {
      newErrors.grade = 'Please select a grade';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      const selected = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        newErrors.dueDate = 'Due date must be today or in the future';
      }
    }

    if (!formData.questionTypes || formData.questionTypes.length === 0) {
      newErrors.questionTypes = 'Select at least one question type';
    }

    if (!formData.numberOfQuestions || formData.numberOfQuestions < 1 || formData.numberOfQuestions > 50) {
      newErrors.numberOfQuestions = 'Number of questions must be between 1 and 50';
    }

    if (!formData.totalMarks || formData.totalMarks < 1) {
      newErrors.totalMarks = 'Total marks must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const assignmentId = await submitAssignment();
      router.push(`/assessment/${assignmentId}`);
    } catch {
      // Error is handled in the store and displayed in the modal
    }
  };

  const isSubmitting = generationStatus === 'submitting';

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-cards-stack">
        {/* Card 1: Basic Information */}
        <div className="glass-card">
          <h2 className="glass-card-title">Basic Information</h2>
          <p className="glass-card-subtitle">Set up the core details for your assessment</p>

          <div className="form-grid">
            <div className="form-group form-grid-full">
              <label className="form-label form-label-required" htmlFor="title">
                Assessment Title
              </label>
              <input
                id="title"
                type="text"
                className="form-input"
                placeholder="e.g., Mid-Term Examination 2025"
                value={formData.title}
                onChange={(e) => setFormField('title', e.target.value)}
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label className="form-label form-label-required" htmlFor="subject">
                Subject
              </label>
              <select
                id="subject"
                className="form-select"
                value={formData.subject}
                onChange={(e) => setFormField('subject', e.target.value)}
              >
                <option value="">Select a subject</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.subject && <span className="form-error">{errors.subject}</span>}
            </div>

            <div className="form-group">
              <label className="form-label form-label-required" htmlFor="grade">
                Grade
              </label>
              <select
                id="grade"
                className="form-select"
                value={formData.grade}
                onChange={(e) => setFormField('grade', e.target.value)}
              >
                <option value="">Select a grade</option>
                {grades.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {errors.grade && <span className="form-error">{errors.grade}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="duration">
                Duration
              </label>
              <input
                id="duration"
                type="text"
                className="form-input"
                placeholder="e.g., 2 hours"
                value={formData.duration}
                onChange={(e) => setFormField('duration', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Card 2: File Upload */}
        <div className="glass-card">
          <h2 className="glass-card-title">Reference Material</h2>
          <p className="glass-card-subtitle">Upload a PDF or text file to base questions on specific content</p>
          <FileUpload />
        </div>

        {/* Card 3: Due Date */}
        <div className="glass-card">
          <h2 className="glass-card-title">Schedule</h2>
          <p className="glass-card-subtitle">Set the due date for this assessment</p>

          <div className="form-group">
            <label className="form-label form-label-required" htmlFor="dueDate">
              Due Date
            </label>
            <input
              id="dueDate"
              type="date"
              className="form-input"
              value={formData.dueDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFormField('dueDate', e.target.value)}
            />
            {errors.dueDate && <span className="form-error">{errors.dueDate}</span>}
          </div>
        </div>

        {/* Card 4: Question Configuration */}
        <div className="glass-card">
          <h2 className="glass-card-title">Question Configuration</h2>
          <p className="glass-card-subtitle">Define the structure and difficulty of your questions</p>
          <QuestionConfig errors={errors} />
        </div>

        {/* Card 5: Additional Instructions */}
        <div className="glass-card">
          <h2 className="glass-card-title">Additional Instructions</h2>
          <p className="glass-card-subtitle">Provide any specific guidelines for question generation</p>

          <div className="form-group">
            <textarea
              className="form-textarea"
              placeholder="Add any specific instructions for question generation..."
              value={formData.additionalInstructions}
              onChange={(e) => setFormField('additionalInstructions', e.target.value)}
              maxLength={500}
              rows={4}
            />
            <span className="form-char-count">
              {formData.additionalInstructions.length}/500 characters
            </span>
          </div>
        </div>

        {/* Submit */}
        <div className="form-submit-area">
          <button
            type="submit"
            className="btn-primary btn-large"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="btn-spinner" />
                <span>Generating...</span>
              </>
            ) : (
              <span>Generate Assessment ✨</span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
