import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, BarChart3, Cpu, Target, Zap, Lock } from 'lucide-react';
import type { AppView } from '../types';
import {
  Label, Display, It, Body, Card, CardIcon, CardTitle, CardBody,
  Btn, Divider, Section, Grid, TwoCol, PageFooter,
} from './UI';

interface Props { setView: (v: AppView) => void; }

function useMobile() {
  const [mob, setMob] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const h = () => setMob(window.innerWidth <= 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return mob;
}

function HeroOrrery() {
  const ref = useRef<HTMLCanvasElement>(null);
  const mob = useMobile();
  const SIZE = mob ? 300 : 500;

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const W = SIZE, H = SIZE, cx = W / 2, cy = H / 2;
    cv.width = W; cv.height = H;
    let t = 0, raf: number;

    const rings = [
      { r: 56 * (SIZE/500),  spd: 0.022, nodes: 3, nodeR: 9,  color: '#012956' },
      { r: 100 * (SIZE/500), spd: -0.014, nodes: 4, nodeR: 7, color: '#012956' },
      { r: 148 * (SIZE/500), spd: 0.009,  nodes: 5, nodeR: 6, color: '#012956' },
      { r: 198 * (SIZE/500), spd: -0.005, nodes: 6, nodeR: 5, color: '#012956' },
    ];
    const flows = Array.from({ length: 18 }, (_, i) => ({
      angle: (i / 18) * Math.PI * 2,
      progress: Math.random(),
      speed: 0.003 + Math.random() * 0.003,
      targetRing: Math.floor(Math.random() * rings.length),
    }));

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 230 * (SIZE/500));
      grd.addColorStop(0, 'rgba(1,41,86,0.04)');
      grd.addColorStop(0.6, 'rgba(1,41,86,0.02)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(1,41,86,0.04)'; ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y = 0; y < H; y += 50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

      rings.forEach((ring, ri) => {
        ctx.beginPath(); ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(1,41,86,${0.08 + ri * 0.015})`; ctx.lineWidth = 1; ctx.stroke();
        for (let ni = 0; ni < ring.nodes; ni++) {
          const angle = (ni / ring.nodes) * Math.PI * 2 + t * ring.spd;
          const nx = cx + Math.cos(angle) * ring.r;
          const ny = cy + Math.sin(angle) * ring.r;
          const pulse = (Math.sin(t * 0.04 + ni * 1.3 + ri * 0.7) + 1) / 2;
          const halo = ctx.createRadialGradient(nx, ny, 0, nx, ny, ring.nodeR + 10);
          halo.addColorStop(0, `rgba(1,41,86,${0.12 + pulse * 0.08})`);
          halo.addColorStop(1, 'transparent');
          ctx.beginPath(); ctx.arc(nx, ny, ring.nodeR + 10, 0, Math.PI * 2);
          ctx.fillStyle = halo; ctx.fill();
          ctx.beginPath(); ctx.arc(nx, ny, ring.nodeR, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(1,41,86,${0.08 + pulse * 0.06})`;
          ctx.strokeStyle = `rgba(1,41,86,${0.3 + pulse * 0.2})`;
          ctx.lineWidth = 1.2; ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(nx, ny);
          ctx.strokeStyle = 'rgba(1,41,86,0.05)'; ctx.lineWidth = 0.6; ctx.stroke();
        }
      });

      flows.forEach((fl) => {
        fl.progress += fl.speed;
        if (fl.progress > 1) { fl.progress = 0; fl.targetRing = Math.floor(Math.random() * rings.length); fl.angle = Math.random() * Math.PI * 2; }
        const ring = rings[fl.targetRing];
        const r = fl.progress * ring.r;
        const px = cx + Math.cos(fl.angle) * r;
        const py = cy + Math.sin(fl.angle) * r;
        const alpha = Math.sin(fl.progress * Math.PI) * 0.5;
        ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(1,41,86,${alpha})`; ctx.fill();
      });

      const outerR = rings[rings.length - 1].r;
      for (let i = 0; i < 36; i++) {
        const angle = (i / 36) * Math.PI * 2 + t * 0.003;
        const x = cx + Math.cos(angle) * (outerR + 14 * (SIZE/500));
        const y = cy + Math.sin(angle) * (outerR + 14 * (SIZE/500));
        const pulse = (Math.sin(t * 0.05 + i * 0.4) + 1) / 2;
        ctx.beginPath(); ctx.arc(x, y, i % 6 === 0 ? 2.5 : 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(1,41,86,${0.1 + pulse * 0.18})`; ctx.fill();
      }

      const breath = 1 + Math.sin(t * 0.04) * 0.07;
      ctx.beginPath(); ctx.arc(cx, cy, 24 * breath * (SIZE/500), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(242,240,235,0.98)'; ctx.fill();
      ctx.strokeStyle = 'rgba(1,41,86,0.45)'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.font = `600 ${9 * (SIZE/500)}px 'DM Mono', monospace`;
      ctx.fillStyle = 'rgba(1,41,86,0.7)';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('SC', cx, cy);
      t += 1;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [SIZE]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <canvas ref={ref} width={SIZE} height={SIZE} style={{ display: 'block', width: '100%', maxWidth: SIZE, opacity: 0.92 }} />
    </div>
  );
}

function QuantamentalWord() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const mob = useMobile();
  const W = mob ? 320 : 560;
  const H = mob ? 72 : 96;

  function runAnimation() {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const TARGET = 'QUANTAMENTAL';
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
    let t = 0;
    const letters = TARGET.split('').map((_, i) => ({
      locked: false,
      lockFrame: 48 + i * 11,
      scramble: CHARS[Math.floor(Math.random() * CHARS.length)],
    }));
    cancelAnimationFrame(rafRef.current);
    function frame() {
      ctx.clearRect(0, 0, W, H);
      t++;
      const charW = W / TARGET.length;
      TARGET.split('').forEach((ch, i) => {
        const l = letters[i];
        if (t >= l.lockFrame) l.locked = true;
        if (!l.locked) l.scramble = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = charW * i + charW / 2;
        const y = H / 2 - 4;
        if (!l.locked) {
          ctx.font = `400 ${mob ? 14 : 20}px 'DM Mono', monospace`;
          ctx.fillStyle = `rgba(1,41,86,${Math.random() > 0.55 ? 0.35 : 0.14})`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(l.scramble, x, y);
        } else {
          ctx.font = `700 ${mob ? 24 : 38}px 'Playfair Display', serif`;
          ctx.fillStyle = '#012956';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(ch, x, y);
        }
      });
      rafRef.current = requestAnimationFrame(frame);
    }
    frame();
  }

  useEffect(() => {
    const el = wrapRef.current; if (!el) return;
    runAnimation();
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach(e => { if (e.isIntersecting) runAnimation(); }); },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => { observer.disconnect(); cancelAnimationFrame(rafRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mob]);

  return (
    <div ref={wrapRef} style={{ display: 'inline-block', width: '100%' }}>
      <canvas ref={canvasRef} width={W} height={H} style={{ display: 'block', width: '100%', maxWidth: W }} />
      <div style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: mob ? '0.75rem' : '0.99rem', letterSpacing: '0.28em', textTransform: 'uppercase',
        color: '#012956', opacity: 0.55, marginTop: '0.1rem', paddingLeft: 4,
      }}>
        investing approach
      </div>
    </div>
  );
}

