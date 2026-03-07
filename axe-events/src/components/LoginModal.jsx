import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const c = {
  bg: '#FFFBF5',
  card: '#FFFFFF',
  border: '#F0E6D8',
  text: '#2D1B0E',
  muted: '#8B7355',
  accent: '#E8652B',
  gold: '#D4A843',
};

export default function LoginModal({ onClose }) {
  const { t } = useTranslation();
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const [mode, setMode] = useState('login'); // login | signup | forgot
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [capoeiraGroup, setCapoeiraGroup] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'forgot') {
        await resetPassword(email);
        setResetSent(true);
      } else if (mode === 'signup') {
        await signUp(email, password, name, capoeiraGroup);
        onClose();
      } else {
        await signIn(email, password);
        onClose();
      }
    } catch (err) {
      setError(err.message || t('auth.error'));
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || t('auth.error'));
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    background: c.bg, border: `1px solid ${c.border}`,
    borderRadius: 10, color: c.text,
    fontSize: '0.9rem', outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(45,27,14,0.3)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: c.card,
          border: `1px solid ${c.border}`,
          borderRadius: 22, padding: '36px 28px',
          width: '100%', maxWidth: 380,
          boxShadow: '0 20px 60px rgba(45,27,14,0.15)',
          animation: 'fadeUp 0.3s ease both',
          position: 'relative',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '2rem', letterSpacing: '0.06em',
            background: `linear-gradient(135deg, ${c.accent}, ${c.gold})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>AXÉ</span>
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '1.4rem', letterSpacing: '0.04em',
            color: c.text, margin: '8px 0 0',
          }}>
            {mode === 'forgot' ? t('auth.forgotPassword') :
             mode === 'signup' ? t('auth.signupTitle') : t('auth.loginTitle')}
          </h2>
        </div>

        {resetSent ? (
          <div style={{
            textAlign: 'center', padding: '20px 0',
            color: c.gold, fontSize: '0.9rem',
          }}>
            {t('auth.resetSent')}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <input
                    type="text" placeholder={t('auth.name')}
                    value={name} onChange={(e) => setName(e.target.value)}
                    required style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <input
                    type="text" placeholder={t('auth.capoeiraGroup')}
                    value={capoeiraGroup} onChange={(e) => setCapoeiraGroup(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </>
            )}

            <div style={{ marginBottom: 14 }}>
              <input
                type="email" placeholder={t('auth.email')}
                value={email} onChange={(e) => setEmail(e.target.value)}
                required style={inputStyle}
              />
            </div>

            {mode !== 'forgot' && (
              <div style={{ marginBottom: 14 }}>
                <input
                  type="password" placeholder={t('auth.password')}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required minLength={6} style={inputStyle}
                />
              </div>
            )}

            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 8,
                background: `${c.accent}0A`, border: `1px solid ${c.accent}22`,
                color: c.accent, fontSize: '0.82rem', marginBottom: 14,
              }}>{error}</div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '14px',
                background: `linear-gradient(135deg, ${c.accent}, ${c.gold})`,
                border: 'none', borderRadius: 10,
                color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => !loading && (e.target.style.transform = 'scale(1.02)')}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >
              {loading ? t('common.loading') :
               mode === 'forgot' ? t('auth.forgotPassword') :
               mode === 'signup' ? t('auth.signupBtn') : t('auth.loginBtn')}
            </button>
          </form>
        )}

        {mode !== 'forgot' && !resetSent && (
          <>
            <div style={{
              textAlign: 'center', margin: '18px 0',
              fontSize: '0.78rem', color: c.muted,
            }}>
              {t('auth.orContinueWith')}
            </div>

            <button
              onClick={handleGoogle}
              style={{
                width: '100%', padding: '12px',
                background: c.bg, border: `1px solid ${c.border}`,
                borderRadius: 10, color: c.text,
                fontWeight: 600, fontSize: '0.88rem',
                cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t('auth.google')}
            </button>
          </>
        )}

        <div style={{
          textAlign: 'center', marginTop: 16,
          fontSize: '0.8rem',
        }}>
          {mode === 'login' && (
            <>
              <button
                onClick={() => setMode('forgot')}
                style={{
                  background: 'none', border: 'none',
                  color: c.muted, cursor: 'pointer', fontSize: '0.8rem',
                  display: 'block', margin: '0 auto 8px',
                }}
              >{t('auth.forgotPassword')}</button>
              <button
                onClick={() => { setMode('signup'); setError(''); }}
                style={{
                  background: 'none', border: 'none',
                  color: c.accent, cursor: 'pointer', fontSize: '0.8rem',
                }}
              >{t('auth.switchToSignup')}</button>
            </>
          )}
          {mode === 'signup' && (
            <button
              onClick={() => { setMode('login'); setError(''); }}
              style={{
                background: 'none', border: 'none',
                color: c.accent, cursor: 'pointer', fontSize: '0.8rem',
              }}
            >{t('auth.switchToLogin')}</button>
          )}
          {mode === 'forgot' && (
            <button
              onClick={() => { setMode('login'); setError(''); setResetSent(false); }}
              style={{
                background: 'none', border: 'none',
                color: c.accent, cursor: 'pointer', fontSize: '0.8rem',
              }}
            >{t('auth.switchToLogin')}</button>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none',
            color: c.muted, fontSize: '1.2rem', cursor: 'pointer',
          }}
        >&times;</button>
      </div>
    </div>
  );
}
