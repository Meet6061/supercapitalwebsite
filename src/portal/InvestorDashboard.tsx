import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Investor, NavData, Holding, InvestorStatement } from '../lib/supabase';
import logoSrc from '../components/logo.png';

interface Props { session: Session; onBack: () => void; }

export default function InvestorDashboard({ session, onBack }: Props) {
  const [investor, setInvestor]   = useState<Investor | null>(null);
  const [statements, setStatements] = useState<InvestorStatement[]>([]);
  const [holdings, setHoldings]   = useState<Holding[]>([]);
  const [nav, setNav]             = useState<NavData[]>([]);
  const [tab, setTab]             = useState<'overview'|'holdings'|'statements'>('overview');

  useEffect(() => {
    async function load() {
      const { data: inv } = await supabase.from('investors').select('*').eq('user_id', session.user.id).single();
      if (inv) {
        setInvestor(inv);
        const { data: s } = await supabase.from('investor_statements').select('*').eq('investor_id', inv.id).order('as_of_date', { ascending: false });
        setStatements(s || []);
      }
      const { data: h } = await supabase.from('holdings').select('*').order('weight_pct', { ascending: false });
      setHoldings(h || []);
      const { data: n } = await supabase.from('nav_data').select('*').order('date', { ascending: false }).limit(12);
      setNav(n || []);
    }
    load();
  }, [session]);

  const latest    = statements[0];
  const latestNav = nav[0];

  function signOut() { supabase.auth.signOut(); onBack(); }

  return (
    <div style={{ minHeight:'100vh', background:'#F2F0EB', fontFamily:"'Bricolage Grotesque',sans-serif" }}>

      {/* Header */}
      <header style={{ background:'rgba(242,240,235,0.95)', backdropFilter:'blur(18px)', borderBottom:'1px solid rgba(0,0,0,0.09)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 5vw', height:64, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'1.5rem' }}>
            <img src={logoSrc} alt="Super Capital" style={{ height:44, mixBlendMode:'multiply' }} />
            <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(0,0,0,0.35)' }}>← Site</button>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <span style={{ fontSize:'0.8rem', color:'rgba(0,0,0,0.4)' }}>{session.user.email}</span>
            <button onClick={signOut} style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.62rem', letterSpacing:'0.1em', textTransform:'uppercase', background:'none', border:'1px solid rgba(0,0,0,0.18)', borderRadius:100, padding:'6px 16px', cursor:'pointer', color:'rgba(0,0,0,0.45)' }}>Sign Out</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth:1100, margin:'0 auto', padding:'2.5rem 5vw' }}>

        {/* Welcome */}
        <div style={{ marginBottom:'2rem' }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.62rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(1,41,86,0.45)', marginBottom:'0.4rem' }}>Investor Portal</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'2rem', fontWeight:600, color:'#0D0D0D', letterSpacing:'-0.02em' }}>
            Welcome{investor?.full_name ? `, ${investor.full_name}` : ''}
          </div>
          {investor?.folio_number && <div style={{ fontSize:'0.78rem', color:'rgba(0,0,0,0.35)', marginTop:'0.3rem' }}>Folio: {investor.folio_number}</div>}
        </div>

        {/* KPI cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:14, marginBottom:'2.5rem' }}>
          {[
            { label:'Current Value',  value: latest?.value_cr    ? `₹${latest.value_cr.toFixed(2)} Cr`    : '—' },
            { label:'Invested',       value: latest?.invested_cr ? `₹${latest.invested_cr.toFixed(2)} Cr` : '—' },
            { label:'P&L',            value: latest?.pnl_pct     ? `${latest.pnl_pct > 0 ? '+' : ''}${latest.pnl_pct.toFixed(2)}%` : '—' },
            { label:'Current NAV',    value: latestNav?.nav      ? `₹${latestNav.nav.toFixed(2)}`          : '—' },
          ].map(k => (
            <div key={k.label} style={{ background:'#fff', border:'1px solid rgba(0,0,0,0.09)', borderRadius:14, padding:'1.4rem' }}>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.55rem', letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(0,0,0,0.38)', marginBottom:'0.6rem' }}>{k.label}</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.7rem', fontWeight:600, color:'#012956', lineHeight:1 }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:'1.8rem', background:'rgba(0,0,0,0.04)', borderRadius:100, padding:4, width:'fit-content' }}>
          {(['overview','holdings','statements'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', letterSpacing:'0.12em', textTransform:'uppercase', padding:'8px 18px', borderRadius:100, border:'none', cursor:'pointer', background:tab===t?'#fff':'transparent', color:tab===t?'#012956':'rgba(0,0,0,0.4)', boxShadow:tab===t?'0 1px 4px rgba(0,0,0,0.08)':'none', transition:'all 0.2s' }}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div style={{ background:'#fff', border:'1px solid rgba(0,0,0,0.09)', borderRadius:16, padding:'2rem' }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.15rem', fontWeight:600, marginBottom:'1.2rem' }}>Fund Details</div>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <tbody>
                {[
                  ['Fund','Super Performance Series I'],
                  ['Category','SEBI Category III AIF'],
                  ['Commitment', investor?.commitment_cr ? `₹${investor.commitment_cr} Cr` : '—'],
                  ['Amount Drawn', investor?.drawdown_cr ? `₹${investor.drawdown_cr} Cr` : '—'],
                  ['Joined', investor?.joined_date || '—'],
                  ['Status', investor?.status || 'Active'],
                ].map(([k,v]) => (
                  <tr key={k} style={{ borderBottom:'1px solid rgba(0,0,0,0.05)' }}>
                    <td style={{ padding:'0.8rem 0', fontSize:'0.82rem', color:'rgba(0,0,0,0.38)', width:'38%' }}>{k}</td>
                    <td style={{ padding:'0.8rem 0', fontSize:'0.85rem', color:'#0D0D0D' }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Holdings */}
        {tab === 'holdings' && (
          <div style={{ background:'#fff', border:'1px solid rgba(0,0,0,0.09)', borderRadius:16, overflow:'hidden' }}>
            <div style={{ padding:'1.4rem 1.8rem', borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.15rem', fontWeight:600 }}>Portfolio Holdings</div>
              {holdings[0] && <div style={{ fontSize:'0.75rem', color:'rgba(0,0,0,0.35)', marginTop:2 }}>As of {holdings[0].as_of_date}</div>}
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr style={{ background:'rgba(0,0,0,0.02)' }}>
                  {['Stock','Sector','Weight','CMP','Avg Cost','P&L'].map(h => (
                    <th key={h} style={{ padding:'0.8rem 1.2rem', textAlign:'left', fontFamily:"'DM Mono',monospace", fontSize:'0.55rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(0,0,0,0.38)', fontWeight:400 }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {holdings.length === 0
                    ? <tr><td colSpan={6} style={{ padding:'3rem', textAlign:'center', color:'rgba(0,0,0,0.28)', fontSize:'0.85rem' }}>No holdings uploaded yet.</td></tr>
                    : holdings.map(h => (
                      <tr key={h.id} style={{ borderTop:'1px solid rgba(0,0,0,0.05)' }}>
                        <td style={{ padding:'0.9rem 1.2rem', fontSize:'0.88rem', fontWeight:500 }}>{h.stock_name}</td>
                        <td style={{ padding:'0.9rem 1.2rem', fontSize:'0.8rem', color:'rgba(0,0,0,0.45)' }}>{h.sector || '—'}</td>
                        <td style={{ padding:'0.9rem 1.2rem', fontSize:'0.85rem' }}>{h.weight_pct ? `${h.weight_pct}%` : '—'}</td>
                        <td style={{ padding:'0.9rem 1.2rem', fontSize:'0.85rem' }}>{h.cmp ? `₹${h.cmp}` : '—'}</td>
                        <td style={{ padding:'0.9rem 1.2rem', fontSize:'0.85rem' }}>{h.avg_cost ? `₹${h.avg_cost}` : '—'}</td>
                        <td style={{ padding:'0.9rem 1.2rem', fontSize:'0.85rem', fontWeight:500, color: h.pnl_pct && h.pnl_pct >= 0 ? '#1a7a4a' : '#c0392b' }}>
                          {h.pnl_pct ? `${h.pnl_pct > 0 ? '+' : ''}${h.pnl_pct}%` : '—'}
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Statements */}
        {tab === 'statements' && (
          <div style={{ background:'#fff', border:'1px solid rgba(0,0,0,0.09)', borderRadius:16, overflow:'hidden' }}>
            <div style={{ padding:'1.4rem 1.8rem', borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.15rem', fontWeight:600 }}>Monthly Statements</div>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr style={{ background:'rgba(0,0,0,0.02)' }}>
                  {['Date','Units','NAV','Value','Invested','P&L','Return'].map(h => (
                    <th key={h} style={{ padding:'0.8rem 1.2rem', textAlign:'left', fontFamily:"'DM Mono',monospace", fontSize:'0.55rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(0,0,0,0.38)', fontWeight:400 }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {statements.length === 0
                    ? <tr><td colSpan={7} style={{ padding:'3rem', textAlign:'center', color:'rgba(0,0,0,0.28)', fontSize:'0.85rem' }}>No statements uploaded yet.</td></tr>
                    : statements.map(s => (
                      <tr key={s.id} style={{ borderTop:'1px solid rgba(0,0,0,0.05)' }}>
                        <td style={{ padding:'0.9rem 1.2rem', fontSize:'0.85rem', fontWeight:500 }}>{s.as_of_date}</td>
                        <td style={{ padding:'0.9rem 1.2rem', fontSize:'0.82rem', color:'rgba(0,0,0,0.5)' }}>{s.units?.toFixed(4) || '—'}</td>
                        <td style={{ padding:'0.9rem 1.2rem', fontSize:'0.85rem' }}>{s.nav ? `₹${s.nav}` : '—'}</td>
                        <td style={{ padding:'0.9rem 1.2rem', fontSize:'0.85rem', fontWeight:500 }}>{s.value_cr ? `₹${s.value_cr.toFixed(4)} Cr` : '—'}</td>
                        <td style={{ padding:'0.9rem 1.2rem', fontSize:'0.85rem' }}>{s.invested_cr ? `₹${s.invested_cr} Cr` : '—'}</td>
                        <td style={{ padding:'0.9rem 1.2rem', fontSize:'0.85rem' }}>{s.pnl_cr ? `₹${s.pnl_cr.toFixed(4)} Cr` : '—'}</td>
                        <td style={{ padding:'0.9rem 1.2rem', fontSize:'0.85rem', fontWeight:500, color: s.pnl_pct && s.pnl_pct >= 0 ? '#1a7a4a' : '#c0392b' }}>
                          {s.pnl_pct ? `${s.pnl_pct > 0 ? '+' : ''}${s.pnl_pct.toFixed(2)}%` : '—'}
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
