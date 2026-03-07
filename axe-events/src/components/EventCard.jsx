import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const c = {
  card: '#241710',
  border: '#3A2A1A',
  text: '#F5E6D3',
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

export default function EventCard({ event }) {
  const { t } = useTranslation();

  const typeColor = TYPE_COLORS[event.event_type] || c.muted;
  const startDate = new Date(event.start_date);
  const month = startDate.toLocaleString(undefined, { month: 'short' }).toUpperCase();
  const day = startDate.getDate();

  return (
    <Link to={`/event/${event.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: c.card,
        border: `1px solid ${c.border}`,
        borderRadius: 14,
        padding: 16,
        display: 'flex',
        gap: 14,
        transition: 'transform 0.2s, border-color 0.2s',
        cursor: 'pointer',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = typeColor + '66';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = c.border;
        }}
      >
        {/* Date block */}
        <div style={{
          flexShrink: 0, width: 52, height: 58,
          background: `${typeColor}15`,
          border: `1px solid ${typeColor}33`,
          borderRadius: 10,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            fontSize: '0.6rem', fontWeight: 700,
            color: typeColor, letterSpacing: '0.1em',
          }}>{month}</div>
          <div style={{
            fontSize: '1.3rem', fontWeight: 700,
            color: c.text, lineHeight: 1,
          }}>{day}</div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: '0.65rem', fontWeight: 700,
              color: typeColor, textTransform: 'uppercase',
              letterSpacing: '0.1em',
              background: `${typeColor}18`,
              padding: '2px 8px', borderRadius: 4,
            }}>
              {t(`event.${event.event_type}`)}
            </span>
            {event.is_free && (
              <span style={{
                fontSize: '0.65rem', fontWeight: 600,
                color: '#0DAA8A', background: '#0DAA8A18',
                padding: '2px 8px', borderRadius: 4,
              }}>{t('event.free')}</span>
            )}
          </div>

          <h3 style={{
            fontSize: '0.95rem', fontWeight: 600,
            color: c.text, margin: '0 0 4px',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{event.title}</h3>

          <div style={{
            fontSize: '0.78rem', color: c.muted,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {event.city && <span>{event.city}</span>}
            {event.city && event.country && <span style={{ opacity: 0.4 }}>|</span>}
            {event.country && <span>{event.country}</span>}
          </div>

          {(event.rsvp_going > 0 || event.rsvp_interested > 0) && (
            <div style={{
              fontSize: '0.72rem', color: c.muted, marginTop: 6,
              display: 'flex', gap: 10,
            }}>
              {event.rsvp_going > 0 && (
                <span>{t('event.peopleGoing', { count: event.rsvp_going })}</span>
              )}
              {event.rsvp_interested > 0 && (
                <span>{t('event.peopleInterested', { count: event.rsvp_interested })}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
