import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import NotificationBell from './NotificationBell';

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
  { code: 'de', label: 'DE' },
  { code: 'fr', label: 'FR' },
];

const c = {
  bg: '#FFFBF5',
  card: '#FFFFFF',
  border: '#F0E6D8',
  text: '#2D1B0E',
  muted: '#8B7355',
  accent: '#E8652B',
  gold: '#D4A843',
};

export default function Layout({ children }) {
  const { t, i18n } = useTranslation();
  const { user, profile, isAdmin, isApprovedOrganizer, signOut, updateProfile, requestOrganizer } = useAuth();
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [editingGroup, setEditingGroup] = useState(false);
  const [groupValue, setGroupValue] = useState('');

  useEffect(() => {
    if (profile) setGroupValue(profile.capoeira_group || '');
  }, [profile]);

  useEffect(() => {
    setShowMobileNav(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: t('nav.home'), show: true },
    { to: '/submit', label: t('nav.submit'), show: !!user },
    { to: '/my-events', label: t('nav.myEvents'), show: !!user },
    { to: '/admin', label: t('nav.admin'), show: isAdmin },
  ];

  return (
    <div style={{ minHeight: '100vh', background: c.bg, position: 'relative', overflowX: 'hidden', width: '100%' }}>
      {/* Flowing Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <svg viewBox="0 0 1200 800" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }}>
          <path d="M-100 400 Q200 100 400 400 Q600 700 800 400 Q1000 100 1300 400" stroke="#D4A843" strokeWidth="2" fill="none">
            <animate attributeName="d" dur="20s" repeatCount="indefinite"
              values="M-100 400 Q200 100 400 400 Q600 700 800 400 Q1000 100 1300 400;
                      M-100 400 Q200 600 400 400 Q600 200 800 400 Q1000 600 1300 400;
                      M-100 400 Q200 100 400 400 Q600 700 800 400 Q1000 100 1300 400" />
          </path>
          <path d="M-100 300 Q300 500 500 300 Q700 100 900 300 Q1100 500 1300 300" stroke="#E8652B" strokeWidth="1.5" fill="none">
            <animate attributeName="d" dur="25s" repeatCount="indefinite"
              values="M-100 300 Q300 500 500 300 Q700 100 900 300 Q1100 500 1300 300;
                      M-100 300 Q300 100 500 300 Q700 500 900 300 Q1100 100 1300 300;
                      M-100 300 Q300 500 500 300 Q700 100 900 300 Q1100 500 1300 300" />
          </path>
          <path d="M-100 550 Q200 350 500 550 Q800 750 1100 550 Q1300 350 1500 550" stroke="#D4A843" strokeWidth="1" fill="none">
            <animate attributeName="d" dur="30s" repeatCount="indefinite"
              values="M-100 550 Q200 350 500 550 Q800 750 1100 550 Q1300 350 1500 550;
                      M-100 550 Q200 750 500 550 Q800 350 1100 550 Q1300 750 1500 550;
                      M-100 550 Q200 350 500 550 Q800 750 1100 550 Q1300 350 1500 550" />
          </path>
        </svg>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: 120 + i * 60,
            height: 120 + i * 60,
            borderRadius: '50%',
            border: '1px solid #D4A843',
            opacity: 0.03 + i * 0.006,
            left: `${10 + i * 18}%`,
            top: `${15 + (i % 3) * 25}%`,
            animation: `floatCircle ${18 + i * 4}s ease-in-out infinite ${i * 2}s`,
          }} />
        ))}
      </div>

      {/* Nav Bar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,251,245,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${c.border}`,
        padding: '0 16px',
      }}>
        <div style={{
          maxWidth: 960, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 56,
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '1.5rem', letterSpacing: '0.06em',
              background: `linear-gradient(135deg, ${c.accent}, ${c.gold})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>AXÉ</span>
            <span className="nav-subtitle" style={{
              fontSize: '0.7rem', color: c.muted, letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 500,
            }}>{t('app.subtitle')}</span>
          </Link>

          {/* Right side controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Desktop nav links — hidden on mobile */}
            <div className="desktop-nav" style={{
              display: 'flex', alignItems: 'center', gap: 2,
            }}>
              {navLinks.filter(l => l.show).map(l => (
                <Link key={l.to} to={l.to} style={{
                  padding: '6px 10px', borderRadius: 8,
                  fontSize: '0.78rem', fontWeight: 500,
                  color: location.pathname === l.to ? c.text : c.muted,
                  background: location.pathname === l.to ? `${c.accent}12` : 'none',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}>{l.label}</Link>
              ))}
            </div>

            {/* Language selector */}
            <select
              value={i18n.language?.substring(0, 2)}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              style={{
                background: c.card, border: `1px solid ${c.border}`,
                color: c.muted, borderRadius: 6, padding: '4px 8px',
                fontSize: '0.75rem', cursor: 'pointer', outline: 'none',
              }}
            >
              {LANGS.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>

            {/* Install button — hidden when already installed as PWA */}
            {!window.matchMedia('(display-mode: standalone)').matches && !navigator.standalone && (
              <Link to="/install" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: c.muted, padding: 4, borderRadius: 6,
                transition: 'color 0.2s',
              }} title={t('nav.install', 'Install App')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </Link>
            )}

            {/* Notification bell */}
            {user && <NotificationBell userId={user.id} />}

            {/* Mobile hamburger — visible on mobile only */}
            <button
              className="mobile-menu-btn"
              onClick={() => setShowMobileNav(!showMobileNav)}
              style={{
                display: 'none', background: 'none', border: 'none',
                color: c.text, fontSize: '1.3rem', cursor: 'pointer',
                padding: '4px 6px', lineHeight: 1,
              }}
            >{showMobileNav ? '✕' : '☰'}</button>

            {/* Auth button */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  style={{
                    background: `linear-gradient(135deg, ${c.accent}, ${c.gold})`,
                    border: 'none', borderRadius: '50%',
                    width: 32, height: 32,
                    color: '#fff', fontWeight: 700, fontSize: '0.8rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {(profile?.name || user.email)?.[0]?.toUpperCase() || '?'}
                </button>
                {showMenu && (
                  <div
                    onClick={() => setShowMenu(false)}
                    style={{
                      position: 'fixed', right: 12, top: 52,
                      background: c.card, border: `1px solid ${c.border}`,
                      borderRadius: 10, padding: 8, minWidth: 160,
                      maxWidth: 'calc(100vw - 24px)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                      animation: 'slideDown 0.2s ease',
                      zIndex: 200,
                    }}
                  >
                    <div style={{
                      padding: '8px 12px', fontSize: '0.8rem', color: c.muted,
                      borderBottom: `1px solid ${c.border}`, marginBottom: 4,
                    }}>
                      <div>{profile?.name || user.email}</div>
                      {editingGroup ? (
                        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                          <input
                            type="text"
                            value={groupValue}
                            onChange={(e) => setGroupValue(e.target.value)}
                            placeholder={t('auth.capoeiraGroup')}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              flex: 1, padding: '4px 8px', fontSize: '0.75rem',
                              border: `1px solid ${c.border}`, borderRadius: 6,
                              background: c.bg, color: c.text, outline: 'none',
                            }}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateProfile({ capoeira_group: groupValue || null });
                              setEditingGroup(false);
                            }}
                            style={{
                              padding: '4px 8px', fontSize: '0.7rem',
                              background: c.accent, color: '#fff', border: 'none',
                              borderRadius: 6, cursor: 'pointer', fontWeight: 600,
                            }}
                          >{t('common.save')}</button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingGroup(true); }}
                          style={{
                            background: 'none', border: 'none', padding: 0,
                            fontSize: '0.72rem', color: profile?.capoeira_group ? c.text : c.accent,
                            cursor: 'pointer', marginTop: 4, display: 'block',
                          }}
                        >
                          {profile?.capoeira_group || t('auth.addGroup')}
                        </button>
                      )}
                    </div>
                    {/* Organizer status badge */}
                    {profile?.organizer_status === 'approved' && (
                      <div style={{
                        padding: '6px 12px', fontSize: '0.75rem',
                        color: '#0DAA8A', fontWeight: 600,
                      }}>{t('profile.organizerApproved')}</div>
                    )}
                    {profile?.organizer_status === 'pending' && (
                      <div style={{
                        padding: '6px 12px', fontSize: '0.75rem',
                        color: c.gold, fontWeight: 500,
                      }}>{t('profile.organizerPending')}</div>
                    )}
                    <Link to="/delete-account" style={{
                      display: 'block', padding: '8px 12px', borderRadius: 6,
                      fontSize: '0.78rem', color: c.muted, textDecoration: 'none',
                    }}>{t('deleteAccount.title')}</Link>
                    <button
                      onClick={signOut}
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: 6,
                        background: 'none', border: 'none', textAlign: 'left',
                        color: c.accent, fontSize: '0.85rem', cursor: 'pointer',
                      }}
                    >{t('nav.logout')}</button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                style={{
                  background: `linear-gradient(135deg, ${c.accent}, ${c.gold})`,
                  border: 'none', borderRadius: 8,
                  padding: '6px 16px', color: '#fff',
                  fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                }}
              >{t('nav.login')}</button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile nav dropdown */}
      {showMobileNav && (
        <div style={{
          position: 'sticky', top: 56, zIndex: 99,
          background: 'rgba(255,251,245,0.97)', backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${c.border}`,
          padding: '8px 16px',
          animation: 'slideDown 0.2s ease',
        }}>
          <div style={{
            maxWidth: 960, margin: '0 auto',
            display: 'flex', flexDirection: 'column', gap: 2,
          }}>
            {navLinks.filter(l => l.show).map(l => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setShowMobileNav(false)}
                style={{
                  padding: '10px 12px', borderRadius: 8,
                  fontSize: '0.85rem', fontWeight: 500,
                  color: location.pathname === l.to ? c.text : c.muted,
                  background: location.pathname === l.to ? `${c.accent}12` : 'transparent',
                  textDecoration: 'none',
                }}
              >{l.label}</Link>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '20px 16px 80px', position: 'relative', zIndex: 1 }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${c.border}`, padding: '20px 16px',
        textAlign: 'center', fontSize: '0.75rem', color: c.muted,
      }}>
        <Link to="/privacy" style={{ color: c.muted }}>{t('nav.privacy')}</Link>
        {!window.matchMedia('(display-mode: standalone)').matches && !navigator.standalone && (
          <>
            <span style={{ margin: '0 8px' }}>|</span>
            <Link to="/install" style={{ color: c.muted }}>{t('nav.install', 'Install App')}</Link>
          </>
        )}
        <span style={{ margin: '0 8px' }}>|</span>
        <span>AXÉ Events {new Date().getFullYear()}</span>
      </footer>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      <style>{`
        @keyframes floatCircle {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.03); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 600px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .nav-subtitle { display: none !important; }
        }
      `}</style>
    </div>
  );
}
