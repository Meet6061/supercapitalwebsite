import { useEffect, useState, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { NAV_SERIES, HOLDINGS, SECTOR_ALLOCATION, getMockClientByEmail, getMockStatements, getMockInvestments } from '../lib/mockData';
import { generateStatementPDF } from '../lib/pdfGenerator';
import logoSrc from '../components/logo.png';

interface Props { session: Session; onBack: () => void; }
type InvestorPage = 'dashboard' | 'portfolio' | 'statements';

interface ClientRow  { id: string; full_name: string; email: string; pan: string | null; folio_number: string | null; phone: string | null; category: string; kyc_status: string; status: string; joined_date: string | null; }
interface StatRow    { client_id: string; as_of_date: string; month?: string; units: number | null; nav: number | null; current_value_cr: number | null; invested_cr: number | null; pnl_cr: number | null; pnl_pct: number | null; xirr: number | null; }
interface InvRow     { invested_cr: number; investment_date: string; units_allotted: number | null; nav_at_entry: number | null; status: string; }

const mono: React.CSSProperties = { fontFamily:"'DM Mono',monospace" };

export default function InvestorDashboard({ session, onBack }: Props) {
  const [page, setPage]           = useState<InvestorPage>('dashboard');
  const [client, setClient]       = useState<ClientRow | null>(null);
  const [statements, setStatements] = useState<StatRow[]>([]);
  const [investments, setInvestments] = useState<InvRow[]>([]);
  const [loading, setLoading]     = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Try live Supabase first
      const { data: liveClient } = await supabase.from('clients').select('*').eq('user_id', session.user.id).single();
      if (liveClient) {
        setClient(liveClient);
        const { data: liveStatements } = await supabase.from('client_statements').select('*').eq('client_id', liveClient.id).order('as_of_date', { ascending: true });
        const { data: liveInvestments } = await supabase.from('investments').select('*').eq('client_id', liveClient.id).order('investment_date', { ascending: false });
        setStatements(liveStatements || []);
        setInvestments(liveInvestments || []);
      } else {
        // Fall back to mock data by email
        const mock = getMockClientByEmail(session.user.email || '');
        if (mock) {
          setClient({ id: mock.client_id, full_name: mock.full_name, email: mock.email, pan: mock.pan, folio_number: mock.folio_number, phone: mock.phone, category: mock.category, kyc_status: mock.kyc_status, status: mock.status, joined_date: mock.joined_date });
          setStatements(getMockStatements(mock.client_id));
          setInvestments(getMockInvestments(mock.client_id));
        }
      }
    } catch (_) {
      const mock = getMockClientByEmail(session.user.email || '');
      if (mock) {
        setClient({ id: mock.client_id, full_name: mock.full_name, email: mock.email, pan: mock.pan, folio_number: mock.folio_number, phone: mock.phone, category: mock.category, kyc_status: mock.kyc_status, status: mock.status, joined_date: mock.joined_date });
        setStatements(getMockStatements(mock.client_id));
        setInvestments(getMockInvestments(mock.client_id));
      }
    }
    setLoading(false);
  }, [session]);

  useEffect(() => { load(); }, [load]);

  const latest    = statements[statements.length - 1];
  const totalInv  = investments.reduce((s, i) => s + i.invested_cr, 0);
  const currentVal = latest?.current_value_cr ?? totalInv;
  const pnlCr     = currentVal - totalInv;
  const pnlPct    = totalInv > 0 ? (pnlCr / totalInv) * 100 : 0;

  const navItems = [
    { label:'Overview',   page:'dashboard'  as InvestorPage },
    { label:'Portfolio',  page:'portfolio'  as InvestorPage },
    { label:'Statements', page:'statements' as InvestorPage },
  ];

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F2F0EB' }}>
      <span style={{ ...mono, fontSize:'0.7rem', letterSpacing:'0.2em', color:'rgba(1,41,86,0.4)', textTransform:'uppercase' }}>Loading…</span>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#F2F0EB', fontFamily:"'Bricolage Grotesque',sans-serif", display:'flex', flexDirection:'column' }}>

      {/* Header */}
      <header style={{ background:'rgba(242,240,235,0.97)', backdropFilter:'blur(18px)', borderBottom:'1px solid rgba(0,0,0,0.09)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 2.5rem', height:68, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <img src={logoSrc} alt="Super Capital" style={{ height:46, width:'auto', objectFit:'contain' }} />
          <nav style={{ display:'flex', gap:4 }}>
            {navItems.map(n => (
              <button key={n.page} onClick={() => setPage(n.page)}
                style={{ ...mono, fontSize:'0.6rem', letterSpacing:'0.1em', textTransform:'uppercase', padding:'7px 18px', borderRadius:100, border:'none', cursor:'pointer', background: page === n.page ? '#012956' : 'transparent', color: page === n.page ? '#F2F0EB' : 'rgba(0,0,0,0.45)', transition:'all 0.2s' }}>
                {n.label}
              </button>
            ))}
          </nav>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <span style={{ fontSize:'0.78rem', color:'rgba(0,0,0,0.38)' }}>{client?.full_name || session.user.email}</span>
            <button onClick={() => { supabase.auth.signOut(); onBack(); }}
              style={{ ...mono, fontSize:'0.6rem', letterSpacing:'0.1em', textTransform:'uppercase', background:'none', border:'1px solid rgba(0,0,0,0.18)', borderRadius:100, padding:'6px 16px', cursor:'pointer', color:'rgba(0,0,0,0.45)' }}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth:1200, margin:'0 auto', width:'100%', padding:'2.5rem 2.5rem 5rem', flex:1 }}>
        {page === 'dashboard'  && <OverviewPage  client={client} statements={statements} investments={investments} latest={latest} totalInv={totalInv} currentVal={currentVal} pnlCr={pnlCr} pnlPct={pnlPct} />}
        {page === 'portfolio'  && <PortfolioPage />}
        {page === 'statements' && <StatementsPage statements={statements} client={client} totalInv={totalInv} />}
      </main>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// OVERVIEW PAGE
