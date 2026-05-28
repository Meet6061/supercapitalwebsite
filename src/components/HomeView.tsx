import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, BarChart3, Cpu, Target, Zap, Lock } from 'lucide-react';
import type { AppView } from '../types';
import HeroCanvas from './HeroCanvas';
import {
  Label, Display, It, Body, Card, CardIcon, CardTitle, CardBody,
  Btn, Divider, Section, Grid, TwoCol, PageFooter,
} from './UI';

interface Props { setView: (v: AppView) => void; }

// Quantamental matrix animation — restarts on every scroll into view
function QuantamentalWord() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  function runAnimation() {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const W = 560, H = 96;
    const TARGET = 'QUANTAMENTAL';
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
    let t = 0;

    // Reset letters each time animation runs
    const letters = TARGET.split('').map((_, i) => ({
      locked: false,
      lockFrame: 48 + i * 11,
      scramble: CHARS[Math.floor(Math.random() * CHARS.length)],
    }));

    let rippleActive = false;
    let rippleT = 0;

    cancelAnimationFrame(rafRef.current);

    function frame() {
      ctx.clearRect(0, 0, W, H);
      t++;

      const allLocked = letters.every(l => l.locked);
      if (allLocked) {
        if (rippleActive) {
          rippleT++;
          if (rippleT > 80) { rippleActive = false; }
        } else if (t % 200 === 0) {
          rippleActive = true; rippleT = 0;
        }
      }

      const charW = W / TARGET.length;

      TARGET.split('').forEach((ch, i) => {
        const l = letters[i];
        if (t >= l.lockFrame) l.locked = true;
        if (!l.locked) l.scramble = CHARS[Math.floor(Math.random() * CHARS.length)];

        const x = charW * i + charW / 2;
        const y = H / 2 - 4;

        if (!l.locked) {
          // Scrambling phase: DM Mono muted flicker
          const flicker = Math.random() > 0.55 ? 0.42 : 0.16;
          ctx.font = `400 20px 'DM Mono', monospace`;
          ctx.fillStyle = `rgba(11,110,106,${flicker})`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(l.scramble, x, y);
        } else {
          // Locked: Playfair Display bold, clean solid teal, no glow, no dots
          ctx.font = `700 38px 'Playfair Display', 'Cormorant Garamond', serif`;
          ctx.fillStyle = '#0B6E6A';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(ch, x, y);
        }
      });

      rafRef.current = requestAnimationFrame(frame);
    }
    frame();
  }

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    // Run once immediately on mount
    runAnimation();

    // Re-run every time the element enters the viewport (each scroll)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            runAnimation();
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={wrapRef} style={{ display: 'inline-block' }}>
      <canvas
        ref={canvasRef}
        width={560}
        height={96}
        style={{ display: 'block', maxWidth: '100%' }}
      />
      <div style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: '0.99rem',
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: '#0B6E6A',
        opacity: 0.65,
        marginTop: '0.1rem',
        paddingLeft: 4,
      }}>
        investing approach
      </div>
    </div>
  );
}

const ABOUT_CARDS = [
  { icon: <BarChart3 size={20} />, color: 'teal' as const, title: 'Macro Regime Intelligence', body: 'Systematic mapping of market cycles — Expansion, Consolidation, Correction — to calibrate allocation dynamically.' },
  { icon: <Shield size={20} />,    color: 'blue' as const, title: 'Fundamental Research Depth', body: 'Rigorous bottom-up analysis of business quality, RoE trajectory, balance sheet strength, and management integrity.' },
  { icon: <TrendingUp size={20} />, color: 'neutral' as const, title: 'Dynamic Capital Allocation', body: '0–100% flexible mandate across equity, debt, and derivatives — deployed only when conviction thresholds are met.' },
  { icon: <Cpu size={20} />,       color: 'teal' as const, title: 'Quantitative Decision Systems', body: 'Probability-weighted models, threshold-based entry/exit frameworks, and statistical overlays on every capital decision.' },
];

