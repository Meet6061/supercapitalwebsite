import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import logoSrc from '../components/logo.png';

interface Props { session: Session; onBack: () => void; }
type AdminTab = 'investors' | 'nav';

interface InvestorRecord {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  folio_number: string | null;
  commitment_cr: number | null;
  drawdown_cr: number | null;
  status: string;
  category: string;
  joined_date: string | null;
  created_at: string;
}

export default function AdminDashboard({ session, onBack }: Props) {
  const [tab, setTab]           = useState<AdminTab>('investors');
  const [investors, setInvestors] = useState<InvestorRecord[]>([]);
  const [msg, setMsg]           = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const { data, error } = await supabase
      .from('investors')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('Load error:', error);
    setInvestors(data || []);
  }

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(''), 4000); }

  async function updateInvestor(id: string, updates: object) {
    const { error } = await supabase.from('investors').update(updates).eq('id', id);
    error ? flash(`Error: ${error.message}`) : flash('✓ Saved successfully');
    load();
  }

  async function deleteInvestor(id: string, email: string) {
    if (!confirm(`Remove ${email} from investors? Their auth account will remain.`)) return;
    const { error } = await supabase.from('investors').delete().eq('id', id);
    error ? flash(`Error: ${error.message}`) : flash('✓ Removed');
    load();
  }

  const totalCommitment = investors.reduce((s, i) => s + (i.commitment_cr || 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: '#F2F0EB', fontFamily: "'Bricolage Grotesque',sans-serif" }}>

      {/* Header */}
      <header style={{ background: 'rgba(242,240,235,0.95)', backdropFilter: 'blur(18px)', borderBottom: '1px solid rgba(0,0,0,0.09)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 5vw', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <img src={logoSrc} alt="Super Capital" style={{ height: 44, mixBlendMode: 'multiply' }} />
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(1,41,86,0.6)', background: 'rgba(1,41,86,0.08)', padding: '4px 12px', borderRadius: 100 }}>Admin</span>
            <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Mono',monospace", fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)' }}>← Site</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'rgba(0,0,0,0.4)' }}>{session.user.email}</span>
            <button onClick={() => { supabase.auth.signOut(); onBack(); }}
              style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'none', border: '1px solid rgba(0,0,0,0.18)', borderRadius: 100, padding: '6px 16px', cursor: 'pointer', color: 'rgba(0,0,0,0.45)' }}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 5vw' }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: '2.5rem' }}>
          {[
            { label: 'Total Investors',   value: investors.length },
            { label: 'Active',            value: investors.filter(i => i.status === 'active').length },
            { label: 'Total Commitment',  value: `₹${totalCommitment.toFixed(1)} Cr` },
          ].map(k => (
            <div key={k.label} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 14, padding: '1.3rem 1.5rem' }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.55rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)', marginBottom: '0.5rem' }}>{k.label}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.9rem', fontWeight: 600, color: '#012956', lineHeight: 1 }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: '2rem', background: 'rgba(0,0,0,0.04)', borderRadius: 100, padding: 4, width: 'fit-content' }}>
          {(['investors', 'nav'] as AdminTab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '8px 20px', borderRadius: 100, border: 'none', cursor: 'pointer', background: tab === t ? '#fff' : 'transparent', color: tab === t ? '#012956' : 'rgba(0,0,0,0.4)', boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.2s' }}>
              {t === 'investors' ? 'Investors' : 'Upload NAV'}
            </button>
          ))}
        </div>

        {msg && (
          <div style={{ marginBottom: '1.2rem', padding: '10px 18px', borderRadius: 10, background: msg.startsWith('✓') ? 'rgba(26,122,74,0.08)' : 'rgba(192,57,43,0.08)', color: msg.startsWith('✓') ? '#1a7a4a' : '#c0392b', fontSize: '0.82rem' }}>
            {msg}
          </div>
        )}

        {/* INVESTORS TAB */}
        {tab === 'investors' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* How to add notice */}
            <div style={{ background: 'rgba(1,41,86,0.05)', border: '1px solid rgba(1,41,86,0.12)', borderRadius: 14, padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ fontSize: '1.2rem', marginTop: 2 }}>ℹ️</div>
              <div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(1,41,86,0.7)', marginBottom: '0.4rem' }}>How to add a new investor</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(0,0,0,0.55)', lineHeight: 1.7 }}>
                  Go to <strong>Supabase Dashboard → Authentication → Users → Invite User</strong> and enter their email. They will receive a setup link. Their account will automatically appear here once created. Then click their row below to fill in investment details.
                </div>
              </div>
            </div>

            {/* Investor list */}
            <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '1.2rem 1.8rem', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.15rem', fontWeight: 600 }}>All Investors</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.35)' }}>{investors.length} registered</div>
                  <button onClick={load} style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'none', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 100, padding: '5px 12px', cursor: 'pointer', color: 'rgba(0,0,0,0.4)' }}>↻ Refresh</button>
                </div>
              </div>

              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.2fr 1fr 1fr 1fr 80px', gap: 0, padding: '0.7rem 1.8rem', background: 'rgba(0,0,0,0.02)' }}>
                {['Investor', 'Folio', 'Commitment', 'Category', 'Status', ''].map(h => (
                  <div key={h} style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.55rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.38)' }}>{h}</div>
                ))}
              </div>

              {investors.length === 0
                ? <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(0,0,0,0.28)', fontSize: '0.85rem' }}>
                    No investors yet. Add users via Supabase Auth — they'll appear here automatically.
                  </div>
                : investors.map(inv => (
                  <InvestorRow
                    key={inv.id}
                    inv={inv}
                    onUpdate={upd => updateInvestor(inv.id, upd)}
                    onDelete={() => deleteInvestor(inv.id, inv.email)}
                  />
                ))
              }
            </div>
          </div>
        )}

        {/* NAV TAB */}
        {tab === 'nav' && <NavUploadPanel />}

      </main>
    </div>
  );
}

