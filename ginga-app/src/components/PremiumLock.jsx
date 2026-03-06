import { usePremium } from '../context/PremiumContext';

export default function PremiumLock({ children, label }) {
  const { isPremium, requirePremium } = usePremium();

  if (isPremium) return children;

  return (
    <div
      onClick={(e) => { e.stopPropagation(); requirePremium(); }}
      style={{ position: 'relative', cursor: 'pointer' }}
    >
      <div style={{ opacity: 0.45, pointerEvents: 'none', filter: 'grayscale(0.3)' }}>
        {children}
      </div>
      <div style={{
        position: 'absolute', top: 8, right: 8,
        background: 'rgba(212,168,67,0.15)',
        borderRadius: 8,
        padding: '4px 10px',
        fontSize: '0.7rem',
        fontFamily: "'DM Sans', sans-serif",
        color: '#D4A843',
        fontWeight: 600,
        letterSpacing: '0.05em',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}>
        <span style={{ fontSize: '0.8rem' }}>&#x1F512;</span>
        {label || 'Premium'}
      </div>
    </div>
  );
}
