import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import CalendarView from '../components/CalendarView';
import EventCard from '../components/EventCard';

const c = {
  bg: '#FFFBF5',
  card: '#FFFFFF',
  border: '#F0E6D8',
  text: '#2D1B0E',
  muted: '#8B7355',
  accent: '#E8652B',
  gold: '#D4A843',
  teal: '#0DAA8A',
};

const EVENT_TYPES = ['roda', 'workshop', 'batizado', 'festival', 'other'];

function SplashIntro({ onEnter, userName }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 800);
    const t3 = setTimeout(() => setPhase(3), 1600);
    const t4 = setTimeout(() => setPhase(4), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '40px 20px',
      position: 'relative', zIndex: 1,
    }}>
      {/* AXÉ */}
      <h1 style={{
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        fontSize: 'clamp(5rem, 18vw, 9rem)',
        letterSpacing: '0.06em',
        lineHeight: 1.1,
        paddingTop: '0.05em',
        background: `linear-gradient(90deg, #D4A843, #E8952B, #E8652B)`,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        margin: 0,
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.9)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>AXÉ</h1>

      {/* Subtitle */}
      <div style={{
        fontSize: '0.75rem', letterSpacing: '0.3em', textTransform: 'uppercase',
        color: c.muted, fontWeight: 500, marginTop: 8,
        opacity: phase >= 2 ? 1 : 0,
        transform: phase >= 2 ? 'translateY(0)' : 'translateY(16px)',
        transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>Capoeira Events Worldwide</div>

      {/* Accent line */}
      <div style={{
        width: phase >= 2 ? 60 : 0, height: 2, marginTop: 20,
        background: `linear-gradient(90deg, transparent, ${c.gold}, transparent)`,
        transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
      }} />

      {/* Quote */}
      <div style={{
        marginTop: 28, maxWidth: 400,
        opacity: phase >= 3 ? 1 : 0,
        transform: phase >= 3 ? 'translateY(0)' : 'translateY(16px)',
        transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '1.05rem', fontStyle: 'italic', fontWeight: 300,
          color: c.muted, lineHeight: 1.9,
        }}>
          "Capoeira &#233; pra homem, menino e mulher&nbsp;—<br />
          s&#243; n&#227;o aprende quem n&#227;o quer."
        </p>
        <p style={{
          fontSize: '0.72rem', color: c.gold, marginTop: 10, fontWeight: 600,
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>Traditional corrido</p>
      </div>

      {/* Greeting + Enter */}
      <div style={{
        marginTop: 40,
        opacity: phase >= 4 ? 1 : 0,
        transform: phase >= 4 ? 'translateY(0)' : 'translateY(16px)',
        transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {userName && (
          <p style={{
            fontSize: '0.88rem', color: c.text, fontWeight: 400, marginBottom: 20,
          }}>
            Salve, <strong>{userName}</strong>!
          </p>
        )}
        <button
          onClick={onEnter}
          style={{
            padding: '14px 48px',
            background: `linear-gradient(135deg, ${c.accent}, ${c.gold})`,
            border: 'none', borderRadius: 50,
            color: '#fff', fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '1.15rem', letterSpacing: '0.12em',
            cursor: 'pointer',
            boxShadow: `0 6px 30px rgba(232,101,43,0.25)`,
            transition: 'all 0.3s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 8px 40px rgba(232,101,43,0.35)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 6px 30px rgba(232,101,43,0.25)';
          }}
        >ENTER THE RODA</button>
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEnter = () => {
    setFadeOut(true);
    setTimeout(() => setShowSplash(false), 500);
  };

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*, rsvps(status)')
      .in('status', ['approved', 'featured'])
      .order('start_date', { ascending: true });

    if (!error && data) {
      const enriched = data.map(ev => ({
        ...ev,
        rsvp_going: ev.rsvps?.filter(r => r.status === 'going').length || 0,
        rsvp_interested: ev.rsvps?.filter(r => r.status === 'interested').length || 0,
      }));
      setEvents(enriched);
    }
    setLoading(false);
  };

  const featured = useMemo(() => events.filter(e => e.status === 'featured'), [events]);

  const cities = useMemo(() => {
    const set = new Set(events.map(e => e.city).filter(Boolean));
    return [...set].sort();
  }, [events]);

  const filtered = useMemo(() => {
    return events.filter(ev => {
      if (filterType && ev.event_type !== filterType) return false;
      if (filterCity && ev.city !== filterCity) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!ev.title.toLowerCase().includes(q) &&
            !ev.city?.toLowerCase().includes(q) &&
            !ev.country?.toLowerCase().includes(q) &&
            !ev.organizer_name?.toLowerCase().includes(q)) return false;
      }
      if (selectedDate) {
        const evDate = new Date(ev.start_date);
        if (evDate.getFullYear() !== selectedDate.getFullYear() ||
            evDate.getMonth() !== selectedDate.getMonth() ||
            evDate.getDate() !== selectedDate.getDate()) return false;
      }
      return true;
    });
  }, [events, filterType, filterCity, search, selectedDate]);

  const inputStyle = {
    padding: '10px 16px',
    background: c.card,
    border: `1px solid ${c.border}`,
    borderRadius: 10,
    color: c.text,
    fontSize: '0.84rem',
    outline: 'none',
    flex: 1,
    minWidth: 0,
    boxShadow: '0 1px 4px rgba(139,115,85,0.04)',
  };

  if (showSplash) {
    return (
      <div style={{
        opacity: fadeOut ? 0 : 1,
        transform: fadeOut ? 'scale(0.97)' : 'scale(1)',
        transition: 'all 0.5s ease',
      }}>
          <SplashIntro onEnter={handleEnter} userName={profile?.name} />
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeUp 0.5s ease both', position: 'relative', zIndex: 1 }}>

      {/* Header */}
      <div style={{
        textAlign: 'center', marginBottom: 28, paddingTop: 8,
      }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '2.8rem', letterSpacing: '0.08em',
          background: `linear-gradient(135deg, ${c.accent}, ${c.gold})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          margin: '0 0 4px',
        }}>EVENTS</h1>
        <p style={{
          fontSize: '0.82rem', color: c.muted, maxWidth: 400, margin: '0 auto',
        }}>{t('app.tagline')}</p>
      </div>

      {/* Search */}
      <div style={{
        marginBottom: 20,
      }}>
        <input
          type="text"
          placeholder={t('home.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            ...inputStyle, width: '100%', flex: 'none',
            padding: '12px 18px', fontSize: '0.88rem',
            borderRadius: 12,
          }}
        />
      </div>

      {/* Type chips */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <button
          onClick={() => setFilterType('')}
          style={{
            padding: '6px 16px', borderRadius: 20,
            background: !filterType ? c.text : 'transparent',
            color: !filterType ? '#fff' : c.muted,
            border: `1px solid ${!filterType ? c.text : c.border}`,
            fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer',
            letterSpacing: '0.03em', transition: 'all 0.2s',
          }}
        >{t('home.allTypes')}</button>
        {EVENT_TYPES.map(type => {
          const active = filterType === type;
          return (
            <button
              key={type}
              onClick={() => setFilterType(active ? '' : type)}
              style={{
                padding: '6px 16px', borderRadius: 20,
                background: active ? c.text : 'transparent',
                color: active ? '#fff' : c.muted,
                border: `1px solid ${active ? c.text : c.border}`,
                fontSize: '0.76rem', fontWeight: 500, cursor: 'pointer',
                textTransform: 'capitalize', transition: 'all 0.2s',
              }}
            >{t(`event.${type}`)}</button>
          );
        })}
      </div>

      {/* City filter + selected date */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {cities.length > 0 && (
          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            style={{ ...inputStyle, flex: 0, minWidth: 140 }}
          >
            <option value="">{t('home.filterCity')}</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        )}
        {selectedDate && (
          <button
            onClick={() => setSelectedDate(null)}
            style={{
              background: `${c.accent}08`, border: `1px solid ${c.accent}22`,
              borderRadius: 20, padding: '6px 16px',
              color: c.accent, fontSize: '0.78rem', cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {selectedDate.toLocaleDateString()} &times;
          </button>
        )}
      </div>

      {/* Featured events */}
      {featured.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '1.1rem', letterSpacing: '0.08em',
            color: c.gold, marginBottom: 12,
          }}>{t('home.featured')}</h2>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
            {featured.map(ev => (
              <div key={ev.id} style={{ minWidth: 300, flex: '0 0 auto' }}>
                <EventCard event={ev} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar */}
      <CalendarView
        events={events}
        onDateClick={(date) => {
          setSelectedDate(
            selectedDate?.getTime() === date.getTime() ? null : date
          );
        }}
      />

      {/* Events list */}
      <h2 style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '1.1rem', letterSpacing: '0.08em',
        color: c.text, marginBottom: 12,
      }}>{t('home.upcoming')}</h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: c.muted }}>
          {t('common.loading')}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '40px 20px',
          color: c.muted, fontSize: '0.9rem',
          background: c.card, borderRadius: 14,
          border: `1px solid ${c.border}`,
        }}>
          {t('home.noEvents')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(ev => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>
      )}

    </div>
  );
}
