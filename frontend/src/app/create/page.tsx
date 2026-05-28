'use client';

import React from 'react';
import { AssignmentForm } from '@/components/create/AssignmentForm';
import { GeneratingModal } from '@/components/create/GeneratingModal';
import { useAssessmentStore } from '@/store/useAssessmentStore';

export default function CreatePage() {
  const generationStatus = useAssessmentStore((s) => s.generationStatus);

  return (
    <div className="page-wrapper">
      <h1 className="page-title">Create New Assessment</h1>
      <p className="page-subtitle">
        Configure your assessment parameters and let AI generate a professional question paper.
      </p>

      <AssignmentForm />

      {generationStatus !== 'idle' && <GeneratingModal />}
    </div>
  );
}
