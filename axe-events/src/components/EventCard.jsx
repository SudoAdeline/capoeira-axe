import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const c = {
  card: '#FFFFFF',
  border: '#F0E6D8',
  text: '#2D1B0E',
  muted: '#8B7355',
  accent: '#E8652B',
  gold: '#D4A843',
};

const TYPE_COLORS = {
  roda: '#E8652B',
  workshop: '#0DAA8A',
  batizado: '#8B5FA8',
  festival: '#D4A843',
  other: '#8B7355',
};

const SCOPE_COLORS = {
  local: '#0DAA8A',
  regional: '#E8652B',
  national: '#8B5FA8',
  global: '#D4A843',
};

export default function EventCard({ event }) {
  const { t } = useTranslation();

  const typeColor = TYPE_COLORS[event.event_type] || c.muted;
  const startDate = new Date(event.start_date);

  return (
    <Link to={`/event/${event.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: c.card,
        border: `1px solid ${c.border}`,
        borderLeft: `4px solid ${typeColor}`,
        borderRadius: 12,
        padding: '16px 18px',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        boxShadow: '0 1px 6px rgba(139,115,85,0.05)',
        position: 'relative',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 8px 28px ${typeColor}12`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 6px rgba(139,115,85,0.05)';
        }}
      >
        {/* Title row */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: 12, marginBottom: 8,
        }}>
          <h3 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '1.05rem', fontWeight: 400,
            letterSpacing: '0.03em',
            color: c.text, margin: 0,
          }}>{event.title}</h3>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <span style={{
              fontSize: '0.62rem', fontWeight: 700,
              color: typeColor, textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background: `${typeColor}0C`,
              padding: '3px 10px', borderRadius: 4,
            }}>
              {t(`event.${event.event_type}`)}
            </span>
            {event.scope && (
              <span style={{
                fontSize: '0.62rem', fontWeight: 700,
                color: SCOPE_COLORS[event.scope] || c.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: `${SCOPE_COLORS[event.scope] || c.muted}0C`,
                padding: '3px 10px', borderRadius: 4,
              }}>
                {event.scope}
              </span>
            )}
            {event.is_free && (
              <span style={{
                fontSize: '0.62rem', fontWeight: 600,
                color: '#0DAA8A', background: '#0DAA8A0C',
                padding: '3px 10px', borderRadius: 4,
              }}>{t('event.free')}</span>
            )}
          </div>
        </div>

        {/* Details row */}
        <div style={{
          fontSize: '0.78rem', color: c.muted,
          display: 'flex', alignItems: 'center', gap: 6,
          flexWrap: 'wrap',
        }}>
          <span>{startDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span style={{ opacity: 0.3 }}>&middot;</span>
          <span>{startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
          {event.location_name && (
            <>
              <span style={{ opacity: 0.3 }}>&middot;</span>
              <span>{event.location_name}</span>
            </>
          )}
        </div>

        {/* Location + organizer */}
        {(event.city || event.organizer_name) && (
          <div style={{
            fontSize: '0.75rem', color: c.muted, marginTop: 4,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {event.organizer_name && (
              <span>By <strong style={{ color: c.text, fontWeight: 500 }}>{event.organizer_name}</strong></span>
            )}
            {event.organizer_name && event.city && <span style={{ opacity: 0.3 }}>&middot;</span>}
            {event.city && <span>{event.city}{event.country ? `, ${event.country}` : ''}</span>}
          </div>
        )}

        {/* RSVP + footer */}
        {(event.rsvp_going > 0 || event.rsvp_interested > 0 || !event.is_free) && (
          <div style={{
            fontSize: '0.72rem', color: c.muted, marginTop: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', gap: 10 }}>
              {event.rsvp_going > 0 && (
                <span>{t('event.peopleGoing', { count: event.rsvp_going })}</span>
              )}
              {event.rsvp_interested > 0 && (
                <span>{t('event.peopleInterested', { count: event.rsvp_interested })}</span>
              )}
            </div>
            {!event.is_free && event.price_info && (
              <span style={{ color: c.gold, fontWeight: 600 }}>{event.price_info}</span>
            )}
          </div>
        )}

        {/* RSVP arrow */}
        <div style={{
          position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
          color: typeColor, fontSize: '0.9rem', opacity: 0.4,
        }}>&#8594;</div>
      </div>
    </Link>
  );
}
