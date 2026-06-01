import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import logoSrc from '../components/logo.png';
import type { AppView } from '../types';

interface Props { session: Session; onBack: () => void; }
type AdminTab = 'users' | 'nav';

interface User {
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
  role: string;
  created_at: string;
}

export default function AdminDashboard({ session, onBack }: Props) {
  const [tab, setTab]       = useState<AdminTab>('users');
  const [users, setUsers]   = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all'|'investor'|'admin'>('all');
  const [msg, setMsg]       = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const { data, error } = await supabase.from('investors').select('*').order('created_at', { ascending: false });
    if (error) { console.error(error); setMsg(`Load error: ${error.message}`); }
    setUsers(data || []);
  }

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(''), 4000); }

  async function updateUser(id: string, updates: object) {
    const { error } = await supabase.from('investors').update(updates).eq('id', id);
    error ? flash(`Error: ${error.message}`) : flash('✓ Saved');
    load();
  }

  async function deleteUser(id: string, name: string) {
    if (!confirm(`Remove "${name}" from the portal? This removes their investor record only.`)) return;
    const { error } = await supabase.from('investors').delete().eq('id', id);
    error ? flash(`Error: ${error.message}`) : flash('✓ User removed');
    load();
  }

  const filtered = users.filter(u => {
    const matchSearch = !search || u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || u.role === filter;
    return matchSearch && matchFilter;
  });

  const navLinks: { view: AppView; label: string }[] = [
    { view: 'home', label: 'Overview' }, { view: 'fund', label: 'The Fund' },
    { view: 'strategy', label: 'Strategy' }, { view: 'about', label: 'About Us' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F2F0EB', fontFamily: "'Bricolage Grotesque',sans-serif" }}>

      {/* Site-style header */}
      <header style={{ background: 'rgba(242,240,235,0.95)', backdropFilter: 'blur(18px)', borderBottom: '1px solid rgba(0,0,0,0.09)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 5vw', height: 90, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', height: '100%', padding: '12px 0 2px' }}>
            <img src={logoSrc} alt="Super Capital" style={{ height: '225%', width: '200%', objectFit: 'contain', objectPosition: 'left center', cursor: 'pointer' }} onClick={onBack} />
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(1,41,86,0.65)', background: 'rgba(1,41,86,0.08)', padding: '4px 12px', borderRadius: 100 }}>Admin Portal</span>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {navLinks.map(l => (
              <button key={l.view} onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '0.83rem', color: 'var(--ink-2)', padding: 0 }}>{l.label}</button>
            ))}
            <button onClick={() => { supabase.auth.signOut(); onBack(); }}
              style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', background: '#0D0D0D', color: '#F2F0EB', border: 'none', borderRadius: 100, padding: '9px 22px', cursor: 'pointer' }}>
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 5vw' }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: '2.5rem' }}>
          {[
            { label: 'Total Users',      value: users.length },
            { label: 'Investors',        value: users.filter(u => u.role === 'investor').length },
            { label: 'Admins',           value: users.filter(u => u.role === 'admin').length },
            { label: 'Total Commitment', value: `₹${users.filter(u=>u.role==='investor').reduce((s,u) => s+(u.commitment_cr||0), 0).toFixed(1)} Cr` },
          ].map(k => (
            <div key={k.label} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 14, padding: '1.3rem 1.5rem' }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.55rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)', marginBottom: '0.5rem' }}>{k.label}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.9rem', fontWeight: 600, color: '#012956', lineHeight: 1 }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: '2rem', background: 'rgba(0,0,0,0.04)', borderRadius: 100, padding: 4, width: 'fit-content' }}>
          {(['users', 'nav'] as AdminTab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '8px 20px', borderRadius: 100, border: 'none', cursor: 'pointer', background: tab === t ? '#fff' : 'transparent', color: tab === t ? '#012956' : 'rgba(0,0,0,0.4)', boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.2s' }}>
              {t === 'users' ? 'User Management' : 'Upload NAV'}
            </button>
          ))}
        </div>

        {msg && <div style={{ marginBottom: '1.2rem', padding: '10px 18px', borderRadius: 10, background: msg.startsWith('✓') ? 'rgba(26,122,74,0.08)' : 'rgba(192,57,43,0.08)', color: msg.startsWith('✓') ? '#1a7a4a' : '#c0392b', fontSize: '0.82rem' }}>{msg}</div>}

        {/* USER MANAGEMENT */}
        {tab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Add user notice */}
            <div style={{ background: 'rgba(1,41,86,0.04)', border: '1px solid rgba(1,41,86,0.1)', borderRadius: 14, padding: '1.2rem 1.5rem', fontSize: '0.84rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.7 }}>
              <strong style={{ color: '#012956' }}>To add a new user:</strong> Go to Supabase Dashboard → Authentication → Users → Invite User. They'll receive an email and appear here automatically. Then set their role and details below.
            </div>

            {/* Search + filter bar */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                <input
                  type="text"
                  placeholder="Search by name or email…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width: '100%', background: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 100, padding: '10px 18px 10px 40px', fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '0.88rem', color: '#0D0D0D', outline: 'none', boxSizing: 'border-box' }}
                />
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(0,0,0,0.3)', fontSize: '0.9rem' }}>⌕</span>
              </div>
              {(['all','investor','admin'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '8px 16px', borderRadius: 100, border: 'none', cursor: 'pointer', background: filter === f ? '#012956' : 'rgba(0,0,0,0.06)', color: filter === f ? '#F2F0EB' : 'rgba(0,0,0,0.45)', transition: 'all 0.2s' }}>
                  {f === 'all' ? `All (${users.length})` : f === 'investor' ? `Investors (${users.filter(u=>u.role==='investor').length})` : `Admins (${users.filter(u=>u.role==='admin').length})`}
                </button>
              ))}
              <button onClick={load} style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'none', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 100, padding: '8px 14px', cursor: 'pointer', color: 'rgba(0,0,0,0.4)' }}>↻ Refresh</button>
            </div>

            {/* User list */}
            <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr 60px', padding: '0.7rem 1.8rem', background: 'rgba(0,0,0,0.02)', gap: 0 }}>
                {['User', 'Role', 'Folio', 'Commitment', 'Status', ''].map(h => (
                  <div key={h} style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.55rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.38)' }}>{h}</div>
                ))}
              </div>

              {filtered.length === 0
                ? <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(0,0,0,0.28)', fontSize: '0.85rem' }}>
                    {search ? 'No users match your search.' : 'No users yet. Add via Supabase Auth.'}
                  </div>
                : filtered.map(u => (
                  <UserRow key={u.id} user={u}
                    onUpdate={upd => updateUser(u.id, upd)}
                    onDelete={() => deleteUser(u.id, u.full_name)}
                    isSelf={u.email === session.user.email}
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

// ── User Row ───────────────────────────────────────────────────────────────────
function UserRow({ user, onUpdate, onDelete, isSelf }: {
  user: User; onUpdate: (u: object) => void; onDelete: () => void; isSelf: boolean;
}) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    full_name:     user.full_name     || '',
    role:          user.role          || 'investor',
    folio_number:  user.folio_number  || '',
    commitment_cr: user.commitment_cr?.toString() || '',
    drawdown_cr:   user.drawdown_cr?.toString()   || '',
    status:        user.status        || 'active',
    category:      user.category      || 'HNI',
    joined_date:   user.joined_date   || '',
  });
  const [newPw, setNewPw]   = useState('');
  const [pwMsg, setPwMsg]   = useState('');
  const [pwLoad, setPwLoad] = useState(false);

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function changePassword() {
    if (!newPw || newPw.length < 6) { setPwMsg('Minimum 6 characters'); return; }
    setPwLoad(true);
    // Update password for current user (works only for self via Supabase client)
    // For other users, admin must use Supabase Dashboard
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setPwMsg(error ? `Error: ${error.message}` : '✓ Password updated');
    setNewPw('');
    setPwLoad(false);
    setTimeout(() => setPwMsg(''), 4000);
  }

  const roleColor: Record<string, string> = { admin: '#012956', investor: '#1a7a4a' };
  const statusColor: Record<string, string> = { active: '#1a7a4a', exited: '#b8860b', suspended: '#c0392b' };

  return (
    <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
      <div onClick={() => setEdit(!edit)}
        style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr 60px', padding: '1rem 1.8rem', cursor: 'pointer', alignItems: 'center', transition: 'background 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.015)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user.full_name}</span>
            {isSelf && <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.52rem', background: 'rgba(1,41,86,0.08)', color: '#012956', padding: '1px 7px', borderRadius: 4 }}>you</span>}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.38)', marginTop: 2 }}>{user.email}</div>
        </div>
        <div>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.58rem', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 100, background: `${roleColor[user.role]||'#888'}18`, color: roleColor[user.role]||'#888' }}>
            {user.role}
          </span>
        </div>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.75rem', color: 'rgba(0,0,0,0.45)' }}>{user.folio_number || '—'}</div>
        <div style={{ fontSize: '0.82rem' }}>{user.commitment_cr ? `₹${user.commitment_cr} Cr` : '—'}</div>
        <div>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.58rem', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 100, background: `${statusColor[user.status]||'#888'}18`, color: statusColor[user.status]||'#888' }}>
            {user.status}
          </span>
        </div>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.6rem', color: 'rgba(0,0,0,0.3)', textAlign: 'right' }}>{edit ? '↑' : '↓'}</div>
      </div>

      {edit && (
        <div style={{ padding: '1.5rem 1.8rem 2rem', borderTop: '1px solid rgba(0,0,0,0.04)', background: 'rgba(0,0,0,0.012)' }}>

          {/* Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.2rem' }}>
            <AF label="Full Name"          value={form.full_name}     onChange={v => set('full_name', v)}     type="text"   />
            <div>
              <div style={lbl}>Role</div>
              <select value={form.role} onChange={e => set('role', e.target.value)} style={inp}>
                <option value="investor">Investor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <div style={lbl}>Status</div>
              <select value={form.status} onChange={e => set('status', e.target.value)} style={inp}>
                {['active','exited','suspended'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            {form.role === 'investor' && (<>
              <AF label="Folio Number"        value={form.folio_number}  onChange={v => set('folio_number', v)}  type="text"   />
              <AF label="Commitment (₹ Cr)"  value={form.commitment_cr} onChange={v => set('commitment_cr', v)} type="number" />
              <AF label="Drawn (₹ Cr)"       value={form.drawdown_cr}   onChange={v => set('drawdown_cr', v)}   type="number" />
              <AF label="Joined Date"         value={form.joined_date}   onChange={v => set('joined_date', v)}   type="date"   />
              <div>
                <div style={lbl}>Category</div>
                <select value={form.category} onChange={e => set('category', e.target.value)} style={inp}>
                  {['HNI','Family Office','Institutional'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </>)}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <button onClick={() => onUpdate({
              full_name:     form.full_name,
              role:          form.role,
              status:        form.status,
              folio_number:  form.folio_number  || null,
              commitment_cr: form.commitment_cr ? parseFloat(form.commitment_cr) : null,
              drawdown_cr:   form.drawdown_cr   ? parseFloat(form.drawdown_cr)   : null,
              category:      form.category,
              joined_date:   form.joined_date   || null,
            })} style={btn}>Save Changes</button>

            {!isSelf && (
              <button onClick={onDelete} style={{ ...btn, background: 'transparent', color: '#c0392b', border: '1px solid rgba(192,57,43,0.3)' }}>
                Remove User
              </button>
            )}
          </div>

          {/* Change password — only works for own account from client */}
          <div style={{ paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.38)', marginBottom: '0.8rem' }}>
              {isSelf ? 'Change Your Password' : 'Change Password (Admin Only — for other users, use Supabase Dashboard → Auth → Users)'}
            </div>
            {isSelf ? (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input type="password" placeholder="New password (min 6 chars)" value={newPw} onChange={e => setNewPw(e.target.value)}
                  style={{ ...inp, maxWidth: 260, marginBottom: 0 }} />
                <button onClick={changePassword} disabled={pwLoad} style={{ ...btn, background: 'rgba(0,0,0,0.07)', color: '#0D0D0D', opacity: pwLoad ? 0.6 : 1 }}>
                  {pwLoad ? 'Updating…' : 'Set Password'}
                </button>
              </div>
            ) : (
              <div style={{ fontSize: '0.82rem', color: 'rgba(0,0,0,0.4)', padding: '10px 14px', background: 'rgba(0,0,0,0.03)', borderRadius: 8 }}>
                To change another user's password: Supabase Dashboard → Authentication → Users → click the user → Reset password.
              </div>
            )}
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

interface User {
  id: string; user_id: string | null; full_name: string; email: string;
  folio_number: string | null; commitment_cr: number | null; drawdown_cr: number | null;
  status: string; category: string; joined_date: string | null; role: string; created_at: string;
}