// ══════════════════════════════════════════════════════════════════════════════
function OverviewPage({ client, statements, latest, totalInv, currentVal, pnlCr, pnlPct }: {
  client: ClientRow | null; statements: StatRow[]; investments: InvRow[];
  latest: StatRow | undefined; totalInv: number; currentVal: number; pnlCr: number; pnlPct: number;
}) {
  const latestNAV = NAV_SERIES[NAV_SERIES.length - 1];

  return (
    <div>
      {/* Greeting */}
      <div style={{ marginBottom:'2rem' }}>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.58rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(1,41,86,0.5)', marginBottom:'0.4rem' }}>
          {client?.folio_number || ''} · Super Capital AIF
        </div>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(1.6rem,2.5vw,2.4rem)', fontWeight:600, color:'#0D0D0D', margin:0, lineHeight:1.2 }}>
          Welcome back, {client?.full_name?.split(' ')[0] || 'Investor'}.
        </h1>
        <div style={{ fontSize:'0.8rem', color:'rgba(0,0,0,0.38)', marginTop:'0.3rem' }}>
          Portfolio as of {latestNAV.date} · NAV ₹{latestNAV.nav.toFixed(2)}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:'2.5rem' }}>
        {[
          { label:'Amount Invested', value:`₹${totalInv.toFixed(2)} Cr`,              sub:`${client?.joined_date || '—'}` },
          { label:'Current Value',   value:`₹${currentVal.toFixed(4)} Cr`,             sub:'as of latest NAV' },
          { label:'Absolute Return', value:`₹${pnlCr.toFixed(4)} Cr`,                  sub:'profit / loss', positive: pnlCr >= 0 },
          { label:'Return %',        value:`${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%`, sub:`XIRR ~${(latest?.xirr ?? pnlPct * 1.05).toFixed(2)}%`, positive: pnlPct >= 0 },
        ].map(k => (
          <div key={k.label} style={{ background:'#fff', border:'1px solid rgba(0,0,0,0.09)', borderRadius:16, padding:'1.4rem 1.6rem' }}>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.55rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(0,0,0,0.38)' }}>{k.label}</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.9rem', fontWeight:600, lineHeight:1, margin:'0.5rem 0 0.3rem', color: k.positive !== undefined ? (k.positive ? '#1a7a4a' : '#c0392b') : '#012956' }}>{k.value}</div>
            <div style={{ fontSize:'0.72rem', color:'rgba(0,0,0,0.32)' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* NAV Chart */}
      <div style={{ background:'#fff', border:'1px solid rgba(0,0,0,0.09)', borderRadius:16, padding:'1.8rem', marginBottom:'1.5rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.4rem' }}>
          <div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.15rem', fontWeight:600 }}>NAV Performance</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.55rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(0,0,0,0.35)', marginTop:3 }}>Jul 2024 — Jun 2025</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.6rem', fontWeight:600, color:'#012956' }}>₹{latestNAV.nav.toFixed(2)}</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.58rem', color:'rgba(0,0,0,0.35)' }}>+21.42% since inception</div>
          </div>
        </div>
        <MiniNAVChart data={statements.length > 0 ? statements : NAV_SERIES} useStatements={statements.length > 0} invested={totalInv} />
      </div>

      {/* Client details */}
      <div style={{ background:'#fff', border:'1px solid rgba(0,0,0,0.09)', borderRadius:16, padding:'1.6rem' }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.1rem', fontWeight:600, marginBottom:'1.2rem' }}>Account Details</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
          {[
            { label:'Folio Number', value: client?.folio_number || '—' },
            { label:'Category',     value: client?.category || '—' },
            { label:'KYC Status',   value: client?.kyc_status || '—' },
            { label:'PAN',          value: client?.pan ? client.pan.slice(0,5) + '****' + client.pan.slice(-1) : '—' },
            { label:'Joined',       value: client?.joined_date || '—' },
            { label:'Status',       value: client?.status || '—' },
          ].map(r => (
            <div key={r.label}>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.55rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(0,0,0,0.35)', marginBottom:4 }}>{r.label}</div>
              <div style={{ fontSize:'0.85rem', fontWeight:500 }}>{r.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// NAV CHART (SVG, no external library)
// ══════════════════════════════════════════════════════════════════════════════
function MiniNAVChart({ data, useStatements, invested }: { data: any[]; useStatements: boolean; invested: number }) {
  const W = 900, H = 200, PAD = { t:10, r:20, b:40, l:60 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  const values = useStatements
    ? data.map((d: StatRow) => d.current_value_cr ?? 0)
    : data.map((d: typeof NAV_SERIES[0]) => d.nav / 1000 * invested); // normalise to Cr for fund-level

  const labels = useStatements
    ? data.map((d: StatRow) => d.month || d.as_of_date?.slice(0,7))
    : data.map((d: typeof NAV_SERIES[0]) => d.month);

  const minV = Math.min(...values) * 0.995;
  const maxV = Math.max(...values) * 1.005;
  const toX = (i: number) => PAD.l + (i / (values.length - 1)) * innerW;
  const toY = (v: number) => PAD.t + innerH - ((v - minV) / (maxV - minV)) * innerH;

  const pts = values.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
  const area = `M${toX(0)},${toY(minV)} L${pts.split(' ').map((p, i) => i === 0 ? `${toX(0)},${toY(values[0])}` : p).join(' ')} L${toX(values.length-1)},${toY(minV)} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:'auto', overflow:'visible' }}>
      <defs>
        <linearGradient id="navGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#012956" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#012956" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0,0.25,0.5,0.75,1].map(t => {
        const y = PAD.t + innerH * (1 - t);
        const v = minV + t * (maxV - minV);
        return (
          <g key={t}>
            <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="rgba(0,0,0,0.06)" strokeWidth={1} />
            <text x={PAD.l - 8} y={y + 4} textAnchor="end" fontSize={9} fill="rgba(0,0,0,0.3)" fontFamily="'DM Mono',monospace">
              {useStatements ? `₹${v.toFixed(2)}Cr` : `₹${v.toFixed(0)}`}
            </text>
          </g>
        );
      })}
      {/* Area fill */}
      <path d={area} fill="url(#navGrad)" />
      {/* Line */}
      <polyline points={pts} fill="none" stroke="#012956" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {/* Dots */}
      {values.map((v, i) => (
        <circle key={i} cx={toX(i)} cy={toY(v)} r={3.5} fill="#fff" stroke="#012956" strokeWidth={2} />
      ))}
      {/* X labels */}
      {labels.map((l, i) => (
        <text key={i} x={toX(i)} y={H - 8} textAnchor="middle" fontSize={9} fill="rgba(0,0,0,0.35)" fontFamily="'DM Mono',monospace">{l}</text>
      ))}
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PORTFOLIO PAGE
// ══════════════════════════════════════════════════════════════════════════════
function PortfolioPage() {
  return (
    <div>
      <div style={{ marginBottom:'2rem' }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.9rem', fontWeight:600, color:'#0D0D0D', lineHeight:1.2 }}>Portfolio Holdings</div>
        <div style={{ fontSize:'0.8rem', color:'rgba(0,0,0,0.38)', marginTop:'0.3rem' }}>As of 30 Jun 2025 · 14 positions</div>
      </div>

      {/* Sector allocation */}
      <div style={{ background:'#fff', border:'1px solid rgba(0,0,0,0.09)', borderRadius:16, padding:'1.6rem', marginBottom:'1.5rem' }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.1rem', fontWeight:600, marginBottom:'1.2rem' }}>Sector Allocation</div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {SECTOR_ALLOCATION.map(sa => (
            <div key={sa.sector} style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
              <div style={{ width:140, fontSize:'0.78rem', color:'rgba(0,0,0,0.55)', flexShrink:0 }}>{sa.sector}</div>
              <div style={{ flex:1, height:8, background:'rgba(0,0,0,0.05)', borderRadius:4, overflow:'hidden' }}>
                <div style={{ width:`${sa.weight_pct}%`, height:'100%', background:'#012956', borderRadius:4 }} />
              </div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.72rem', width:44, textAlign:'right', color:'rgba(0,0,0,0.55)' }}>{sa.weight_pct}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Holdings table */}
      <div style={{ background:'#fff', border:'1px solid rgba(0,0,0,0.09)', borderRadius:16, overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr 0.6fr 1fr 1fr 0.8fr', padding:'0.8rem 1.6rem', background:'rgba(0,0,0,0.02)', gap:'1rem' }}>
          {['Company', 'Sector', 'Weight', 'Avg Cost', 'CMP', 'P&L'].map(h => (
            <div key={h} style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.55rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(0,0,0,0.38)' }}>{h}</div>
          ))}
        </div>
        {HOLDINGS.map((h, i) => (
          <div key={h.stock_name} style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr 0.6fr 1fr 1fr 0.8fr', padding:'0.9rem 1.6rem', borderTop:'1px solid rgba(0,0,0,0.06)', alignItems:'center', gap:'1rem', background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.008)' }}>
            <div style={{ fontSize:'0.88rem', fontWeight:500 }}>{h.stock_name}</div>
            <div style={{ fontSize:'0.78rem', color:'rgba(0,0,0,0.5)' }}>{h.sector}</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.75rem' }}>{h.weight_pct}%</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.75rem', color:'rgba(0,0,0,0.5)' }}>₹{h.avg_cost.toLocaleString('en-IN')}</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.78rem' }}>₹{h.cmp.toLocaleString('en-IN')}</div>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.78rem', fontWeight:500, color: h.pnl_pct >= 0 ? '#1a7a4a' : '#c0392b' }}>+{h.pnl_pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STATEMENTS PAGE
// ══════════════════════════════════════════════════════════════════════════════
function StatementsPage({ statements, client, totalInv }: { statements: StatRow[]; client: ClientRow | null; totalInv: number }) {
  const [pdfLoading, setPdfLoading] = useState(false);

  async function downloadPDF() {
    if (!client) return;
    setPdfLoading(true);
    try {
      // Convert logo to base64 for embedding in PDF
      const resp = await fetch(logoSrc);
      const blob = await resp.blob();
      const reader = new FileReader();
      const logoB64: string = await new Promise(res => {
        reader.onloadend = () => res((reader.result as string).split(',')[1]);
        reader.readAsDataURL(blob);
      });
      await generateStatementPDF(
        {
          full_name:    client.full_name,
          folio_number: client.folio_number,
          pan:          client.pan,
          category:     client.category,
          joined_date:  client.joined_date,
          email:        client.email,
        },
        statements,
        logoB64
      );
    } catch (e) {
      console.error('PDF error:', e);
      alert('PDF generation failed. Please try again.');
    }
    setPdfLoading(false);
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem' }}>
        <div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.9rem', fontWeight:600, color:'#0D0D0D', lineHeight:1.2 }}>Monthly Statements</div>
          <div style={{ fontSize:'0.8rem', color:'rgba(0,0,0,0.38)', marginTop:'0.3rem' }}>Full history of your portfolio valuation</div>
        </div>
        <button
          onClick={downloadPDF}
          disabled={pdfLoading}
          style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.68rem', letterSpacing:'0.12em', textTransform:'uppercase', padding:'11px 24px', borderRadius:100, background:'#012956', color:'#F2F0EB', border:'none', cursor: pdfLoading ? 'not-allowed' : 'pointer', opacity: pdfLoading ? 0.6 : 1 }}>
          {pdfLoading ? 'Generating…' : '↓ Download PDF'}
        </button>
      </div>

      <div style={{ background:'#fff', border:'1px solid rgba(0,0,0,0.09)', borderRadius:16, overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr 1fr 1fr', padding:'0.8rem 1.6rem', background:'rgba(0,0,0,0.02)', gap:'0.8rem' }}>
          {['Month', 'NAV', 'Units', 'Invested', 'Value', 'P&L (₹)', 'Return %'].map(h => (
            <div key={h} style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.52rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(0,0,0,0.38)' }}>{h}</div>
          ))}
        </div>
        {statements.length === 0
          ? <div style={{ padding:'3rem', textAlign:'center', color:'rgba(0,0,0,0.28)', fontSize:'0.85rem' }}>No statements on record yet.</div>
          : [...statements].reverse().map(st => (
            <div key={st.as_of_date} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr 1fr 1fr', padding:'0.85rem 1.6rem', borderTop:'1px solid rgba(0,0,0,0.06)', alignItems:'center', gap:'0.8rem' }}>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.72rem' }}>{(st as any).month || st.as_of_date?.slice(0,7)}</div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.75rem' }}>₹{st.nav?.toFixed(2) || '—'}</div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.72rem', color:'rgba(0,0,0,0.45)' }}>{st.units?.toLocaleString('en-IN') || '—'}</div>
              <div style={{ fontSize:'0.8rem' }}>₹{(st.invested_cr ?? totalInv).toFixed(2)} Cr</div>
              <div style={{ fontSize:'0.82rem', fontWeight:500 }}>₹{st.current_value_cr?.toFixed(4) || '—'} Cr</div>
              <div style={{ fontSize:'0.82rem', color: (st.pnl_cr || 0) >= 0 ? '#1a7a4a' : '#c0392b' }}>
                {st.pnl_cr != null ? `${st.pnl_cr >= 0 ? '+' : ''}₹${st.pnl_cr.toFixed(4)} Cr` : '—'}
              </div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.78rem', fontWeight:500, color: (st.pnl_pct || 0) >= 0 ? '#1a7a4a' : '#c0392b' }}>
                {st.pnl_pct != null ? `${st.pnl_pct >= 0 ? '+' : ''}${st.pnl_pct.toFixed(2)}%` : '—'}
              </div>
            </div>
          ))
        }
      </div>

      {/* Client details footer */}
      {client && (
        <div style={{ marginTop:'1.5rem', background:'rgba(0,0,0,0.02)', border:'1px solid rgba(0,0,0,0.07)', borderRadius:12, padding:'1.2rem 1.6rem', display:'flex', gap:'3rem', flexWrap:'wrap' }}>
          {[
            { label:'Investor',  value: client.full_name },
            { label:'Folio',     value: client.folio_number || '—' },
            { label:'Category',  value: client.category },
            { label:'PAN',       value: client.pan ? client.pan.slice(0,5)+'****'+client.pan.slice(-1) : '—' },
          ].map(r => (
            <div key={r.label}>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.5rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(0,0,0,0.32)', marginBottom:3 }}>{r.label}</div>
              <div style={{ fontSize:'0.82rem', fontWeight:500 }}>{r.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import React from 'react';
