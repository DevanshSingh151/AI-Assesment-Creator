'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/store/useAssessmentStore';

const routeNames: Record<string, string> = {
  '/': 'Dashboard',
  '/create': 'Create Assessment',
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { notifications, markAllAsRead, clearNotifications } = useAssessmentStore();
  
  const [notiOpen, setNotiOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notiRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notiRef.current && !notiRef.current.contains(event.target as Node)) {
        setNotiOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getBreadcrumb = () => {
    if (pathname.startsWith('/assessment/')) {
      return { parent: 'Assessments', current: 'View Assessment' };
    }
    const name = routeNames[pathname] || 'Page';
    return { parent: 'VedaAI', current: name };
  };

  const { parent, current } = getBreadcrumb();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (link: string) => {
    setNotiOpen(false);
    markAllAsRead();
    if (link && link !== '#') {
      router.push(link);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <header className="header">
      <div className="header-breadcrumb">
        <span className="header-breadcrumb-item">{parent}</span>
        <span className="header-breadcrumb-separator">/</span>
        <span className="header-breadcrumb-current">{current}</span>
      </div>

      <div className="header-actions">
        {/* Notifications Bell */}
        <div className="header-action-wrapper" ref={notiRef} style={{ position: 'relative' }}>
          <button 
            className={`header-icon-btn ${notiOpen ? 'active' : ''}`} 
            onClick={() => {
              setNotiOpen(!notiOpen);
              setProfileOpen(false);
              if (!notiOpen) markAllAsRead();
            }}
            aria-label="Notifications"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && <span className="header-notification-dot" />}
          </button>

          {notiOpen && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <span className="notifications-title">Notifications</span>
                {notifications.length > 0 && (
                  <button className="notifications-clear" onClick={clearNotifications}>
                    Clear all
                  </button>
                )}
              </div>
              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <div className="notifications-empty">
                    <span className="notifications-empty-icon">🔔</span>
                    <span>No notifications yet</span>
                  </div>
                ) : (
                  notifications.map((noti) => (
                    <button
                      key={noti.id}
                      className={`notification-item ${!noti.read ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(noti.link)}
                    >
                      <div className="notification-item-header">
                        <div className="notification-item-title">
                          {!noti.read && <span className="notification-unread-dot" />}
                          {noti.title}
                        </div>
                        <span className="notification-item-time">
                          {formatTimeAgo(noti.date)}
                        </span>
                      </div>
                      <div className="notification-item-msg">{noti.message}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="header-action-wrapper" ref={profileRef} style={{ position: 'relative' }}>
          <div 
            className="header-avatar" 
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotiOpen(false);
            }}
            title="User Settings"
          >
            U
          </div>

          {profileOpen && (
            <div className="notifications-dropdown" style={{ width: 200, padding: 8 }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Teacher Account</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>teacher@vedaai.com</div>
              </div>
              <button 
                className="dropdown-item" 
                onClick={() => {
                  setProfileOpen(false);
                  router.push('/');
                }}
              >
                Dashboard
              </button>
              <button 
                className="dropdown-item" 
                onClick={() => {
                  setProfileOpen(false);
                  router.push('/create');
                }}
              >
                Create Exam
              </button>
              <button 
                className="dropdown-item danger" 
                onClick={() => {
                  setProfileOpen(false);
                  alert('Logout functionality demo!');
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