const ABOUT_CARDS = [
  { icon: <BarChart3 size={20} />, color: 'teal' as const, title: 'Research-Driven Investing', body: 'Combining deep fundamental research with disciplined portfolio construction to identify long-term wealth creation opportunities.' },
  { icon: <Shield size={20} />,    color: 'blue' as const, title: 'Adaptive Capital Allocation', body: 'A flexible investment framework designed to respond to evolving market conditions and emerging opportunities.' },
  { icon: <TrendingUp size={20} />, color: 'neutral' as const, title: 'Quantitative Insights', body: 'Proprietary analytical models and probabilistic frameworks enhance investment decision-making.' },
  { icon: <Cpu size={20} />,       color: 'teal' as const, title: 'Risk-Conscious Approach', body: 'Capital preservation remains central through active monitoring, position sizing, and exposure management.' },
];

const PHIL = [
  { n: '01', icon: <BarChart3 size={22} />, c: 'teal' as const, title: 'Market Regime Intelligence', body: 'Assessing macro, liquidity, valuation, and market structure to understand prevailing market conditions.', tag: 'Top-Down Intelligence' },
  { n: '02', icon: <Shield size={22} />,    c: 'blue' as const, title: 'Quantitative Analytics', body: 'Leveraging proprietary screeners, probabilistic models, and data-driven insights for decision support.', tag: '' },
  { n: '03', icon: <TrendingUp size={22} />, c: 'neutral' as const, title: 'Fundamental Research', body: 'Evaluating business quality, growth potential, management capability, and financial strength.', tag: 'Absolute Returns Focus' },
  { n: '04', icon: <Cpu size={22} />, c: 'teal' as const, title: 'Probabilistic Positioning', body: 'Size allocation tied explicitly to probability metrics and reward-to-risk asymmetry — eliminating emotional bias from every decision.', tag: 'Disciplined Framework' },
];