const PHIL = [
  { n: '01', icon: <BarChart3 size={22} />, c: 'teal' as const, title: 'Macro Regime Analysis', body: 'Capital flows, liquidity cycles, and policy indicators guide net exposure — expanding during growth, shifting defensive in corrections.', tag: 'Top-Down Intelligence' },
  { n: '02', icon: <Shield size={22} />,    c: 'blue' as const, title: 'Bottom-Up Security Research', body: 'Deep competitive-advantage analysis, governance standards, consistent high RoE, and pristine balance sheets define every holding.', tag: 'Uncompromised Quality' },
  { n: '03', icon: <TrendingUp size={22} />, c: 'neutral' as const, title: 'Active Tactical Allocation', body: 'Unlike index-bound managers, we deploy into cash, arbitrage indices, or debt based on structural opportunity — not mandate constraints.', tag: 'Absolute Returns Focus' },
  { n: '04', icon: <Cpu size={22} />,       c: 'teal' as const, title: 'Probabilistic Positioning', body: 'Size allocation tied explicitly to probability metrics and reward-to-risk asymmetry — eliminating emotional bias from every decision.', tag: 'Disciplined Framework' },
];

// USP cards for the fund banner
const FUND_USP = [
  { icon: <Target size={16} />, label: '12–15 Positions', sub: 'Concentrated conviction' },
  { icon: <Zap size={16} />,    label: '0–100% Flexible', sub: 'Dynamic allocation' },
  { icon: <Lock size={16} />,   label: 'Cat. III AIF',   sub: 'SEBI Registered' },
  { icon: <Shield size={16} />, label: 'HWM Protected',  sub: 'High-water mark' },
];

const wv = { initial:{ opacity:0, y:22 }, whileInView:{ opacity:1, y:0 }, viewport:{ once:true } };

