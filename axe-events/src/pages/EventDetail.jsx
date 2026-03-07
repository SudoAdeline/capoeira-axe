import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

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

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [myRsvp, setMyRsvp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
    setEvent(data);

    const { data: rsvpData } = await supabase
      .from('rsvps')
      .select('*')
      .eq('event_id', id);
    setRsvps(rsvpData || []);

    if (user) {
      const mine = rsvpData?.find(r => r.user_id === user.id);
      setMyRsvp(mine || null);
    }
    setLoading(false);
  };

  const handleRsvp = async (status) => {
    if (!user) return;

    if (myRsvp) {
      if (myRsvp.status === status) {
        // Remove RSVP
        await supabase.from('rsvps').delete().eq('id', myRsvp.id);
        setMyRsvp(null);
        setRsvps(rsvps.filter(r => r.id !== myRsvp.id));
      } else {
        // Update RSVP
        await supabase.from('rsvps').update({ status }).eq('id', myRsvp.id);
        setMyRsvp({ ...myRsvp, status });
        setRsvps(rsvps.map(r => r.id === myRsvp.id ? { ...r, status } : r));
      }
    } else {
      // New RSVP
      const { data } = await supabase
        .from('rsvps')
        .insert({ event_id: id, user_id: user.id, status })
        .select()
        .single();
      if (data) {
        setMyRsvp(data);
        setRsvps([...rsvps, data]);
      }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `${event.title} — ${event.city || ''}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60, color: c.muted }}>{t('common.loading')}</div>;
  }
  if (!event) {
    return <div style={{ textAlign: 'center', padding: 60, color: c.muted }}>{t('common.error')}</div>;
  }

  const typeColor = TYPE_COLORS[event.event_type] || c.muted;
  const startDate = new Date(event.start_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;
  const goingCount = rsvps.filter(r => r.status === 'going').length;
  const interestedCount = rsvps.filter(r => r.status === 'interested').length;

  const rsvpBtnStyle = (status) => ({
    flex: 1,
    padding: '12px 16px',
    borderRadius: 10,
    border: myRsvp?.status === status ? `2px solid ${typeColor}` : `1px solid ${c.border}`,
    background: myRsvp?.status === status ? `${typeColor}22` : c.card,
    color: myRsvp?.status === status ? typeColor : c.text,
    fontWeight: 600,
    fontSize: '0.88rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  const mapsUrl = event.location_address
    ? `https://maps.google.com/?q=${encodeURIComponent(event.location_address)}`
    : null;

  return (
    <div style={{ animation: 'fadeUp 0.3s ease' }}>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none', border: 'none',
          color: c.muted, fontSize: '0.85rem',
          cursor: 'pointer', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 4,
        }}
      >
        &larr; {t('common.back')}
      </button>

      {/* Event image */}
      {event.image_url && (
        <div style={{
          borderRadius: 16, overflow: 'hidden',
          marginBottom: 20, maxHeight: 240,
        }}>
          <img src={event.image_url} alt={event.title} style={{
            width: '100%', height: '100%', objectFit: 'cover',
          }} />
        </div>
      )}

      {/* Type badge + title */}
      <div style={{ marginBottom: 6 }}>
        <span style={{
          fontSize: '0.7rem', fontWeight: 700,
          color: typeColor, textTransform: 'uppercase',
          letterSpacing: '0.1em',
          background: `${typeColor}18`,
          padding: '3px 10px', borderRadius: 4,
        }}>{t(`event.${event.event_type}`)}</span>
        {event.is_free && (
          <span style={{
            fontSize: '0.7rem', fontWeight: 600,
            color: '#0DAA8A', background: '#0DAA8A18',
            padding: '3px 10px', borderRadius: 4,
            marginLeft: 6,
          }}>{t('event.free')}</span>
        )}
        {!event.is_free && event.price_info && (
          <span style={{
            fontSize: '0.7rem', fontWeight: 600,
            color: c.gold, background: `${c.gold}18`,
            padding: '3px 10px', borderRadius: 4,
            marginLeft: 6,
          }}>{event.price_info}</span>
        )}
      </div>

      <h1 style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '1.8rem', letterSpacing: '0.03em',
        color: c.text, margin: '8px 0 20px',
      }}>{event.title}</h1>

      {/* Info cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 10, marginBottom: 20,
      }}>
        {/* Date */}
        <div style={{
          background: c.card, border: `1px solid ${c.border}`,
          borderRadius: 12, padding: '14px 16px',
        }}>
          <div style={{ fontSize: '0.7rem', color: c.muted, marginBottom: 4 }}>{t('event.date')}</div>
          <div style={{ fontSize: '0.88rem', color: c.text, fontWeight: 500 }}>
            {startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          {endDate && (
            <div style={{ fontSize: '0.78rem', color: c.muted, marginTop: 2 }}>
              &rarr; {endDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>

        {/* Time */}
        <div style={{
          background: c.card, border: `1px solid ${c.border}`,
          borderRadius: 12, padding: '14px 16px',
        }}>
          <div style={{ fontSize: '0.7rem', color: c.muted, marginBottom: 4 }}>{t('event.time')}</div>
          <div style={{ fontSize: '0.88rem', color: c.text, fontWeight: 500 }}>
            {startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Location */}
        {(event.location_name || event.location_address) && (
          <div style={{
            background: c.card, border: `1px solid ${c.border}`,
            borderRadius: 12, padding: '14px 16px',
            gridColumn: '1 / -1',
          }}>
            <div style={{ fontSize: '0.7rem', color: c.muted, marginBottom: 4 }}>{t('event.location')}</div>
            {event.location_name && (
              <div style={{ fontSize: '0.88rem', color: c.text, fontWeight: 500 }}>{event.location_name}</div>
            )}
            {event.location_address && (
              <div style={{ fontSize: '0.78rem', color: c.muted, marginTop: 2 }}>{event.location_address}</div>
            )}
            {event.city && (
              <div style={{ fontSize: '0.78rem', color: c.muted }}>
                {event.city}{event.country ? `, ${event.country}` : ''}
              </div>
            )}
            {mapsUrl && (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-block', marginTop: 8,
                fontSize: '0.78rem', color: typeColor,
                fontWeight: 600,
              }}>{t('event.openMap')} &rarr;</a>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {event.description && (
        <div style={{
          background: c.card, border: `1px solid ${c.border}`,
          borderRadius: 12, padding: '18px 16px',
          marginBottom: 20,
        }}>
          <div style={{ fontSize: '0.7rem', color: c.muted, marginBottom: 8 }}>{t('event.details')}</div>
          <div style={{
            fontSize: '0.88rem', color: c.text,
            lineHeight: 1.6, whiteSpace: 'pre-wrap',
          }}>{event.description}</div>
        </div>
      )}

      {/* Organizer */}
      {event.organizer_name && (
        <div style={{
          background: c.card, border: `1px solid ${c.border}`,
          borderRadius: 12, padding: '14px 16px',
          marginBottom: 20,
        }}>
          <div style={{ fontSize: '0.7rem', color: c.muted, marginBottom: 4 }}>{t('event.organizer')}</div>
          <div style={{ fontSize: '0.88rem', color: c.text, fontWeight: 500 }}>{event.organizer_name}</div>
          {event.contact_email && (
            <a href={`mailto:${event.contact_email}`} style={{
              fontSize: '0.78rem', color: typeColor, display: 'block', marginTop: 4,
            }}>{event.contact_email}</a>
          )}
          {event.contact_url && (
            <a href={event.contact_url} target="_blank" rel="noopener noreferrer" style={{
              fontSize: '0.78rem', color: typeColor, display: 'block', marginTop: 2,
            }}>{event.contact_url}</a>
          )}
        </div>
      )}

      {/* RSVP section */}
      <div style={{
        background: c.card, border: `1px solid ${c.border}`,
        borderRadius: 12, padding: '18px 16px',
        marginBottom: 20,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 16,
          marginBottom: 14, fontSize: '0.82rem', color: c.muted,
        }}>
          <span>{t('event.peopleGoing', { count: goingCount })}</span>
          <span>{t('event.peopleInterested', { count: interestedCount })}</span>
        </div>

        {user ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => handleRsvp('going')} style={rsvpBtnStyle('going')}>
              {t('event.going')}
            </button>
            <button onClick={() => handleRsvp('interested')} style={rsvpBtnStyle('interested')}>
              {t('event.interested')}
            </button>
          </div>
        ) : (
          <div style={{
            textAlign: 'center', fontSize: '0.82rem',
            color: c.muted, padding: '8px 0',
          }}>
            {t('submit.loginRequired')}
          </div>
        )}
      </div>

      {/* Share button */}
      <button
        onClick={handleShare}
        style={{
          width: '100%', padding: '14px',
          background: `${c.accent}15`,
          border: `1px solid ${c.accent}33`,
          borderRadius: 12,
          color: c.accent, fontWeight: 600,
          fontSize: '0.9rem', cursor: 'pointer',
        }}
      >{t('event.share')}</button>
    </div>
  );
}
