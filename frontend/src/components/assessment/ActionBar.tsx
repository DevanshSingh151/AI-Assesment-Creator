'use client';

import React, { useState } from 'react';
import { IAssignment } from '@/types';
import { regenerateAssignment, getAssessmentPdfUrl } from '@/lib/api';
import { useAssessmentStore } from '@/store/useAssessmentStore';

interface ActionBarProps {
  assignment: IAssignment;
}

export function ActionBar({ assignment }: ActionBarProps) {
  const [regenerating, setRegenerating] = useState(false);
  const { setGenerationStatus, setGenerationMessage, setAssignment } = useAssessmentStore();

  const handleRegenerate = async () => {
    if (regenerating) return;
    setRegenerating(true);
    setGenerationStatus('processing');
    setGenerationMessage('Regenerating your assessment...');

    try {
      await regenerateAssignment(assignment._id);
      setAssignment({
        ...assignment,
        status: 'pending',
        generatedPaper: undefined,
        error: undefined,
      });
    } catch {
      setGenerationStatus('failed');
      setGenerationMessage('Failed to regenerate. Please try again.');
    } finally {
      setRegenerating(false);
    }
  };

  const handleDownload = () => {
    const url = getAssessmentPdfUrl(assignment._id);
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="action-bar">
      <div className="action-bar-left">
        <h1 className="action-bar-title">{assignment.title}</h1>
        <span className="action-bar-badge">{assignment.subject}</span>
      </div>

      <div className="action-bar-right">
        <button
          className="btn-warning"
          onClick={handleRegenerate}
          disabled={regenerating}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          <span>Regenerate</span>
        </button>

        <button className="btn-primary" onClick={handleDownload}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Download PDF</span>
        </button>

        <button className="btn-secondary" onClick={handlePrint}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          <span>Print</span>
        </button>
      </div>
    </div>
  );
}
