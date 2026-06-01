import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Lead } from '../lib/supabase';
import logoSrc from '../components/logo.png';

interface Props { session: Session; onBack: () => void; }

type AdminTab = 'leads' | 'users' | 'nav' | 'holdings';

interface PortalUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  user_metadata: { is_admin?: boolean; full_name?: string };
  investor?: {
    id: string;
    full_name: string;
    folio_number: string;
    commitment_cr: number;
    drawdown_cr: number;
    status: string;
    category: string;
    joined_date: string;
  };
}

export default function AdminDashboard({ session, onBack }: Props) {
  const [tab, setTab] = useState<AdminTab>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<PortalUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { loadLeads(); loadUsers(); }, []);

  async function loadLeads() {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    setLeads(data || []);
  }

  async function loadUsers() {
    // Fetch auth users via admin API + their investor records
    const { data: invData } = await supabase.from('investors').select('*');
    const investors = invData || [];

    // We can't call admin.listUsers from frontend — use investors table as source of truth
    // Show investors with their linked data
    setUsers(investors.map((inv: any) => ({
      id: inv.user_id || inv.id,
      email: inv.email,
      created_at: inv.created_at,
      last_sign_in_at: '',
      user_metadata: { full_name: inv.full_name },
      investor: inv,
    })));
  }

  async function updateLeadStatus(id: string, status: string) {
    await supabase.from('leads').update({ status }).eq('id', id);
    loadLeads();
  }

  async function updateInvestor(id: string, updates: object) {
    setLoading(true);
    const { error } = await supabase.from('investors').update(updates).eq('id', id);
    setMsg(error ? `Error: ${error.message}` : '✓ Saved');
    setLoading(false);
    loadUsers();
    setTimeout(() => setMsg(''), 3000);
  }

  const statusColor: Record<string, string> = {
    new: '#012956', contacted: '#b8860b', converted: '#1a7a4a', rejected: '#c0392b',
  };

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

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: '2.5rem' }}>
          {[
            { label: 'Total Leads',      value: leads.length },
            { label: 'New Leads',        value: leads.filter(l => l.status === 'new').length },
            { label: 'Converted',        value: leads.filter(l => l.status === 'converted').length },
            { label: 'Active Investors', value: users.filter(u => u.investor?.status === 'active').length },
          ].map(k => (
            <div key={k.label} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 14, padding: '1.3rem 1.5rem' }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.55rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)', marginBottom: '0.5rem' }}>{k.label}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2rem', fontWeight: 600, color: '#012956', lineHeight: 1 }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: '2rem', background: 'rgba(0,0,0,0.04)', borderRadius: 100, padding: 4, width: 'fit-content' }}>
          {(['leads', 'users', 'nav', 'holdings'] as AdminTab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '8px 18px', borderRadius: 100, border: 'none', cursor: 'pointer', background: tab === t ? '#fff' : 'transparent', color: tab === t ? '#012956' : 'rgba(0,0,0,0.4)', boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.2s' }}>
              {t === 'users' ? 'Investors' : t}
            </button>
          ))}
        </div>

        {msg && <div style={{ marginBottom: '1rem', padding: '10px 16px', borderRadius: 10, background: msg.startsWith('✓') ? 'rgba(26,122,74,0.08)' : 'rgba(192,57,43,0.08)', color: msg.startsWith('✓') ? '#1a7a4a' : '#c0392b', fontSize: '0.82rem', fontFamily: "'DM Mono',monospace" }}>{msg}</div>}

        {/* LEADS TAB */}
        {tab === 'leads' && (
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '1.4rem 1.8rem', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.2rem', fontWeight: 600 }}>Investor Inquiries</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.35)' }}>{leads.length} total</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                    {['Date', 'Name', 'Email', 'Mobile', 'Type', 'Allocation', 'Message', 'Status'].map(h => (
                      <th key={h} style={{ padding: '0.8rem 1rem', textAlign: 'left', fontFamily: "'DM Mono',monospace", fontSize: '0.55rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.38)', fontWeight: 400, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0
                    ? <tr><td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'rgba(0,0,0,0.28)', fontSize: '0.85rem' }}>No inquiries yet.</td></tr>
                    : leads.map(lead => (
                      <tr key={lead.id} style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                        <td style={{ padding: '0.9rem 1rem', fontSize: '0.75rem', color: 'rgba(0,0,0,0.38)', whiteSpace: 'nowrap' }}>
                          {lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td style={{ padding: '0.9rem 1rem', fontSize: '0.88rem', fontWeight: 500, whiteSpace: 'nowrap' }}>{lead.full_name}</td>
                        <td style={{ padding: '0.9rem 1rem', fontSize: '0.8rem', color: 'rgba(0,0,0,0.55)' }}>{lead.email}</td>
                        <td style={{ padding: '0.9rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{lead.mobile || '—'}</td>
                        <td style={{ padding: '0.9rem 1rem', fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)', whiteSpace: 'nowrap' }}>{lead.investor_type || '—'}</td>
                        <td style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{lead.allocation || '—'}</td>
                        <td style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', color: 'rgba(0,0,0,0.5)', maxWidth: 180 }}>{lead.message || '—'}</td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <select value={lead.status || 'new'}
                            onChange={e => updateLeadStatus(lead.id!, e.target.value)}
                            style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', border: `1px solid ${statusColor[lead.status || 'new']}44`, borderRadius: 8, padding: '4px 8px', background: `${statusColor[lead.status || 'new']}10`, color: statusColor[lead.status || 'new'], cursor: 'pointer' }}>
                            {['new', 'contacted', 'converted', 'rejected'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* INVESTORS / USER MANAGEMENT TAB */}
        {tab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Add New Investor */}
            <AddInvestorForm onSaved={() => { loadUsers(); setMsg('✓ Investor added'); setTimeout(() => setMsg(''), 3000); }} />

            {/* Investor list */}
            <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '1.4rem 1.8rem', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.2rem', fontWeight: 600 }}>Registered Investors</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.35)' }}>{users.length} investors</div>
              </div>
              {users.length === 0
                ? <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(0,0,0,0.28)', fontSize: '0.85rem' }}>No investors yet. Add one above.</div>
                : users.map(u => (
                  <InvestorRow key={u.id} user={u} loading={loading} onUpdate={(id, upd) => updateInvestor(id, upd)} />
                ))
              }
            </div>
          </div>
        )}

        {/* NAV UPLOAD */}
        {tab === 'nav' && <NavUploadPanel />}

        {/* HOLDINGS INFO */}
        {tab === 'holdings' && (
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 16, padding: '2rem', maxWidth: 600 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>Upload Holdings</div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
              Go to your Supabase dashboard and insert rows directly into the <code style={{ background: 'rgba(0,0,0,0.06)', padding: '2px 6px', borderRadius: 4 }}>holdings</code> table.<br /><br />
              <strong>Columns:</strong> as_of_date, stock_name, isin, sector, weight_pct, avg_cost, cmp, pnl_pct
            </div>
            <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer"
              style={{ display: 'inline-block', fontFamily: "'DM Mono',monospace", fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '12px 24px', borderRadius: 100, background: '#012956', color: '#F2F0EB', textDecoration: 'none' }}>
              Open Supabase Dashboard
            </a>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Add Investor Form ──────────────────────────────────────────────────────────
function AddInvestorForm({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', folio_number: '',
    commitment_cr: '', drawdown_cr: '', category: 'HNI',
    joined_date: '', status: 'active',
  });

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function submit() {
    if (!form.full_name || !form.email || !form.password) {
      setMsg('Name, email and password are required.'); return;
    }
    setLoading(true); setMsg('');
    try {
      // 1. Create auth user via Supabase admin signup
      //    (This uses anon key — works if email confirmations are OFF in Supabase Auth settings)
      const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
        email: form.email,
        password: form.password,
        email_confirm: true,
        user_metadata: { full_name: form.full_name, is_admin: false },
      });

      if (authErr) throw new Error(authErr.message);
      const userId = authData.user.id;

      // 2. Create investor record
      const { error: invErr } = await supabase.from('investors').insert([{
        user_id:       userId,
        full_name:     form.full_name,
        email:         form.email,
        folio_number:  form.folio_number || null,
        commitment_cr: form.commitment_cr ? parseFloat(form.commitment_cr) : null,
        drawdown_cr:   form.drawdown_cr ? parseFloat(form.drawdown_cr) : null,
        category:      form.category,
        joined_date:   form.joined_date || null,
        status:        form.status,
      }]);
      if (invErr) throw new Error(invErr.message);

      setMsg('✓ Investor created successfully');
      setForm({ full_name:'', email:'', password:'', folio_number:'', commitment_cr:'', drawdown_cr:'', category:'HNI', joined_date:'', status:'active' });
      onSaved();
      setTimeout(() => { setMsg(''); setOpen(false); }, 2000);
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
    }
    setLoading(false);
  }

  return (
    <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 16, overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)}
        style={{ width: '100%', padding: '1.2rem 1.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.2rem', fontWeight: 600, color: '#0D0D0D' }}>+ Add New Investor</div>
        <span style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.35)' }}>{open ? 'Close ↑' : 'Expand ↓'}</span>
      </button>

      {open && (
        <div style={{ padding: '0 1.8rem 1.8rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ height: '1.2rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <AF label="Full Name *"     value={form.full_name}     onChange={v => set('full_name', v)}     type="text"   placeholder="Investor full name" />
            <AF label="Email *"          value={form.email}         onChange={v => set('email', v)}         type="email"  placeholder="investor@email.com" />
            <AF label="Password *"       value={form.password}      onChange={v => set('password', v)}      type="password" placeholder="Temporary password" />
            <AF label="Folio Number"     value={form.folio_number}  onChange={v => set('folio_number', v)}  type="text"   placeholder="SC-001" />
            <AF label="Commitment (₹ Cr)" value={form.commitment_cr} onChange={v => set('commitment_cr', v)} type="number" placeholder="e.g. 2" />
            <AF label="Drawn (₹ Cr)"    value={form.drawdown_cr}   onChange={v => set('drawdown_cr', v)}   type="number" placeholder="e.g. 1.5" />
            <AF label="Joined Date"      value={form.joined_date}   onChange={v => set('joined_date', v)}   type="date"   placeholder="" />
            <div>
              <div style={lbl}>Category</div>
              <select value={form.category} onChange={e => set('category', e.target.value)} style={inp}>
                {['HNI', 'Family Office', 'Institutional'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          {msg && <div style={{ margin: '1rem 0', fontSize: '0.82rem', color: msg.startsWith('✓') ? '#1a7a4a' : '#c0392b', padding: '10px 14px', background: msg.startsWith('✓') ? 'rgba(26,122,74,0.06)' : 'rgba(192,57,43,0.06)', borderRadius: 8 }}>{msg}</div>}
          <button onClick={submit} disabled={loading}
            style={{ marginTop: '1rem', fontFamily: "'DM Mono',monospace", fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '12px 28px', borderRadius: 100, background: '#012956', color: '#F2F0EB', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Creating…' : 'Create Investor Account'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Investor Row (editable) ────────────────────────────────────────────────────
function InvestorRow({ user, loading, onUpdate }: { user: PortalUser; loading: boolean; onUpdate: (id: string, updates: object) => void }) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    full_name:     user.investor?.full_name     || '',
    folio_number:  user.investor?.folio_number  || '',
    commitment_cr: user.investor?.commitment_cr?.toString() || '',
    drawdown_cr:   user.investor?.drawdown_cr?.toString()   || '',
    status:        user.investor?.status        || 'active',
    category:      user.investor?.category      || 'HNI',
    joined_date:   user.investor?.joined_date   || '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function resetPassword() {
    if (!newPassword || newPassword.length < 6) { setPwMsg('Min 6 characters'); return; }
    const { error } = await supabase.auth.admin.updateUserById(user.id, { password: newPassword });
    setPwMsg(error ? `Error: ${error.message}` : '✓ Password updated');
    setNewPassword('');
    setTimeout(() => setPwMsg(''), 3000);
  }

  const statusColor: Record<string, string> = { active: '#1a7a4a', exited: '#b8860b', suspended: '#c0392b' };

  return (
    <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
      {/* Collapsed row */}
      <div onClick={() => setEdit(!edit)}
        style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 80px', gap: 0, padding: '1rem 1.8rem', cursor: 'pointer', alignItems: 'center' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.015)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#0D0D0D' }}>{user.investor?.full_name || '—'}</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.38)', marginTop: 2 }}>{user.email}</div>
        </div>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.75rem', color: 'rgba(0,0,0,0.45)' }}>{user.investor?.folio_number || '—'}</div>
        <div style={{ fontSize: '0.82rem' }}>{user.investor?.commitment_cr ? `₹${user.investor.commitment_cr} Cr` : '—'}</div>
        <div style={{ fontSize: '0.82rem' }}>{user.investor?.drawdown_cr ? `₹${user.investor.drawdown_cr} Cr` : '—'}</div>
        <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.45)' }}>{user.investor?.category || '—'}</div>
        <div>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.58rem', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 100, background: `${statusColor[user.investor?.status || 'active']}15`, color: statusColor[user.investor?.status || 'active'] }}>
            {user.investor?.status || 'active'}
          </span>
        </div>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.6rem', color: 'rgba(0,0,0,0.35)', textAlign: 'right' }}>{edit ? 'Close ↑' : 'Edit ↓'}</div>
      </div>

      {/* Expanded edit panel */}
      {edit && user.investor && (
        <div style={{ padding: '1.5rem 1.8rem 2rem', borderTop: '1px solid rgba(0,0,0,0.04)', background: 'rgba(0,0,0,0.01)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <AF label="Full Name"        value={form.full_name}     onChange={v => set('full_name', v)}     type="text"   />
            <AF label="Folio Number"     value={form.folio_number}  onChange={v => set('folio_number', v)}  type="text"   />
            <AF label="Commitment (₹ Cr)" value={form.commitment_cr} onChange={v => set('commitment_cr', v)} type="number" />
            <AF label="Drawn (₹ Cr)"    value={form.drawdown_cr}   onChange={v => set('drawdown_cr', v)}   type="number" />
            <AF label="Joined Date"      value={form.joined_date}   onChange={v => set('joined_date', v)}   type="date"   />
            <div>
              <div style={lbl}>Status</div>
              <select value={form.status} onChange={e => set('status', e.target.value)} style={inp}>
                {['active', 'exited', 'suspended'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <button onClick={() => onUpdate(user.investor!.id, {
            full_name:     form.full_name,
            folio_number:  form.folio_number,
            commitment_cr: form.commitment_cr ? parseFloat(form.commitment_cr) : null,
            drawdown_cr:   form.drawdown_cr ? parseFloat(form.drawdown_cr) : null,
            status:        form.status,
            category:      form.category,
            joined_date:   form.joined_date || null,
          })} disabled={loading}
            style={{ ...btnStyle, marginRight: '1rem' }}>
            {loading ? 'Saving…' : 'Save Changes'}
          </button>

          {/* Reset password */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.6rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.38)', marginBottom: '0.8rem' }}>Reset Password</div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input type="password" placeholder="New password (min 6 chars)" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                style={{ ...inp, maxWidth: 260, marginBottom: 0 }} />
              <button onClick={resetPassword} style={{ ...btnStyle, background: 'rgba(0,0,0,0.06)', color: '#0D0D0D' }}>Set Password</button>
            </div>
            {pwMsg && <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: pwMsg.startsWith('✓') ? '#1a7a4a' : '#c0392b' }}>{pwMsg}</div>}
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
    const { error } = await supabase.from('nav_data').insert([{ date, nav: parseFloat(nav), aum_cr: aum ? parseFloat(aum) : null, uploaded_by: 'admin' }]);
    setMsg(error ? `Error: ${error.message}` : '✓ NAV uploaded');
    if (!error) { setDate(''); setNav(''); setAum(''); }
    setTimeout(() => setMsg(''), 3000);
  }

  return (
    <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 16, padding: '2rem', maxWidth: 420 }}>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem' }}>Upload NAV</div>
      <AF label="Date *"       value={date} onChange={setDate} type="date"   />
      <AF label="NAV (₹) *"   value={nav}  onChange={setNav}  type="number" placeholder="e.g. 1024.50" />
      <AF label="AUM (₹ Cr)"  value={aum}  onChange={setAum}  type="number" placeholder="Optional" />
      {msg && <div style={{ marginBottom: '1rem', fontSize: '0.82rem', color: msg.startsWith('✓') ? '#1a7a4a' : '#c0392b' }}>{msg}</div>}
      <button onClick={submit} style={btnStyle}>Upload</button>
    </div>
  );
}

// ── Shared field component ─────────────────────────────────────────────────────
function AF({ label, value, onChange, type, placeholder }: { label: string; value: string; onChange: (v: string) => void; type: string; placeholder?: string }) {
  return (
    <div style={{ marginBottom: '0.9rem' }}>
      <div style={lbl}>{label}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={inp} />
    </div>
  );
}

const lbl: React.CSSProperties = { fontFamily: "'DM Mono',monospace", fontSize: '0.58rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.38)', marginBottom: 5, display: 'block' };
const inp: React.CSSProperties = { width: '100%', background: '#F2F0EB', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 10, padding: '10px 14px', fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '0.88rem', color: '#0D0D0D', outline: 'none', boxSizing: 'border-box', appearance: 'none' };
const btnStyle: React.CSSProperties = { fontFamily: "'DM Mono',monospace", fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '11px 24px', borderRadius: 100, background: '#012956', color: '#F2F0EB', border: 'none', cursor: 'pointer' };

// Need React for CSSProperties type
import React from 'react';
