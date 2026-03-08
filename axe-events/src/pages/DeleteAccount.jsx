import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
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

export default function DeleteAccount() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!user) return;
    setLoading(true);
    setError('');

    // Delete user's RSVPs, events, and profile
    await supabase.from('rsvps').delete().eq('user_id', user.id);
    await supabase.from('events').delete().eq('submitted_by', user.id);
    await supabase.from('profiles').delete().eq('id', user.id);

    // Sign out (Supabase auth user deletion requires admin/service key,
    // so we clear all app data and sign out)
    await signOut();
    setDone(true);
    setLoading(false);
  };

  if (done) {
    return (
      <div style={{
        textAlign: 'center', padding: '60px 20px',
        animation: 'fadeUp 0.3s ease',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: '#0DAA8A0C', border: '2px solid #0DAA8A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: '1.5rem',
        }}>&#10003;</div>
        <p style={{ color: c.text, fontSize: '1rem', marginBottom: 8 }}>
          {t('deleteAccount.success')}
        </p>
        <p style={{ color: c.muted, fontSize: '0.85rem' }}>
          {t('deleteAccount.successDetail')}
        </p>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeUp 0.3s ease', maxWidth: 540 }}>
      <h1 style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '1.8rem', letterSpacing: '0.04em',
        color: c.text, marginBottom: 4,
      }}>{t('deleteAccount.title')}</h1>
      <p style={{ fontSize: '0.85rem', color: c.muted, marginBottom: 28 }}>
        {t('deleteAccount.subtitle')}
      </p>

      <div style={{
        background: c.card, border: `1px solid ${c.border}`,
        borderRadius: 16, padding: '28px 24px',
      }}>
        {!user ? (
          <p style={{ fontSize: '0.88rem', color: c.muted }}>
            {t('submit.loginRequired')}
          </p>
        ) : (
          <>
            <p style={{ fontSize: '0.88rem', color: c.text, lineHeight: 1.7, marginBottom: 20 }}>
              {t('deleteAccount.warning')}
            </p>
            <ul style={{ fontSize: '0.85rem', color: c.muted, lineHeight: 1.8, marginBottom: 24, paddingLeft: 20 }}>
              <li>{t('deleteAccount.item1')}</li>
              <li>{t('deleteAccount.item2')}</li>
              <li>{t('deleteAccount.item3')}</li>
            </ul>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24,
            }}>
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: c.accent }}
              />
              <label style={{ fontSize: '0.85rem', color: c.text }}>
                {t('deleteAccount.confirm')}
              </label>
            </div>

            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 8,
                background: `${c.accent}0A`, border: `1px solid ${c.accent}22`,
                color: c.accent, fontSize: '0.82rem', marginBottom: 18,
              }}>{error}</div>
            )}

            <button
              onClick={handleDelete}
              disabled={!confirmed || loading}
              style={{
                width: '100%', padding: '14px',
                background: confirmed ? c.accent : c.border,
                border: 'none', borderRadius: 12,
                color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                cursor: confirmed && !loading ? 'pointer' : 'not-allowed',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? t('common.loading') : t('deleteAccount.deleteBtn')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
