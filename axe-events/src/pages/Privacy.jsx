import { useTranslation } from 'react-i18next';

const c = {
  text: '#2D1B0E',
  muted: '#8B7355',
  card: '#FFFFFF',
  border: '#F0E6D8',
  accent: '#E8652B',
};

export default function Privacy() {
  const { t } = useTranslation();

  const sectionStyle = {
    marginBottom: 24,
  };

  const headingStyle = {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '1.1rem',
    letterSpacing: '0.04em',
    color: c.text,
    marginBottom: 8,
  };

  const textStyle = {
    fontSize: '0.85rem',
    color: c.muted,
    lineHeight: 1.7,
  };

  return (
    <div style={{ animation: 'fadeUp 0.3s ease', maxWidth: 640 }}>
      <h1 style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '1.8rem', letterSpacing: '0.04em',
        color: c.text, marginBottom: 4,
      }}>{t('privacy.title')}</h1>
      <p style={{ fontSize: '0.78rem', color: c.muted, marginBottom: 28 }}>
        {t('privacy.lastUpdated')}
      </p>

      <div style={{
        background: c.card, border: `1px solid ${c.border}`,
        borderRadius: 16, padding: '28px 24px',
      }}>
        <div style={sectionStyle}>
          <h2 style={headingStyle}>What We Collect</h2>
          <p style={textStyle}>
            When you create an account, we collect your email address and display name.
            When you submit events, we store the event details you provide (title, description,
            location, dates, organizer info). When you RSVP to events, we record your attendance status.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>How We Use Your Data</h2>
          <p style={textStyle}>
            Your data is used solely to operate AXÉ Events — displaying events, showing RSVP counts,
            and managing your account. We do not sell, share, or monetize your personal information
            in any way. We do not use third-party analytics or tracking services.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Authentication</h2>
          <p style={textStyle}>
            Authentication is handled by Supabase. Your password is securely hashed and never stored
            in plain text. If you sign in with Google, we receive only your email and name from Google
            — we do not access any other Google data.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Data Storage</h2>
          <p style={textStyle}>
            Your data is stored in a PostgreSQL database managed by Supabase with row-level security
            policies. Data is encrypted in transit (TLS) and at rest.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Your Rights</h2>
          <p style={textStyle}>
            You can view, update, or delete your account and all associated data at any time.
            To request data deletion, contact us or delete your account through the app settings.
            Under GDPR, you have the right to access, rectify, or erase your personal data.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Cookies</h2>
          <p style={textStyle}>
            We use localStorage to store your authentication session and language preference.
            We do not use tracking cookies or third-party cookies.
          </p>
        </div>

        <div style={{ ...sectionStyle, marginBottom: 0 }}>
          <h2 style={headingStyle}>Contact</h2>
          <p style={textStyle}>
            If you have questions about this privacy policy or your data, please reach out through
            the app or contact the AXÉ Events team.
          </p>
        </div>
      </div>
    </div>
  );
}