export default function HomeView({ setView }: Props) {
  return (
    <div>
      {/* HERO */}
      <section style={hs.wrap}>
        <div style={hs.grid} />
        <div style={hs.vignette} />
        <div style={hs.strip}>
          <div style={hs.pill}><span style={hs.pillDot} />Category III Alternative Investment Fund · SEBI Registered</div>
          <span style={hs.year}>Est. 2026</span>
        </div>
        <div style={hs.canvasWrap}><HeroCanvas /></div>
        <div style={hs.body}>
          <motion.div initial={{ opacity:0,y:22 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.6 }}>
            <div style={hs.h1Main}>Super</div>
            <div style={hs.h1It}>Capital</div>
            <div style={hs.h1Sub}>Asset Management.</div>
          </motion.div>

          {/* SEBI tag below brand */}
          <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.15,duration:0.55 }}>
            <div style={hs.sebiTag}>Category III AIF · SEBI Registered</div>
          </motion.div>

          {/* Quantamental word animation */}
          <motion.div initial={{ opacity:0,y:22 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2,duration:0.6 }}>
            <div style={hs.quantWrap}>
              <QuantamentalWord />
            </div>
          </motion.div>

          <motion.div initial={{ opacity:0,y:22 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.3,duration:0.6 }}>
            <p style={hs.desc}>We blend active fundamental research, probabilistic frameworks, and dynamic capital allocation to deliver long-term appreciation for India's most sophisticated investors.</p>
          </motion.div>
          <motion.div initial={{ opacity:0,y:22 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.4,duration:0.6 }} style={{ display:'flex',gap:'1rem',flexWrap:'wrap' }}>
            <Btn onClick={() => setView('fund')}>Explore the Fund</Btn>
            <Btn variant="outline" onClick={() => setView('strategy')}>Our Strategy</Btn>
          </motion.div>
        </div>
      </section>

      {/* ABOUT */}
      <Section>
        <TwoCol ratio="1fr 1.15fr" gap="7vw">
          <div>
            <motion.div {...wv} transition={{ duration:0.6 }}>
              <Label>About Super Capital</Label>
              <Display size="lg" style={{ marginBottom:'1.4rem' }}>Active research.<br /><It>Tactical precision.</It></Display>
              <Body style={{ maxWidth:420, marginBottom:'2.5rem' }}>Super Capital is an institutional alternative investment platform combining bottom-up fundamental research with quantitative decision frameworks. Every allocation is governed by regime analysis, probabilistic models, and disciplined risk controls — not sentiment or market benchmarks.</Body>
            </motion.div>
          </div>
          <Grid cols={2} gap={14}>
            {ABOUT_CARDS.map((c,i) => (
              <motion.div key={c.title} {...wv} transition={{ delay:i*0.1,duration:0.6 }}>
                <Card><CardIcon color={c.color}>{c.icon}</CardIcon><CardTitle>{c.title}</CardTitle><CardBody>{c.body}</CardBody></Card>
              </motion.div>
            ))}
          </Grid>
        </TwoCol>
      </Section>

      <Divider />

      {/* FUND BANNER — USP cards instead of stats */}
      <Section>
        <motion.div {...wv} transition={{ duration:0.7 }} style={fb.wrap}>
          <div style={fb.bgGlow}/><div style={fb.bgGrid}/>
          <div style={fb.inner}>
            <div>
              <div style={fb.badge}><span style={fb.badgeDot}/>Active Fund · India Focused</div>
              <div style={fb.name}>Super<br /><em style={{ fontStyle:'italic',color:'rgba(15,240,200,0.85)' }}>Performance</em><br />Series I</div>
              <p style={fb.desc}>A Category III AIF deploying concentrated, research-led strategies across India's capital markets with dynamic risk overlays.</p>
              <div style={{ marginTop:'2rem' }}><Btn variant="ghost" onClick={() => setView('fund')}>View Fund Details</Btn></div>
            </div>
            <div style={fb.uspGrid}>
              {FUND_USP.map((u,i) => (
                <div key={i} style={fb.uspCard}>
                  <div style={fb.uspIcon}>{u.icon}</div>
                  <div style={fb.uspLabel}>{u.label}</div>
                  <div style={fb.uspSub}>{u.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </Section>

      {/* PHILOSOPHY */}
      <Section style={{ paddingTop:0 }}>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6vw',alignItems:'end',marginBottom:'3.5rem' }}>
          <div><Label>Investment Philosophy</Label><Display size="lg">The four pillars of our<br /><It>quantamental</It> edge.</Display></div>
          <Body style={{ maxWidth:400 }}>We approach markets with structured discipline — combining the intuition of fundamental research with the rigour of quantitative systems.</Body>
        </div>
        <Grid cols={4} gap={14}>
          {PHIL.map((p,i) => (
            <motion.div key={p.title} {...wv} transition={{ delay:i*0.1,duration:0.6 }}>
              <PhilCard {...p}/>
            </motion.div>
          ))}
        </Grid>
      </Section>

      {/* Who We Serve */}
      <div style={{ margin:'0 5vw 90px' }}>
        <motion.div {...wv} transition={{ duration:0.6 }} style={ws.wrap}>
          <div style={ws.bgGlow}/>
          <div style={ws.inner}>
            <div style={ws.left}>
              <Label>Who We Serve</Label>
              <div style={ws.h}>India's Most<br /><em style={{ fontStyle:'italic',color:'var(--teal)' }}>Sophisticated</em><br />Investors.</div>
            </div>
            <div style={ws.right}>
              {[
                { t: 'High Net-Worth Individuals', d: 'SEBI-accredited investors with ₹1 Crore+ commitment capacity seeking institutional-grade alternatives.' },
                { t: 'Family Offices', d: 'Multi-generational wealth pools seeking concentrated, research-led equity strategies with absolute return orientation.' },
                { t: 'Institutional Allocators', d: 'Endowments, foundations, and corporate treasuries diversifying into Indian alternative strategies.' },
              ].map((item,i) => (
                <div key={i} style={ws.row}>
                  <div style={ws.rowDot}/>
                  <div>
                    <div style={ws.rowTitle}>{item.t}</div>
                    <div style={ws.rowBody}>{item.d}</div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop:'2rem',display:'flex',gap:'1rem',flexWrap:'wrap' }}>
                <Btn onClick={() => setView('contact')}>Investor Inquiry</Btn>
                <Btn variant="outline" onClick={() => setView('strategy')}>Read Strategy</Btn>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <PageFooter disc="© 2026 Super Capital. For Super Capital by Elevate Securities" />
    </div>
  );
}

function PhilCard({ n, icon, c, title, body, tag }: { n:string;icon:React.ReactNode;c:'teal'|'blue'|'neutral';title:string;body:string;tag:string }) {
  const cols = { teal:{bg:'var(--teal-bg)',fg:'var(--teal)'}, blue:{bg:'var(--blue-bg)',fg:'var(--blue)'}, neutral:{bg:'rgba(0,0,0,0.05)',fg:'var(--ink-2)'} };
  const [hov,setHov] = React.useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:16,padding:'2rem 1.6rem',position:'relative',overflow:'hidden',cursor:'default',transition:'transform 0.35s,box-shadow 0.35s',transform:hov?'translateY(-6px)':'none',boxShadow:hov?'0 20px 60px rgba(0,0,0,0.1)':'none' }}>
      <div style={{ fontFamily:"'Instrument Serif',serif",fontSize:'3.5rem',fontWeight:400,color:'rgba(0,0,0,0.06)',lineHeight:1,position:'absolute',top:'1.2rem',right:'1.4rem',pointerEvents:'none' }}>{n}</div>
      <div style={{ width:44,height:44,borderRadius:11,background:cols[c].bg,color:cols[c].fg,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1.4rem' }}>{icon}</div>
      <div style={{ fontSize:'1rem',fontWeight:500,marginBottom:'0.7rem' }}>{title}</div>
      <div style={{ fontSize:'0.8rem',color:'var(--ink-3)',lineHeight:1.7 }}>{body}</div>
      <div style={{ display:'inline-flex',alignItems:'center',marginTop:'1.3rem',fontFamily:"'DM Mono',monospace",fontSize:'0.6rem',letterSpacing:'0.12em',textTransform:'uppercase',padding:'4px 10px',borderRadius:100,background:cols[c].bg,color:cols[c].fg,opacity:hov?1:0,transform:hov?'translateY(0)':'translateY(6px)',transition:'opacity 0.3s,transform 0.3s' }}>{tag}</div>
    </div>
  );
}

const hs:Record<string,React.CSSProperties>={
  wrap:{position:'relative',minHeight:'100svh',paddingTop:72,display:'flex',flexDirection:'column',overflow:'hidden'},
  grid:{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(0,0,0,0.055) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.055) 1px,transparent 1px)',backgroundSize:'72px 72px',animation:'gridDrift 18s linear infinite',pointerEvents:'none'},
  vignette:{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 0%,rgba(242,240,235,0) 30%,rgba(242,240,235,0.65) 100%)',pointerEvents:'none'},
  strip:{position:'relative',zIndex:2,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'26px 5vw 0'},
  pill:{display:'inline-flex',alignItems:'center',gap:8,border:'1px solid rgba(0,0,0,0.16)',background:'rgba(255,255,255,0.6)',backdropFilter:'blur(8px)',borderRadius:100,padding:'6px 16px 6px 10px',fontFamily:"'DM Mono',monospace",fontSize:'0.62rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'var(--ink-2)'},
  pillDot:{display:'inline-block',width:7,height:7,borderRadius:'50%',background:'var(--teal)'},
  year:{fontFamily:"'DM Mono',monospace",fontSize:'0.62rem',letterSpacing:'0.12em',color:'var(--ink-3)'},
  canvasWrap:{position:'absolute',right:'3vw',top:'50%',transform:'translateY(-42%)',zIndex:1,pointerEvents:'none'},
  body:{position:'relative',zIndex:2,flex:1,display:'flex',flexDirection:'column',justifyContent:'center',padding:'50px 5vw 0'},
  sebiTag:{fontFamily:"'DM Mono',monospace",fontSize:'0.58rem',letterSpacing:'0.22em',textTransform:'uppercase',color:'var(--teal)',marginBottom:'1.2rem',marginTop:'0.5rem',opacity:0.8},
  quantWrap:{marginBottom:'1.8rem',marginTop:'0.4rem'},
  h1Main:{fontFamily:"'Cormorant Garamond','Instrument Serif',serif",fontSize:'clamp(4rem,7.5vw,8rem)',fontWeight:600,lineHeight:0.95,letterSpacing:'-0.03em',color:'var(--ink)'},
  h1It:{fontFamily:"'Cormorant Garamond','Instrument Serif',serif",fontSize:'clamp(4rem,7.5vw,8rem)',fontWeight:600,lineHeight:0.95,letterSpacing:'-0.03em',color:'var(--teal)',fontStyle:'italic'},
  h1Sub:{fontFamily:"'Cormorant Garamond','Instrument Serif',serif",fontSize:'clamp(4rem,7.5vw,8rem)',fontWeight:600,lineHeight:0.95,letterSpacing:'-0.03em',color:'var(--ink-3)'},
  desc:{fontSize:'clamp(0.95rem,1.2vw,1.05rem)',color:'var(--ink-2)',maxWidth:500,lineHeight:1.75,marginBottom:'2.5rem',fontWeight:300},
};

const fb:Record<string,React.CSSProperties>={
  wrap:{borderRadius:24,background:'var(--bg-dark)',padding:'60px 5vw',position:'relative',overflow:'hidden',color:'#fff'},
  bgGlow:{position:'absolute',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse at 80% 50%,rgba(15,240,200,0.1) 0%,transparent 65%),radial-gradient(ellipse at 20% 80%,rgba(24,64,168,0.12) 0%,transparent 60%)'},
  bgGrid:{position:'absolute',inset:0,pointerEvents:'none',backgroundImage:'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)',backgroundSize:'48px 48px'},
  inner:{position:'relative',zIndex:1,display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6vw',alignItems:'center'},
  badge:{display:'inline-flex',alignItems:'center',gap:8,border:'1px solid rgba(255,255,255,0.15)',borderRadius:100,padding:'5px 14px 5px 10px',fontFamily:"'DM Mono',monospace",fontSize:'0.6rem',letterSpacing:'0.16em',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:'1.5rem'},
  badgeDot:{display:'inline-block',width:6,height:6,borderRadius:'50%',background:'#0ff0c8'},
  name:{fontFamily:"'Cormorant Garamond','Instrument Serif',serif",fontSize:'clamp(2.4rem,4vw,4.2rem)',fontWeight:600,lineHeight:1.05,letterSpacing:'-0.025em',color:'#fff',marginBottom:'1rem'},
  desc:{fontSize:'0.92rem',color:'rgba(255,255,255,0.55)',lineHeight:1.8,maxWidth:400},
  uspGrid:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12},
  uspCard:{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14,padding:'1.4rem 1.2rem'},
  uspIcon:{color:'#0ff0c8',marginBottom:'0.6rem',opacity:0.9},
  uspLabel:{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:'0.95rem',fontWeight:500,color:'#fff',marginBottom:'0.25rem'},
  uspSub:{fontFamily:"'DM Mono',monospace",fontSize:'0.58rem',letterSpacing:'0.14em',textTransform:'uppercase',color:'rgba(255,255,255,0.35)'},
};

const ws:Record<string,React.CSSProperties>={
  wrap:{border:'1px solid var(--border-md)',borderRadius:24,background:'var(--bg-card)',padding:'56px 5vw',position:'relative',overflow:'hidden'},
  bgGlow:{position:'absolute',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse at 100% 50%,rgba(11,110,106,0.06) 0%,transparent 60%)'},
  inner:{position:'relative',zIndex:1,display:'grid',gridTemplateColumns:'1fr 1.4fr',gap:'6vw',alignItems:'start'},
  left:{},
  right:{},
  h:{fontFamily:"'Cormorant Garamond','Instrument Serif',serif",fontSize:'clamp(2.2rem,3.5vw,3.5rem)',fontWeight:600,letterSpacing:'-0.025em',lineHeight:1.1,marginBottom:'0.8rem',color:'var(--ink)'},
  row:{display:'flex',gap:'1.2rem',alignItems:'flex-start',marginBottom:'1.6rem'},
  rowDot:{width:7,height:7,borderRadius:'50%',background:'var(--teal)',marginTop:7,flexShrink:0},
  rowTitle:{fontSize:'0.95rem',fontWeight:500,color:'var(--ink)',marginBottom:'0.3rem'},
  rowBody:{fontSize:'0.82rem',color:'var(--ink-3)',lineHeight:1.65},
};
