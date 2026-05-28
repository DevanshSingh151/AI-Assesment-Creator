'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAssignments } from '@/lib/api';
import { IAssignment } from '@/types';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<IAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchAssignments() {
      try {
        setLoading(true);
        const data = await getAssignments();
        setAssignments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch assessments');
      } finally {
        setLoading(false);
      }
    }
    fetchAssignments();
  }, []);

  const filteredAssignments = assignments.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.subject.toLowerCase().includes(query) ||
      item.grade.toLowerCase().includes(query)
    );
  });

  return (
    <div className="page-wrapper">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Assignments</h1>
          <p className="page-subtitle">Manage and print your generated exam papers and worksheets</p>
        </div>
        <Link href="/create" className="btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Create New</span>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="dashboard-toolbar" style={{ marginTop: 24 }}>
        <div className="search-bar-wrapper">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search assignments by title, subject, or grade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="dashboard-grid">
          <div className="skeleton skeleton-card" style={{ height: 160 }} />
          <div className="skeleton skeleton-card" style={{ height: 160 }} />
          <div className="skeleton skeleton-card" style={{ height: 160 }} />
        </div>
      ) : error ? (
        <div className="error-state">
          <div className="error-state-icon">😕</div>
          <h2 className="error-state-title">Failed to load assessments</h2>
          <p className="error-state-message">{error}</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📄</div>
          <h2 className="empty-state-title">No assignments found</h2>
          <p className="empty-state-message">
            {searchQuery ? 'Try adjusting your search query.' : 'Generate your first assignment to view it here!'}
          </p>
          {!searchQuery && (
            <Link href="/create" className="btn-primary" style={{ marginTop: 16 }}>
              <span>Create Assessment</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="dashboard-grid">
          {filteredAssignments.map((assignment) => (
            <Link
              key={assignment._id}
              href={`/assessment/${assignment._id}`}
              className="glass-card assignment-item-card"
            >
              <div className="assessment-card-header">
                <span className={`status-pill ${assignment.status}`}>
                  {assignment.status}
                </span>
                <span className="assessment-card-date">
                  {new Date(assignment.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              
              <h3 className="assessment-card-title">{assignment.title}</h3>
              
              <div className="assessment-card-meta">
                <span className="meta-badge">{assignment.subject}</span>
                <span className="meta-badge">{assignment.grade}</span>
              </div>

              <div className="assessment-card-details">
                <span>{assignment.numberOfQuestions} Questions</span>
                <span className="separator">•</span>
                <span>{assignment.totalMarks} Marks</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
