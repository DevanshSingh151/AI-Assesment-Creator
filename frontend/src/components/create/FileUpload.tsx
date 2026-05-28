'use client';

import React, { useRef, useState, useCallback } from 'react';
import { useAssessmentStore } from '@/store/useAssessmentStore';

const ACCEPTED_TYPES = ['.pdf', '.txt', '.doc', '.docx'];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload() {
  const { formData, setFormField } = useAssessmentStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');

  const validateFile = (file: File): boolean => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      setError(`Invalid file type. Accepted: ${ACCEPTED_TYPES.join(', ')}`);
      return false;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError(`File is too large. Maximum size: ${MAX_SIZE_MB}MB`);
      return false;
    }
    setError('');
    return true;
  };

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      setFormField('uploadedFile', file);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setFormField]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeFile = () => {
    setFormField('uploadedFile', null);
    setError('');
  };

  if (formData.uploadedFile) {
    return (
      <div>
        <div className="file-upload-preview">
          <div className="file-upload-preview-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div className="file-upload-preview-info">
            <div className="file-upload-preview-name">{formData.uploadedFile.name}</div>
            <div className="file-upload-preview-size">{formatFileSize(formData.uploadedFile.size)}</div>
          </div>
          <button
            type="button"
            className="file-upload-preview-remove"
            onClick={removeFile}
            aria-label="Remove file"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className={`file-upload-zone ${isDragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
      >
        <div className="file-upload-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 16 12 12 8 16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            <polyline points="16 16 12 12 8 16" />
          </svg>
        </div>
        <p className="file-upload-text">
          Drag & drop your file here, or <strong>click to browse</strong>
        </p>
        <p className="file-upload-hint">
          Supports: PDF, TXT, DOC, DOCX • Max size: {MAX_SIZE_MB}MB
        </p>
      </div>
      {error && <span className="form-error" style={{ marginTop: 8 }}>{error}</span>}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}
