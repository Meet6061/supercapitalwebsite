import React, { useEffect, useState, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { createUser, changePassword, deleteAuthUser } from '../lib/adminApi';
import { HOLDINGS, SECTOR_ALLOCATION } from '../lib/mockData';
import logoSrc from '../components/logo.png';

interface Props { session: Session; onBack: () => void; }

type AdminPage = 'dashboard' | 'users' | 'clients' | 'client_profile' | 'fund_data';

// ── Types ────────────────────────────────────────────────────────────────────
interface Client {
  id: string; user_id: string | null; full_name: string; email: string;
  pan: string | null; folio_number: string | null; phone: string | null;
  category: string; kyc_status: string; status: string;
  notes: string | null; joined_date: string | null; created_at: string;
}
interface Investment {
  id: string; client_id: string; invested_cr: number; investment_date: string;
  units_allotted: number | null; nav_at_entry: number | null; status: string; notes: string | null;
}
interface Statement {
  id: string; client_id: string; as_of_date: string; units: number | null;
  nav: number | null; current_value_cr: number | null; invested_cr: number | null;
  pnl_cr: number | null; pnl_pct: number | null; xirr: number | null;
}
interface NavRow { id: string; date: string; nav: number; aum_cr: number | null; }

// ── Styles ──────────────────────────────────────────────────────────────────
const s = {
  lbl:        { fontFamily:"'DM Mono',monospace", fontSize:'0.58rem', letterSpacing:'0.16em', textTransform:'uppercase' as const, color:'rgba(0,0,0,0.38)', marginBottom:5, display:'block' },
  inp:        { width:'100%', background:'#F2F0EB', border:'1px solid rgba(0,0,0,0.12)', borderRadius:10, padding:'10px 14px', fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:'0.88rem', color:'#0D0D0D', outline:'none', boxSizing:'border-box' as const, appearance:'none' as const },
  mono12:     { fontFamily:"'DM Mono',monospace", fontSize:'0.55rem', letterSpacing:'0.14em', textTransform:'uppercase' as const, color:'rgba(0,0,0,0.38)' },
  solidBtn:   { fontFamily:"'DM Mono',monospace", fontSize:'0.68rem', letterSpacing:'0.12em', textTransform:'uppercase' as const, padding:'11px 24px', borderRadius:100, background:'#012956', color:'#F2F0EB', border:'none', cursor:'pointer' as const },
  outlineBtn: { fontFamily:"'DM Mono',monospace", fontSize:'0.65rem', letterSpacing:'0.1em', textTransform:'uppercase' as const, background:'none', border:'1px solid rgba(0,0,0,0.18)', borderRadius:100, padding:'7px 18px', cursor:'pointer' as const, color:'rgba(0,0,0,0.45)' },
  dangerBtn:  { fontFamily:"'DM Mono',monospace", fontSize:'0.65rem', letterSpacing:'0.1em', textTransform:'uppercase' as const, background:'transparent', border:'1px solid rgba(192,57,43,0.3)', borderRadius:100, padding:'7px 18px', cursor:'pointer' as const, color:'#c0392b' },
  card:       { background:'#fff', border:'1px solid rgba(0,0,0,0.09)', borderRadius:16, overflow:'hidden' as const },
  badge: (color: string) => ({ fontFamily:"'DM Mono',monospace", fontSize:'0.55rem', letterSpacing:'0.12em', textTransform:'uppercase' as const, padding:'3px 10px', borderRadius:100, background:`${color}18`, color }),
};

function AF({ label, value, onChange, type, placeholder, style }: { label: string; value: string; onChange: (v: string) => void; type: string; placeholder?: string; style?: React.CSSProperties }) {
  return (
    <div style={{ marginBottom:'0.9rem', ...style }}>
      <label style={s.lbl}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={s.inp} maxLength={type === 'password' ? 128 : undefined} />
    </div>
  );
}

function SF({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div style={{ marginBottom:'0.9rem' }}>
      <label style={s.lbl}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={s.inp}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Flash({ msg }: { msg: string }) {
  if (!msg) return null;
  const ok = msg.startsWith('✓');
  return <div style={{ marginBottom:'1rem', padding:'10px 18px', borderRadius:10, background: ok ? 'rgba(26,122,74,0.08)' : 'rgba(192,57,43,0.08)', color: ok ? '#1a7a4a' : '#c0392b', fontSize:'0.82rem' }}>{msg}</div>;
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard({ session, onBack }: Props) {
  const [page, setPage]             = useState<AdminPage>('dashboard');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients]       = useState<Client[]>([]);
  const [navData, setNavData]       = useState<NavRow[]>([]);
  const [msg, setMsg]               = useState('');

  const flash = useCallback((m: string) => { setMsg(m); setTimeout(() => setMsg(''), 5000); }, []);

  const loadClients = useCallback(async () => {
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    setClients(data || []);
  }, []);

  const loadNav = useCallback(async () => {
    const { data } = await supabase.from('nav_data').select('*').order('date', { ascending: false });
    setNavData(data || []);
  }, []);

  useEffect(() => { loadClients(); loadNav(); }, [loadClients, loadNav]);

  function openClientProfile(client: Client) {
    setSelectedClient(client);
    setPage('client_profile');
  }

  // AUM computed from investments in production
  const latestNAV = navData[0];

  const navItems: { label: string; page: AdminPage; icon: string }[] = [
    { label: 'Dashboard',   page: 'dashboard',     icon: '▦' },
    { label: 'Users',       page: 'users',          icon: '◉' },
    { label: 'Clients',     page: 'clients',        icon: '◈' },
    { label: 'Fund Data',   page: 'fund_data',      icon: '◎' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'#F2F0EB', fontFamily:"'Bricolage Grotesque',sans-serif", display:'flex', flexDirection:'column' }}>

      {/* Header */}
      <header style={{ background:'rgba(242,240,235,0.97)', backdropFilter:'blur(18px)', borderBottom:'1px solid rgba(0,0,0,0.09)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ maxWidth:1340, margin:'0 auto', padding:'0 2rem', height:72, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'2rem' }}>
            <img src={logoSrc} alt="Super Capital" onClick={onBack} style={{ height:52, width:'auto', objectFit:'contain', cursor:'pointer' }} />
            <span style={s.badge('#012956')}>Admin Portal</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'1.5rem' }}>
            <span style={{ fontSize:'0.8rem', color:'rgba(0,0,0,0.38)' }}>{session.user.email}</span>
            <button onClick={() => { supabase.auth.signOut(); onBack(); }} style={s.outlineBtn}>Sign Out</button>
          </div>
        </div>
      </header>

      <div style={{ display:'flex', flex:1, maxWidth:1340, margin:'0 auto', width:'100%', padding:'0 2rem' }}>

        {/* Sidebar */}
        <aside style={{ width:200, flexShrink:0, paddingTop:'2rem', paddingRight:'1.5rem' }}>
          <nav style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {navItems.map(n => (
              <button key={n.page} onClick={() => setPage(n.page)}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10, border:'none', cursor:'pointer', textAlign:'left' as const, background: page === n.page || (page === 'client_profile' && n.page === 'clients') ? 'rgba(1,41,86,0.08)' : 'transparent', color: page === n.page || (page === 'client_profile' && n.page === 'clients') ? '#012956' : 'rgba(0,0,0,0.45)', fontFamily:"'DM Mono',monospace", fontSize:'0.62rem', letterSpacing:'0.1em', textTransform:'uppercase', transition:'all 0.15s' }}>
                <span style={{ fontSize:'0.9rem', opacity:0.7 }}>{n.icon}</span> {n.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{ flex:1, paddingTop:'2rem', paddingBottom:'4rem', minWidth:0 }}>
          <Flash msg={msg} />

          {page === 'dashboard'     && <DashboardPage clients={clients} latestNAV={latestNAV} onGoClients={() => setPage('clients')} onGoUsers={() => setPage('users')} />}
          {page === 'users'         && <UsersPage session={session} flash={flash} onClientCreated={loadClients} />}
          {page === 'clients'       && <ClientsPage clients={clients} onRefresh={loadClients} flash={flash} onOpenProfile={openClientProfile} />}
          {page === 'client_profile' && selectedClient && <ClientProfilePage client={selectedClient} flash={flash} onBack={() => setPage('clients')} onUpdated={loadClients} />}
          {page === 'fund_data'     && <FundDataPage navData={navData} flash={flash} onRefresh={loadNav} />}
        </main>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
function DashboardPage({ clients, latestNAV, onGoClients, onGoUsers }: { clients: Client[]; latestNAV: NavRow | undefined; onGoClients: () => void; onGoUsers: () => void }) {
  const activeClients = clients.filter(c => c.status === 'active').length;
  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of Super Capital AIF" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:'2.5rem' }}>
        {[
          { label:'Total Clients',   value: clients.length,                        sub:'registered investors' },
          { label:'Active Clients',  value: activeClients,                         sub:'currently invested' },
          { label:'Latest NAV',      value: latestNAV ? `₹${latestNAV.nav.toFixed(2)}` : '—', sub: latestNAV?.date || 'not uploaded' },
          { label:'Fund AUM',        value: latestNAV?.aum_cr ? `₹${latestNAV.aum_cr} Cr` : '—', sub:'as of latest NAV' },
        ].map(k => (
          <div key={k.label} style={{ ...s.card, padding:'1.4rem 1.6rem' }}>
            <div style={s.mono12}>{k.label}</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'2.2rem', fontWeight:600, color:'#012956', lineHeight:1, margin:'0.5rem 0 0.3rem' }}>{k.value}</div>
            <div style={{ fontSize:'0.72rem', color:'rgba(0,0,0,0.32)' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
        <div style={{ ...s.card, padding:'1.8rem' }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.15rem', fontWeight:600, marginBottom:'1.2rem' }}>Quick Actions</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <button onClick={onGoUsers} style={{ ...s.solidBtn, textAlign:'left', width:'100%' }}>+ Create New User</button>
            <button onClick={onGoClients} style={{ ...s.outlineBtn, textAlign:'left', width:'100%', padding:'11px 24px' }}>View All Clients</button>
          </div>
        </div>
        <div style={{ ...s.card, padding:'1.8rem' }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.15rem', fontWeight:600, marginBottom:'1.2rem' }}>Recent Clients</div>
          {clients.slice(0,4).map(c => (
            <div key={c.id} style={{ display:'flex', justifyContent:'space-between', padding:'0.6rem 0', borderBottom:'1px solid rgba(0,0,0,0.05)' }}>
              <div>
                <div style={{ fontSize:'0.85rem', fontWeight:500 }}>{c.full_name}</div>
                <div style={{ fontSize:'0.72rem', color:'rgba(0,0,0,0.38)' }}>{c.folio_number || 'No folio'}</div>
              </div>
              <span style={s.badge(c.status === 'active' ? '#1a7a4a' : '#888')}>{c.status}</span>
            </div>
          ))}
          {clients.length === 0 && <div style={{ color:'rgba(0,0,0,0.3)', fontSize:'0.82rem' }}>No clients yet.</div>}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: USERS (auth user management)
// ══════════════════════════════════════════════════════════════════════════════
function UsersPage({ session, onClientCreated }: { session: Session; flash?: (m: string) => void; onClientCreated: () => void }) {
  const [form, setForm] = useState({ full_name:'', email:'', password:'', role:'investor', folio_number:'', category:'HNI', joined_date:'', pan:'', phone:'' });
  const [loading, setLoading] = useState(false);
  const [localMsg, setLocalMsg] = useState('');

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function createClient() {
    if (!form.full_name || !form.email || !form.password) { setLocalMsg('Name, email and password are required.'); return; }
    if (form.password.length < 8) { setLocalMsg('Password must be at least 8 characters.'); return; }
    if (form.password.length > 128) { setLocalMsg('Password too long.'); return; }
    setLoading(true); setLocalMsg('');
    try {
      // 1. Create auth user
      const result = await createUser(form.email, form.password, form.full_name, form.role);
      const uid = result.user?.id;

      // 2. Create client record linked to auth user
      if (uid && form.role === 'investor') {
        const { error } = await supabase.from('clients').insert([{
          user_id:      uid,
          full_name:    form.full_name,
          email:        form.email,
          pan:          form.pan || null,
          folio_number: form.folio_number || null,
          phone:        form.phone || null,
          category:     form.category,
          joined_date:  form.joined_date || null,
          kyc_status:   'pending',
          status:       'active',
        }]);
        if (error) throw new Error(error.message);
      }

      setLocalMsg(`✓ ${form.role === 'investor' ? 'Client' : 'Admin'} "${form.full_name}" created. They can log in immediately.`);
      setForm({ full_name:'', email:'', password:'', role:'investor', folio_number:'', category:'HNI', joined_date:'', pan:'', phone:'' });
      onClientCreated();
    } catch (e: any) {
      setLocalMsg(`Error: ${e.message}`);
    }
    setLoading(false);
  }

  return (
    <div>
      <PageHeader title="User Management" subtitle="Create and manage login accounts. All credentials set by admin — no emails sent to users." />

      <div style={{ ...s.card, padding:'2rem', maxWidth:720 }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.2rem', fontWeight:600, marginBottom:'1.5rem' }}>Create New Account</div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1.2rem' }}>
          <AF label="Full Name *"  value={form.full_name} onChange={v => set('full_name', v)} type="text"     placeholder="Full legal name" />
          <AF label="Email *"      value={form.email}     onChange={v => set('email', v)}     type="email"   placeholder="email@domain.com" />
          <AF label="Password *"   value={form.password}  onChange={v => set('password', v)}  type="password" placeholder="Min 8 characters" />
          <SF label="Role *"       value={form.role}      onChange={v => set('role', v)}       options={['investor','admin']} />
        </div>

        {form.role === 'investor' && (
          <>
            <div style={{ height:1, background:'rgba(0,0,0,0.06)', margin:'0.5rem 0 1.2rem' }} />
            <div style={{ ...s.mono12, marginBottom:'1rem' }}>Investor Details</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1.2rem' }}>
              <AF label="Folio Number"     value={form.folio_number} onChange={v => set('folio_number', v)} type="text"   placeholder="SC-001" />
              <AF label="PAN"              value={form.pan}          onChange={v => set('pan', v)}           type="text"   placeholder="ABCDE1234F" />
              <AF label="Phone"            value={form.phone}        onChange={v => set('phone', v)}         type="text"   placeholder="+91 98765 43210" />
              <AF label="Investment Date"  value={form.joined_date}  onChange={v => set('joined_date', v)}   type="date" />
              <SF label="Category"         value={form.category}     onChange={v => set('category', v)}      options={['HNI','Family Office','Institutional']} />
            </div>
          </>
        )}

        <Flash msg={localMsg} />
        <div style={{ marginTop:'0.5rem', padding:'12px 16px', borderRadius:10, background:'rgba(1,41,86,0.04)', fontSize:'0.78rem', color:'rgba(0,0,0,0.4)', marginBottom:'1.2rem' }}>
          The user will be able to log in immediately with the credentials you set. No email will be sent. Share credentials securely.
        </div>
        <button onClick={createClient} disabled={loading} style={{ ...s.solidBtn, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Creating…' : 'Create Account'}
        </button>
      </div>

      <div style={{ marginTop:'1rem', padding:'12px 18px', borderRadius:10, background:'rgba(0,0,0,0.03)', fontSize:'0.78rem', color:'rgba(0,0,0,0.38)' }}>
        Logged in as: <strong>{session.user.email}</strong> — to change passwords or delete users, go to Clients → Client Profile.
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: CLIENTS (table view of all clients)
// ══════════════════════════════════════════════════════════════════════════════
function ClientsPage({ clients, onRefresh, onOpenProfile }: { clients: Client[]; onRefresh: () => void; flash?: (m: string) => void; onOpenProfile: (c: Client) => void }) {
  const [search, setSearch]   = useState('');
  const [statusF, setStatusF] = useState('all');

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !search || c.full_name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.folio_number || '').toLowerCase().includes(q) || (c.pan || '').toLowerCase().includes(q);
    const matchS = statusF === 'all' || c.status === statusF;
    return matchQ && matchS;
  });

  return (
    <div>
      <PageHeader title="Client Management" subtitle="All registered investors. Click any row to view or edit their full profile." />

      {/* Filters */}
      <div style={{ display:'flex', gap:'0.75rem', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:240 }}>
          <input type="text" placeholder="Search name, email, folio, PAN…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...s.inp, paddingLeft:38, borderRadius:100 }} />
          <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'rgba(0,0,0,0.3)', fontSize:'0.9rem' }}>⌕</span>
        </div>
        {(['all','active','exited','suspended'] as const).map(f => (
          <button key={f} onClick={() => setStatusF(f)}
            style={{ ...s.outlineBtn, background: statusF === f ? '#012956' : 'transparent', color: statusF === f ? '#F2F0EB' : 'rgba(0,0,0,0.45)', borderColor: statusF === f ? '#012956' : 'rgba(0,0,0,0.18)' }}>
            {f === 'all' ? `All (${clients.length})` : `${f} (${clients.filter(c=>c.status===f).length})`}
          </button>
        ))}
        <button onClick={onRefresh} style={s.outlineBtn}>↻ Refresh</button>
      </div>

      {/* Table */}
      <div style={s.card}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 0.8fr 0.8fr 0.8fr 0.6fr', padding:'0.8rem 1.6rem', background:'rgba(0,0,0,0.02)', gap:'1rem' }}>
          {['Client', 'Email', 'Folio', 'Category', 'KYC', 'Status'].map(h => <div key={h} style={s.mono12}>{h}</div>)}
        </div>
        {filtered.length === 0
          ? <div style={{ padding:'3rem', textAlign:'center', color:'rgba(0,0,0,0.28)', fontSize:'0.85rem' }}>{search ? 'No results.' : 'No clients yet. Create one in User Management.'}</div>
          : filtered.map(c => (
            <div key={c.id} onClick={() => onOpenProfile(c)}
              style={{ display:'grid', gridTemplateColumns:'2fr 1fr 0.8fr 0.8fr 0.8fr 0.6fr', padding:'1rem 1.6rem', borderTop:'1px solid rgba(0,0,0,0.06)', cursor:'pointer', alignItems:'center', gap:'1rem', transition:'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.015)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <div>
                <div style={{ fontSize:'0.88rem', fontWeight:500 }}>{c.full_name}</div>
                <div style={{ fontSize:'0.72rem', color:'rgba(0,0,0,0.38)', marginTop:2 }}>{c.joined_date || '—'}</div>
              </div>
              <div style={{ fontSize:'0.78rem', color:'rgba(0,0,0,0.5)', wordBreak:'break-all' as const }}>{c.email}</div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.72rem', color:'rgba(0,0,0,0.45)' }}>{c.folio_number || '—'}</div>
              <div style={{ fontSize:'0.78rem' }}>{c.category}</div>
              <span style={s.badge(c.kyc_status === 'verified' ? '#1a7a4a' : c.kyc_status === 'rejected' ? '#c0392b' : '#b8860b')}>{c.kyc_status}</span>
              <span style={s.badge(c.status === 'active' ? '#1a7a4a' : '#888')}>{c.status}</span>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: CLIENT PROFILE (with tabs)
// ══════════════════════════════════════════════════════════════════════════════
type ProfileTab = 'profile' | 'investments' | 'statements' | 'security';

function ClientProfilePage({ client, flash, onBack, onUpdated }: { client: Client; flash: (m: string) => void; onBack: () => void; onUpdated: () => void }) {
  const [tab, setTab]         = useState<ProfileTab>('profile');
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [statements, setStatements]   = useState<Statement[]>([]);

  const loadInvestments = useCallback(async () => {
    const { data } = await supabase.from('investments').select('*').eq('client_id', client.id).order('investment_date', { ascending: false });
    setInvestments(data || []);
  }, [client.id]);

  const loadStatements = useCallback(async () => {
    const { data } = await supabase.from('client_statements').select('*').eq('client_id', client.id).order('as_of_date', { ascending: false });
    setStatements(data || []);
  }, [client.id]);

  useEffect(() => { loadInvestments(); loadStatements(); }, [loadInvestments, loadStatements]);

  const totalInvested = investments.reduce((s, i) => s + i.invested_cr, 0);
  const latestStatement = statements[0];

  return (
    <div>
      {/* Back + title */}
      <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.8rem' }}>
        <button onClick={onBack} style={{ ...s.outlineBtn, padding:'6px 14px' }}>← Back</button>
        <div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.6rem', fontWeight:600, color:'#0D0D0D', lineHeight:1.2 }}>{client.full_name}</div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.58rem', letterSpacing:'0.14em', color:'rgba(0,0,0,0.38)', marginTop:3 }}>{client.folio_number || 'No Folio'} · {client.email}</div>
        </div>
        <span style={{ ...s.badge(client.status === 'active' ? '#1a7a4a' : '#888'), marginLeft:'auto' }}>{client.status}</span>
      </div>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:'1.8rem' }}>
        {[
          { label:'Total Invested', value: `₹${totalInvested.toFixed(2)} Cr` },
          { label:'Current Value',  value: latestStatement?.current_value_cr ? `₹${latestStatement.current_value_cr.toFixed(4)} Cr` : '—' },
          { label:'P&L',            value: latestStatement?.pnl_pct ? `${latestStatement.pnl_pct.toFixed(2)}%` : '—' },
          { label:'XIRR',           value: latestStatement?.xirr ? `${latestStatement.xirr.toFixed(2)}%` : '—' },
        ].map(k => (
          <div key={k.label} style={{ ...s.card, padding:'1.2rem 1.4rem' }}>
            <div style={s.mono12}>{k.label}</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.7rem', fontWeight:600, color:'#012956', lineHeight:1, marginTop:'0.4rem' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:'1.5rem', background:'rgba(0,0,0,0.04)', borderRadius:100, padding:4, width:'fit-content' }}>
        {(['profile','investments','statements','security'] as ProfileTab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', letterSpacing:'0.1em', textTransform:'uppercase', padding:'8px 20px', borderRadius:100, border:'none', cursor:'pointer', background: tab === t ? '#fff' : 'transparent', color: tab === t ? '#012956' : 'rgba(0,0,0,0.4)', boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition:'all 0.2s' }}>
            {t === 'profile' ? 'Profile' : t === 'investments' ? 'Investments' : t === 'statements' ? 'Statements' : 'Security'}
          </button>
        ))}
      </div>

      {tab === 'profile'     && <ProfileTab     client={client} flash={flash} onUpdated={onUpdated} />}
      {tab === 'investments' && <InvestmentsTab client={client} investments={investments} flash={flash} onRefresh={loadInvestments} />}
      {tab === 'statements'  && <StatementsTab  client={client} statements={statements}  flash={flash} onRefresh={loadStatements} />}
      {tab === 'security'    && <SecurityTab    client={client} flash={flash} />}
    </div>
  );
}

// ── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab({ client, flash, onUpdated }: { client: Client; flash: (m: string) => void; onUpdated: () => void }) {
  const [form, setForm] = useState({
    full_name:   client.full_name,
    email:       client.email,
    pan:         client.pan || '',
    folio_number:client.folio_number || '',
    phone:       client.phone || '',
    category:    client.category,
    kyc_status:  client.kyc_status,
    status:      client.status,
    joined_date: client.joined_date || '',
    notes:       client.notes || '',
  });
  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function save() {
    const { error } = await supabase.from('clients').update({ ...form, pan: form.pan || null, folio_number: form.folio_number || null, phone: form.phone || null, joined_date: form.joined_date || null, notes: form.notes || null }).eq('id', client.id);
    error ? flash(`Error: ${error.message}`) : flash('✓ Profile updated');
    onUpdated();
  }

  return (
    <div style={{ ...s.card, padding:'2rem', maxWidth:720 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1.2rem' }}>
        <AF label="Full Name *"    value={form.full_name}    onChange={v => set('full_name', v)}   type="text" />
        <AF label="Email"          value={form.email}        onChange={v => set('email', v)}        type="email" />
        <AF label="PAN"            value={form.pan}          onChange={v => set('pan', v)}          type="text" placeholder="ABCDE1234F" />
        <AF label="Folio Number"   value={form.folio_number} onChange={v => set('folio_number', v)} type="text" placeholder="SC-001" />
        <AF label="Phone"          value={form.phone}        onChange={v => set('phone', v)}        type="text" />
        <AF label="Joined Date"    value={form.joined_date}  onChange={v => set('joined_date', v)}  type="date" />
        <SF label="Category"       value={form.category}     onChange={v => set('category', v)}     options={['HNI','Family Office','Institutional']} />
        <SF label="KYC Status"     value={form.kyc_status}   onChange={v => set('kyc_status', v)}   options={['pending','verified','rejected']} />
        <SF label="Status"         value={form.status}       onChange={v => set('status', v)}       options={['active','exited','suspended']} />
      </div>
      <div style={{ marginBottom:'0.9rem' }}>
        <label style={s.lbl}>Internal Notes (admin only)</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
          style={{ ...s.inp, resize:'vertical' as const, fontFamily:"'Bricolage Grotesque',sans-serif" }} placeholder="Any internal notes about this client…" />
      </div>
      <button onClick={save} style={s.solidBtn}>Save Changes</button>
    </div>
  );
}

// ── Investments Tab ──────────────────────────────────────────────────────────
function InvestmentsTab({ client, investments, flash, onRefresh }: { client: Client; investments: Investment[]; flash: (m: string) => void; onRefresh: () => void }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm]     = useState({ invested_cr:'', investment_date:'', units_allotted:'', nav_at_entry:'', status:'active', notes:'' });
  const [editId, setEditId] = useState<string | null>(null);
  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function addInvestment() {
    if (!form.invested_cr || !form.investment_date) { flash('Amount and date are required'); return; }
    const { error } = await supabase.from('investments').insert([{
      client_id:       client.id,
      invested_cr:     parseFloat(form.invested_cr),
      investment_date: form.investment_date,
      units_allotted:  form.units_allotted ? parseFloat(form.units_allotted) : null,
      nav_at_entry:    form.nav_at_entry   ? parseFloat(form.nav_at_entry)   : null,
      status:          form.status,
      notes:           form.notes || null,
    }]);
    error ? flash(`Error: ${error.message}`) : flash('✓ Investment added');
    if (!error) { setAdding(false); setForm({ invested_cr:'', investment_date:'', units_allotted:'', nav_at_entry:'', status:'active', notes:'' }); onRefresh(); }
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('investments').update({ status }).eq('id', id);
    error ? flash(`Error: ${error.message}`) : flash('✓ Updated');
    onRefresh(); setEditId(null);
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.2rem' }}>
        <div style={{ fontSize:'0.88rem', color:'rgba(0,0,0,0.45)' }}>{investments.length} investment tranche{investments.length !== 1 ? 's' : ''}</div>
        <button onClick={() => setAdding(!adding)} style={s.solidBtn}>{adding ? 'Cancel' : '+ Add Investment'}</button>
      </div>

      {adding && (
        <div style={{ ...s.card, padding:'1.6rem', marginBottom:'1.5rem' }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.1rem', fontWeight:600, marginBottom:'1.2rem' }}>New Investment Tranche</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0 1.2rem' }}>
            <AF label="Amount (₹ Cr) *"  value={form.invested_cr}     onChange={v => set('invested_cr', v)}     type="number" placeholder="e.g. 1.00" />
            <AF label="Investment Date *" value={form.investment_date}  onChange={v => set('investment_date', v)}  type="date" />
            <AF label="Units Allotted"    value={form.units_allotted}  onChange={v => set('units_allotted', v)}  type="number" placeholder="e.g. 10000" />
            <AF label="NAV at Entry (₹)"  value={form.nav_at_entry}    onChange={v => set('nav_at_entry', v)}    type="number" placeholder="e.g. 1000.00" />
            <SF label="Status"            value={form.status}          onChange={v => set('status', v)}          options={['active','redeemed','partial']} />
          </div>
          <button onClick={addInvestment} style={s.solidBtn}>Add</button>
        </div>
      )}

      <div style={s.card}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr 0.8fr 60px', padding:'0.8rem 1.6rem', background:'rgba(0,0,0,0.02)', gap:'1rem' }}>
          {['Date', 'Amount', 'Units', 'NAV at Entry', 'Status', ''].map(h => <div key={h} style={s.mono12}>{h}</div>)}
        </div>
        {investments.length === 0
          ? <div style={{ padding:'2.5rem', textAlign:'center', color:'rgba(0,0,0,0.28)', fontSize:'0.85rem' }}>No investments yet.</div>
          : investments.map(inv => (
            <div key={inv.id}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr 0.8fr 60px', padding:'0.9rem 1.6rem', borderTop:'1px solid rgba(0,0,0,0.06)', alignItems:'center', gap:'1rem' }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.75rem' }}>{inv.investment_date}</div>
                <div style={{ fontSize:'0.88rem', fontWeight:500 }}>₹{inv.invested_cr} Cr</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.75rem', color:'rgba(0,0,0,0.45)' }}>{inv.units_allotted?.toLocaleString() || '—'}</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.75rem', color:'rgba(0,0,0,0.45)' }}>{inv.nav_at_entry ? `₹${inv.nav_at_entry}` : '—'}</div>
                <span style={s.badge(inv.status === 'active' ? '#1a7a4a' : inv.status === 'redeemed' ? '#888' : '#b8860b')}>{inv.status}</span>
                <button onClick={() => setEditId(editId === inv.id ? null : inv.id)} style={{ ...s.outlineBtn, padding:'4px 10px', fontSize:'0.55rem' }}>Edit</button>
              </div>
              {editId === inv.id && (
                <div style={{ padding:'1rem 1.6rem', background:'rgba(0,0,0,0.02)', borderTop:'1px solid rgba(0,0,0,0.04)', display:'flex', gap:'0.6rem', alignItems:'center' }}>
                  <span style={s.lbl}>Change status:</span>
                  {['active','redeemed','partial'].map(st => (
                    <button key={st} onClick={() => updateStatus(inv.id, st)} style={{ ...s.outlineBtn, padding:'5px 12px', background: inv.status === st ? '#012956' : 'transparent', color: inv.status === st ? '#F2F0EB' : 'rgba(0,0,0,0.45)' }}>{st}</button>
                  ))}
                </div>
              )}
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ── Statements Tab ───────────────────────────────────────────────────────────
function StatementsTab({ client, statements, flash, onRefresh }: { client: Client; statements: Statement[]; flash: (m: string) => void; onRefresh: () => void }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm]     = useState({ as_of_date:'', units:'', nav:'', current_value_cr:'', invested_cr:'', pnl_cr:'', pnl_pct:'', xirr:'' });
  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function addStatement() {
    if (!form.as_of_date) { flash('Date is required'); return; }
    const { error } = await supabase.from('client_statements').upsert([{
      client_id:        client.id,
      as_of_date:       form.as_of_date,
      units:            form.units           ? parseFloat(form.units)           : null,
      nav:              form.nav             ? parseFloat(form.nav)             : null,
      current_value_cr: form.current_value_cr ? parseFloat(form.current_value_cr) : null,
      invested_cr:      form.invested_cr     ? parseFloat(form.invested_cr)     : null,
      pnl_cr:           form.pnl_cr          ? parseFloat(form.pnl_cr)          : null,
      pnl_pct:          form.pnl_pct         ? parseFloat(form.pnl_pct)         : null,
      xirr:             form.xirr            ? parseFloat(form.xirr)            : null,
    }], { onConflict: 'client_id,as_of_date' });
    error ? flash(`Error: ${error.message}`) : flash('✓ Statement saved');
    if (!error) { setAdding(false); setForm({ as_of_date:'', units:'', nav:'', current_value_cr:'', invested_cr:'', pnl_cr:'', pnl_pct:'', xirr:'' }); onRefresh(); }
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.2rem' }}>
        <div style={{ fontSize:'0.88rem', color:'rgba(0,0,0,0.45)' }}>{statements.length} monthly statement{statements.length !== 1 ? 's' : ''}</div>
        <button onClick={() => setAdding(!adding)} style={s.solidBtn}>{adding ? 'Cancel' : '+ Add / Update Statement'}</button>
      </div>

      {adding && (
        <div style={{ ...s.card, padding:'1.6rem', marginBottom:'1.5rem' }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.1rem', fontWeight:600, marginBottom:'1.2rem' }}>Monthly Snapshot</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0 1.2rem' }}>
            <AF label="As Of Date *"       value={form.as_of_date}       onChange={v => set('as_of_date', v)}       type="date" />
            <AF label="Units"              value={form.units}             onChange={v => set('units', v)}             type="number" placeholder="e.g. 10000" />
            <AF label="NAV (₹)"           value={form.nav}               onChange={v => set('nav', v)}               type="number" placeholder="e.g. 1214.20" />
            <AF label="Current Value (Cr)" value={form.current_value_cr}  onChange={v => set('current_value_cr', v)}  type="number" placeholder="e.g. 1.2142" />
            <AF label="Invested (Cr)"      value={form.invested_cr}       onChange={v => set('invested_cr', v)}       type="number" placeholder="e.g. 1.00" />
            <AF label="P&L (Cr)"          value={form.pnl_cr}            onChange={v => set('pnl_cr', v)}            type="number" />
            <AF label="P&L %"             value={form.pnl_pct}           onChange={v => set('pnl_pct', v)}           type="number" />
            <AF label="XIRR %"            value={form.xirr}              onChange={v => set('xirr', v)}              type="number" />
          </div>
          <button onClick={addStatement} style={s.solidBtn}>Save</button>
        </div>
      )}

      <div style={s.card}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr 1fr', padding:'0.8rem 1.6rem', background:'rgba(0,0,0,0.02)', gap:'1rem' }}>
          {['Month', 'NAV', 'Units', 'Value', 'Invested', 'P&L %'].map(h => <div key={h} style={s.mono12}>{h}</div>)}
        </div>
        {statements.length === 0
          ? <div style={{ padding:'2.5rem', textAlign:'center', color:'rgba(0,0,0,0.28)', fontSize:'0.85rem' }}>No statements yet.</div>
          : statements.map(st => (
            <div key={st.id} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr 1fr', padding:'0.9rem 1.6rem', borderTop:'1px solid rgba(0,0,0,0.06)', alignItems:'center', gap:'1rem' }}>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.75rem' }}>{st.as_of_date}</div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.78rem' }}>₹{st.nav?.toFixed(2) || '—'}</div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.75rem', color:'rgba(0,0,0,0.45)' }}>{st.units?.toLocaleString() || '—'}</div>
              <div style={{ fontSize:'0.85rem', fontWeight:500 }}>₹{st.current_value_cr?.toFixed(4) || '—'} Cr</div>
              <div style={{ fontSize:'0.82rem', color:'rgba(0,0,0,0.5)' }}>₹{st.invested_cr?.toFixed(2) || '—'} Cr</div>
              <span style={{ fontSize:'0.85rem', fontWeight:500, color: (st.pnl_pct || 0) >= 0 ? '#1a7a4a' : '#c0392b' }}>{st.pnl_pct != null ? `${st.pnl_pct >= 0 ? '+' : ''}${st.pnl_pct.toFixed(2)}%` : '—'}</span>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ── Security Tab ─────────────────────────────────────────────────────────────
function SecurityTab({ client, flash }: { client: Client; flash: (m: string) => void }) {
  const [newPw, setNewPw]   = useState('');
  const [loading, setLoading] = useState(false);

  async function setPw() {
    if (!newPw || newPw.length < 8)  { flash('Password must be at least 8 characters'); return; }
    if (newPw.length > 128)          { flash('Password too long'); return; }
    if (!client.user_id)             { flash('No auth account linked to this client'); return; }
    setLoading(true);
    try {
      await changePassword(client.user_id, newPw);
      flash(`✓ Password updated for ${client.email}`);
      setNewPw('');
    } catch (e: any) { flash(`Error: ${e.message}`); }
    setLoading(false);
  }

  async function deleteClient() {
    if (!confirm(`Permanently delete "${client.full_name}" and all their data? This cannot be undone.`)) return;
    try {
      if (client.user_id) await deleteAuthUser(client.user_id);
      else await supabase.from('clients').delete().eq('id', client.id);
      flash('✓ Client deleted');
    } catch (e: any) { flash(`Error: ${e.message}`); }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem', maxWidth:500 }}>
      <div style={{ ...s.card, padding:'1.8rem' }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.1rem', fontWeight:600, marginBottom:'0.4rem' }}>Change Password</div>
        <div style={{ fontSize:'0.78rem', color:'rgba(0,0,0,0.38)', marginBottom:'1.4rem' }}>Set a new password for {client.email}. No email is sent. Share the new password with the client directly.</div>
        <AF label="New Password" value={newPw} onChange={setNewPw} type="password" placeholder="Min 8 characters" />
        <button onClick={setPw} disabled={loading} style={{ ...s.solidBtn, opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Updating…' : 'Set Password'}
        </button>
      </div>

      <div style={{ ...s.card, padding:'1.8rem', border:'1px solid rgba(192,57,43,0.2)' }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.1rem', fontWeight:600, marginBottom:'0.4rem', color:'#c0392b' }}>Danger Zone</div>
        <div style={{ fontSize:'0.78rem', color:'rgba(0,0,0,0.38)', marginBottom:'1.4rem' }}>Deletes the login account and all client data including investments and statements. Irreversible.</div>
        <button onClick={deleteClient} style={s.dangerBtn}>Delete Client</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: FUND DATA (NAV + Holdings)
// ══════════════════════════════════════════════════════════════════════════════
function FundDataPage({ navData, flash, onRefresh }: { navData: NavRow[]; flash: (m: string) => void; onRefresh: () => void }) {
  const [fundTab, setFundTab] = useState<'nav'|'holdings'>('nav');
  const [form, setForm]       = useState({ date:'', nav:'', aum_cr:'' });
  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function addNav() {
    if (!form.date || !form.nav) { flash('Date and NAV are required'); return; }
    const { error } = await supabase.from('nav_data').upsert([{ date: form.date, nav: parseFloat(form.nav), aum_cr: form.aum_cr ? parseFloat(form.aum_cr) : null }], { onConflict: 'date' });
    error ? flash(`Error: ${error.message}`) : flash('✓ NAV saved');
    if (!error) { setForm({ date:'', nav:'', aum_cr:'' }); onRefresh(); }
  }

  return (
    <div>
      <PageHeader title="Fund Data" subtitle="Manage fund-level NAV and portfolio holdings. This data is visible to all investors." />
      <div style={{ display:'flex', gap:4, marginBottom:'1.5rem', background:'rgba(0,0,0,0.04)', borderRadius:100, padding:4, width:'fit-content' }}>
        {(['nav','holdings'] as const).map(t => (
          <button key={t} onClick={() => setFundTab(t)}
            style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', letterSpacing:'0.1em', textTransform:'uppercase', padding:'8px 20px', borderRadius:100, border:'none', cursor:'pointer', background: fundTab === t ? '#fff' : 'transparent', color: fundTab === t ? '#012956' : 'rgba(0,0,0,0.4)', boxShadow: fundTab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition:'all 0.2s' }}>
            {t === 'nav' ? 'NAV History' : 'Portfolio Holdings'}
          </button>
        ))}
      </div>

      {fundTab === 'nav' && (
        <div style={{ display:'grid', gridTemplateColumns:'380px 1fr', gap:'1.5rem', alignItems:'start' }}>
          <div style={{ ...s.card, padding:'1.6rem' }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.1rem', fontWeight:600, marginBottom:'1.2rem' }}>Add / Update NAV</div>
            <AF label="Date *"      value={form.date}   onChange={v => set('date', v)}   type="date" />
            <AF label="NAV (₹) *"  value={form.nav}    onChange={v => set('nav', v)}    type="number" placeholder="e.g. 1214.20" />
            <AF label="AUM (₹ Cr)" value={form.aum_cr} onChange={v => set('aum_cr', v)} type="number" placeholder="Optional" />
            <button onClick={addNav} style={s.solidBtn}>Save NAV</button>
          </div>
          <div style={s.card}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', padding:'0.8rem 1.6rem', background:'rgba(0,0,0,0.02)' }}>
              {['Date', 'NAV', 'AUM'].map(h => <div key={h} style={s.mono12}>{h}</div>)}
            </div>
            {navData.length === 0
              ? <div style={{ padding:'2rem', textAlign:'center', color:'rgba(0,0,0,0.28)', fontSize:'0.85rem' }}>No NAV data yet.</div>
              : navData.map(n => (
                <div key={n.id} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', padding:'0.9rem 1.6rem', borderTop:'1px solid rgba(0,0,0,0.06)', alignItems:'center' }}>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.75rem' }}>{n.date}</div>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.85rem', fontWeight:500, color:'#012956' }}>₹{n.nav.toFixed(2)}</div>
                  <div style={{ fontSize:'0.8rem', color:'rgba(0,0,0,0.45)' }}>{n.aum_cr ? `₹${n.aum_cr} Cr` : '—'}</div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {fundTab === 'holdings' && (
        <div style={s.card}>
          <div style={{ padding:'1.2rem 1.6rem', borderBottom:'1px solid rgba(0,0,0,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={s.mono12}>Portfolio Holdings — as of {HOLDINGS.length > 0 ? '30 Jun 2025' : '—'}</div>
            <span style={{ fontSize:'0.78rem', color:'rgba(0,0,0,0.38)' }}>Loaded from mockData.ts · {HOLDINGS.length} stocks</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr 0.6fr 1fr 1fr 0.8fr', padding:'0.8rem 1.6rem', background:'rgba(0,0,0,0.02)', gap:'1rem' }}>
            {['Stock', 'Sector', 'Weight', 'Avg Cost', 'CMP', 'P&L %'].map(h => <div key={h} style={s.mono12}>{h}</div>)}
          </div>
          {HOLDINGS.map(h => (
            <div key={h.stock_name} style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr 0.6fr 1fr 1fr 0.8fr', padding:'0.85rem 1.6rem', borderTop:'1px solid rgba(0,0,0,0.06)', alignItems:'center', gap:'1rem' }}>
              <div style={{ fontSize:'0.85rem', fontWeight:500 }}>{h.stock_name}</div>
              <div style={{ fontSize:'0.78rem', color:'rgba(0,0,0,0.5)' }}>{h.sector}</div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.75rem' }}>{h.weight_pct}%</div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.75rem', color:'rgba(0,0,0,0.45)' }}>₹{h.avg_cost.toLocaleString()}</div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.75rem' }}>₹{h.cmp.toLocaleString()}</div>
              <span style={{ fontSize:'0.82rem', fontWeight:500, color: h.pnl_pct >= 0 ? '#1a7a4a' : '#c0392b' }}>+{h.pnl_pct}%</span>
            </div>
          ))}
          <div style={{ padding:'1rem 1.6rem', borderTop:'1px solid rgba(0,0,0,0.06)', display:'flex', gap:'2rem' }}>
            {SECTOR_ALLOCATION.map(sa => (
              <div key={sa.sector} style={{ display:'flex', gap:6, alignItems:'center' }}>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.55rem', color:'rgba(0,0,0,0.38)' }}>{sa.sector}</span>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.65rem', fontWeight:500, color:'#012956' }}>{sa.weight_pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared ───────────────────────────────────────────────────────────────────
function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom:'2rem' }}>
      <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.9rem', fontWeight:600, color:'#0D0D0D', margin:0, lineHeight:1.2 }}>{title}</h1>
      {subtitle && <p style={{ fontSize:'0.82rem', color:'rgba(0,0,0,0.4)', margin:'0.4rem 0 0' }}>{subtitle}</p>}
    </div>
  );
}
