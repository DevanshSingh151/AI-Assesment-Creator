'use client';

import React from 'react';
import { IQuestion } from '@/types';
import { DifficultyBadge } from './DifficultyBadge';

interface QuestionCardProps {
  question: IQuestion;
}

const optionLabels = ['(a)', '(b)', '(c)', '(d)', '(e)', '(f)', '(g)', '(h)'];

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <div className="question-item">
      <div className="question-item-header">
        <div className="question-item-left">
          <span className="question-item-number">Q{question.questionNumber}.</span>
          <span className="question-item-text">{question.text}</span>
        </div>
        <div className="question-item-right">
          <span className="question-item-marks">[{question.marks} {question.marks === 1 ? 'mark' : 'marks'}]</span>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
      </div>

      {question.type === 'MCQ' && question.options && question.options.length > 0 && (
        <div className="mcq-options">
          {question.options.map((option, index) => (
            <div key={index} className="mcq-option">
              <span className="mcq-option-label">{optionLabels[index] || `(${String.fromCharCode(97 + index)})`}</span>
              <span>{option}</span>
            </div>
          ))}
        </div>
      )}

      {question.type === 'True/False' && (
        <div className="true-false-options">
          <div className="true-false-option">
            <div className="true-false-circle" />
            <span>True</span>
          </div>
          <div className="true-false-option">
            <div className="true-false-circle" />
            <span>False</span>
          </div>
        </div>
      )}
    </div>
  );
}
