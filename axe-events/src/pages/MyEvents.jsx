import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
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

const STATUS_COLORS = {
  pending: '#D4A843',
  approved: '#0DAA8A',
  rejected: '#E8652B',
  featured: '#8B5FA8',
};

export default function MyEvents() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tab, setTab] = useState('rsvps');
  const [rsvpEvents, setRsvpEvents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);

    // Fetch RSVP'd events
    const { data: rsvpData } = await supabase
      .from('rsvps')
      .select('status, events(*)')
      .eq('user_id', user.id);

    if (rsvpData) {
      setRsvpEvents(rsvpData.map(r => ({ ...r.events, myRsvpStatus: r.status })));
    }

    // Fetch submitted events
    const { data: subData } = await supabase
      .from('events')
      .select('*')
      .eq('submitted_by', user.id)
      .order('created_at', { ascending: false });

    setSubmissions(subData || []);
    setLoading(false);
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: c.muted }}>
        {t('submit.loginRequired')}
      </div>
    );
  }

  const tabStyle = (active) => ({
    flex: 1, padding: '10px',
    background: active ? `${c.accent}22` : 'transparent',
    border: 'none',
    borderBottom: active ? `2px solid ${c.accent}` : `2px solid transparent`,
    color: active ? c.text : c.muted,
    fontWeight: 600, fontSize: '0.88rem',
    cursor: 'pointer', transition: 'all 0.2s',
  });

  return (
    <div style={{ animation: 'fadeUp 0.3s ease' }}>
      <h1 style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '1.8rem', letterSpacing: '0.04em',
        color: c.text, marginBottom: 20,
      }}>{t('myEvents.title')}</h1>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${c.border}`,
        marginBottom: 20,
      }}>
        <button onClick={() => setTab('rsvps')} style={tabStyle(tab === 'rsvps')}>
          {t('myEvents.rsvps')}
        </button>
        <button onClick={() => setTab('submissions')} style={tabStyle(tab === 'submissions')}>
          {t('myEvents.submissions')}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: c.muted }}>{t('common.loading')}</div>
      ) : tab === 'rsvps' ? (
        rsvpEvents.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '40px 20px',
            color: c.muted, background: c.card,
            borderRadius: 14, border: `1px solid ${c.border}`,
          }}>{t('myEvents.noRsvps')}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rsvpEvents.map(ev => (
              <EventCard key={ev.id} event={ev} />
            ))}
          </div>
        )
      ) : (
        submissions.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '40px 20px',
            color: c.muted, background: c.card,
            borderRadius: 14, border: `1px solid ${c.border}`,
          }}>{t('myEvents.noSubmissions')}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {submissions.map(ev => {
              const statusColor = STATUS_COLORS[ev.status] || c.muted;
              return (
                <div key={ev.id} style={{
                  background: c.card, border: `1px solid ${c.border}`,
                  borderRadius: 14, padding: 16,
                }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 8,
                  }}>
                    <h3 style={{
                      fontSize: '0.95rem', fontWeight: 600, color: c.text, margin: 0,
                    }}>{ev.title}</h3>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 700,
                      color: statusColor, textTransform: 'uppercase',
                      background: `${statusColor}18`,
                      padding: '3px 10px', borderRadius: 4,
                      letterSpacing: '0.05em',
                    }}>{t(`myEvents.${ev.status}`)}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: c.muted }}>
                    {new Date(ev.start_date).toLocaleDateString(undefined, {
                      weekday: 'short', month: 'short', day: 'numeric',
                    })}
                    {ev.city && ` — ${ev.city}`}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