const FUND_USP = [
  { icon: <Target size={16} />, label: '12–15 Positions', sub: 'Concentrated conviction' },
  { icon: <Zap size={16} />,    label: '0–100% Flexible', sub: 'Dynamic allocation' },
  { icon: <Lock size={16} />,   label: 'Cat. III AIF',   sub: 'SEBI Registered' },
  { icon: <Shield size={16} />, label: 'HWM Protected',  sub: 'High-water mark' },
];

const wv = { initial:{ opacity:0, y:22 }, whileInView:{ opacity:1, y:0 }, viewport:{ once:true } };

export default function HomeView({ setView }: Props) {
  const mob = useMobile();

  return (
    <div>
      {/* HERO */}
      <section style={{
        position: 'relative', minHeight: '100svh',
        paddingTop: mob ? 90 : 72,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', background: 'var(--bg)',
      }}>
        <div style={{ position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(1,41,86,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(1,41,86,0.04) 1px,transparent 1px)',backgroundSize:'72px 72px',pointerEvents:'none' }} />
        <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 0%,rgba(242,240,235,0) 30%,rgba(242,240,235,0.55) 100%)',pointerEvents:'none' }} />

        {/* Top strip */}
        <div style={{ position:'relative',zIndex:2,display:'flex',justifyContent:'space-between',alignItems:'center',padding: mob ? '16px 5vw 0' : '26px 5vw 0', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display:'inline-flex',alignItems:'center',gap:8,border:'1px solid rgba(0,0,0,0.16)',background:'rgba(255,255,255,0.6)',backdropFilter:'blur(8px)',borderRadius:100,padding:'6px 16px 6px 10px',fontFamily:"'DM Mono',monospace",fontSize:'0.62rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'var(--ink-2)' }}>
            <span style={{ display:'inline-block',width:7,height:7,borderRadius:'50%',background:'var(--teal)' }} />
            Category III Alternative Investment Fund · SEBI Registered
          </div>
          <span style={{ fontFamily:"'DM Mono',monospace",fontSize:'0.62rem',letterSpacing:'0.12em',color:'var(--ink-3)' }}>Est. 2026</span>
        </div>

        {/* Mobile: canvas on top, text below. Desktop: text left, canvas right */}
        {mob ? (
          <>
            <div style={{ position:'relative',zIndex:1,padding:'24px 5vw 0',display:'flex',justifyContent:'center' }}>
              <HeroOrrery />
            </div>
            <div style={{ position:'relative',zIndex:2,padding:'24px 5vw 48px',display:'flex',flexDirection:'column' }}>
              <motion.div initial={{ opacity:0,y:22 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.6 }}>
                <div style={{ fontFamily:"'Cormorant Garamond','Instrument Serif',serif",fontSize:'clamp(3.2rem,12vw,5rem)',fontWeight:600,lineHeight:0.95,letterSpacing:'-0.03em',color:'var(--ink)' }}>Super</div>
                <div style={{ fontFamily:"'Cormorant Garamond','Instrument Serif',serif",fontSize:'clamp(3.2rem,12vw,5rem)',fontWeight:600,lineHeight:0.95,letterSpacing:'-0.03em',color:'var(--teal)',fontStyle:'italic' }}>Capital</div>
              </motion.div>
              <motion.div initial={{ opacity:0,y:22 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2,duration:0.6 }} style={{ marginTop:'1.4rem',marginBottom:'1.4rem' }}>
                <QuantamentalWord />
              </motion.div>
              <motion.div initial={{ opacity:0,y:22 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.3,duration:0.6 }}>
                <p style={{ fontSize:'0.95rem',color:'var(--ink-2)',lineHeight:1.75,marginBottom:'2rem',fontWeight:300 }}>Super Performance Series I is an actively managed Category III AIF focused on long-term capital appreciation through concentrated investing, dynamic allocation, and research-driven decision-making.</p>
              </motion.div>
              <motion.div initial={{ opacity:0,y:22 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.4,duration:0.6 }} style={{ display:'flex',gap:'1rem',flexWrap:'wrap' }}>
                <Btn onClick={() => setView('fund')}>Explore the Fund</Btn>
                <Btn variant="outline" onClick={() => setView('strategy')}>Our Strategy</Btn>
              </motion.div>
            </div>
          </>
        ) : (
          <>
            <div style={{ position:'absolute',right:'3vw',top:'50%',transform:'translateY(-44%)',zIndex:1,pointerEvents:'none' }}>
              <HeroOrrery />
            </div>
            <div style={{ position:'relative',zIndex:2,flex:1,display:'flex',flexDirection:'column',justifyContent:'center',padding:'50px 5vw 0' }}>
              <motion.div initial={{ opacity:0,y:22 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.6 }}>
                <div style={{ fontFamily:"'Cormorant Garamond','Instrument Serif',serif",fontSize:'clamp(4rem,7.5vw,8rem)',fontWeight:600,lineHeight:0.95,letterSpacing:'-0.03em',color:'var(--ink)' }}>Super</div>
                <div style={{ fontFamily:"'Cormorant Garamond','Instrument Serif',serif",fontSize:'clamp(4rem,7.5vw,8rem)',fontWeight:600,lineHeight:0.95,letterSpacing:'-0.03em',color:'var(--teal)',fontStyle:'italic' }}>Capital</div>
              </motion.div>
              <motion.div initial={{ opacity:0,y:22 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2,duration:0.6 }}>
                <div style={{ marginBottom:'1.8rem',marginTop:'1.2rem' }}><QuantamentalWord /></div>
              </motion.div>
              <motion.div initial={{ opacity:0,y:22 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.3,duration:0.6 }}>
                <p style={{ fontSize:'clamp(0.95rem,1.2vw,1.05rem)',color:'var(--ink-2)',maxWidth:500,lineHeight:1.75,marginBottom:'2.5rem',fontWeight:300 }}>Super Performance Series I is an actively managed Category III AIF focused on long-term capital appreciation through concentrated investing, dynamic allocation, and research-driven decision-making.</p>
              </motion.div>
              <motion.div initial={{ opacity:0,y:22 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.4,duration:0.6 }} style={{ display:'flex',gap:'1rem',flexWrap:'wrap' }}>
                <Btn onClick={() => setView('fund')}>Explore the Fund</Btn>
                <Btn variant="outline" onClick={() => setView('strategy')}>Our Strategy</Btn>
              </motion.div>
            </div>
          </>
        )}
      </section>

      {/* ABOUT */}
      <Section>
        <TwoCol ratio="1fr 1.15fr" gap="7vw">
          <div>
            <motion.div {...wv} transition={{ duration:0.6 }}>
              <Label>About Super Capital</Label>
              <Display size="lg" style={{ marginBottom:'1.4rem' }}>Active research.<br /><It>Tactical precision.</It></Display>
              <Body style={{ maxWidth:420, marginBottom:'2.5rem' }}>Super Performance Series I is an actively managed Category III AIF focused on long-term capital appreciation through concentrated investing, dynamic allocation, and disciplined research. The strategy combines quantitative intelligence, market regime assessment, and fundamental analysis to identify high-conviction opportunities across market cycles.</Body>
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

      {/* FUND BANNER */}
      <Section>
        <motion.div {...wv} transition={{ duration:0.7 }} style={{ borderRadius:24,background:'#011a3d',padding: mob ? '40px 6vw' : '60px 5vw',position:'relative',overflow:'hidden',color:'#fff' }}>
          <div style={{ position:'absolute',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse at 80% 50%,rgba(1,70,140,0.4) 0%,transparent 65%)' }}/>
          <div style={{ position:'absolute',inset:0,pointerEvents:'none',backgroundImage:'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)',backgroundSize:'48px 48px' }}/>
          <div style={{ position:'relative',zIndex:1,display:'grid',gridTemplateColumns: mob ? '1fr' : '1fr 1fr',gap: mob ? '2.5rem' : '6vw',alignItems:'center' }}>
            <div>
              <div style={{ display:'inline-flex',alignItems:'center',gap:8,border:'1px solid rgba(255,255,255,0.15)',borderRadius:100,padding:'5px 14px 5px 10px',fontFamily:"'DM Mono',monospace",fontSize:'0.6rem',letterSpacing:'0.16em',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:'1.5rem' }}>
                <span style={{ display:'inline-block',width:6,height:6,borderRadius:'50%',background:'rgba(160,195,255,0.9)' }}/>
                Active Fund · India Focused
              </div>
              <div style={{ fontFamily:"'Cormorant Garamond','Instrument Serif',serif",fontSize:'clamp(2.4rem,4vw,4.2rem)',fontWeight:600,lineHeight:1.05,letterSpacing:'-0.025em',color:'#fff',marginBottom:'1rem' }}>
                Super<br /><em style={{ fontStyle:'italic',color:'rgba(160,195,255,0.9)' }}>Performance</em><br />Series I
              </div>
              <p style={{ fontSize:'0.92rem',color:'rgba(255,255,255,0.55)',lineHeight:1.8,maxWidth:400,marginBottom:'2rem' }}>A Category III AIF deploying concentrated, research-led strategies across India's capital markets with dynamic risk overlays.</p>
              <Btn variant="ghost" onClick={() => setView('fund')}>View Fund Details</Btn>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
              {FUND_USP.map((u,i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14,padding:'1.4rem 1.2rem' }}>
                  <div style={{ color:'rgba(160,195,255,0.9)',marginBottom:'0.6rem',opacity:0.9 }}>{u.icon}</div>
                  <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:'0.95rem',fontWeight:500,color:'#fff',marginBottom:'0.25rem' }}>{u.label}</div>
                  <div style={{ fontFamily:"'DM Mono',monospace",fontSize:'0.58rem',letterSpacing:'0.14em',textTransform:'uppercase',color:'rgba(255,255,255,0.35)' }}>{u.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </Section>

      {/* PHILOSOPHY */}
      <Section style={{ paddingTop:0 }}>
        <div style={{ display:'grid',gridTemplateColumns: mob ? '1fr' : '1fr 1fr',gap: mob ? '1.5rem' : '6vw',alignItems:'end',marginBottom:'3.5rem' }}>
          <div><Label>Investment Philosophy</Label><Display size="lg">The four pillars of our<br /><It>quantamental</It> edge.</Display></div>
          <Body style={{ maxWidth:400 }}>We approach markets with structured discipline — combining the intuition of fundamental research with the rigour of quantitative systems.</Body>
        </div>
        <Grid cols={mob ? 1 : 4} gap={14}>
          {PHIL.map((p,i) => (
            <motion.div key={p.title} {...wv} transition={{ delay:i*0.1,duration:0.6 }}>
              <PhilCard {...p}/>
            </motion.div>
          ))}
        </Grid>
      </Section>

      {/* Who We Serve */}
      <div style={{ margin: mob ? '0 5vw 60px' : '0 5vw 90px' }}>
        <motion.div {...wv} transition={{ duration:0.6 }} style={{ border:'1px solid var(--border-md)',borderRadius:24,background:'var(--bg-card)',padding: mob ? '36px 6vw' : '56px 5vw',position:'relative',overflow:'hidden' }}>
          <div style={{ position:'absolute',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse at 100% 50%,rgba(1,41,86,0.05) 0%,transparent 60%)' }}/>
          <div style={{ position:'relative',zIndex:1,display:'grid',gridTemplateColumns: mob ? '1fr' : '1fr 1.4fr',gap: mob ? '2.5rem' : '6vw',alignItems:'start' }}>
            <div>
              <Label>Who We Serve</Label>
              <div style={{ fontFamily:"'Cormorant Garamond','Instrument Serif',serif",fontSize:'clamp(2.2rem,3.5vw,3.5rem)',fontWeight:600,letterSpacing:'-0.025em',lineHeight:1.1,marginBottom:'0.8rem',color:'var(--ink)' }}>
                India's Most<br /><em style={{ fontStyle:'italic',color:'var(--teal)' }}>Sophisticated</em><br />Investors.
              </div>
            </div>
            <div>
              {[
                { t:'High Net-Worth Individuals', d:'SEBI-accredited investors with ₹1 Crore+ commitment capacity seeking institutional-grade alternatives.' },
                { t:'Family Offices', d:'Multi-generational wealth pools seeking concentrated, research-led equity strategies with absolute return orientation.' },
                { t:'Institutional Allocators', d:'Endowments, foundations, and corporate treasuries diversifying into Indian alternative strategies.' },
              ].map((item,i) => (
                <div key={i} style={{ display:'flex',gap:'1.2rem',alignItems:'flex-start',marginBottom:'1.6rem' }}>
                  <div style={{ width:7,height:7,borderRadius:'50%',background:'var(--teal)',marginTop:7,flexShrink:0 }}/>
                  <div>
                    <div style={{ fontSize:'0.95rem',fontWeight:500,color:'var(--ink)',marginBottom:'0.3rem' }}>{item.t}</div>
                    <div style={{ fontSize:'0.82rem',color:'var(--ink-3)',lineHeight:1.65 }}>{item.d}</div>
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
      {tag && <div style={{ display:'inline-flex',alignItems:'center',marginTop:'1.3rem',fontFamily:"'DM Mono',monospace",fontSize:'0.6rem',letterSpacing:'0.12em',textTransform:'uppercase',padding:'4px 10px',borderRadius:100,background:cols[c].bg,color:cols[c].fg,opacity:hov?1:0,transform:hov?'translateY(0)':'translateY(6px)',transition:'opacity 0.3s,transform 0.3s' }}>{tag}</div>}
    </div>
  );
}
