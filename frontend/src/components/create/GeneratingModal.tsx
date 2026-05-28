'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { useWebSocket } from '@/hooks/useWebSocket';

interface ProgressStep {
  label: string;
  status: 'pending' | 'active' | 'completed';
}

function mapMessageToStep(message: string): number {
  const lower = message.toLowerCase();
  if (lower.includes('format') || lower.includes('paper') || lower.includes('finaliz')) return 2;
  if (lower.includes('generat') || lower.includes('question') || lower.includes('creating')) return 1;
  return 0;
}

export function GeneratingModal() {
  const router = useRouter();
  const {
    generationStatus,
    generationMessage,
    currentAssessment,
    setGenerationStatus,
    setGenerationMessage,
    submitAssignment,
  } = useAssessmentStore();

  const assignmentId = currentAssessment?._id || null;
  const { isConnected } = useWebSocket(assignmentId);

  const [steps, setSteps] = useState<ProgressStep[]>([
    { label: 'Analyzing requirements...', status: 'active' },
    { label: 'Generating questions...', status: 'pending' },
    { label: 'Formatting paper...', status: 'pending' },
  ]);

  useEffect(() => {
    if (generationStatus === 'processing' && generationMessage) {
      const activeStep = mapMessageToStep(generationMessage);
      setSteps((prev) =>
        prev.map((step, i) => ({
          ...step,
          status: i < activeStep ? 'completed' : i === activeStep ? 'active' : 'pending',
        }))
      );
    }

    if (generationStatus === 'completed') {
      setSteps((prev) =>
        prev.map((step) => ({ ...step, status: 'completed' as const }))
      );
    }
  }, [generationStatus, generationMessage]);

  const handleViewAssessment = () => {
    if (assignmentId) {
      setGenerationStatus('idle');
      setGenerationMessage('');
      router.push(`/assessment/${assignmentId}`);
      if (window.location.pathname.includes(`/assessment/${assignmentId}`)) {
        window.location.reload();
      }
    }
  };

  const handleRetry = async () => {
    setGenerationStatus('idle');
    setGenerationMessage('');
    try {
      const id = await submitAssignment();
      router.push(`/assessment/${id}`);
    } catch {
      // Error handled in store
    }
  };

  const handleClose = () => {
    setGenerationStatus('idle');
    setGenerationMessage('');
  };

  if (generationStatus === 'completed') {
    return (
      <div className="generating-modal">
        <div className="generating-modal-backdrop" />
        <div className="generating-modal-content generating-complete">
          <div className="generating-complete-icon">🎉</div>
          <h2 className="generating-complete-title">Assessment Ready!</h2>
          <p className="generating-complete-subtitle">
            Your assessment has been generated successfully.
          </p>
          <div className="generating-actions">
            <button className="btn-primary" onClick={handleViewAssessment}>
              <span>View Assessment</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (generationStatus === 'failed') {
    return (
      <div className="generating-modal">
        <div className="generating-modal-backdrop" />
        <div className="generating-modal-content generating-error">
          <div className="generating-error-icon">⚠️</div>
          <h2 className="generating-error-title">Generation Failed</h2>
          <p className="generating-error-message">
            {generationMessage || 'An unexpected error occurred. Please try again.'}
          </p>
          <div className="generating-actions">
            <button className="btn-secondary" onClick={handleClose}>
              <span>Cancel</span>
            </button>
            <button className="btn-primary" onClick={handleRetry}>
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="generating-modal">
      <div className="generating-modal-backdrop" />
      <div className="generating-modal-content">
        <div className="generating-spinner">
          <div className="generating-spinner-ring" />
          <div className="generating-spinner-ring" />
          <div className="generating-spinner-ring" />
          <div className="generating-spinner-icon">🧠</div>
        </div>

        <h2 className="generating-title">Generating Your Assessment</h2>
        <p className="generating-subtitle">
          {generationMessage || 'Please wait while we create your assessment...'}
        </p>

        <div className="progress-steps">
          {steps.map((step, index) => (
            <div key={index} className={`progress-step ${step.status}`}>
              <div className="progress-step-indicator">
                {step.status === 'completed' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : step.status === 'active' ? (
                  <div className="btn-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                ) : (
                  index + 1
                )}
              </div>
              <div className="progress-step-content">
                <div className="progress-step-label">{step.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
