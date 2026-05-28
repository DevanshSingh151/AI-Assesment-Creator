'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from './Header';

export function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname === '';
    return pathname === href;
  };

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      label: 'My Groups',
      href: '/groups',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: 'Assignments',
      href: '/assignments',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      label: "AI Teacher's Toolkit",
      href: '/toolkit',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      ),
    },
    {
      label: 'My Library',
      href: '/library',
      badge: 32,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div
        className={`sidebar-overlay ${mobileOpen ? 'visible' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <div className="app-layout">
        <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
          {/* Logo Brand Box */}
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              {/* stylized bold V */}
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 22, height: 22, color: 'white' }}>
                <path d="M2 3h4.5l5.5 12.5L17.5 3H22L14.5 19.5h-5L2 3z" />
              </svg>
            </div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">VedaAI</span>
            </div>
          </div>

          {/* Create Assignment Button (Capsule design) */}
          <button
            className="create-assignment-btn"
            onClick={() => {
              setMobileOpen(false);
              router.push('/create');
            }}
          >
            {/* Sparkle plus icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Create Assignment</span>
          </button>

          {/* Navigation Links */}
          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`sidebar-nav-item ${active ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="sidebar-nav-icon">{item.icon}</span>
                  <span className="sidebar-nav-label">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="library-badge">{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Area: Settings & School Info card */}
          <div className="sidebar-bottom">
            <button
              className="sidebar-nav-item"
              style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }}
              onClick={() => {
                setMobileOpen(false);
                setSettingsOpen(true);
              }}
            >
              <span className="sidebar-nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </span>
              <span className="sidebar-nav-label">Settings</span>
            </button>

            {/* School Profile Box */}
            <div className="school-box">
              <div className="school-avatar">
                <img
                  src="/teacher_avatar.png"
                  alt="Teacher Avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="school-info">
                <span className="school-name" title="Delhi Public School">Delhi Public School</span>
                <span className="school-location" title="Bokaro Steel City">Bokaro Steel City</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="main-content">
          <Header />
          {children}
        </div>
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="generating-modal" style={{ zIndex: 1100 }}>
          <div className="generating-modal-backdrop" onClick={() => setSettingsOpen(false)} />
          <div className="generating-modal-content glass-card" style={{ maxWidth: 500, textAlign: 'left' }}>
            <button 
              style={{ position: 'absolute', top: 16, right: 16, fontSize: 20, color: 'var(--text-muted)', cursor: 'pointer' }}
              onClick={() => setSettingsOpen(false)}
            >
              ✕
            </button>
            <h3 className="glass-card-title" style={{ fontSize: 22, marginBottom: 8, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 800 }}>
              VedaAI Settings
            </h3>
            <p className="glass-card-subtitle" style={{ marginBottom: 20 }}>Configure your AI Generator preferences</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Preferred AI Model</label>
                <select className="form-select" defaultValue="gemini-2.5-flash">
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended)</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Default Institution Name</label>
                <input className="form-input" type="text" placeholder="e.g. Delhi Public School" defaultValue="Delhi Public School" />
              </div>
              <div className="form-group">
                <label className="form-label">Language</label>
                <select className="form-select" defaultValue="en">
                  <option value="en">English (US)</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
            </div>
            
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="btn-secondary" onClick={() => setSettingsOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => { setSettingsOpen(false); alert('Settings saved successfully!'); }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {helpOpen && (
        <div className="generating-modal" style={{ zIndex: 1100 }}>
          <div className="generating-modal-backdrop" onClick={() => setHelpOpen(false)} />
          <div className="generating-modal-content glass-card" style={{ maxWidth: 550, textAlign: 'left' }}>
            <button 
              style={{ position: 'absolute', top: 16, right: 16, fontSize: 20, color: 'var(--text-muted)', cursor: 'pointer' }}
              onClick={() => setHelpOpen(false)}
            >
              ✕
            </button>
            <h3 className="glass-card-title" style={{ fontSize: 22, marginBottom: 8, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 800 }}>
              Help & Documentation
            </h3>
            <p className="glass-card-subtitle" style={{ marginBottom: 20 }}>Learn how to create high-quality papers with VedaAI</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 300, overflowY: 'auto', paddingRight: 8 }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>How do I generate an assessment?</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Go to the "Create Assessment" page, fill in details like Subject, Grade, Marks, and Question count, choose your question types, and click "Generate Assessment".
                </div>
              </div>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Can I upload a syllabus or text file?</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Yes! In the file upload section, upload a text/PDF file, and the AI will generate questions based specifically on its contents.
                </div>
              </div>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>How do I download or print?</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Once the paper is generated, click the "Download PDF" button in the Action Bar to save it as a high-quality PDF, or click "Print" to print it or save it as PDF directly from your browser.
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" onClick={() => setHelpOpen(false)}>Got it!</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
