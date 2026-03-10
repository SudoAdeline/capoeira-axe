import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  const [showReminder, setShowReminder] = useState(false);
  const [reminderMsg, setReminderMsg] = useState('');
  const [reminderSending, setReminderSending] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);

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

  const sendReminder = async () => {
    if (!reminderMsg.trim() || rsvps.length === 0) return;
    setReminderSending(true);
    const notifications = rsvps
      .filter(r => r.user_id !== user.id)
      .map(r => ({
        user_id: r.user_id,
        event_id: id,
        sender_id: user.id,
        message: reminderMsg.trim(),
      }));
    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications);
    }
    setReminderSending(false);
    setReminderSent(true);
    setReminderMsg('');
    setTimeout(() => { setReminderSent(false); setShowReminder(false); }, 2000);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60, color: c.muted }}>{t('common.loading')}</div>;
  }
  if (!event) {
    return <div style={{ textAlign: 'center', padding: 60, color: c.muted }}>{t('common.error')}</div>;
  }

  // Parse comma-separated event types
  const eventTypes = (event.event_type || '').split(',').filter(Boolean);
  const primaryType = eventTypes[0] || 'other';
  const typeColor = TYPE_COLORS[primaryType] || c.muted;
  const startDate = new Date(event.start_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;
  const goingCount = rsvps.filter(r => r.status === 'going').length;
  const interestedCount = rsvps.filter(r => r.status === 'interested').length;

  // Registration deadline check
  const regDeadline = event.registration_deadline ? new Date(event.registration_deadline) : null;
  const regClosed = regDeadline && regDeadline < new Date();

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

  const mapsQuery = [event.location_name, event.location_address, event.city, event.country]
    .filter(Boolean).join(', ');
  const mapsUrl = mapsQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`
    : null;

  const sectionCard = {
    background: c.card, border: `1px solid ${c.border}`,
    borderRadius: 12, padding: '18px 16px',
    marginBottom: 20,
  };

  const sectionLabel = {
    fontSize: '0.7rem', color: c.muted, marginBottom: 8,
    textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600,
  };

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
          marginBottom: 20,
        }}>
          <img src={event.image_url} alt={event.title} style={{
            width: '100%', display: 'block', borderRadius: 16,
          }} />
        </div>
      )}

      {/* Type badges — supports multiple */}
      <div style={{ marginBottom: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {eventTypes.map(type => {
          const tc = TYPE_COLORS[type] || c.muted;
          return (
            <span key={type} style={{
              fontSize: '0.7rem', fontWeight: 700,
              color: tc, textTransform: 'uppercase',
              letterSpacing: '0.1em',
              background: `${tc}0C`,
              padding: '3px 10px', borderRadius: 4,
            }}>{t(`event.${type}`)}</span>
          );
        })}
        {event.is_free && (
          <span style={{
            fontSize: '0.7rem', fontWeight: 600,
            color: '#0DAA8A', background: '#0DAA8A0C',
            padding: '3px 10px', borderRadius: 4,
          }}>{t('event.free')}</span>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '1.8rem', letterSpacing: '0.03em',
          color: c.text, margin: '8px 0 20px',
        }}>{event.title}</h1>
        {user && event.submitted_by === user.id && (
          <Link to={`/edit/${event.id}`} style={{
            fontSize: '0.75rem', fontWeight: 600,
            color: c.accent, textDecoration: 'none',
            padding: '6px 14px', borderRadius: 8,
            background: `${c.accent}0A`, border: `1px solid ${c.accent}22`,
            flexShrink: 0, marginTop: 12,
          }}>{t('admin.edit')}</Link>
        )}
      </div>

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
          <div style={{ fontSize: '0.7rem', color: c.muted, marginBottom: 4 }}>{t('event.schedule')}</div>
          <div style={{ fontSize: '0.82rem', color: c.muted }}>
            {event.schedule?.length > 0
              ? [event.schedule[0].date && new Date(event.schedule[0].date + 'T00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }), event.schedule[0].time].filter(Boolean).join(' · ')
              : t('event.details')}
          </div>
        </div>

        {/* Single location */}
        {(event.location_name || event.location_address) && !event.day_locations?.length && (
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

        {/* City-only location fallback */}
        {!event.location_name && !event.location_address && event.city && !event.day_locations?.length && (
          <div style={{
            background: c.card, border: `1px solid ${c.border}`,
            borderRadius: 12, padding: '14px 16px',
            gridColumn: '1 / -1',
          }}>
            <div style={{ fontSize: '0.7rem', color: c.muted, marginBottom: 4 }}>{t('event.location')}</div>
            <div style={{ fontSize: '0.78rem', color: c.muted }}>
              {event.city}{event.country ? `, ${event.country}` : ''}
            </div>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([event.city, event.country].filter(Boolean).join(', '))}`} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-block', marginTop: 8,
              fontSize: '0.78rem', color: typeColor,
              fontWeight: 600,
            }}>{t('event.openMap')} &rarr;</a>
          </div>
        )}
      </div>

      {/* Multi-day locations */}
      {event.day_locations?.length > 0 && (
        <div style={sectionCard}>
          <div style={sectionLabel}>{t('event.dayLocations')}</div>
          {event.day_locations.map((day, idx) => (
            <div key={idx} style={{
              padding: '10px 12px', marginBottom: 8,
              background: c.bg, borderRadius: 8,
              border: `1px solid ${c.border}`,
            }}>
              {day.date && (
                <div style={{ fontSize: '0.78rem', color: typeColor, fontWeight: 600, marginBottom: 4 }}>
                  {new Date(day.date + 'T00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              )}
              {day.venue && (
                <div style={{ fontSize: '0.88rem', color: c.text, fontWeight: 500 }}>{day.venue}</div>
              )}
              {day.address && (
                <div style={{ fontSize: '0.78rem', color: c.muted }}>{day.address}</div>
              )}
              {day.city && (
                <div style={{ fontSize: '0.78rem', color: c.muted }}>{day.city}</div>
              )}
              {(day.venue || day.address || day.city) && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([day.venue, day.address, day.city, event.country].filter(Boolean).join(', '))}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: '0.72rem', color: typeColor, fontWeight: 600 }}
                >{t('event.openMap')} &rarr;</a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Description */}
      {event.description && (
        <div style={sectionCard}>
          <div style={{ fontSize: '0.7rem', color: c.muted, marginBottom: 8 }}>{t('event.details')}</div>
          <div style={{
            fontSize: '0.88rem', color: c.text,
            lineHeight: 1.6, whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>{event.description}</div>
        </div>
      )}

      {/* Additional Info */}
      {event.additional_info && (
        <div style={sectionCard}>
          <div style={{ fontSize: '0.7rem', color: c.muted, marginBottom: 8 }}>{t('event.additionalInfo')}</div>
          <div style={{
            fontSize: '0.88rem', color: c.text,
            lineHeight: 1.6, whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>{event.additional_info}</div>
        </div>
      )}

      {/* Price info (when not free) */}
      {!event.is_free && event.price_info && (
        <div style={sectionCard}>
          <div style={{ fontSize: '0.7rem', color: c.muted, marginBottom: 8 }}>{t('event.paid')}</div>
          <div style={{
            fontSize: '0.88rem', color: c.text,
            lineHeight: 1.5, whiteSpace: 'pre-wrap',
          }}>{event.price_info}</div>
        </div>
      )}

      {/* Featured Teachers / Mestres */}
      {event.guests?.length > 0 && (
        <div style={sectionCard}>
          <div style={sectionLabel}>{t('event.guests')}</div>
          {event.guests.map((guest, idx) => (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 0',
              borderBottom: idx < event.guests.length - 1 ? `1px solid ${c.border}` : 'none',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: `linear-gradient(135deg, ${c.accent}30, ${c.gold}30)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: c.accent, fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
              }}>{guest.name[0]?.toUpperCase()}</div>
              <div>
                <div style={{ fontSize: '0.88rem', color: c.text, fontWeight: 500 }}>
                  {guest.title ? `${guest.title} ${guest.name}` : guest.name}
                </div>
                {guest.group && (
                  <div style={{ fontSize: '0.73rem', color: c.muted }}>{guest.group}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Schedule / Program */}
      {event.schedule?.length > 0 && (
        <div style={sectionCard}>
          <div style={sectionLabel}>{t('event.schedule')}</div>
          {event.schedule.map((item, idx) => (
            <div key={idx} style={{
              padding: '12px 14px', background: c.bg,
              borderRadius: 10, marginBottom: idx < event.schedule.length - 1 ? 10 : 0,
              border: `1px solid ${c.border}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: item.description ? 8 : 0 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: typeColor, flexShrink: 0,
                }} />
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: typeColor }}>
                  {item.date && new Date(item.date + 'T00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  {item.date && item.time && ' · '}
                  {item.time}
                </div>
              </div>
              {item.description && (
                <div style={{
                  fontSize: '0.85rem', color: c.text, lineHeight: 1.6,
                  whiteSpace: 'pre-wrap', paddingLeft: 16,
                }}>
                  {item.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Registration */}
      {(event.registration_url || regDeadline) && (
        <div style={sectionCard}>
          {regDeadline && (
            <div style={{
              fontSize: '0.78rem', marginBottom: 10,
              color: regClosed ? c.accent : c.muted,
              fontWeight: regClosed ? 600 : 400,
            }}>
              {regClosed
                ? t('event.regClosed')
                : `${t('submit.regDeadline').replace(' (optional)', '')}: ${regDeadline.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
              }
            </div>
          )}
          {event.registration_url && !regClosed && (
            <a
              href={event.registration_url}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-block', padding: '12px 24px',
                background: `linear-gradient(135deg, ${c.accent}, ${c.gold})`,
                color: '#fff', borderRadius: 10, fontWeight: 600,
                fontSize: '0.88rem', textDecoration: 'none',
              }}
            >{t('event.regOpen')}</a>
          )}
        </div>
      )}

      {/* Organizer + Contact */}
      {event.organizer_name && (
        <div style={sectionCard}>
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
          {event.contact_phone && (
            <div style={{ marginTop: 6, display: 'flex', gap: 10, alignItems: 'center' }}>
              <a href={`tel:${event.contact_phone}`} style={{
                fontSize: '0.78rem', color: typeColor,
              }}>{event.contact_phone}</a>
              {event.contact_phone.startsWith('+') && (
                <a
                  href={`https://wa.me/${event.contact_phone.replace(/[\s\-()]/g, '')}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    fontSize: '0.72rem', fontWeight: 600,
                    color: '#25D366', background: '#25D3660C',
                    padding: '3px 10px', borderRadius: 4,
                  }}
                >{t('event.whatsapp')}</a>
              )}
            </div>
          )}
        </div>
      )}

      {/* RSVP section */}
      <div style={sectionCard}>
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
          <div style={sectionCard}>
            <div style={sectionLabel}>{t('event.attendeeList')}</div>

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

      {/* Send Reminder — visible only to event creator */}
      {user && event.submitted_by === user.id && rsvps.length > 0 && (
        <div style={sectionCard}>
          {!showReminder ? (
            <button
              onClick={() => setShowReminder(true)}
              style={{
                width: '100%', padding: '12px',
                background: `${c.gold}0A`, border: `1px solid ${c.gold}22`,
                borderRadius: 10, color: c.gold,
                fontWeight: 600, fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >{t('notify.sendReminder')}</button>
          ) : reminderSent ? (
            <div style={{
              textAlign: 'center', padding: '12px',
              color: '#0DAA8A', fontSize: '0.88rem', fontWeight: 600,
            }}>{t('notify.sent')}</div>
          ) : (
            <div>
              <textarea
                value={reminderMsg}
                onChange={(e) => setReminderMsg(e.target.value)}
                placeholder={t('notify.messagePlaceholder')}
                rows={3}
                style={{
                  width: '100%', padding: '12px 14px',
                  background: c.bg, border: `1px solid ${c.border}`,
                  borderRadius: 10, color: c.text,
                  fontSize: '0.85rem', outline: 'none',
                  resize: 'vertical', boxSizing: 'border-box',
                  marginBottom: 10,
                }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={sendReminder}
                  disabled={!reminderMsg.trim() || reminderSending}
                  style={{
                    flex: 1, padding: '10px',
                    background: `linear-gradient(135deg, ${c.accent}, ${c.gold})`,
                    border: 'none', borderRadius: 8,
                    color: '#fff', fontWeight: 600, fontSize: '0.85rem',
                    cursor: reminderMsg.trim() && !reminderSending ? 'pointer' : 'not-allowed',
                    opacity: !reminderMsg.trim() || reminderSending ? 0.6 : 1,
                  }}
                >{reminderSending ? t('common.loading') : t('notify.send')}</button>
                <button
                  onClick={() => { setShowReminder(false); setReminderMsg(''); }}
                  style={{
                    padding: '10px 16px',
                    background: 'none', border: `1px solid ${c.border}`,
                    borderRadius: 8, color: c.muted,
                    fontSize: '0.85rem', cursor: 'pointer',
                  }}
                >{t('common.cancel')}</button>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <a
          href={(() => {
            const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
            const end = endDate || new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
            const location = [event.location_name, event.location_address, event.city, event.country]
              .filter(Boolean).join(', ');
            const params = new URLSearchParams({
              action: 'TEMPLATE',
              text: event.title,
              dates: `${fmt(startDate)}/${fmt(end)}`,
              details: event.description || '',
              location,
            });
            return `https://calendar.google.com/calendar/render?${params}`;
          })()}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1, padding: '14px', textAlign: 'center',
            background: `${c.gold}0A`,
            border: `1px solid ${c.gold}22`,
            borderRadius: 12,
            color: c.gold, fontWeight: 600,
            fontSize: '0.9rem', cursor: 'pointer',
            textDecoration: 'none',
          }}
        >{t('event.addToCalendar')}</a>
        <button
          onClick={handleShare}
          style={{
            flex: 1, padding: '14px',
            background: `${c.accent}0A`,
            border: `1px solid ${c.accent}22`,
            borderRadius: 12,
            color: c.accent, fontWeight: 600,
            fontSize: '0.9rem', cursor: 'pointer',
          }}
        >{t('event.share')}</button>
      </div>
    </div>
  );
}
