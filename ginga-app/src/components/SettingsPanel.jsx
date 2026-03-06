import { useState } from 'react';
import { api } from '../lib/api';

const c = {
  bg: "#FDF6EC",
  bgCard: "#FFFFFF",
  text: "#2C1810",
  textMuted: "#8B7355",
  gold: "#D4A843",
  accent: "#E8652B",
  border: "#E8DCC8",
};

export default function SettingsPanel({ user, onBack, onLogout, onUpgrade, onShowPrivacy }) {
  const [portalLoading, setPortalLoading] = useState(false);

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const data = await api('/api/stripe/portal', { method: 'POST' });
      window.location.href = data.url;
    } catch {
      setPortalLoading(false);
    }
  };

  const btnStyle = {
    width: '100%',
    padding: '14px 20px',
    borderRadius: 12,
    border: `1px solid ${c.border}`,
    background: c.bgCard,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.9rem',
    color: c.text,
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  return (
    <div style={{
      maxWidth: 500, margin: '0 auto', padding: '24px',
      fontFamily: "'DM Sans', sans-serif",
      position: 'relative', zIndex: 1,
    }}>
      {/* Back button */}
      <button onClick={onBack} style={{
        background: 'none', border: 'none',
        color: c.gold, cursor: 'pointer', padding: '8px 0',
        fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem',
        marginBottom: 24,
      }}>&larr; Back</button>

      <h1 style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '2rem',
        letterSpacing: '0.06em',
        color: c.text,
        marginBottom: 32,
      }}>Settings</h1>

      {/* Account section */}
      <div style={{
        background: c.bgCard,
        borderRadius: 16,
        border: `1px solid ${c.border}`,
        padding: '24px 20px',
        marginBottom: 16,
      }}>
        <div style={{ fontSize: '0.75rem', color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, fontWeight: 600 }}>Account</div>
        {user.name && <div style={{ fontSize: '1rem', color: c.text, fontWeight: 600, marginBottom: 2 }}>{user.name}</div>}
        <div style={{ fontSize: '0.9rem', color: c.textMuted, marginBottom: 4 }}>{user.email}</div>
        <div style={{
          display: 'inline-block',
          padding: '3px 10px',
          borderRadius: 8,
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          background: user.isPremium ? `${c.gold}22` : `${c.textMuted}15`,
          color: user.isPremium ? c.gold : c.textMuted,
        }}>
          {user.isPremium ? 'PREMIUM' : 'FREE'}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {user.isPremium ? (
          <button onClick={openPortal} disabled={portalLoading} style={btnStyle}>
            <span>Manage Subscription</span>
            <span style={{ color: c.textMuted }}>&rsaquo;</span>
          </button>
        ) : (
          <button onClick={onUpgrade} style={{
            ...btnStyle,
            background: `linear-gradient(135deg, ${c.gold}, ${c.accent})`,
            color: '#fff',
            border: 'none',
          }}>
            <span>Upgrade to Premium</span>
            <span>&rsaquo;</span>
          </button>
        )}

        <button onClick={onShowPrivacy} style={btnStyle}>
          <span>Privacy Policy</span>
          <span style={{ color: c.textMuted }}>&rsaquo;</span>
        </button>

        <button onClick={onLogout} style={{
          ...btnStyle,
          color: c.accent,
          border: `1px solid ${c.accent}33`,
          marginTop: 8,
        }}>
          <span>Log Out</span>
          <span>&rsaquo;</span>
        </button>
      </div>
    </div>
  );
}
