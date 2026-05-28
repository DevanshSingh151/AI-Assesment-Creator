'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAssignment } from '@/lib/api';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { IAssignment } from '@/types';
import { ActionBar } from '@/components/assessment/ActionBar';
import { QuestionPaper } from '@/components/assessment/QuestionPaper';
import { GeneratingModal } from '@/components/create/GeneratingModal';

export default function AssessmentPage() {
  const params = useParams();
  const id = params.id as string;

  const { currentAssessment, setAssignment, setGenerationStatus, setGenerationMessage, generationStatus } = useAssessmentStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const needsWebSocket =
    currentAssessment?.status === 'pending' || currentAssessment?.status === 'processing';
  const wsId = needsWebSocket ? id : null;
  useWebSocket(wsId);

  useEffect(() => {
    async function fetchAssignment() {
      try {
        setLoading(true);
        const data = await getAssignment(id);
        setAssignment(data);

        if (data.status === 'completed') {
          setGenerationStatus('idle');
        } else if (data.status === 'failed') {
          setGenerationStatus('failed');
          setGenerationMessage(data.error || 'Generation failed');
        } else {
          setGenerationStatus('processing');
          setGenerationMessage('Generating your assessment...');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load assessment');
      } finally {
        setLoading(false);
      }
    }

    fetchAssignment();
  }, [id, setAssignment, setGenerationStatus, setGenerationMessage]);

  if (loading) {
    return (
      <div className="assessment-page">
        <div className="action-bar">
          <div className="action-bar-left">
            <div className="skeleton skeleton-title" style={{ width: 200 }} />
          </div>
          <div className="action-bar-right">
            <div className="skeleton" style={{ width: 100, height: 38, borderRadius: 8 }} />
            <div className="skeleton" style={{ width: 130, height: 38, borderRadius: 8 }} />
          </div>
        </div>
        <div className="question-paper-wrapper">
          <div className="skeleton-paper">
            <div className="skeleton skeleton-title" style={{ width: '50%', margin: '0 auto 20px' }} />
            <div className="skeleton skeleton-text" style={{ width: '30%', margin: '0 auto 40px' }} />
            <div className="skeleton skeleton-card" />
            <div className="skeleton skeleton-card" />
            <div className="skeleton skeleton-card" style={{ height: 120 }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div className="error-state">
          <div className="error-state-icon">😕</div>
          <h2 className="error-state-title">Something went wrong</h2>
          <p className="error-state-message">{error}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  if (!currentAssessment) {
    return (
      <div className="page-wrapper">
        <div className="error-state">
          <div className="error-state-icon">🔍</div>
          <h2 className="error-state-title">Assessment Not Found</h2>
          <p className="error-state-message">The assessment you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (currentAssessment.status === 'failed') {
    return (
      <div className="page-wrapper">
        <div className="error-state">
          <div className="error-state-icon">⚠️</div>
          <h2 className="error-state-title">Generation Failed</h2>
          <p className="error-state-message">
            {currentAssessment.error || 'The assessment generation encountered an error.'}
          </p>
          <button
            className="btn-primary"
            onClick={async () => {
              try {
                const { regenerateAssignment } = await import('@/lib/api');
                await regenerateAssignment(id);
                window.location.reload();
              } catch {
                // handled
              }
            }}
          >
            <span>Regenerate</span>
          </button>
        </div>
        {generationStatus !== 'idle' && <GeneratingModal />}
      </div>
    );
  }

  if (
    currentAssessment.status === 'pending' ||
    currentAssessment.status === 'processing'
  ) {
    return (
      <div className="page-wrapper">
        <GeneratingModal />
      </div>
    );
  }

  // Completed
  return (
    <div className="assessment-page">
      <ActionBar assignment={currentAssessment} />
      {currentAssessment.generatedPaper && (
        <QuestionPaper paper={currentAssessment.generatedPaper} />
      )}
    </div>
  );
}
