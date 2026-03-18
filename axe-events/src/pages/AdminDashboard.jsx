import { useState, useEffect } from 'react';
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

const STATUS_COLORS = {
  pending: '#D4A843',
  approved: '#0DAA8A',
  rejected: '#E8652B',
  featured: '#8B5FA8',
};

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState('queue');
  const [pendingEvents, setPendingEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [orgRequests, setOrgRequests] = useState([]);
  const [claimRequests, setClaimRequests] = useState([]);
  const [stats, setStats] = useState({ total: 0, rsvps: 0, thisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);

    const { data: pending } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    setPendingEvents(pending || []);

    const { data: all } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    setAllEvents(all || []);

    const { data: orgReqs } = await supabase
      .from('profiles')
      .select('*')
      .eq('organizer_status', 'pending')
      .order('created_at', { ascending: false });
    setOrgRequests(orgReqs || []);

    const { data: claims } = await supabase
      .from('events')
      .select('*, claimer:profiles!claimed_by(name, capoeira_group)')
      .eq('claim_status', 'pending')
      .order('created_at', { ascending: false });
    setClaimRequests(claims || []);

    const { count: totalEvents } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .in('status', ['approved', 'featured']);

    const { count: totalRsvps } = await supabase
      .from('rsvps')
      .select('*', { count: 'exact', head: true });

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const { count: thisMonth } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthStart.toISOString());

    setStats({
      total: totalEvents || 0,
      rsvps: totalRsvps || 0,
      thisMonth: thisMonth || 0,
    });
    setLoading(false);
  };

  const updateStatus = async (eventId, newStatus) => {
    await supabase.from('events').update({ status: newStatus }).eq('id', eventId);
    fetchData();
  };

  const deleteEvent = async (eventId) => {
    await supabase.from('events').delete().eq('id', eventId);
    fetchData();
  };

  const handleClaim = async (eventId, approve) => {
    if (approve) {
      const claim = claimRequests.find(c => c.id === eventId);
      await supabase.from('events').update({
        claim_status: 'approved',
        submitted_by: claim.claimed_by,
        is_organizer: true,
        shared_by_name: null,
        claimed_by: null,
      }).eq('id', eventId);
    } else {
      await supabase.from('events').update({ claim_status: 'rejected' }).eq('id', eventId);
    }
    fetchData();
  };

  const updateOrganizerStatus = async (profileId, status) => {
    await supabase.from('profiles').update({ organizer_status: status }).eq('id', profileId);
    fetchData();
  };

  if (!isAdmin) {
    return (
      <div style={{
        textAlign: 'center', padding: '60px 20px',
        color: c.muted, fontSize: '0.9rem',
      }}>
        {t('admin.unauthorized')}
      </div>
    );
  }

  const tabStyle = (active) => ({
    flex: '1 1 auto', padding: '8px 6px',
    background: active ? `${c.accent}0C` : 'transparent',
    border: 'none',
    borderBottom: active ? `2px solid ${c.accent}` : `2px solid transparent`,
    color: active ? c.text : c.muted,
    fontWeight: 600, fontSize: '0.72rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    minWidth: 0,
  });

  const actionBtn = (color) => ({
    padding: '6px 14px',
    background: `${color}0C`,
    border: `1px solid ${color}22`,
    borderRadius: 6,
    color, fontWeight: 600,
    fontSize: '0.72rem', cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  });

  const filteredAll = allEvents.filter(ev => {
    if (!search) return true;
    const q = search.toLowerCase();
    return ev.title.toLowerCase().includes(q) ||
           ev.city?.toLowerCase().includes(q) ||
           ev.status.includes(q);
  });

  return (
    <div style={{ animation: 'fadeUp 0.3s ease' }}>
      <h1 style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '1.8rem', letterSpacing: '0.04em',
        color: c.text, marginBottom: 20,
      }}>{t('admin.title')}</h1>

      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${c.border}`,
        marginBottom: 20,
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
      }}>
        <button onClick={() => setTab('queue')} style={tabStyle(tab === 'queue')}>
          {t('admin.queue')} {pendingEvents.length > 0 && `(${pendingEvents.length})`}
        </button>
        <button onClick={() => setTab('all')} style={tabStyle(tab === 'all')}>
          {t('admin.allEvents')}
        </button>
        <button onClick={() => setTab('organizers')} style={tabStyle(tab === 'organizers')}>
          {t('admin.organizerRequests')} {(orgRequests.length + claimRequests.length) > 0 && `(${orgRequests.length + claimRequests.length})`}
        </button>
        <button onClick={() => setTab('stats')} style={tabStyle(tab === 'stats')}>
          {t('admin.stats')}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: c.muted }}>{t('common.loading')}</div>
      ) : tab === 'queue' ? (
        pendingEvents.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '40px 20px',
            color: c.muted, background: c.card,
            borderRadius: 14, border: `1px solid ${c.border}`,
          }}>{t('admin.noQueue')}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingEvents.map(ev => (
              <div key={ev.id} style={{
                background: c.card, border: `1px solid ${c.border}`,
                borderRadius: 14, padding: 18,
              }}>
                <h3 style={{
                  fontSize: '1rem', fontWeight: 600, color: c.text,
                  margin: '0 0 4px',
                }}>{ev.title}</h3>
                <div style={{ fontSize: '0.78rem', color: c.muted, marginBottom: 4 }}>
                  {ev.event_type} &middot; {new Date(ev.start_date).toLocaleDateString()}
                  {ev.city && ` &middot; ${ev.city}`}
                </div>
                {ev.description && (
                  <div style={{
                    fontSize: '0.82rem', color: c.muted, marginBottom: 12,
                    lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>{ev.description}</div>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => updateStatus(ev.id, 'approved')} style={actionBtn('#0DAA8A')}>
                    {t('admin.approve')}
                  </button>
                  <button onClick={() => updateStatus(ev.id, 'featured')} style={actionBtn('#8B5FA8')}>
                    {t('admin.feature')}
                  </button>
                  <button onClick={() => updateStatus(ev.id, 'rejected')} style={actionBtn('#E8652B')}>
                    {t('admin.reject')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : tab === 'all' ? (
        <div>
          <input
            type="text" placeholder={t('home.search')}
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px',
              background: c.bg, border: `1px solid ${c.border}`,
              borderRadius: 10, color: c.text,
              fontSize: '0.85rem', marginBottom: 16, outline: 'none',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredAll.map(ev => {
              const statusColor = STATUS_COLORS[ev.status] || c.muted;
              return (
                <div key={ev.id} style={{
                  background: c.card, border: `1px solid ${c.border}`,
                  borderRadius: 12, padding: '12px 14px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.85rem', fontWeight: 600, color: c.text,
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>{ev.title}</div>
                      <div style={{ fontSize: '0.72rem', color: c.muted }}>
                        {ev.event_type} &middot; {new Date(ev.start_date).toLocaleDateString()}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700,
                      color: statusColor, textTransform: 'uppercase',
                      background: `${statusColor}0C`,
                      padding: '3px 8px', borderRadius: 4,
                      flexShrink: 0,
                    }}>{ev.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {ev.status !== 'approved' && (
                      <button onClick={() => updateStatus(ev.id, 'approved')} style={actionBtn('#0DAA8A')}>
                        {t('admin.approve')}
                      </button>
                    )}
                    {ev.status === 'featured' ? (
                      <button onClick={() => updateStatus(ev.id, 'approved')} style={actionBtn('#8B5FA8')}>
                        {t('admin.unfeature')}
                      </button>
                    ) : ev.status === 'approved' && (
                      <button onClick={() => updateStatus(ev.id, 'featured')} style={actionBtn('#8B5FA8')}>
                        {t('admin.feature')}
                      </button>
                    )}
                    <button onClick={() => deleteEvent(ev.id)} style={actionBtn('#E8652B')}>
                      {t('admin.delete')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : tab === 'organizers' ? (
        <div>
          {/* Organizer Requests */}
          {orgRequests.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: c.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                {t('admin.organizerRequests')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {orgRequests.map(p => (
                  <div key={p.id} style={{
                    background: c.card, border: `1px solid ${c.border}`,
                    borderRadius: 12, padding: '12px 14px',
                  }}>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: c.text }}>
                        {p.name || p.apelido || 'Unknown'}
                      </div>
                      {p.apelido && p.name && (
                        <div style={{ fontSize: '0.72rem', color: c.muted }}>Apelido: {p.apelido}</div>
                      )}
                      {p.capoeira_group && (
                        <div style={{ fontSize: '0.72rem', color: c.muted }}>{p.capoeira_group}</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button onClick={() => updateOrganizerStatus(p.id, 'approved')} style={actionBtn('#0DAA8A')}>
                        {t('admin.approveOrganizer')}
                      </button>
                      <button onClick={() => updateOrganizerStatus(p.id, 'rejected')} style={actionBtn('#E8652B')}>
                        {t('admin.rejectOrganizer')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ownership Claims */}
          {claimRequests.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: c.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                {t('admin.claimRequests')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {claimRequests.map(ev => (
                  <div key={ev.id} style={{
                    background: c.card, border: `1px solid ${c.border}`,
                    borderRadius: 12, padding: '12px 14px',
                  }}>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: c.text }}>{ev.title}</div>
                      <div style={{ fontSize: '0.72rem', color: c.muted }}>
                        {t('event.claimEvent')}: <strong>{ev.claimer?.name || 'Unknown'}</strong>
                        {ev.claimer?.capoeira_group && ` (${ev.claimer.capoeira_group})`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button onClick={() => handleClaim(ev.id, true)} style={actionBtn('#0DAA8A')}>
                        {t('admin.approveClaim')}
                      </button>
                      <button onClick={() => handleClaim(ev.id, false)} style={actionBtn('#E8652B')}>
                        {t('admin.rejectClaim')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {orgRequests.length === 0 && claimRequests.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '40px 20px',
              color: c.muted, background: c.card,
              borderRadius: 14, border: `1px solid ${c.border}`,
            }}>{t('admin.noOrgRequests')}</div>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
        }}>
          {[
            { label: t('admin.totalEvents'), value: stats.total, color: '#0DAA8A' },
            { label: t('admin.totalRsvps'), value: stats.rsvps, color: c.accent },
            { label: t('admin.thisMonth'), value: stats.thisMonth, color: c.gold },
          ].map((s, i) => (
            <div key={i} style={{
              background: c.card, border: `1px solid ${c.border}`,
              borderRadius: 14, padding: '24px 20px',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '2rem', fontWeight: 700,
                fontFamily: "'Bebas Neue', sans-serif",
                color: s.color, letterSpacing: '0.02em',
              }}>{s.value}</div>
              <div style={{
                fontSize: '0.75rem', color: c.muted,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                marginTop: 4,
              }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
