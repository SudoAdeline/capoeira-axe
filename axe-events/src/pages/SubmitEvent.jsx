import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const EVENT_TYPES = ['roda', 'workshop', 'batizado', 'festival', 'other'];

export default function SubmitEvent() {
  const { t } = useTranslation();
  const { user, isApprovedOrganizer } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Core form
  const [form, setForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location_name: '',
    location_address: '',
    city: '',
    country: '',
    organizer_name: '',
    contact_email: '',
    contact_url: '',
    contact_phone: '',
    is_free: true,
    price_info: '',
    registration_deadline: '',
    registration_url: '',
  });

  // Multi-select event types
  const [selectedTypes, setSelectedTypes] = useState(['roda']);

  // Multi-day locations
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [dayLocations, setDayLocations] = useState([
    { date: '', venue: '', address: '', city: '' },
  ]);

  // Featured teachers / mestres
  const [guests, setGuests] = useState([]);

  // Event schedule
  const [schedule, setSchedule] = useState([]);

  if (!user) {
    return (
      <div style={{
        textAlign: 'center', padding: '60px 20px',
        color: c.muted, fontSize: '0.9rem',
      }}>
        {t('submit.loginRequired')}
      </div>
    );
  }

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [key]: val });
  };

  const toggleType = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  // Day locations helpers
  const updateDayLocation = (idx, field, value) => {
    setDayLocations(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  };
  const addDayLocation = () => {
    setDayLocations(prev => [...prev, { date: '', venue: '', address: '', city: '' }]);
  };
  const removeDayLocation = (idx) => {
    setDayLocations(prev => prev.filter((_, i) => i !== idx));
  };

  // Guest helpers
  const addGuest = () => {
    setGuests(prev => [...prev, { name: '', title: '', group: '' }]);
  };
  const updateGuest = (idx, field, value) => {
    setGuests(prev => prev.map((g, i) => i === idx ? { ...g, [field]: value } : g));
  };
  const removeGuest = (idx) => {
    setGuests(prev => prev.filter((_, i) => i !== idx));
  };

  // Schedule helpers
  const addScheduleItem = () => {
    setSchedule(prev => [...prev, { time: '', description: '' }]);
  };
  const updateScheduleItem = (idx, field, value) => {
    setSchedule(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };
  const removeScheduleItem = (idx) => {
    setSchedule(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedTypes.length === 0) {
      setError('Please select at least one event type.');
      return;
    }
    setLoading(true);
    setError('');

    const payload = {
      ...form,
      event_type: selectedTypes.join(','),
      start_date: new Date(form.start_date).toISOString(),
      end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
      registration_deadline: form.registration_deadline
        ? new Date(form.registration_deadline).toISOString() : null,
      registration_url: form.registration_url || null,
      contact_phone: form.contact_phone || null,
      submitted_by: user.id,
      status: isApprovedOrganizer ? 'approved' : 'pending',
      day_locations: isMultiDay && dayLocations.some(d => d.venue || d.date)
        ? dayLocations : null,
      guests: guests.length > 0 && guests.some(g => g.name)
        ? guests.filter(g => g.name) : null,
      schedule: schedule.length > 0 && schedule.some(s => s.time || s.description)
        ? schedule.filter(s => s.time || s.description) : null,
    };

    // Clean empty strings
    if (!payload.location_name) payload.location_name = null;
    if (!payload.location_address) payload.location_address = null;
    if (!payload.price_info) payload.price_info = null;

    const { error: err } = await supabase.from('events').insert(payload);

    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{
        textAlign: 'center', padding: '60px 20px',
        animation: 'fadeUp 0.3s ease',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: '#0DAA8A0C', border: '2px solid #0DAA8A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: '1.5rem',
        }}>&#10003;</div>
        <p style={{ color: c.text, fontSize: '1rem', marginBottom: 8 }}>{t('submit.success')}</p>
        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: 16, padding: '10px 24px',
            background: `linear-gradient(135deg, ${c.accent}, ${c.gold})`,
            border: 'none', borderRadius: 10,
            color: '#fff', fontWeight: 600,
            fontSize: '0.9rem', cursor: 'pointer',
          }}
        >{t('nav.home')}</button>
      </div>
    );
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    background: c.bg, border: `1px solid ${c.border}`,
    borderRadius: 10, color: c.text,
    fontSize: '0.88rem', outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block', marginBottom: 6,
    fontSize: '0.78rem', color: c.muted, fontWeight: 500,
  };

  const fieldStyle = { marginBottom: 18 };

  const sectionStyle = {
    marginBottom: 24, padding: '16px',
    background: c.card, border: `1px solid ${c.border}`,
    borderRadius: 12,
  };

  const sectionTitle = {
    fontSize: '0.82rem', fontWeight: 600, color: c.text,
    marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8,
  };

  const smallBtn = {
    padding: '6px 14px', fontSize: '0.78rem',
    background: c.bg, border: `1px solid ${c.border}`,
    borderRadius: 8, color: c.accent, cursor: 'pointer',
    fontWeight: 500,
  };

  const removeBtn = {
    padding: '4px 10px', fontSize: '0.72rem',
    background: 'transparent', border: `1px solid ${c.border}`,
    borderRadius: 6, color: c.muted, cursor: 'pointer',
  };

  return (
    <div style={{ animation: 'fadeUp 0.3s ease' }}>
      <h1 style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '1.8rem', letterSpacing: '0.04em',
        color: c.text, marginBottom: 4,
      }}>{t('submit.title')}</h1>
      <p style={{
        fontSize: '0.85rem', color: c.muted, marginBottom: 28,
      }}>{t('submit.subtitle')}</p>

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div style={fieldStyle}>
          <label style={labelStyle}>{t('submit.eventTitle')} *</label>
          <input type="text" required value={form.title} onChange={set('title')} style={inputStyle} />
        </div>

        {/* Description */}
        <div style={fieldStyle}>
          <label style={labelStyle}>{t('submit.description')}</label>
          <textarea
            value={form.description} onChange={set('description')}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {/* Event Type — multi-select checkboxes */}
        <div style={fieldStyle}>
          <label style={labelStyle}>{t('submit.eventType')} *</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EVENT_TYPES.map(type => (
              <label
                key={type}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 8,
                  background: selectedTypes.includes(type) ? `${c.accent}12` : c.bg,
                  border: `1px solid ${selectedTypes.includes(type) ? c.accent : c.border}`,
                  cursor: 'pointer', fontSize: '0.85rem', color: c.text,
                  transition: 'all 0.15s',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => toggleType(type)}
                  style={{ accentColor: c.accent, width: 16, height: 16 }}
                />
                {t(`event.${type}`)}
              </label>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, ...fieldStyle }}>
          <div>
            <label style={labelStyle}>{t('submit.startDate')} *</label>
            <input type="datetime-local" required value={form.start_date} onChange={set('start_date')} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>{t('submit.endDate')}</label>
            <input type="datetime-local" value={form.end_date} onChange={set('end_date')} style={inputStyle} />
          </div>
        </div>

        {/* Multi-day toggle */}
        <div style={{ ...fieldStyle, display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="checkbox" checked={isMultiDay} onChange={() => setIsMultiDay(!isMultiDay)}
            style={{ width: 18, height: 18, accentColor: c.accent }}
          />
          <label style={{ fontSize: '0.88rem', color: c.text }}>{t('submit.multiDay')}</label>
        </div>

        {/* Single location (when NOT multi-day) */}
        {!isMultiDay && (
          <>
            <div style={fieldStyle}>
              <label style={labelStyle}>{t('submit.locationName')}</label>
              <input type="text" value={form.location_name} onChange={set('location_name')} style={inputStyle} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>{t('submit.address')}</label>
              <input type="text" value={form.location_address} onChange={set('location_address')} style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, ...fieldStyle }}>
              <div>
                <label style={labelStyle}>{t('submit.city')}</label>
                <input type="text" value={form.city} onChange={set('city')} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{t('submit.country')}</label>
                <input type="text" value={form.country} onChange={set('country')} style={inputStyle} />
              </div>
            </div>
          </>
        )}

        {/* Multi-day locations */}
        {isMultiDay && (
          <div style={sectionStyle}>
            <div style={sectionTitle}>{t('event.dayLocations')}</div>
            {dayLocations.map((day, idx) => (
              <div key={idx} style={{
                padding: 12, background: c.bg, borderRadius: 10,
                marginBottom: 10, border: `1px solid ${c.border}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: c.muted }}>
                    Day {idx + 1}
                  </span>
                  {dayLocations.length > 1 && (
                    <button type="button" onClick={() => removeDayLocation(idx)} style={removeBtn}>
                      {t('submit.removeDay')}
                    </button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <input
                    type="date" value={day.date}
                    onChange={(e) => updateDayLocation(idx, 'date', e.target.value)}
                    style={inputStyle} placeholder={t('submit.dayDate')}
                  />
                  <input
                    type="text" value={day.venue}
                    onChange={(e) => updateDayLocation(idx, 'venue', e.target.value)}
                    style={inputStyle} placeholder={t('submit.dayVenue')}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
                  <input
                    type="text" value={day.address}
                    onChange={(e) => updateDayLocation(idx, 'address', e.target.value)}
                    style={inputStyle} placeholder={t('submit.dayAddress')}
                  />
                  <input
                    type="text" value={day.city}
                    onChange={(e) => updateDayLocation(idx, 'city', e.target.value)}
                    style={inputStyle} placeholder={t('submit.dayCity')}
                  />
                </div>
              </div>
            ))}
            <button type="button" onClick={addDayLocation} style={smallBtn}>
              + {t('submit.addDay')}
            </button>
            {/* Country still needed for multi-day */}
            <div style={{ marginTop: 12 }}>
              <label style={labelStyle}>{t('submit.country')}</label>
              <input type="text" value={form.country} onChange={set('country')} style={inputStyle} />
            </div>
          </div>
        )}

        {/* Organizer */}
        <div style={fieldStyle}>
          <label style={labelStyle}>{t('submit.organizerName')}</label>
          <input type="text" value={form.organizer_name} onChange={set('organizer_name')} style={inputStyle} />
        </div>

        {/* Contact: email + url + phone */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, ...fieldStyle }}>
          <div>
            <label style={labelStyle}>{t('submit.contactEmail')}</label>
            <input type="email" value={form.contact_email} onChange={set('contact_email')} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>{t('submit.contactUrl')}</label>
            <input type="url" value={form.contact_url} onChange={set('contact_url')} style={inputStyle} />
          </div>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>{t('submit.contactPhone')}</label>
          <input type="tel" value={form.contact_phone} onChange={set('contact_phone')} style={inputStyle} placeholder="+33 6 12 34 56 78" />
        </div>

        {/* Free / price */}
        <div style={{ ...fieldStyle, display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="checkbox" checked={form.is_free} onChange={set('is_free')}
            style={{ width: 18, height: 18, accentColor: c.accent }}
          />
          <label style={{ fontSize: '0.88rem', color: c.text }}>{t('submit.isFree')}</label>
        </div>

        {!form.is_free && (
          <div style={fieldStyle}>
            <label style={labelStyle}>{t('submit.priceInfo')}</label>
            <textarea
              value={form.price_info} onChange={set('price_info')}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
        )}

        {/* Registration deadline + link */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, ...fieldStyle }}>
          <div>
            <label style={labelStyle}>{t('submit.regDeadline')}</label>
            <input type="datetime-local" value={form.registration_deadline} onChange={set('registration_deadline')} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>{t('submit.regUrl')}</label>
            <input type="url" value={form.registration_url} onChange={set('registration_url')} style={inputStyle} />
          </div>
        </div>

        {/* Featured Teachers / Mestres */}
        <div style={sectionStyle}>
          <div style={sectionTitle}>{t('submit.guests')}</div>
          {guests.map((guest, idx) => (
            <div key={idx} style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8,
              marginBottom: 8, alignItems: 'end',
            }}>
              <div>
                <label style={{ ...labelStyle, fontSize: '0.72rem' }}>{t('submit.guestName')} *</label>
                <input
                  type="text" value={guest.name}
                  onChange={(e) => updateGuest(idx, 'name', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '0.72rem' }}>{t('submit.guestTitle')}</label>
                <input
                  type="text" value={guest.title}
                  onChange={(e) => updateGuest(idx, 'title', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '0.72rem' }}>{t('submit.guestGroup')}</label>
                <input
                  type="text" value={guest.group}
                  onChange={(e) => updateGuest(idx, 'group', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <button type="button" onClick={() => removeGuest(idx)} style={{ ...removeBtn, marginBottom: 2 }}>
                &times;
              </button>
            </div>
          ))}
          <button type="button" onClick={addGuest} style={smallBtn}>
            + {t('submit.addGuest')}
          </button>
        </div>

        {/* Event Schedule / Program */}
        <div style={sectionStyle}>
          <div style={sectionTitle}>{t('submit.schedule')}</div>
          {schedule.map((item, idx) => (
            <div key={idx} style={{
              display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: 8,
              marginBottom: 8, alignItems: 'end',
            }}>
              <div>
                <label style={{ ...labelStyle, fontSize: '0.72rem' }}>{t('submit.scheduleTime')}</label>
                <input
                  type="text" value={item.time}
                  onChange={(e) => updateScheduleItem(idx, 'time', e.target.value)}
                  style={inputStyle} placeholder="10:00"
                />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '0.72rem' }}>{t('submit.scheduleDesc')}</label>
                <input
                  type="text" value={item.description}
                  onChange={(e) => updateScheduleItem(idx, 'description', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <button type="button" onClick={() => removeScheduleItem(idx)} style={{ ...removeBtn, marginBottom: 2 }}>
                &times;
              </button>
            </div>
          ))}
          <button type="button" onClick={addScheduleItem} style={smallBtn}>
            + {t('submit.addSchedule')}
          </button>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: 8,
            background: `${c.accent}0A`, border: `1px solid ${c.accent}22`,
            color: c.accent, fontSize: '0.82rem', marginBottom: 18,
          }}>{error}</div>
        )}

        <button
          type="submit" disabled={loading}
          style={{
            width: '100%', padding: '16px',
            background: `linear-gradient(135deg, ${c.accent}, ${c.gold})`,
            border: 'none', borderRadius: 12,
            color: '#fff', fontWeight: 700, fontSize: '1rem',
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.7 : 1,
            boxShadow: `0 4px 20px rgba(232,101,43,0.2)`,
          }}
        >
          {loading ? t('common.loading') : t('submit.submitBtn')}
        </button>
      </form>
    </div>
  );
}
