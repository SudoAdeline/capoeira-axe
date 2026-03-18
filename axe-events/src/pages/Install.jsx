import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const c = {
  bg: '#FFFBF5',
  card: '#FFFFFF',
  border: '#F0E6D8',
  text: '#2D1B0E',
  muted: '#8B7355',
  accent: '#E8652B',
  gold: '#D4A843',
};

export default function Install() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState(window.__deferredInstallPrompt || null);
  const [installed, setInstalled] = useState(false);

  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = isIOS || (/Safari/.test(ua) && !/Chrome/.test(ua));
  const isFirefox = /Firefox/.test(ua);
  const isEdge = /Edg/.test(ua);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || navigator.standalone === true;

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.__deferredInstallPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setInstalled(true);
      setDeferredPrompt(null);
      window.__deferredInstallPrompt = null;
    }
  };

  if (isStandalone || installed) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>&#10003;</div>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '1.8rem', color: c.text, marginBottom: 8,
        }}>{t('installPage.alreadyInstalled', 'App is installed!')}</h1>
        <p style={{ color: c.muted, fontSize: '0.9rem' }}>
          {t('installPage.alreadyInstalledDesc', 'AXÉ Events is already installed on your device. Open it from your home screen.')}
        </p>
      </div>
    );
  }

  const getBrowserName = () => {
    if (isIOS) return 'Safari (iOS)';
    if (isSafari) return 'Safari';
    if (isFirefox) return 'Firefox';
    if (isEdge) return 'Edge';
    return 'Chrome';
  };

  const getSteps = () => {
    if (isIOS || isSafari) {
      return [
        { icon: '↑', text: t('install.iosStep1') },
        { icon: '+', text: t('install.iosStep2') },
        { icon: '✓', text: t('install.iosStep3') },
      ];
    }
    if (isFirefox) {
      return [
        { icon: '⋮', text: t('install.firefoxStep1', 'Tap the <strong>⋮ menu</strong> (top right)') },
        { icon: '+', text: t('install.firefoxStep2', 'Tap <strong>"Install"</strong> or <strong>"Add to Home Screen"</strong>') },
        { icon: '✓', text: t('install.firefoxStep3', 'Confirm and open from your home screen') },
      ];
    }
    if (isEdge) {
      return [
        { icon: '⋯', text: t('install.edgeStep1', 'Click the <strong>⋯ menu</strong> (top right)') },
        { icon: '+', text: t('install.edgeStep2', 'Click <strong>"Apps" → "Install this site as an app"</strong>') },
        { icon: '✓', text: t('install.edgeStep3', 'Click <strong>Install</strong> to confirm') },
      ];
    }
    return [
      { icon: '⋮', text: t('install.androidStep1') },
      { icon: '+', text: t('install.androidStep2') },
      { icon: '✓', text: t('install.androidStep3') },
    ];
  };

  const steps = getSteps();

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '24px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 72, height: 72, margin: '0 auto 16px',
          borderRadius: 16,
          background: `linear-gradient(135deg, ${c.accent}, ${c.gold})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 8px 32px rgba(232,101,43,0.2)`,
        }}>
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontWeight: 900, fontSize: '1.4rem', color: '#fff',
            letterSpacing: '0.05em',
          }}>AXÉ</span>
        </div>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '1.8rem', letterSpacing: '0.04em',
          color: c.text, margin: '0 0 8px',
        }}>{t('installPage.title', 'Install AXÉ Events')}</h1>
        <p style={{ color: c.muted, fontSize: '0.88rem', lineHeight: 1.5 }}>
          {t('installPage.description', 'Install the app on your device for quick access, offline support, and a native app experience.')}
        </p>
      </div>

      {/* Native install button */}
      {deferredPrompt && (
        <div style={{ marginBottom: 28 }}>
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
          >{t('install.installBtn', 'Install App')}</button>
          <div style={{
            textAlign: 'center', marginTop: 16, paddingTop: 16,
            borderTop: `1px solid ${c.border}`,
            color: c.muted, fontSize: '0.8rem',
          }}>{t('installPage.orManual', 'Or follow the manual steps below:')}</div>
        </div>
      )}

      {/* Browser-specific instructions */}
      <div style={{
        background: c.card, border: `1px solid ${c.border}`,
        borderRadius: 16, padding: '24px 20px',
        boxShadow: '0 2px 12px rgba(139,115,85,0.06)',
      }}>
        <div style={{
          fontSize: '0.78rem', color: c.muted, marginBottom: 16,
          textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600,
        }}>
          {t('installPage.stepsFor', 'Steps for')} {getBrowserName()}
        </div>

        {steps.map((step, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start',
            gap: 14, marginBottom: i < steps.length - 1 ? 20 : 0,
          }}>
            <div style={{
              flexShrink: 0, width: 36, height: 36,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${c.accent}15, ${c.gold}10)`,
              border: `1px solid ${c.accent}22`,
              color: c.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.9rem',
            }}>{i + 1}</div>
            <div
              style={{ fontSize: '0.9rem', color: c.text, lineHeight: 1.6, paddingTop: 7 }}
              dangerouslySetInnerHTML={{ __html: step.text }}
            />
          </div>
        ))}
      </div>

      {/* Benefits */}
      <div style={{ marginTop: 24, display: 'grid', gap: 12 }}>
        {[
          { icon: '⚡', label: t('installPage.benefit1', 'Instant access from home screen') },
          { icon: '📱', label: t('installPage.benefit2', 'Full-screen native app experience') },
          { icon: '🔔', label: t('installPage.benefit3', 'Stay updated on new events') },
        ].map((b, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', background: c.card,
            border: `1px solid ${c.border}`, borderRadius: 10,
          }}>
            <span style={{ fontSize: '1.1rem' }}>{b.icon}</span>
            <span style={{ fontSize: '0.85rem', color: c.text }}>{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
