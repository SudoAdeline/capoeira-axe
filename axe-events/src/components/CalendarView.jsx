import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const c = {
  bg: '#1A0F08',
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

export default function CalendarView({ events, onDateClick }) {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  // Map event dates to their types for dot indicators
  const eventDays = useMemo(() => {
    const map = {};
    events.forEach(ev => {
      const d = new Date(ev.start_date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        if (!map[day].includes(ev.event_type)) map[day].push(ev.event_type);
      }
    });
    return map;
  }, [events, year, month]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const monthName = currentDate.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  const cells = [];
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div style={{
      background: c.card,
      border: `1px solid ${c.border}`,
      borderRadius: 16,
      padding: '16px 12px',
      marginBottom: 24,
    }}>
      {/* Header with month navigation */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16, padding: '0 4px',
      }}>
        <button onClick={prevMonth} style={{
          background: 'none', border: 'none', color: c.muted,
          fontSize: '1.2rem', cursor: 'pointer', padding: '4px 8px',
        }}>&lt;</button>
        <span style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '1.15rem', letterSpacing: '0.04em',
          color: c.text, textTransform: 'capitalize',
        }}>{monthName}</span>
        <button onClick={nextMonth} style={{
          background: 'none', border: 'none', color: c.muted,
          fontSize: '1.2rem', cursor: 'pointer', padding: '4px 8px',
        }}>&gt;</button>
      </div>

      {/* Weekday headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 2, marginBottom: 4,
      }}>
        {weekDays.map(d => (
          <div key={d} style={{
            textAlign: 'center', fontSize: '0.65rem',
            color: c.muted, fontWeight: 600,
            padding: '4px 0',
          }}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 2,
      }}>
        {cells.map((day, i) => (
          <div
            key={i}
            onClick={() => day && eventDays[day] && onDateClick?.(new Date(year, month, day))}
            style={{
              textAlign: 'center',
              padding: '6px 0 4px',
              borderRadius: 8,
              cursor: day && eventDays[day] ? 'pointer' : 'default',
              background: isToday(day) ? `${c.accent}22` : 'transparent',
              border: isToday(day) ? `1px solid ${c.accent}44` : '1px solid transparent',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => {
              if (day && eventDays[day]) e.currentTarget.style.background = `${c.accent}15`;
            }}
            onMouseLeave={e => {
              if (!isToday(day)) e.currentTarget.style.background = 'transparent';
            }}
          >
            <div style={{
              fontSize: '0.82rem',
              color: day ? (isToday(day) ? c.accent : c.text) : 'transparent',
              fontWeight: isToday(day) ? 700 : 400,
            }}>{day || ''}</div>
            {/* Event dots */}
            {day && eventDays[day] && (
              <div style={{
                display: 'flex', justifyContent: 'center',
                gap: 3, marginTop: 2,
              }}>
                {eventDays[day].slice(0, 3).map((type, j) => (
                  <div key={j} style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: TYPE_COLORS[type] || c.muted,
                  }} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 12,
        marginTop: 14, padding: '0 4px',
        justifyContent: 'center',
      }}>
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} style={{
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: color,
            }} />
            <span style={{
              fontSize: '0.65rem', color: c.muted,
              textTransform: 'capitalize',
            }}>{t(`event.${type}`)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
