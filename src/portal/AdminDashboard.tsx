import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import logoSrc from '../components/logo.png';

interface Props { session: Session; onBack: () => void; }
type AdminTab = 'investors' | 'nav';

interface InvestorRecord {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  folio_number: string;
  commitment_cr: number;
  drawdown_cr: number;
  status: string;
  category: string;
  joined_date: string;
  created_at: string;
}

export default function AdminDashboard({ session, onBack }: Props) {
  const [tab, setTab] = useState<AdminTab>('investors');
  const [investors, setInvestors] = useState<InvestorRecord[]>([]);
  const [msg, setMsg] = useState('');

  useEffect(() => { loadInvestors(); }, []);

  async function loadInvestors() {
    const { data } = await supabase.from('investors').select('*').order('created_at', { ascending: false });
    setInvestors(data || []);
  }

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(''), 4000); }

  async function updateInvestor(id: string, updates: object) {
    const { error } = await supabase.from('investors').update(updates).eq('id', id);
    if (error) flash(`Error: ${error.message}`);
    else { flash('✓ Saved'); loadInvestors(); }
  }

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
            { label: 'Total Investors',  value: investors.length },
            { label: 'Active',           value: investors.filter(i => i.status === 'active').length },
            { label: 'Total Commitment', value: `₹${investors.reduce((s, i) => s + (i.commitment_cr || 0), 0).toFixed(1)} Cr` },
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
              {t === 'investors' ? 'Manage Investors' : 'Upload NAV'}
            </button>
          ))}
        </div>

        {msg && (
          <div style={{ marginBottom: '1.2rem', padding: '10px 18px', borderRadius: 10, background: msg.startsWith('✓') ? 'rgba(26,122,74,0.08)' : 'rgba(192,57,43,0.08)', color: msg.startsWith('✓') ? '#1a7a4a' : '#c0392b', fontSize: '0.82rem', fontFamily: "'DM Mono',monospace" }}>
            {msg}
          </div>
        )}

        {/* INVESTORS TAB */}
        {tab === 'investors' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Add investor */}
            <AddInvestorForm onSaved={() => { loadInvestors(); flash('✓ Investor added successfully'); }} />

            {/* List */}
            <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '1.2rem 1.8rem', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.15rem', fontWeight: 600 }}>All Investors</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.35)' }}>{investors.length} registered</div>
              </div>
              {investors.length === 0
                ? <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(0,0,0,0.28)', fontSize: '0.85rem' }}>No investors yet. Add one above.</div>
                : investors.map(inv => (
                  <InvestorRow key={inv.id} inv={inv} onUpdate={(upd) => updateInvestor(inv.id, upd)} />
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

// ── Add Investor Form ──────────────────────────────────────────────────────────
// Creates investor record only — auth user must be created separately via Supabase dashboard
// OR via magic link / password reset email
function AddInvestorForm({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    full_name: '', email: '', folio_number: '',
    commitment_cr: '', drawdown_cr: '', category: 'HNI',
    joined_date: '', status: 'active',
  });

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function submit() {
    if (!form.full_name || !form.email) { setMsg('Name and email are required'); return; }
    setLoading(true); setMsg('');

    try {
      // Step 1: Send magic link / password reset to investor so they can set their password
      const { error: inviteErr } = await supabase.auth.resetPasswordForEmail(form.email, {
        redirectTo: `${window.location.origin}#portal`,
      });
      if (inviteErr) throw new Error(`Could not send invite: ${inviteErr.message}`);

      // Step 2: Insert investor record (user_id will be linked when they log in first time)
      const { error: dbErr } = await supabase.from('investors').insert([{
        user_id:       null, // will be updated when investor first logs in
        full_name:     form.full_name,
        email:         form.email,
        folio_number:  form.folio_number || null,
        commitment_cr: form.commitment_cr ? parseFloat(form.commitment_cr) : null,
        drawdown_cr:   form.drawdown_cr ? parseFloat(form.drawdown_cr) : null,
        category:      form.category,
        joined_date:   form.joined_date || null,
        status:        form.status,
      }]);
      if (dbErr) throw new Error(dbErr.message);

      setMsg(`✓ Invite sent to ${form.email} — they can set their password via the link`);
      setForm({ full_name:'', email:'', folio_number:'', commitment_cr:'', drawdown_cr:'', category:'HNI', joined_date:'', status:'active' });
      onSaved();
      setTimeout(() => { setMsg(''); setOpen(false); }, 4000);
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
    }
    setLoading(false);
  }

  return (
    <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 16, overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)}
        style={{ width: '100%', padding: '1.2rem 1.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.15rem', fontWeight: 600, color: '#0D0D0D' }}>+ Add New Investor</div>
        <span style={{ fontSize: '0.72rem', color: 'rgba(0,0,0,0.35)', fontFamily: "'DM Mono',monospace" }}>{open ? 'Close ↑' : 'Expand ↓'}</span>
      </button>

      {open && (
        <div style={{ padding: '0 1.8rem 1.8rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '1rem 0 1.2rem', fontSize: '0.82rem', color: 'rgba(0,0,0,0.45)', lineHeight: 1.6 }}>
            Fill in the investor details and click <strong>Add Investor</strong>. A password-setup email will be sent to them automatically. They click the link, set their password, and can log in.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <AF label="Full Name *"        value={form.full_name}     onChange={v => set('full_name', v)}     type="text"     placeholder="Investor full name" />
            <AF label="Email *"             value={form.email}         onChange={v => set('email', v)}         type="email"    placeholder="investor@email.com" />
            <AF label="Folio Number"        value={form.folio_number}  onChange={v => set('folio_number', v)}  type="text"     placeholder="SC-001" />
            <AF label="Commitment (₹ Cr)"  value={form.commitment_cr} onChange={v => set('commitment_cr', v)} type="number"   placeholder="e.g. 2" />
            <AF label="Amount Drawn (₹ Cr)" value={form.drawdown_cr}  onChange={v => set('drawdown_cr', v)}   type="number"   placeholder="e.g. 1.5" />
            <AF label="Joined Date"         value={form.joined_date}   onChange={v => set('joined_date', v)}   type="date"     placeholder="" />
            <div>
              <div style={lbl}>Category</div>
              <select value={form.category} onChange={e => set('category', e.target.value)} style={inp}>
                {['HNI', 'Family Office', 'Institutional'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          {msg && <div style={{ margin: '1rem 0 0', fontSize: '0.82rem', color: msg.startsWith('✓') ? '#1a7a4a' : '#c0392b', padding: '10px 14px', background: msg.startsWith('✓') ? 'rgba(26,122,74,0.06)' : 'rgba(192,57,43,0.06)', borderRadius: 8 }}>{msg}</div>}
          <button onClick={submit} disabled={loading}
            style={{ ...btn, marginTop: '1.2rem', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Sending Invite…' : 'Add Investor & Send Invite'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Investor Row ───────────────────────────────────────────────────────────────
function InvestorRow({ inv, onUpdate }: { inv: InvestorRecord; onUpdate: (upd: object) => void }) {
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

  async function sendPasswordReset() {
    const { error } = await supabase.auth.resetPasswordForEmail(inv.email, {
      redirectTo: `${window.location.origin}#portal`,
    });
    setPwMsg(error ? `Error: ${error.message}` : `✓ Password reset email sent to ${inv.email}`);
    setTimeout(() => setPwMsg(''), 4000);
  }

  const statusColor: Record<string, string> = { active: '#1a7a4a', exited: '#b8860b', suspended: '#c0392b' };

  return (
    <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
      {/* Row summary */}
      <div onClick={() => setEdit(!edit)} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1fr 1fr 1fr 70px', gap: 0, padding: '1rem 1.8rem', cursor: 'pointer', alignItems: 'center' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.015)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{inv.full_name}</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.38)', marginTop: 2 }}>{inv.email}</div>
        </div>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.75rem', color: 'rgba(0,0,0,0.45)' }}>{inv.folio_number || '—'}</div>
        <div style={{ fontSize: '0.82rem' }}>{inv.commitment_cr ? `₹${inv.commitment_cr} Cr` : '—'}</div>
        <div style={{ fontSize: '0.82rem' }}>{inv.category}</div>
        <div>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.58rem', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 100, background: `${statusColor[inv.status] || '#888'}18`, color: statusColor[inv.status] || '#888' }}>
            {inv.status}
          </span>
        </div>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.6rem', color: 'rgba(0,0,0,0.3)', textAlign: 'right' }}>{edit ? '↑' : '↓'}</div>
      </div>

      {/* Edit panel */}
      {edit && (
        <div style={{ padding: '1.5rem 1.8rem 2rem', borderTop: '1px solid rgba(0,0,0,0.04)', background: 'rgba(0,0,0,0.012)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.2rem' }}>
            <AF label="Full Name"          value={form.full_name}     onChange={v => set('full_name', v)}     type="text"   />
            <AF label="Folio Number"       value={form.folio_number}  onChange={v => set('folio_number', v)}  type="text"   />
            <AF label="Commitment (₹ Cr)" value={form.commitment_cr} onChange={v => set('commitment_cr', v)} type="number" />
            <AF label="Drawn (₹ Cr)"      value={form.drawdown_cr}   onChange={v => set('drawdown_cr', v)}   type="number" />
            <AF label="Joined Date"        value={form.joined_date}   onChange={v => set('joined_date', v)}   type="date"   />
            <div>
              <div style={lbl}>Status</div>
              <select value={form.status} onChange={e => set('status', e.target.value)} style={inp}>
                {['active', 'exited', 'suspended'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <button onClick={() => onUpdate({
            full_name:     form.full_name,
            folio_number:  form.folio_number || null,
            commitment_cr: form.commitment_cr ? parseFloat(form.commitment_cr) : null,
            drawdown_cr:   form.drawdown_cr ? parseFloat(form.drawdown_cr) : null,
            status:        form.status,
            category:      form.category,
            joined_date:   form.joined_date || null,
          })} style={btn}>Save Changes</button>

          {/* Password reset */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.38)', marginBottom: '0.8rem' }}>Password Reset</div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(0,0,0,0.45)', marginBottom: '0.8rem' }}>Send a password reset email to {inv.email}</div>
            <button onClick={sendPasswordReset} style={{ ...btn, background: 'rgba(0,0,0,0.06)', color: '#0D0D0D' }}>Send Reset Email</button>
            {pwMsg && <div style={{ marginTop: '0.6rem', fontSize: '0.78rem', color: pwMsg.startsWith('✓') ? '#1a7a4a' : '#c0392b' }}>{pwMsg}</div>}
          </div>
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

function AF({ label, value, onChange, type, placeholder }: { label: string; value: string; onChange: (v: string) => void; type: string; placeholder?: string }) {
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

// Needed for type annotations
interface InvestorRecord {
  id: string; user_id: string; full_name: string; email: string;
  folio_number: string; commitment_cr: number; drawdown_cr: number;
  status: string; category: string; joined_date: string; created_at: string;
}
