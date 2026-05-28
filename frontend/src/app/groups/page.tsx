'use client';

import React from 'react';
import Link from 'next/link';

export default function GroupsPage() {
  const groups = [
    {
      id: 'g1',
      name: 'Class 10-A Mathematics',
      studentsCount: 38,
      averageScore: '78%',
      pendingAssignments: 2,
      lastActive: 'Today',
      color: '#7c3aed'
    },
    {
      id: 'g2',
      name: 'Class 11-B Physics',
      studentsCount: 29,
      averageScore: '82%',
      pendingAssignments: 1,
      lastActive: 'Yesterday',
      color: '#3b82f6'
    },
    {
      id: 'g3',
      name: 'Class 9-C General Science',
      studentsCount: 42,
      averageScore: '71%',
      pendingAssignments: 0,
      lastActive: '3 days ago',
      color: '#10b981'
    },
    {
      id: 'g4',
      name: 'Class 12-A Calculus Honors',
      studentsCount: 24,
      averageScore: '89%',
      pendingAssignments: 3,
      lastActive: 'Today',
      color: '#f59e0b'
    }
  ];

  return (
    <div className="page-wrapper">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">My Groups</h1>
          <p className="page-subtitle">Manage student classes, view progress statistics, and link assessments</p>
        </div>
        <button className="btn-primary" onClick={() => alert('New Group creation coming soon!')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Create Group</span>
        </button>
      </div>

      {/* Stats Quick Cards */}
      <div className="dashboard-stats" style={{ marginTop: 24 }}>
        <div className="glass-card stat-card">
          <div className="stat-value">4</div>
          <div className="stat-label">Total Classes</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value">133</div>
          <div className="stat-label">Active Students</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value">80%</div>
          <div className="stat-label">Average Class Score</div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: 32 }}>
        {groups.map((group) => (
          <div key={group.id} className="glass-card assessment-item-card" style={{ borderLeft: `4px solid ${group.color}` }}>
            <div className="assessment-card-header">
              <span className="assessment-card-date">Active {group.lastActive}</span>
              {group.pendingAssignments > 0 && (
                <span className="status-pill warning" style={{ fontSize: 11 }}>
                  {group.pendingAssignments} Active Tests
                </span>
              )}
            </div>
            
            <h3 className="assessment-card-title" style={{ marginTop: 8 }}>{group.name}</h3>
            
            <div className="assessment-card-details" style={{ marginTop: 16 }}>
              <span>👥 {group.studentsCount} Students</span>
              <span className="separator">•</span>
              <span>📈 Avg: {group.averageScore}</span>
            </div>

            <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
              <button className="btn-secondary" style={{ flex: 1, padding: '8px 12px', fontSize: 13 }} onClick={() => alert(`Viewing roster for ${group.name}`)}>
                Roster
              </button>
              <Link href="/create" className="btn-primary" style={{ flex: 2, padding: '8px 12px', fontSize: 13, textAlign: 'center', justifyContent: 'center' }}>
                Create Exam
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