// ── Investor Row ───────────────────────────────────────────────────────────────
function InvestorRow({ inv, onUpdate, onDelete }: {
  inv: InvestorRecord;
  onUpdate: (upd: object) => void;
  onDelete: () => void;
}) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    full_name:     inv.full_name     || '',
    folio_number:  inv.folio_number  || '',
    commitment_cr: inv.commitment_cr?.toString() || '',
    drawdown_cr:   inv.drawdown_cr?.toString()   || '',
    status:        inv.status        || 'active',
    category:      inv.category      || 'HNI',
    joined_date:   inv.joined_date   || '',
  });
  const [pwMsg, setPwMsg] = useState('');

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function sendReset() {
    const { error } = await supabase.auth.resetPasswordForEmail(inv.email, {
      redirectTo: `${window.location.origin}#portal`,
    });
    setPwMsg(error ? `Error: ${error.message}` : `✓ Reset email sent to ${inv.email}`);
    setTimeout(() => setPwMsg(''), 4000);
  }

  const statusColor: Record<string, string> = { active: '#1a7a4a', exited: '#b8860b', suspended: '#c0392b' };

  return (
    <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
      {/* Collapsed row */}
      <div onClick={() => setEdit(!edit)}
        style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.2fr 1fr 1fr 1fr 80px', gap: 0, padding: '1rem 1.8rem', cursor: 'pointer', alignItems: 'center', transition: 'background 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.015)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{inv.full_name}</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.38)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
            {inv.email}
            {!inv.user_id && <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.55rem', background: 'rgba(184,134,11,0.1)', color: '#b8860b', padding: '1px 6px', borderRadius: 4 }}>no auth</span>}
          </div>
        </div>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.75rem', color: 'rgba(0,0,0,0.45)' }}>{inv.folio_number || '—'}</div>
        <div style={{ fontSize: '0.82rem' }}>{inv.commitment_cr ? `₹${inv.commitment_cr} Cr` : '—'}</div>
        <div style={{ fontSize: '0.78rem', color: 'rgba(0,0,0,0.5)' }}>{inv.category}</div>
        <div>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.58rem', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 100, background: `${statusColor[inv.status] || '#888'}18`, color: statusColor[inv.status] || '#888' }}>
            {inv.status}
          </span>
        </div>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.6rem', color: 'rgba(0,0,0,0.3)', textAlign: 'right' }}>{edit ? '↑ close' : '↓ edit'}</div>
      </div>

      {/* Edit panel */}
      {edit && (
        <div style={{ padding: '1.5rem 1.8rem 2rem', borderTop: '1px solid rgba(0,0,0,0.04)', background: 'rgba(0,0,0,0.012)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.2rem' }}>
            <AF label="Full Name"           value={form.full_name}     onChange={v => set('full_name', v)}     type="text"   />
            <AF label="Folio Number"        value={form.folio_number}  onChange={v => set('folio_number', v)}  type="text"   />
            <AF label="Commitment (₹ Cr)"  value={form.commitment_cr} onChange={v => set('commitment_cr', v)} type="number" />
            <AF label="Drawn (₹ Cr)"       value={form.drawdown_cr}   onChange={v => set('drawdown_cr', v)}   type="number" />
            <AF label="Joined Date"         value={form.joined_date}   onChange={v => set('joined_date', v)}   type="date"   />
            <div>
              <div style={lbl}>Status</div>
              <select value={form.status} onChange={e => set('status', e.target.value)} style={inp}>
                {['active', 'exited', 'suspended'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <div style={lbl}>Category</div>
              <select value={form.category} onChange={e => set('category', e.target.value)} style={inp}>
                {['HNI', 'Family Office', 'Institutional'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={() => onUpdate({
              full_name:     form.full_name,
              folio_number:  form.folio_number || null,
              commitment_cr: form.commitment_cr ? parseFloat(form.commitment_cr) : null,
              drawdown_cr:   form.drawdown_cr   ? parseFloat(form.drawdown_cr)   : null,
              status:        form.status,
              category:      form.category,
              joined_date:   form.joined_date   || null,
            })} style={btn}>Save Changes</button>

            <button onClick={sendReset} style={{ ...btn, background: 'transparent', color: '#012956', border: '1px solid rgba(1,41,86,0.3)' }}>
              Send Password Reset
            </button>

            <button onClick={onDelete} style={{ ...btn, background: 'transparent', color: '#c0392b', border: '1px solid rgba(192,57,43,0.3)', marginLeft: 'auto' }}>
              Remove
            </button>
          </div>

          {pwMsg && <div style={{ marginTop: '0.8rem', fontSize: '0.78rem', color: pwMsg.startsWith('✓') ? '#1a7a4a' : '#c0392b' }}>{pwMsg}</div>}
        </div>
      )}
    </div>
  );
}

// ── NAV Upload ─────────────────────────────────────────────────────────────────
function NavUploadPanel() {
  const [date, setDate] = useState('');
  const [nav, setNav]   = useState('');
  const [aum, setAum]   = useState('');
  const [msg, setMsg]   = useState('');

  async function submit() {
    if (!date || !nav) { setMsg('Date and NAV are required'); return; }
    const { error } = await supabase.from('nav_data').insert([{
      date, nav: parseFloat(nav), aum_cr: aum ? parseFloat(aum) : null, uploaded_by: 'admin',
    }]);
    setMsg(error ? `Error: ${error.message}` : '✓ NAV uploaded successfully');
    if (!error) { setDate(''); setNav(''); setAum(''); }
    setTimeout(() => setMsg(''), 3000);
  }

  return (
    <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 16, padding: '2rem', maxWidth: 420 }}>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.15rem', fontWeight: 600, marginBottom: '1.5rem' }}>Upload NAV</div>
      <AF label="Date *"      value={date} onChange={setDate} type="date"   />
      <AF label="NAV (₹) *"  value={nav}  onChange={setNav}  type="number" placeholder="e.g. 1024.50" />
      <AF label="AUM (₹ Cr)" value={aum}  onChange={setAum}  type="number" placeholder="Optional" />
      {msg && <div style={{ marginBottom: '1rem', fontSize: '0.82rem', color: msg.startsWith('✓') ? '#1a7a4a' : '#c0392b' }}>{msg}</div>}
      <button onClick={submit} style={btn}>Upload</button>
    </div>
  );
}

function AF({ label, value, onChange, type, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type: string; placeholder?: string;
}) {
  return (
    <div style={{ marginBottom: '0.9rem' }}>
      <div style={lbl}>{label}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inp} />
    </div>
  );
}

const lbl: React.CSSProperties = { fontFamily: "'DM Mono',monospace", fontSize: '0.58rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.38)', marginBottom: 5, display: 'block' };
const inp: React.CSSProperties = { width: '100%', background: '#F2F0EB', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 10, padding: '10px 14px', fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '0.88rem', color: '#0D0D0D', outline: 'none', boxSizing: 'border-box', appearance: 'none' };
const btn: React.CSSProperties = { fontFamily: "'DM Mono',monospace", fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '11px 24px', borderRadius: 100, background: '#012956', color: '#F2F0EB', border: 'none', cursor: 'pointer' };

interface InvestorRecord {
  id: string; user_id: string | null; full_name: string; email: string;
  folio_number: string | null; commitment_cr: number | null; drawdown_cr: number | null;
  status: string; category: string; joined_date: string | null; created_at: string;
}
