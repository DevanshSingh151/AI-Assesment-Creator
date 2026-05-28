'use client';

import React from 'react';
import { ISection } from '@/types';
import { QuestionCard } from './QuestionCard';

interface SectionBlockProps {
  section: ISection;
}

export function SectionBlock({ section }: SectionBlockProps) {
  return (
    <div className="section-block">
      <div className="section-block-header">
        <h2 className="section-block-title">{section.title}</h2>
        <span className="section-block-marks">{section.totalMarks} Marks</span>
      </div>

      {section.instructions && (
        <p className="section-block-instructions">{section.instructions}</p>
      )}

      <div className="section-questions">
        {section.questions.map((question) => (
          <QuestionCard key={question.id} question={question} />
        ))}
      </div>
    </div>
  );
}
