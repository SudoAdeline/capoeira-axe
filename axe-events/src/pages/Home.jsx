import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import CalendarView from '../components/CalendarView';
import EventCard from '../components/EventCard';

const c = {
  bg: '#1A0F08',
  card: '#241710',
  border: '#3A2A1A',
  text: '#F5E6D3',
  muted: '#8B7355',
  accent: '#E8652B',
  gold: '#D4A843',
};

const EVENT_TYPES = ['roda', 'workshop', 'batizado', 'festival', 'other'];

export default function Home() {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*, rsvps(status)')
      .in('status', ['approved', 'featured'])
      .gte('start_date', new Date().toISOString())
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
    padding: '8px 12px',
    background: c.card,
    border: `1px solid ${c.border}`,
    borderRadius: 8,
    color: c.text,
    fontSize: '0.82rem',
    outline: 'none',
    flex: 1,
    minWidth: 0,
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 28, paddingTop: 8 }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '2.2rem', letterSpacing: '0.06em',
          background: `linear-gradient(135deg, ${c.accent}, ${c.gold})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          margin: '0 0 6px',
        }}>{t('app.title')}</h1>
        <p style={{
          fontSize: '0.88rem', color: c.muted, maxWidth: 400, margin: '0 auto',
        }}>{t('app.tagline')}</p>
      </div>

      {/* Featured events banner */}
      {featured.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '1.1rem', letterSpacing: '0.06em',
            color: c.gold, marginBottom: 12,
          }}>{t('home.featured')}</h2>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
            {featured.map(ev => (
              <div key={ev.id} style={{ minWidth: 280, flex: '0 0 auto' }}>
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

      {/* Filters */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap',
      }}>
        <input
          type="text"
          placeholder={t('home.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: 2 }}
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ ...inputStyle, flex: 0, minWidth: 120 }}
        >
          <option value="">{t('home.allTypes')}</option>
          {EVENT_TYPES.map(type => (
            <option key={type} value={type}>{t(`event.${type}`)}</option>
          ))}
        </select>
        {cities.length > 0 && (
          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            style={{ ...inputStyle, flex: 0, minWidth: 120 }}
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
              background: `${c.accent}22`, border: `1px solid ${c.accent}44`,
              borderRadius: 8, padding: '6px 12px',
              color: c.accent, fontSize: '0.78rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            {selectedDate.toLocaleDateString()} &times;
          </button>
        )}
      </div>

      {/* Events list */}
      <h2 style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '1.1rem', letterSpacing: '0.06em',
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
