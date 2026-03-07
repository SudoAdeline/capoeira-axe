import { useState, useMemo } from 'react';
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
  const [expanded, setExpanded] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

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
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const eventCount = Object.keys(eventDays).length;

  return (
    <div style={{
      background: c.card,
      border: `1px solid ${c.border}`,
      borderRadius: 16,
      padding: 0,
      marginBottom: 24,
      boxShadow: '0 2px 12px rgba(139,115,85,0.06)',
      overflow: 'hidden',
    }}>
      {/* Top accent line */}
      <div style={{
        height: 3,
        background: `linear-gradient(90deg, ${c.accent}, ${c.gold}, ${c.accent})`,
      }} />

      <div style={{ padding: '16px 16px 14px' }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 14,
        }}>
          <button onClick={prevMonth} style={{
            background: 'none', border: `1px solid ${c.border}`, color: c.muted,
            fontSize: '0.9rem', cursor: 'pointer', padding: '4px 10px',
            borderRadius: 6, transition: 'all 0.2s',
          }}>&larr;</button>
          <div style={{ textAlign: 'center' }}>
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '1.2rem', letterSpacing: '0.06em',
              color: c.text, textTransform: 'capitalize',
            }}>{monthName}</span>
            {eventCount > 0 && (
              <div style={{
                fontSize: '0.65rem', color: c.accent, fontWeight: 600, marginTop: 2,
              }}>{eventCount} event{eventCount > 1 ? 's' : ''} this month</div>
            )}
          </div>
          <button onClick={nextMonth} style={{
            background: 'none', border: `1px solid ${c.border}`, color: c.muted,
            fontSize: '0.9rem', cursor: 'pointer', padding: '4px 10px',
            borderRadius: 6, transition: 'all 0.2s',
          }}>&rarr;</button>
        </div>

        {/* Toggle */}
        <button onClick={() => setExpanded(!expanded)} style={{
          display: 'block', width: '100%', background: 'none', border: 'none',
          color: c.muted, fontSize: '0.7rem', cursor: 'pointer', marginBottom: expanded ? 10 : 0,
          letterSpacing: '0.05em',
        }}>{expanded ? 'Hide calendar' : 'Show calendar'}</button>

        {expanded && (
          <>
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
              {cells.map((day, i) => {
                const hasEvents = day && eventDays[day];
                return (
                  <div
                    key={i}
                    onClick={() => hasEvents && onDateClick?.(new Date(year, month, day))}
                    style={{
                      textAlign: 'center',
                      padding: '8px 0 6px',
                      borderRadius: 10,
                      cursor: hasEvents ? 'pointer' : 'default',
                      background: isToday(day)
                        ? `linear-gradient(135deg, ${c.accent}15, ${c.gold}10)`
                        : hasEvents ? `${c.accent}05` : 'transparent',
                      border: isToday(day) ? `1.5px solid ${c.accent}33` : '1.5px solid transparent',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      if (hasEvents) e.currentTarget.style.background = `${c.accent}0D`;
                    }}
                    onMouseLeave={e => {
                      if (!isToday(day)) {
                        e.currentTarget.style.background = hasEvents ? `${c.accent}05` : 'transparent';
                      }
                    }}
                  >
                    <div style={{
                      fontSize: '0.84rem',
                      color: day ? (isToday(day) ? c.accent : hasEvents ? c.text : c.muted) : 'transparent',
                      fontWeight: isToday(day) ? 800 : hasEvents ? 600 : 400,
                    }}>{day || ''}</div>
                    {hasEvents && (
                      <div style={{
                        display: 'flex', justifyContent: 'center',
                        gap: 3, marginTop: 3,
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
                );
              })}
            </div>

            {/* Legend */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 14,
              marginTop: 14, justifyContent: 'center',
            }}>
              {Object.entries(TYPE_COLORS).map(([type, color]) => (
                <div key={type} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: color,
                  }} />
                  <span style={{
                    fontSize: '0.67rem', color: c.muted,
                    textTransform: 'capitalize',
                  }}>{t(`event.${type}`)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
