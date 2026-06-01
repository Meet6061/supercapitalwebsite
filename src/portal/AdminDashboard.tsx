import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Lead, Investor } from '../lib/supabase';
import logoSrc from '../components/logo.png';

interface Props { session: Session; }

type AdminTab = 'leads'|'investors'|'nav'|'holdings';

export default function AdminDashboard({ session: _session }: Props) {
  const [tab, setTab] = useState<AdminTab>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);

  useEffect(() => { loadLeads(); loadInvestors(); }, []);

  async function loadLeads() {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    setLeads(data || []);
  }
  async function loadInvestors() {
    const { data } = await supabase.from('investors').select('*').order('created_at', { ascending: false });
    setInvestors(data || []);
  }
  async function updateLeadStatus(id: string, status: string) {
    await supabase.from('leads').update({ status }).eq('id', id);
    loadLeads();
  }

  const statusColor: Record<string,string> = { new:'#012956', contacted:'#b8860b', converted:'#1a7a4a', rejected:'#c0392b' };

  return (
    <div style={{ minHeight:'100vh', background:'#F2F0EB', fontFamily:"'Bricolage Grotesque',sans-serif" }}>

      {/* Header */}
      <header style={{ background:'rgba(242,240,235,0.95)',backdropFilter:'blur(18px)',borderBottom:'1px solid rgba(0,0,0,0.09)',position:'sticky',top:0,zIndex:100 }}>
        <div style={{ maxWidth:1200,margin:'0 auto',padding:'0 5vw',height:64,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div style={{ display:'flex',alignItems:'center',gap:'1.2rem' }}>
            <img src={logoSrc} alt="Super Capital" style={{ height:44,mixBlendMode:'multiply' }} />
            <span style={{ fontFamily:"'DM Mono',monospace",fontSize:'0.6rem',letterSpacing:'0.18em',textTransform:'uppercase',color:'rgba(1,41,86,0.55)',background:'rgba(1,41,86,0.08)',padding:'4px 10px',borderRadius:100 }}>Admin</span>
          </div>
          <button onClick={() => supabase.auth.signOut()}
            style={{ fontFamily:"'DM Mono',monospace",fontSize:'0.65rem',letterSpacing:'0.1em',textTransform:'uppercase',background:'none',border:'1px solid rgba(0,0,0,0.2)',borderRadius:100,padding:'6px 16px',cursor:'pointer',color:'rgba(0,0,0,0.5)' }}>
            Sign Out
          </button>
        </div>
      </header>

      <main style={{ maxWidth:1200, margin:'0 auto', padding:'2.5rem 5vw' }}>

        {/* Summary KPIs */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:'2.5rem' }}>
          {[
            { label:'Total Leads', value: leads.length },
            { label:'New Leads', value: leads.filter(l=>l.status==='new').length },
            { label:'Converted', value: leads.filter(l=>l.status==='converted').length },
            { label:'Active Investors', value: investors.filter(i=>i.status==='active').length },
          ].map(k => (
            <div key={k.label} style={{ background:'#fff',border:'1px solid rgba(0,0,0,0.09)',borderRadius:14,padding:'1.3rem 1.5rem' }}>
              <div style={{ fontFamily:"'DM Mono',monospace",fontSize:'0.58rem',letterSpacing:'0.16em',textTransform:'uppercase',color:'rgba(0,0,0,0.35)',marginBottom:'0.5rem' }}>{k.label}</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'2rem',fontWeight:600,color:'#012956',lineHeight:1 }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex',gap:4,marginBottom:'2rem',background:'rgba(0,0,0,0.04)',borderRadius:100,padding:4,width:'fit-content' }}>
          {(['leads','investors','nav','holdings'] as AdminTab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ fontFamily:"'DM Mono',monospace",fontSize:'0.62rem',letterSpacing:'0.12em',textTransform:'uppercase',padding:'8px 18px',borderRadius:100,border:'none',cursor:'pointer',background:tab===t?'#fff':'transparent',color:tab===t?'#012956':'rgba(0,0,0,0.4)',boxShadow:tab===t?'0 1px 4px rgba(0,0,0,0.08)':'none',transition:'all 0.2s' }}>
              {t}
            </button>
          ))}
        </div>

        {/* Leads Tab */}
        {tab === 'leads' && (
          <div style={{ background:'#fff',border:'1px solid rgba(0,0,0,0.09)',borderRadius:16,overflow:'hidden' }}>
            <div style={{ padding:'1.4rem 1.8rem',borderBottom:'1px solid rgba(0,0,0,0.06)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'1.2rem',fontWeight:600 }}>Investor Inquiries</div>
              <div style={{ fontSize:'0.78rem',color:'rgba(0,0,0,0.4)' }}>{leads.length} total</div>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%',borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'rgba(0,0,0,0.02)' }}>
                    {['Date','Name','Email','Mobile','Type','Allocation','Status','Action'].map(h => (
                      <th key={h} style={{ padding:'0.8rem 1rem',textAlign:'left',fontFamily:"'DM Mono',monospace",fontSize:'0.55rem',letterSpacing:'0.14em',textTransform:'uppercase',color:'rgba(0,0,0,0.4)',fontWeight:400,whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => (
                    <tr key={lead.id} style={{ borderTop:'1px solid rgba(0,0,0,0.05)' }}>
                      <td style={{ padding:'1rem',fontSize:'0.78rem',color:'rgba(0,0,0,0.4)',whiteSpace:'nowrap' }}>
                        {lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td style={{ padding:'1rem',fontSize:'0.88rem',fontWeight:500,whiteSpace:'nowrap' }}>{lead.full_name}</td>
                      <td style={{ padding:'1rem',fontSize:'0.82rem',color:'rgba(0,0,0,0.6)' }}>{lead.email}</td>
                      <td style={{ padding:'1rem',fontSize:'0.82rem',color:'rgba(0,0,0,0.6)',whiteSpace:'nowrap' }}>{lead.mobile || '—'}</td>
                      <td style={{ padding:'1rem',fontSize:'0.78rem',color:'rgba(0,0,0,0.5)',whiteSpace:'nowrap' }}>{lead.investor_type || '—'}</td>
                      <td style={{ padding:'1rem',fontSize:'0.82rem',whiteSpace:'nowrap' }}>{lead.allocation || '—'}</td>
                      <td style={{ padding:'1rem' }}>
                        <span style={{ fontFamily:"'DM Mono',monospace",fontSize:'0.6rem',letterSpacing:'0.12em',textTransform:'uppercase',padding:'3px 10px',borderRadius:100,background:`${statusColor[lead.status||'new']}18`,color:statusColor[lead.status||'new'] }}>
                          {lead.status || 'new'}
                        </span>
                      </td>
                      <td style={{ padding:'1rem' }}>
                        <select value={lead.status || 'new'}
                          onChange={e => updateLeadStatus(lead.id!, e.target.value)}
                          style={{ fontFamily:"'DM Mono',monospace",fontSize:'0.6rem',letterSpacing:'0.1em',textTransform:'uppercase',border:'1px solid rgba(0,0,0,0.15)',borderRadius:8,padding:'4px 8px',background:'transparent',cursor:'pointer',color:'rgba(0,0,0,0.6)' }}>
                          {['new','contacted','converted','rejected'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Investors Tab */}
        {tab === 'investors' && (
          <div style={{ background:'#fff',border:'1px solid rgba(0,0,0,0.09)',borderRadius:16,overflow:'hidden' }}>
            <div style={{ padding:'1.4rem 1.8rem',borderBottom:'1px solid rgba(0,0,0,0.06)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'1.2rem',fontWeight:600 }}>Registered Investors</div>
              <div style={{ fontSize:'0.75rem',color:'rgba(0,0,0,0.4)' }}>Manage from Supabase Auth for user creation</div>
            </div>
            <table style={{ width:'100%',borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'rgba(0,0,0,0.02)' }}>
                  {['Name','Email','Folio','Category','Commitment','Drawn','Status','Joined'].map(h => (
                    <th key={h} style={{ padding:'0.8rem 1rem',textAlign:'left',fontFamily:"'DM Mono',monospace",fontSize:'0.55rem',letterSpacing:'0.14em',textTransform:'uppercase',color:'rgba(0,0,0,0.4)',fontWeight:400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {investors.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding:'3rem',textAlign:'center',color:'rgba(0,0,0,0.3)',fontSize:'0.85rem' }}>No investors yet.</td></tr>
                ) : investors.map(inv => (
                  <tr key={inv.id} style={{ borderTop:'1px solid rgba(0,0,0,0.05)' }}>
                    <td style={{ padding:'1rem',fontSize:'0.88rem',fontWeight:500 }}>{inv.full_name}</td>
                    <td style={{ padding:'1rem',fontSize:'0.82rem',color:'rgba(0,0,0,0.6)' }}>{inv.email}</td>
                    <td style={{ padding:'1rem',fontSize:'0.8rem',fontFamily:"'DM Mono',monospace" }}>{inv.folio_number || '—'}</td>
                    <td style={{ padding:'1rem',fontSize:'0.8rem',color:'rgba(0,0,0,0.5)' }}>{inv.category}</td>
                    <td style={{ padding:'1rem',fontSize:'0.85rem' }}>{inv.commitment_cr ? `₹${inv.commitment_cr} Cr` : '—'}</td>
                    <td style={{ padding:'1rem',fontSize:'0.85rem' }}>{inv.drawdown_cr ? `₹${inv.drawdown_cr} Cr` : '—'}</td>
                    <td style={{ padding:'1rem' }}>
                      <span style={{ fontFamily:"'DM Mono',monospace",fontSize:'0.6rem',textTransform:'uppercase',padding:'3px 10px',borderRadius:100,background:inv.status==='active'?'rgba(26,122,74,0.1)':'rgba(0,0,0,0.06)',color:inv.status==='active'?'#1a7a4a':'rgba(0,0,0,0.4)' }}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ padding:'1rem',fontSize:'0.8rem',color:'rgba(0,0,0,0.4)' }}>{inv.joined_date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* NAV Upload Tab */}
        {tab === 'nav' && <NavUploadPanel />}

        {/* Holdings Upload Tab */}
        {tab === 'holdings' && <HoldingsUploadPanel />}
      </main>
    </div>
  );
}

function NavUploadPanel() {
  const [date, setDate] = useState('');
  const [nav, setNav] = useState('');
  const [aum, setAum] = useState('');
  const [status, setStatus] = useState('');

  async function submit() {
    if (!date || !nav) return;
    const { error } = await supabase.from('nav_data').insert([{ date, nav: parseFloat(nav), aum_cr: aum ? parseFloat(aum) : null, uploaded_by: 'admin' }]);
    setStatus(error ? `Error: ${error.message}` : '✓ NAV uploaded successfully');
    if (!error) { setDate(''); setNav(''); setAum(''); }
  }

  return (
    <div style={{ background:'#fff',border:'1px solid rgba(0,0,0,0.09)',borderRadius:16,padding:'2rem',maxWidth:480 }}>
      <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'1.2rem',fontWeight:600,marginBottom:'1.5rem' }}>Upload NAV</div>
      <AdminField label="Date" type="date" value={date} onChange={setDate} />
      <AdminField label="NAV (₹)" type="number" value={nav} onChange={setNav} placeholder="e.g. 1024.50" />
      <AdminField label="AUM (₹ Cr)" type="number" value={aum} onChange={setAum} placeholder="Optional" />
      {status && <div style={{ fontSize:'0.82rem',marginBottom:'1rem',color:status.startsWith('✓')?'#1a7a4a':'#c0392b' }}>{status}</div>}
      <button onClick={submit} style={adminBtn}>Upload NAV</button>
    </div>
  );
}

function HoldingsUploadPanel() {
  return (
    <div style={{ background:'#fff',border:'1px solid rgba(0,0,0,0.09)',borderRadius:16,padding:'2rem',maxWidth:600 }}>
      <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'1.2rem',fontWeight:600,marginBottom:'1rem' }}>Upload Holdings</div>
      <div style={{ fontSize:'0.85rem',color:'rgba(0,0,0,0.5)',lineHeight:1.7,marginBottom:'1.5rem' }}>
        Upload holdings directly via Supabase dashboard → Table Editor → holdings table.<br/>
        Or use the Supabase CSV import feature for bulk uploads.<br/><br/>
        <strong>Required columns:</strong> as_of_date, stock_name, isin, sector, weight_pct, avg_cost, cmp, pnl_pct
      </div>
      <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer"
        style={{ ...adminBtn as React.CSSProperties, display:'inline-block', textDecoration:'none', textAlign:'center' }}>
        Open Supabase Dashboard
      </a>
    </div>
  );
}

function AdminField({ label,type,value,onChange,placeholder }:{ label:string;type:string;value:string;onChange:(v:string)=>void;placeholder?:string }) {
  return (
    <div style={{ marginBottom:'1rem' }}>
      <label style={{ fontFamily:"'DM Mono',monospace",fontSize:'0.58rem',letterSpacing:'0.16em',textTransform:'uppercase',color:'rgba(0,0,0,0.4)',marginBottom:6,display:'block' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width:'100%',background:'#F2F0EB',border:'1px solid rgba(0,0,0,0.12)',borderRadius:10,padding:'10px 14px',fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:'0.9rem',color:'#0D0D0D',outline:'none',boxSizing:'border-box' as const }} />
    </div>
  );
}

const adminBtn: React.CSSProperties = { fontFamily:"'DM Mono',monospace",fontSize:'0.7rem',letterSpacing:'0.12em',textTransform:'uppercase',padding:'12px 24px',borderRadius:100,background:'#012956',color:'#F2F0EB',border:'none',cursor:'pointer' };
