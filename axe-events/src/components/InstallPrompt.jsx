import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const c = {
  card: '#241710',
  border: '#3A2A1A',
  text: '#F5E6D3',
  muted: '#8B7355',
  accent: '#E8652B',
  gold: '#D4A843',
};

export default function InstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = isIOS || (/Safari/.test(ua) && !/Chrome/.test(ua));
  const isFirefox = /Firefox/.test(ua);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || navigator.standalone === true;

  useEffect(() => {
    if (isStandalone || localStorage.getItem('axe_events_install_dismissed')) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const timer = setTimeout(() => {
      if (!localStorage.getItem('axe_events_install_dismissed')) {
        setShowModal(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, [isStandalone]);

  if (isStandalone || dismissed || localStorage.getItem('axe_events_install_dismissed')) return null;
  if (!showModal) return null;

  const dismiss = () => {
    setDismissed(true);
    setShowModal(false);
    localStorage.setItem('axe_events_install_dismissed', '1');
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') dismiss();
      setDeferredPrompt(null);
    }
  };

  const getSteps = () => {
    if (isIOS || isSafari) {
      return [t('install.iosStep1'), t('install.iosStep2'), t('install.iosStep3')];
    }
    return [t('install.androidStep1'), t('install.androidStep2'), t('install.androidStep3')];
  };

  const steps = getSteps();
  const showNativeInstall = !!deferredPrompt;

  return (
    <div
      onClick={dismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: `linear-gradient(160deg, ${c.card}, #1A0F08)`,
          border: `1px solid ${c.gold}44`,
          borderRadius: 22, padding: '36px 28px 28px',
          width: '100%', maxWidth: 380,
          textAlign: 'center',
          animation: 'fadeUp 0.3s ease both',
          boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 60px ${c.gold}15`,
        }}
      >
        <div style={{
          width: 68, height: 68, margin: '0 auto 18px',
          borderRadius: 16,
          background: `linear-gradient(135deg, ${c.accent}, ${c.gold})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 8px 32px rgba(232,101,43,0.3)`,
        }}>
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontWeight: 900, fontSize: '1.3rem', color: '#fff',
            letterSpacing: '0.05em',
          }}>AXÉ</span>
        </div>

        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '1.7rem', letterSpacing: '0.06em',
          color: c.text, margin: '0 0 6px',
        }}>{t('install.title')}</h2>

        <p style={{
          fontSize: '0.85rem', color: c.muted,
          lineHeight: 1.5, margin: '0 0 24px',
        }}>{t('install.description')}</p>

        {showNativeInstall ? (
          <button
            onClick={handleInstall}
            style={{
              width: '100%', padding: '16px 24px',
              background: `linear-gradient(135deg, ${c.accent}, ${c.gold})`,
              border: 'none', borderRadius: 12,
              color: '#fff', fontWeight: 700, fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: `0 4px 20px rgba(232,101,43,0.3)`,
            }}
          >{t('install.installBtn')}</button>
        ) : (
          <div style={{
            textAlign: 'left', marginBottom: 20,
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 14, padding: '20px 18px 8px',
          }}>
            {steps.map((step, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start',
                gap: 12, marginBottom: 16,
              }}>
                <div style={{
                  flexShrink: 0, width: 28, height: 28,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${c.accent}, ${c.gold})`,
                  color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.82rem',
                }}>{i + 1}</div>
                <div
                  style={{ fontSize: '0.92rem', color: c.muted, lineHeight: 1.5, paddingTop: 3 }}
                  dangerouslySetInnerHTML={{ __html: step }}
                />
              </div>
            ))}
          </div>
        )}

        {!showNativeInstall && (
          <button
            onClick={dismiss}
            style={{
              width: '100%', padding: '14px 24px',
              background: `linear-gradient(135deg, ${c.accent}, ${c.gold})`,
              border: 'none', borderRadius: 12,
              color: '#fff', fontWeight: 700, fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: `0 4px 20px rgba(232,101,43,0.3)`,
            }}
          >{t('install.gotIt')}</button>
        )}

        <button
          onClick={dismiss}
          style={{
            marginTop: 12, background: 'none', border: 'none',
            color: c.muted, fontSize: '0.8rem',
            cursor: 'pointer', padding: 8, opacity: 0.6,
          }}
        >{t('install.later')}</button>
      </div>
    </div>
  );
}
