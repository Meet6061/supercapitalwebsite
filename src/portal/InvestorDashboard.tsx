import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Investor, NavData, Holding, InvestorStatement } from '../lib/supabase';
import logoSrc from '../components/logo.png';

interface Props { session: Session; }

export default function InvestorDashboard({ session }: Props) {
  const [investor, setInvestor] = useState<Investor | null>(null);
  const [statements, setStatements] = useState<InvestorStatement[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [nav, setNav] = useState<NavData[]>([]);
  const [tab, setTab] = useState<'overview'|'holdings'|'statements'>('overview');

  useEffect(() => {
    async function load() {
      const { data: inv } = await supabase.from('investors')
        .select('*').eq('user_id', session.user.id).single();
      if (inv) {
        setInvestor(inv);
        const { data: stmts } = await supabase.from('investor_statements')
          .select('*').eq('investor_id', inv.id).order('as_of_date', { ascending: false });
        setStatements(stmts || []);
      }
      const { data: h } = await supabase.from('holdings')
        .select('*').order('weight_pct', { ascending: false });
      setHoldings(h || []);
      const { data: n } = await supabase.from('nav_data')
        .select('*').order('date', { ascending: false }).limit(12);
      setNav(n || []);
    }
    load();
  }, [session]);

  const latest = statements[0];
  const latestNav = nav[0];

  return (
    <div style={{ minHeight:'100vh', background:'#F2F0EB', fontFamily:"'Bricolage Grotesque',sans-serif" }}>

      {/* Header */}
      <header style={{ background:'rgba(242,240,235,0.95)',backdropFilter:'blur(18px)',borderBottom:'1px solid rgba(0,0,0,0.09)',position:'sticky',top:0,zIndex:100 }}>
        <div style={{ maxWidth:1100,margin:'0 auto',padding:'0 5vw',height:64,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <img src={logoSrc} alt="Super Capital" style={{ height:48,mixBlendMode:'multiply' }} />
          <div style={{ display:'flex',alignItems:'center',gap:'1.5rem' }}>
            <span style={{ fontSize:'0.82rem',color:'rgba(0,0,0,0.45)' }}>{session.user.email}</span>
            <button onClick={() => supabase.auth.signOut()}
              style={{ fontFamily:"'DM Mono',monospace",fontSize:'0.65rem',letterSpacing:'0.1em',textTransform:'uppercase',background:'none',border:'1px solid rgba(0,0,0,0.2)',borderRadius:100,padding:'6px 16px',cursor:'pointer',color:'rgba(0,0,0,0.5)' }}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth:1100, margin:'0 auto', padding:'2.5rem 5vw' }}>

        {/* Welcome */}
        <div style={{ marginBottom:'2.5rem' }}>
          <div style={{ fontFamily:"'DM Mono',monospace",fontSize:'0.62rem',letterSpacing:'0.22em',textTransform:'uppercase',color:'rgba(1,41,86,0.5)',marginBottom:'0.4rem' }}>
            Investor Portal
          </div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'2rem',fontWeight:600,color:'#0D0D0D',letterSpacing:'-0.02em' }}>
            Welcome, {investor?.full_name || session.user.email}
          </div>
          {investor?.folio_number && (
            <div style={{ fontSize:'0.8rem',color:'rgba(0,0,0,0.4)',marginTop:'0.3rem' }}>
              Folio: {investor.folio_number} · {investor.category}
            </div>
          )}
        </div>

        {/* KPI Cards */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:'2.5rem' }}>
          {[
            { label:'Current Value', value: latest?.value_cr ? `₹${latest.value_cr.toFixed(2)} Cr` : '—', sub:'As of latest statement' },
            { label:'Invested', value: latest?.invested_cr ? `₹${latest.invested_cr.toFixed(2)} Cr` : '—', sub:'Total capital deployed' },
            { label:'P&L', value: latest?.pnl_cr ? `₹${latest.pnl_cr.toFixed(2)} Cr` : '—', sub: latest?.pnl_pct ? `${latest.pnl_pct > 0 ? '+' : ''}${latest.pnl_pct.toFixed(2)}%` : '' },
            { label:'NAV', value: latestNav?.nav ? `₹${latestNav.nav.toFixed(2)}` : '—', sub: latestNav?.date || '' },
          ].map(card => (
            <div key={card.label} style={{ background:'#fff',border:'1px solid rgba(0,0,0,0.09)',borderRadius:16,padding:'1.5rem' }}>
              <div style={{ fontFamily:"'DM Mono',monospace",fontSize:'0.58rem',letterSpacing:'0.18em',textTransform:'uppercase',color:'rgba(0,0,0,0.4)',marginBottom:'0.6rem' }}>{card.label}</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'1.7rem',fontWeight:600,color:'#012956',lineHeight:1 }}>{card.value}</div>
              <div style={{ fontSize:'0.75rem',color:'rgba(0,0,0,0.35)',marginTop:'0.4rem' }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex',gap:4,marginBottom:'2rem',background:'rgba(0,0,0,0.04)',borderRadius:100,padding:4,width:'fit-content' }}>
          {(['overview','holdings','statements'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ fontFamily:"'DM Mono',monospace",fontSize:'0.62rem',letterSpacing:'0.12em',textTransform:'uppercase',padding:'8px 18px',borderRadius:100,border:'none',cursor:'pointer',background:tab===t?'#fff':'transparent',color:tab===t?'#012956':'rgba(0,0,0,0.4)',boxShadow:tab===t?'0 1px 4px rgba(0,0,0,0.08)':'none',transition:'all 0.2s' }}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20 }}>
            <div style={{ background:'#fff',border:'1px solid rgba(0,0,0,0.09)',borderRadius:16,padding:'1.8rem',gridColumn:'1/-1' }}>
              <div style={th}>Fund Details</div>
              <table style={{ width:'100%',borderCollapse:'collapse' }}>
                <tbody>
                  {[
                    ['Fund Name','Super Performance Series I'],
                    ['Category','SEBI Category III AIF'],
                    ['Commitment',investor?.commitment_cr ? `₹${investor.commitment_cr} Cr` : '—'],
                    ['Amount Drawn',investor?.drawdown_cr ? `₹${investor.drawdown_cr} Cr` : '—'],
                    ['Joined',investor?.joined_date || '—'],
                    ['Status',investor?.status || 'Active'],
                  ].map(([k,v]) => (
                    <tr key={k} style={{ borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
                      <td style={{ padding:'0.8rem 0',fontSize:'0.82rem',color:'rgba(0,0,0,0.4)',width:'40%' }}>{k}</td>
                      <td style={{ padding:'0.8rem 0',fontSize:'0.85rem',color:'#0D0D0D',fontWeight:400 }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Holdings Tab */}
        {tab === 'holdings' && (
          <div style={{ background:'#fff',border:'1px solid rgba(0,0,0,0.09)',borderRadius:16,overflow:'hidden' }}>
            <div style={{ padding:'1.5rem 1.8rem',borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
              <div style={th}>Current Holdings</div>
              {holdings[0] && <div style={{ fontSize:'0.75rem',color:'rgba(0,0,0,0.35)' }}>As of {holdings[0].as_of_date}</div>}
            </div>
            <table style={{ width:'100%',borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'rgba(0,0,0,0.02)' }}>
                  {['Stock','Sector','Weight','CMP','Avg Cost','P&L'].map(h => (
                    <th key={h} style={{ padding:'0.8rem 1.2rem',textAlign:'left',fontFamily:"'DM Mono',monospace",fontSize:'0.58rem',letterSpacing:'0.14em',textTransform:'uppercase',color:'rgba(0,0,0,0.4)',fontWeight:400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {holdings.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding:'3rem',textAlign:'center',color:'rgba(0,0,0,0.3)',fontSize:'0.85rem' }}>No holdings data uploaded yet.</td></tr>
                ) : holdings.map(h => (
                  <tr key={h.id} style={{ borderTop:'1px solid rgba(0,0,0,0.05)' }}>
                    <td style={{ padding:'1rem 1.2rem',fontSize:'0.88rem',fontWeight:500,color:'#0D0D0D' }}>{h.stock_name}</td>
                    <td style={{ padding:'1rem 1.2rem',fontSize:'0.82rem',color:'rgba(0,0,0,0.5)' }}>{h.sector || '—'}</td>
                    <td style={{ padding:'1rem 1.2rem',fontSize:'0.85rem' }}>{h.weight_pct ? `${h.weight_pct}%` : '—'}</td>
                    <td style={{ padding:'1rem 1.2rem',fontSize:'0.85rem' }}>{h.cmp ? `₹${h.cmp}` : '—'}</td>
                    <td style={{ padding:'1rem 1.2rem',fontSize:'0.85rem' }}>{h.avg_cost ? `₹${h.avg_cost}` : '—'}</td>
                    <td style={{ padding:'1rem 1.2rem',fontSize:'0.85rem',color:h.pnl_pct && h.pnl_pct >= 0 ? '#1a7a4a' : '#c0392b',fontWeight:500 }}>
                      {h.pnl_pct ? `${h.pnl_pct > 0 ? '+' : ''}${h.pnl_pct}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Statements Tab */}
        {tab === 'statements' && (
          <div style={{ background:'#fff',border:'1px solid rgba(0,0,0,0.09)',borderRadius:16,overflow:'hidden' }}>
            <div style={{ padding:'1.5rem 1.8rem',borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
              <div style={th}>Monthly Statements</div>
            </div>
            <table style={{ width:'100%',borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'rgba(0,0,0,0.02)' }}>
                  {['Date','Units','NAV','Value','Invested','P&L','Return'].map(h => (
                    <th key={h} style={{ padding:'0.8rem 1.2rem',textAlign:'left',fontFamily:"'DM Mono',monospace",fontSize:'0.58rem',letterSpacing:'0.14em',textTransform:'uppercase',color:'rgba(0,0,0,0.4)',fontWeight:400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {statements.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding:'3rem',textAlign:'center',color:'rgba(0,0,0,0.3)',fontSize:'0.85rem' }}>No statements uploaded yet.</td></tr>
                ) : statements.map(s => (
                  <tr key={s.id} style={{ borderTop:'1px solid rgba(0,0,0,0.05)' }}>
                    <td style={{ padding:'1rem 1.2rem',fontSize:'0.85rem',fontWeight:500 }}>{s.as_of_date}</td>
                    <td style={{ padding:'1rem 1.2rem',fontSize:'0.85rem',color:'rgba(0,0,0,0.6)' }}>{s.units?.toFixed(4) || '—'}</td>
                    <td style={{ padding:'1rem 1.2rem',fontSize:'0.85rem' }}>{s.nav ? `₹${s.nav}` : '—'}</td>
                    <td style={{ padding:'1rem 1.2rem',fontSize:'0.85rem',fontWeight:500 }}>{s.value_cr ? `₹${s.value_cr.toFixed(4)} Cr` : '—'}</td>
                    <td style={{ padding:'1rem 1.2rem',fontSize:'0.85rem' }}>{s.invested_cr ? `₹${s.invested_cr} Cr` : '—'}</td>
                    <td style={{ padding:'1rem 1.2rem',fontSize:'0.85rem' }}>{s.pnl_cr ? `₹${s.pnl_cr.toFixed(4)} Cr` : '—'}</td>
                    <td style={{ padding:'1rem 1.2rem',fontSize:'0.85rem',color:s.pnl_pct && s.pnl_pct >= 0 ? '#1a7a4a' : '#c0392b',fontWeight:500 }}>
                      {s.pnl_pct ? `${s.pnl_pct > 0 ? '+' : ''}${s.pnl_pct.toFixed(2)}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

const th: React.CSSProperties = { fontFamily:"'Cormorant Garamond',serif",fontSize:'1.1rem',fontWeight:600,color:'#0D0D0D',marginBottom:'0.3rem' };
