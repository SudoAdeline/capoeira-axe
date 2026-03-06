import { useState } from 'react';
import { api } from '../lib/api';

const MONTHLY_PRICE_ID = 'price_1T7hcwAls3Bhcu705MGF6Lh9';
const YEARLY_PRICE_ID = 'price_1T7herAls3Bhcu70ShP5b1Aw';

const c = {
  bg: "#FDF6EC",
  bgCard: "#FFFFFF",
  text: "#2C1810",
  textMuted: "#8B7355",
  gold: "#D4A843",
  accent: "#E8652B",
  border: "#E8DCC8",
};

export default function UpgradeModal({ onClose }) {
  const [loading, setLoading] = useState(null); // 'monthly' | 'yearly' | null
  const [error, setError] = useState('');

  const handleUpgrade = async (priceId, plan) => {
    setError('');
    setLoading(plan);
    try {
      const data = await api('/api/stripe/create-checkout', {
        method: 'POST',
        body: JSON.stringify({ priceId }),
      });
      window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Could not start checkout. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(44,24,16,0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      fontFamily: "'DM Sans', sans-serif",
    }} onClick={onClose}>
      <div style={{
        background: c.bgCard,
        borderRadius: 20,
        padding: '36px 28px',
        maxWidth: 420,
        width: '100%',
        border: `1px solid ${c.border}`,
        boxShadow: '0 16px 48px rgba(44,24,16,0.15)',
        position: 'relative',
      }} onClick={e => e.stopPropagation()}>

        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 14,
          background: 'none', border: 'none', fontSize: '1.2rem',
          color: c.textMuted, cursor: 'pointer', padding: 4,
        }}>&times;</button>

        {/* Header */}
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '1.8rem',
          letterSpacing: '0.05em',
          color: c.text,
          textAlign: 'center',
          marginBottom: 8,
        }}>Go Deeper</div>
        <div style={{
          fontSize: '0.85rem',
          color: c.textMuted,
          textAlign: 'center',
          marginBottom: 28,
          lineHeight: 1.5,
        }}>Unlock the full training experience</div>

        {/* Benefits */}
        <div style={{ marginBottom: 28 }}>
          {[
            'Advanced progress tracking & analytics',
            'Training history and trends',
            'Custom training plans',
            'Data export',
          ].map((benefit, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 0',
              fontSize: '0.9rem',
              color: c.text,
            }}>
              <span style={{ color: c.gold, fontSize: '1rem' }}>&#10003;</span>
              {benefit}
            </div>
          ))}
        </div>

        {/* Pricing cards */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          {/* Monthly */}
          <button
            disabled={!!loading}
            onClick={() => handleUpgrade(MONTHLY_PRICE_ID, 'monthly')}
            style={{
              flex: 1,
              background: c.bg,
              border: `1.5px solid ${c.border}`,
              borderRadius: 14,
              padding: '20px 12px',
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading === 'yearly' ? 0.5 : 1,
              transition: 'all 0.2s',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: c.textMuted, marginBottom: 6, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Monthly</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: c.text }}>
              &euro;2.99
            </div>
            <div style={{ fontSize: '0.75rem', color: c.textMuted }}>/month</div>
          </button>

          {/* Yearly */}
          <button
            disabled={!!loading}
            onClick={() => handleUpgrade(YEARLY_PRICE_ID, 'yearly')}
            style={{
              flex: 1,
              background: `linear-gradient(135deg, ${c.gold}11, ${c.accent}11)`,
              border: `1.5px solid ${c.gold}`,
              borderRadius: 14,
              padding: '20px 12px',
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading === 'monthly' ? 0.5 : 1,
              transition: 'all 0.2s',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <div style={{
              position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
              background: c.gold, color: '#fff', fontSize: '0.65rem',
              fontWeight: 700, padding: '2px 10px', borderRadius: 10,
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>Save 44%</div>
            <div style={{ fontSize: '0.75rem', color: c.textMuted, marginBottom: 6, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Yearly</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: c.text }}>
              &euro;19.99
            </div>
            <div style={{ fontSize: '0.75rem', color: c.textMuted }}>/year</div>
          </button>
        </div>

        {error && (
          <div style={{
            fontSize: '0.85rem',
            color: c.accent,
            textAlign: 'center',
            marginBottom: 8,
            padding: '10px 14px',
            background: `${c.accent}15`,
            borderRadius: 10,
            border: `1px solid ${c.accent}30`,
          }}>{error}</div>
        )}

        <div style={{
          fontSize: '0.75rem',
          color: c.textMuted,
          textAlign: 'center',
          marginTop: 8,
        }}>
          Cancel anytime from your account settings
        </div>
      </div>
    </div>
  );
}
