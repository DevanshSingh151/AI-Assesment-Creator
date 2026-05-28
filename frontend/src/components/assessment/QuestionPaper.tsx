'use client';

import React from 'react';
import { IGeneratedPaper } from '@/types';
import { StudentInfoHeader } from './StudentInfoHeader';
import { SectionBlock } from './SectionBlock';

interface QuestionPaperProps {
  paper: IGeneratedPaper;
}

export function QuestionPaper({ paper }: QuestionPaperProps) {
  return (
    <div className="question-paper-wrapper">
      <div className="question-paper">
        {/* Paper Header */}
        <div className="paper-header">
          <p className="paper-institution">VedaAI Assessment System</p>
          <h1 className="paper-title">{paper.title}</h1>
          <p className="paper-subject">{paper.subject} — {paper.grade}</p>
          <div className="paper-meta">
            <div className="paper-meta-item">
              <span className="paper-meta-label">Duration:</span>
              <span>{paper.duration}</span>
            </div>
            <div className="paper-meta-item">
              <span className="paper-meta-label">Total Marks:</span>
              <span>{paper.totalMarks}</span>
            </div>
            <div className="paper-meta-item">
              <span className="paper-meta-label">Date:</span>
              <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <hr className="paper-divider paper-divider-thick" />

        {/* Student Info */}
        <StudentInfoHeader />

        <hr className="paper-divider" />

        {/* General Instructions */}
        {paper.instructions && paper.instructions.length > 0 && (
          <>
            <div className="paper-instructions">
              <h3 className="paper-instructions-title">General Instructions</h3>
              <ol className="paper-instructions-list">
                {paper.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>
            <hr className="paper-divider" />
          </>
        )}

        {/* Sections */}
        {paper.sections.map((section) => (
          <SectionBlock key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}
