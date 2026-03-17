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
  const [apelido, setApelido] = useState('');
  const [capoeiraGroup, setCapoeiraGroup] = useState('');
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [showOrgTip, setShowOrgTip] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
        await signUp(email, password, name, apelido, capoeiraGroup, isOrganizer);
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
                    type="text" placeholder={t('auth.name', 'Full name (optional)')}
                    value={name} onChange={(e) => setName(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <input
                    type="text" placeholder={t('auth.apelido', 'Apelido')}
                    value={apelido} onChange={(e) => setApelido(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <input
                    type="text" placeholder={t('auth.capoeiraGroup')}
                    value={capoeiraGroup} onChange={(e) => setCapoeiraGroup(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{
                  marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <input
                    type="checkbox" checked={isOrganizer}
                    onChange={(e) => setIsOrganizer(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: c.accent }}
                  />
                  <label style={{ fontSize: '0.85rem', color: c.text }}>
                    {t('auth.iAmOrganizer')}
                  </label>
                  <span
                    onClick={() => setShowOrgTip(!showOrgTip)}
                    style={{
                      width: 18, height: 18, borderRadius: '50%',
                      background: c.bg, border: `1px solid ${c.border}`,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', color: c.muted, cursor: 'pointer',
                      fontWeight: 700, flexShrink: 0,
                    }}
                  >?</span>
                </div>
                {showOrgTip && (
                  <div style={{
                    marginBottom: 14, padding: '10px 14px',
                    background: `${c.gold}08`, border: `1px solid ${c.gold}22`,
                    borderRadius: 8, fontSize: '0.78rem', color: c.muted,
                    lineHeight: 1.5,
                  }}>
                    {t('auth.organizerTip')}
                  </div>
                )}
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
              <div style={{ marginBottom: 14, position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'} placeholder={t('auth.password')}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required minLength={6} style={{ ...inputStyle, paddingRight: 42 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                    color: c.muted, display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
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
