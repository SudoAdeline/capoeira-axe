import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const EVENT_TYPES = ['roda', 'workshop', 'batizado', 'festival', 'other'];

export default function SubmitEvent() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    event_type: 'roda',
    start_date: '',
    end_date: '',
    location_name: '',
    location_address: '',
    city: '',
    country: '',
    organizer_name: '',
    contact_email: '',
    contact_url: '',
    is_free: true,
    price_info: '',
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: err } = await supabase.from('events').insert({
      ...form,
      start_date: new Date(form.start_date).toISOString(),
      end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
      submitted_by: user.id,
      status: 'pending',
    });

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
          background: '#0DAA8A22', border: '2px solid #0DAA8A',
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
  };

  const labelStyle = {
    display: 'block', marginBottom: 6,
    fontSize: '0.78rem', color: c.muted, fontWeight: 500,
  };

  const fieldStyle = { marginBottom: 18 };

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
        <div style={fieldStyle}>
          <label style={labelStyle}>{t('submit.eventTitle')} *</label>
          <input type="text" required value={form.title} onChange={set('title')} style={inputStyle} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>{t('submit.description')}</label>
          <textarea
            value={form.description} onChange={set('description')}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>{t('submit.eventType')} *</label>
          <select value={form.event_type} onChange={set('event_type')} style={inputStyle}>
            {EVENT_TYPES.map(type => (
              <option key={type} value={type}>{t(`event.${type}`)}</option>
            ))}
          </select>
        </div>

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

        <div style={fieldStyle}>
          <label style={labelStyle}>{t('submit.organizerName')}</label>
          <input type="text" value={form.organizer_name} onChange={set('organizer_name')} style={inputStyle} />
        </div>

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
            <input type="text" value={form.price_info} onChange={set('price_info')} style={inputStyle} />
          </div>
        )}

        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: 8,
            background: 'rgba(232,101,43,0.1)', border: `1px solid ${c.accent}44`,
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
            boxShadow: `0 4px 20px rgba(232,101,43,0.3)`,
          }}
        >
          {loading ? t('common.loading') : t('submit.submitBtn')}
        </button>
      </form>
    </div>
  );
}
