'use client';

import React from 'react';

export default function LibraryPage() {
  const categories = [
    { name: 'Templates', count: 12, icon: '📁', color: '#7c3aed' },
    { name: 'Question Banks', count: 8, icon: '🗄️', color: '#3b82f6' },
    { name: 'Syllabus Source Files', count: 5, icon: '📄', color: '#10b981' },
    { name: 'Exported PDFs', count: 7, icon: '📥', color: '#f59e0b' }
  ];

  const recentAssets = [
    { title: 'Grade 10 Calculus Midterm', type: 'Template', date: 'May 20, 2026', size: '12 questions' },
    { title: 'Class 9 Physics Mechanics Source Text', type: 'Source File', date: 'May 18, 2026', size: '1.2 MB' },
    { title: 'Grade 11 English Literature Quiz Bank', type: 'Question Bank', date: 'May 12, 2026', size: '40 questions' },
    { title: 'Grade 12 Advanced Biology Final Exam', type: 'Exported PDF', date: 'May 10, 2026', size: '254 KB' }
  ];

  return (
    <div className="page-wrapper">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">My Library</h1>
          <p className="page-subtitle">Access your saved templates, source syllabi, and downloaded PDF worksheets (32 items total)</p>
        </div>
        <button className="btn-primary" onClick={() => alert('File upload/import is available inside the "Create Assignment" form')}>
          <span>Import Resource</span>
        </button>
      </div>

      {/* Directory Categories Grid */}
      <div className="dashboard-grid" style={{ marginTop: 32, gap: 16 }}>
        {categories.map((cat, i) => (
          <div key={i} className="glass-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'var(--transition)' }}>
            <span style={{ fontSize: 32 }}>{cat.icon}</span>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{cat.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{cat.count} items stored</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Resources List */}
      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Recent Resources</h2>
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
            <span>Name</span>
            <span>Category</span>
            <span>Created</span>
            <span style={{ textAlign: 'right' }}>Size</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentAssets.map((asset, index) => (
              <div 
                key={index} 
                className="library-list-item" 
                style={{ 
                  padding: '16px 20px', 
                  borderBottom: index !== recentAssets.length - 1 ? '1px solid var(--border-color)' : 'none', 
                  display: 'grid', 
                  gridTemplateColumns: '2fr 1fr 1fr 1fr', 
                  fontSize: 14, 
                  alignItems: 'center',
                  transition: 'var(--transition)'
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{asset.title}</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{asset.type}</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{asset.date}</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'right' }}>{asset.size}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
