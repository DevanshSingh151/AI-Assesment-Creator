'use client';

import React from 'react';

export default function ToolkitPage() {
  const tools = [
    {
      id: 'tool-assessment',
      title: 'Question Paper Generator',
      description: 'Generate structured examinations, worksheets, or quizzes based on specific grade-levels, subjects, and text contents.',
      status: 'Active',
      link: '/create',
      icon: '📝'
    },
    {
      id: 'tool-lesson',
      title: 'Lesson Planner AI',
      description: 'Create detailed week-by-week lesson plans, classroom objectives, homework, and reading schedules matching standard syllabi.',
      status: 'Beta',
      link: '#',
      icon: '📚'
    },
    {
      id: 'tool-rubric',
      title: 'Rubric Builder AI',
      description: 'Design transparent grading matrices and evaluation rubrics specifying target score levels and criteria rules in seconds.',
      status: 'Coming Soon',
      link: '#',
      icon: '📊'
    },
    {
      id: 'tool-feedback',
      title: 'Report Card AI Helper',
      description: 'Draft constructive, personalized feedback summaries and remarks for students by inputting basic bullet points of their progress.',
      status: 'Coming Soon',
      link: '#',
      icon: '💡'
    }
  ];

  return (
    <div className="page-wrapper">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">AI Teacher's Toolkit</h1>
          <p className="page-subtitle">Premium generative artificial intelligence tools for automated classroom preparation</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: 32 }}>
        {tools.map((tool) => (
          <div key={tool.id} className="glass-card assessment-item-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="assessment-card-header">
              <span style={{ fontSize: 32 }}>{tool.icon}</span>
              <span className={`status-pill ${tool.status === 'Active' ? 'completed' : tool.status === 'Beta' ? 'processing' : 'failed'}`}>
                {tool.status}
              </span>
            </div>
            
            <h3 className="assessment-card-title" style={{ marginTop: 16 }}>{tool.title}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8, flexGrow: 1, lineHeight: 1.5 }}>
              {tool.description}
            </p>

            <div style={{ marginTop: 24 }}>
              {tool.status === 'Active' ? (
                <a href={tool.link} className="btn-primary" style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
                  Open Generator
                </a>
              ) : (
                <button 
                  className="btn-secondary" 
                  style={{ width: '100%', padding: '10px', opacity: tool.status === 'Beta' ? 1 : 0.6 }} 
                  onClick={() => alert(`${tool.title} feature is launching soon!`)}
                >
                  {tool.status === 'Beta' ? 'Request Beta Access' : 'Locked'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
