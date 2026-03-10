import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

const c = {
  bg: '#FFFBF5',
  card: '#FFFFFF',
  border: '#F0E6D8',
  text: '#2D1B0E',
  muted: '#8B7355',
  accent: '#E8652B',
  gold: '#D4A843',
};

export default function NotificationBell({ userId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('notifications')
      .select('*, events(title)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [userId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const markAsRead = async (id) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from('notifications').update({ read: true }).in('id', unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const timeAgo = (date) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'none', border: 'none',
          cursor: 'pointer', position: 'relative',
          padding: 4, display: 'flex', alignItems: 'center',
        }}
      >
        {/* Bell SVG */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0,
            width: 16, height: 16, borderRadius: '50%',
            background: c.accent, color: '#fff',
            fontSize: '0.6rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 36,
          width: 300, maxHeight: 400, overflowY: 'auto',
          background: c.card, border: `1px solid ${c.border}`,
          borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          animation: 'slideDown 0.2s ease',
          zIndex: 200,
        }}>
          {/* Header */}
          <div style={{
            padding: '12px 14px', borderBottom: `1px solid ${c.border}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: c.text }}>
              {t('notify.notifications')}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: 'none', border: 'none',
                  fontSize: '0.72rem', color: c.accent,
                  cursor: 'pointer', fontWeight: 500,
                }}
              >{t('notify.markAllRead')}</button>
            )}
          </div>

          {/* Notification list */}
          {notifications.length === 0 ? (
            <div style={{
              padding: '30px 14px', textAlign: 'center',
              fontSize: '0.82rem', color: c.muted,
            }}>{t('notify.noNotifications')}</div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.read) markAsRead(n.id);
                  setOpen(false);
                  navigate(`/event/${n.event_id}`);
                }}
                style={{
                  padding: '12px 14px',
                  borderBottom: `1px solid ${c.border}`,
                  background: n.read ? 'transparent' : `${c.gold}06`,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start', gap: 8,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.78rem', fontWeight: n.read ? 400 : 600,
                      color: c.text, marginBottom: 3,
                    }}>
                      {n.events?.title || 'Event'}
                    </div>
                    <div style={{
                      fontSize: '0.78rem', color: c.muted,
                      lineHeight: 1.4,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>{n.message}</div>
                  </div>
                  <div style={{
                    fontSize: '0.68rem', color: c.muted,
                    flexShrink: 0, marginTop: 2,
                  }}>{timeAgo(n.created_at)}</div>
                </div>
                {!n.read && (
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: c.accent, position: 'absolute',
                    right: 14, marginTop: -18,
                  }} />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
