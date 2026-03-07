import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

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
      .select('*, profiles(name, capoeira_group)')
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
        await supabase.from('rsvps').delete().eq('id', myRsvp.id);
        setMyRsvp(null);
        setRsvps(rsvps.filter(r => r.id !== myRsvp.id));
      } else {
        await supabase.from('rsvps').update({ status }).eq('id', myRsvp.id);
        setMyRsvp({ ...myRsvp, status });
        setRsvps(rsvps.map(r => r.id === myRsvp.id ? { ...r, status } : r));
      }
    } else {
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
    background: myRsvp?.status === status ? `${typeColor}0C` : c.card,
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

      <div style={{ marginBottom: 6 }}>
        <span style={{
          fontSize: '0.7rem', fontWeight: 700,
          color: typeColor, textTransform: 'uppercase',
          letterSpacing: '0.1em',
          background: `${typeColor}0C`,
          padding: '3px 10px', borderRadius: 4,
        }}>{t(`event.${event.event_type}`)}</span>
        {event.is_free && (
          <span style={{
            fontSize: '0.7rem', fontWeight: 600,
            color: '#0DAA8A', background: '#0DAA8A0C',
            padding: '3px 10px', borderRadius: 4,
            marginLeft: 6,
          }}>{t('event.free')}</span>
        )}
        {!event.is_free && event.price_info && (
          <span style={{
            fontSize: '0.7rem', fontWeight: 600,
            color: c.gold, background: `${c.gold}0C`,
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

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 10, marginBottom: 20,
      }}>
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

        <div style={{
          background: c.card, border: `1px solid ${c.border}`,
          borderRadius: 12, padding: '14px 16px',
        }}>
          <div style={{ fontSize: '0.7rem', color: c.muted, marginBottom: 4 }}>{t('event.time')}</div>
          <div style={{ fontSize: '0.88rem', color: c.text, fontWeight: 500 }}>
            {startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

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

      {/* Attendee list — visible only to event creator */}
      {user && event.submitted_by === user.id && rsvps.length > 0 && (() => {
        const going = rsvps.filter(r => r.status === 'going');
        const interested = rsvps.filter(r => r.status === 'interested');
        return (
          <div style={{
            background: c.card, border: `1px solid ${c.border}`,
            borderRadius: 12, padding: '18px 16px',
            marginBottom: 20,
          }}>
            <div style={{
              fontSize: '0.7rem', color: c.muted, marginBottom: 12,
              textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600,
            }}>{t('event.attendeeList')}</div>

            {going.length > 0 && (
              <>
                <div style={{
                  fontSize: '0.72rem', color: typeColor, fontWeight: 700,
                  marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>{t('event.going')} ({going.length})</div>
                {going.map(r => (
                  <div key={r.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 0', borderBottom: `1px solid ${c.border}`,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${c.accent}, ${c.gold})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                    }}>{(r.profiles?.name || '?')[0].toUpperCase()}</div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: c.text, fontWeight: 500 }}>
                        {r.profiles?.name || t('event.anonymous')}
                      </div>
                      {r.profiles?.capoeira_group && (
                        <div style={{ fontSize: '0.73rem', color: c.muted }}>
                          {r.profiles.capoeira_group}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}

            {interested.length > 0 && (
              <>
                <div style={{
                  fontSize: '0.72rem', color: c.gold, fontWeight: 700,
                  marginBottom: 8, marginTop: going.length > 0 ? 16 : 0,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>{t('event.interested')} ({interested.length})</div>
                {interested.map(r => (
                  <div key={r.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 0', borderBottom: `1px solid ${c.border}`,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: `${c.gold}18`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: c.gold, fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                    }}>{(r.profiles?.name || '?')[0].toUpperCase()}</div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: c.text, fontWeight: 500 }}>
                        {r.profiles?.name || t('event.anonymous')}
                      </div>
                      {r.profiles?.capoeira_group && (
                        <div style={{ fontSize: '0.73rem', color: c.muted }}>
                          {r.profiles.capoeira_group}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        );
      })()}

      <button
        onClick={handleShare}
        style={{
          width: '100%', padding: '14px',
          background: `${c.accent}0A`,
          border: `1px solid ${c.accent}22`,
          borderRadius: 12,
          color: c.accent, fontWeight: 600,
          fontSize: '0.9rem', cursor: 'pointer',
        }}
      >{t('event.share')}</button>
    </div>
  );
}
