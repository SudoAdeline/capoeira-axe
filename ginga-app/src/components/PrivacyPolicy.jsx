const c = {
  bg: "#FDF6EC",
  bgCard: "#FFFFFF",
  text: "#2C1810",
  textMuted: "#8B7355",
  gold: "#D4A843",
  border: "#E8DCC8",
};

export default function PrivacyPolicy({ onBack, dark }) {
  const t = dark ? {
    bg: "#1A0F08",
    bgCard: "rgba(253,246,236,0.04)",
    text: "#FDF6EC",
    textMuted: "rgba(212,168,67,0.5)",
    gold: "#D4A843",
    border: "rgba(212,168,67,0.12)",
  } : c;

  const sectionStyle = {
    marginBottom: 28,
  };

  const headingStyle = {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "1.15rem",
    letterSpacing: "0.05em",
    color: t.gold,
    margin: "0 0 10px",
  };

  const pStyle = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.88rem",
    color: t.textMuted,
    lineHeight: 1.7,
    margin: "0 0 10px",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: t.bg,
      padding: "24px",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <button onClick={onBack} style={{
          background: "none",
          border: "none",
          color: t.gold,
          cursor: "pointer",
          padding: "8px 0",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.9rem",
          marginBottom: 24,
        }}>&larr; Back</button>

        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "2.2rem",
          letterSpacing: "0.06em",
          color: t.text,
          marginBottom: 8,
        }}>Privacy Policy</h1>
        <p style={{ ...pStyle, marginBottom: 32 }}>
          Last updated: March 2026
        </p>

        <div style={{
          background: t.bgCard,
          border: `1px solid ${t.border}`,
          borderRadius: 16,
          padding: "32px 28px",
        }}>
          <div style={sectionStyle}>
            <p style={pStyle}>
              AXÉ is a capoeira training app built by a capoeirista, for capoeiristas. We take your privacy seriously and keep things simple. Here's exactly what we do with your data.
            </p>
          </div>

          <div style={sectionStyle}>
            <h3 style={headingStyle}>What We Collect</h3>
            <p style={pStyle}>
              When you create an account, we collect your <strong style={{ color: t.text }}>name</strong> and <strong style={{ color: t.text }}>email address</strong>. That's it for personal information.
            </p>
            <p style={pStyle}>
              As you use the app, we store your <strong style={{ color: t.text }}>training data</strong> — skill progress, completed movements, custom training plans, cord system, favorite songs, event participation, and your preferences. All of this is tied to your account so it syncs across your devices.
            </p>
          </div>

          <div style={sectionStyle}>
            <h3 style={headingStyle}>Payments</h3>
            <p style={pStyle}>
              Premium subscriptions are processed through <strong style={{ color: t.text }}>Stripe</strong>. When you upgrade, we share your email address with Stripe to create your payment profile. Stripe handles all payment details (card numbers, billing addresses) — we never see or store your payment information. Stripe's privacy policy applies to payment data.
            </p>
          </div>

          <div style={sectionStyle}>
            <h3 style={headingStyle}>What We Don't Do</h3>
            <p style={pStyle}>
              We <strong style={{ color: t.text }}>don't sell or share</strong> your personal data with anyone. We don't use ads. We don't use tracking pixels, analytics services, or any third-party scripts that follow you around the internet. Your training data is yours.
            </p>
          </div>

          <div style={sectionStyle}>
            <h3 style={headingStyle}>Where Your Data Lives</h3>
            <p style={pStyle}>
              Your data is stored in our database on our hosting server. We use standard security practices to protect it, including encrypted passwords and secure connections.
            </p>
          </div>

          <div style={sectionStyle}>
            <h3 style={headingStyle}>Your Rights (GDPR)</h3>
            <p style={pStyle}>
              Under the General Data Protection Regulation (GDPR) and similar laws, you have the right to:
            </p>
            <ul style={{ ...pStyle, paddingLeft: 20 }}>
              <li style={{ marginBottom: 6 }}><strong style={{ color: t.text }}>Access</strong> — request a copy of all data we hold about you</li>
              <li style={{ marginBottom: 6 }}><strong style={{ color: t.text }}>Correct</strong> — ask us to fix any inaccurate information</li>
              <li style={{ marginBottom: 6 }}><strong style={{ color: t.text }}>Delete</strong> — request complete deletion of your account and all associated data</li>
              <li style={{ marginBottom: 6 }}><strong style={{ color: t.text }}>Export</strong> — receive your data in a portable format</li>
              <li style={{ marginBottom: 6 }}><strong style={{ color: t.text }}>Object</strong> — opt out of any data processing you disagree with</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h3 style={headingStyle}>Account Deletion</h3>
            <p style={pStyle}>
              You can request deletion of your account and all data at any time by emailing us. We will delete everything — your profile, training data, progress, and any Stripe customer record — within 30 days.
            </p>
          </div>

          <div style={sectionStyle}>
            <h3 style={headingStyle}>Contact</h3>
            <p style={pStyle}>
              For any privacy questions, data requests, or account deletion, reach out to us at:
            </p>
            <p style={{ ...pStyle, color: t.gold, fontWeight: 600 }}>
              axe.capoeira.app@gmail.com
            </p>
          </div>

          <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 20, marginTop: 8 }}>
            <p style={{ ...pStyle, fontSize: "0.8rem" }}>
              We may update this policy as needed. If we make significant changes, we'll notify you through the app. Your continued use of AXÉ after changes means you accept the updated policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
