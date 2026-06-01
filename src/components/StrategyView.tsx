import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Label, Display, It, Body, PageFooter } from './UI';

// ─── Strategy Hero: Sacred Geometry ──────────────────────────────────────────
// Concentric rotating polygons — clean lines, zero fill, zero glow
function StrategyHeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const W = 480, H = 460, cx = W / 2, cy = H / 2;
    let t = 0, raf: number;

    // Layers: [sides, radius, speed, opacity, lineWidth]
    const LAYERS = [
      [3,  52,   0.008,  0.55, 1.2],
      [4,  90,  -0.006,  0.40, 1.0],
      [6,  128,  0.004,  0.32, 0.9],
      [3,  162, -0.005,  0.24, 0.8],
      [12, 196,  0.003,  0.18, 0.7],
      [4,  228, -0.002,  0.14, 0.7],
      [6,  258,  0.002,  0.10, 0.6],
    ];

    // Static dot ring at each polygon vertex
    function polygon(n: number, r: number, angle: number) {
      const pts: [number,number][] = [];
      for (let i = 0; i < n; i++) {
        const a = angle + (i / n) * Math.PI * 2;
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
      return pts;
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 1;

      // Fine dot grid — very faint
      for (let x = 0; x < W; x += 32) {
        for (let y = 0; y < H; y += 32) {
          const dx = x - cx, dy = y - cy;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist > 270) continue;
          ctx.beginPath(); ctx.arc(x, y, 0.8, 0, Math.PI*2);
          ctx.fillStyle = 'rgba(1,41,86,0.07)'; ctx.fill();
        }
      }

      // Draw each rotating polygon
      LAYERS.forEach(([n, r, spd, op, lw]) => {
        const angle = t * spd;
        const pts = polygon(n, r, angle);

        // Polygon outline
        ctx.beginPath();
        pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
        ctx.closePath();
        ctx.strokeStyle = `rgba(1,41,86,${op})`;
        ctx.lineWidth = lw;
        ctx.stroke();

        // Vertex dots
        pts.forEach(([x, y]) => {
          ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI*2);
          ctx.fillStyle = `rgba(1,41,86,${(op * 1.4).toFixed(3)})`; ctx.fill();
        });

        // Spoke lines from centre to every other vertex (alternate layers only)
        if (n <= 6) {
          pts.forEach(([x, y], i) => {
            if (i % 2 !== 0) return;
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y);
            ctx.strokeStyle = `rgba(1,41,86,${(op * 0.35).toFixed(3)})`;
            ctx.lineWidth = 0.6; ctx.stroke();
          });
        }
      });

      // Cross-connect vertices of inner triangle to outer hexagon
      const tri = polygon(3, 52, t * 0.008);
      const hex = polygon(6, 128, t * 0.004);
      tri.forEach(([tx, ty]) => {
        hex.forEach(([hx, hy]) => {
          ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy);
          ctx.strokeStyle = 'rgba(1,41,86,0.055)'; ctx.lineWidth = 0.5; ctx.stroke();
        });
      });

      // Centre crosshair — tiny, precise
      const cSize = 10;
      ctx.beginPath();
      ctx.moveTo(cx - cSize, cy); ctx.lineTo(cx + cSize, cy);
      ctx.moveTo(cx, cy - cSize); ctx.lineTo(cx, cy + cSize);
      ctx.strokeStyle = 'rgba(1,41,86,0.45)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(1,41,86,0.5)'; ctx.fill();

      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} width={480} height={460} style={{ display: 'block', maxWidth: '100%' }} />;
}























// ─── Pillar card ──────────────────────────────────────────────────────────────
function PillarCard({ n, title, summary, detail }: { n: string; title: string; summary: string; detail: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${hov ? 'rgba(1,41,86,0.35)' : 'var(--border)'}`,
        borderRadius: 18, padding: '2.2rem 2rem',
        transition: 'all 0.38s cubic-bezier(.22,.8,.4,1)',
        transform: hov ? 'translateY(-7px)' : 'none',
        boxShadow: hov ? '0 24px 64px rgba(1,41,86,0.1), 0 4px 16px rgba(0,0,0,0.05)' : '0 1px 4px rgba(0,0,0,0.03)',
        cursor: 'default', position: 'relative', overflow: 'hidden', minHeight: 240,
      }}
    >
      <div style={{ position:'absolute',top:0,left:'10%',right:'10%',height:1,background:`linear-gradient(90deg,transparent,rgba(1,41,86,${hov?0.7:0.2}),transparent)`,transition:'opacity 0.4s' }} />
      <div style={{ fontFamily:"'DM Mono',monospace",fontSize:'0.58rem',letterSpacing:'0.22em',textTransform:'uppercase',color:'var(--teal)',marginBottom:'1.2rem',opacity:0.7 }}>Pillar {n}</div>
      <div style={{ fontFamily:"'Instrument Serif',serif",fontSize:'1.35rem',fontWeight:400,color:'var(--ink)',lineHeight:1.2,marginBottom:'1rem' }}>{title}</div>
      <div style={{ fontSize:'0.83rem',color:'var(--ink-3)',lineHeight:1.75,opacity:hov?0:1,transition:'opacity 0.28s' }}>{summary}</div>
      <div style={{ position:'absolute',inset:0,padding:'2.2rem 2rem',background:'var(--bg-card)',opacity:hov?1:0,transition:'opacity 0.32s',pointerEvents:'none',display:'flex',flexDirection:'column',justifyContent:'flex-end' }}>
        <div style={{ fontFamily:"'DM Mono',monospace",fontSize:'0.58rem',letterSpacing:'0.22em',textTransform:'uppercase',color:'var(--teal)',marginBottom:'0.7rem',opacity:0.7 }}>Approach</div>
        <div style={{ fontSize:'0.85rem',color:'var(--ink-2)',lineHeight:1.8 }}>{detail}</div>
      </div>
    </div>
  );
}

// ─── Research step card ───────────────────────────────────────────────────────
function StepCard({ n, title, items, delay }: { n: string; title: string; items: string[]; delay: number }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay, duration: 0.6 }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:'var(--bg-card)',border:`1px solid ${hov?'rgba(1,41,86,0.3)':'var(--border)'}`,borderTop:'2.5px solid var(--teal)',borderRadius:16,padding:'1.8rem 1.6rem',transition:'all 0.34s cubic-bezier(.22,.8,.4,1)',transform:hov?'translateY(-5px)':'none',boxShadow:hov?'0 18px 48px rgba(0,0,0,0.07)':'none',cursor:'default' }}
    >
      <div style={{ fontFamily:"'DM Mono',monospace",fontSize:'0.58rem',letterSpacing:'0.22em',textTransform:'uppercase',color:'var(--teal)',marginBottom:'1rem',opacity:0.65 }}>{n}</div>
      <div style={{ fontFamily:"'Instrument Serif',serif",fontSize:'1.18rem',fontWeight:400,color:'var(--ink)',lineHeight:1.2,marginBottom:'1.1rem' }}>{title}</div>
      <div style={{ borderTop:'1px solid var(--border)',paddingTop:'1rem',display:'flex',flexDirection:'column',gap:8 }}>
        {items.map(item => (
          <div key={item} style={{ display:'flex',alignItems:'flex-start',gap:10 }}>
            <div style={{ width:4,height:4,borderRadius:'50%',background:'var(--teal)',marginTop:7,flexShrink:0 }} />
            <div style={{ fontSize:'0.8rem',color:'var(--ink-3)',lineHeight:1.65 }}>{item}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Portfolio construction canvas ───────────────────────────────────────────
function PortfolioConstCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const wRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wRef, { once: false, margin: '-60px' });
  const progressRef = useRef(0);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const W = 360, H = 340, cx = W / 2, cy = H / 2;
    let t = 0, raf: number;
    const N = 14;
    const nodes = [{ x: cx, y: cy, r: 24, label: 'CORE' }];
    for (let i = 1; i < N; i++) {
      const angle = ((i - 1) / (N - 1)) * Math.PI * 2 - Math.PI / 2;
      const ring = i <= 7 ? 90 : 140;
      nodes.push({ x: cx + Math.cos(angle) * ring, y: cy + Math.sin(angle) * ring, r: 7 + (i % 3) * 2.5, label: '' });
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const vis = Math.min(N, Math.floor(progressRef.current * N * 1.1));
      [90, 140].forEach(r => {
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(1,41,86,0.08)'; ctx.lineWidth = 1; ctx.stroke();
      });
      for (let i = 1; i < vis; i++) {
        ctx.beginPath(); ctx.moveTo(nodes[0].x, nodes[0].y); ctx.lineTo(nodes[i].x, nodes[i].y);
        ctx.strokeStyle = `rgba(1,41,86,${0.10 + Math.sin(t + i * 0.5) * 0.03})`; ctx.lineWidth = 1; ctx.stroke();
      }
      nodes.slice(0, vis).forEach((n, i) => {
        const pulse = (Math.sin(t * 0.9 + i * 0.8) + 1) / 2;
        if (i === 0) {
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r + 12);
          g.addColorStop(0, 'rgba(1,41,86,0.15)'); g.addColorStop(1, 'transparent');
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 12, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fillStyle = 'var(--teal)'; ctx.fill();
          ctx.font = "600 7.5px 'DM Mono',monospace"; ctx.fillStyle = '#fff';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('CORE', n.x, n.y);
        } else {
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r + pulse * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(1,41,86,${0.07 + pulse * 0.05})`; ctx.fill();
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(1,41,86,${0.22 + pulse * 0.12})`;
          ctx.strokeStyle = 'rgba(1,41,86,0.38)'; ctx.lineWidth = 1;
          ctx.fill(); ctx.stroke();
        }
      });
      t += 0.012;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!inView) { progressRef.current = 0; return; }
    let f = 0;
    const id = setInterval(() => { progressRef.current = Math.min(1, f / 70); f++; if (f > 70) clearInterval(id); }, 16);
    return () => clearInterval(id);
  }, [inView]);

  return <div ref={wRef}><canvas ref={ref} width={360} height={340} style={{ display: 'block', maxWidth: '100%' }} /></div>;
}

// ─── Regime state row ─────────────────────────────────────────────────────────
function RegimeRow({ label, equity, hedging, cash, color }: { label: string; equity: string; hedging: string; cash: string; color: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'grid',gridTemplateColumns:'120px 1fr 1fr 1fr',gap:0,padding:'1.1rem 1.4rem',borderBottom:'1px solid var(--border)',background:hov?'var(--bg-alt)':'transparent',transition:'background 0.25s',alignItems:'center' }}>
      <div style={{ display:'flex',alignItems:'center',gap:8 }}>
        <div style={{ width:7,height:7,borderRadius:'50%',background:color,flexShrink:0 }} />
        <span style={{ fontSize:'0.85rem',fontWeight:500,color:'var(--ink)' }}>{label}</span>
      </div>
      <div style={{ fontSize:'0.78rem',color:'var(--ink-3)',textAlign:'center' }}>{equity}</div>
      <div style={{ fontSize:'0.78rem',color:'var(--ink-3)',textAlign:'center' }}>{hedging}</div>
      <div style={{ fontSize:'0.78rem',color:'var(--ink-3)',textAlign:'center' }}>{cash}</div>
    </div>
  );
}

// ─── Risk flow canvas ─────────────────────────────────────────────────────────
function RiskFlowCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const wRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wRef, { once: false, margin: '-60px' });
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const W = 340, H = 200;
    let t = 0, raf: number;
    const boxes = [
      { label: 'Market Conditions', x: 50,  y: 34,  w: 110, color: '#012956' },
      { label: 'Risk Assessment',   x: 170, y: 98,  w: 110, color: '#1840A8' },
      { label: 'Portfolio Adjust.', x: 50,  y: 160, w: 110, color: '#555' },
    ];
    function draw() {
      ctx.clearRect(0, 0, W, H);
      if (!inView) { raf = requestAnimationFrame(draw); return; }
      const arrowPts = [{ x1:155,y1:54,x2:195,y2:98 },{ x1:195,y1:118,x2:155,y2:160 }];
      arrowPts.forEach(a => {
        ctx.beginPath(); ctx.moveTo(a.x1,a.y1); ctx.lineTo(a.x2,a.y2);
        ctx.strokeStyle='rgba(0,0,0,0.12)'; ctx.lineWidth=1.5;
        ctx.setLineDash([4,4]); ctx.stroke(); ctx.setLineDash([]);
      });
      boxes.forEach((b,i) => {
        const barW = (0.45 + 0.22 * Math.sin(t * 0.6 + i * 1.1)) * b.w;
        ctx.beginPath(); ctx.roundRect(b.x,b.y,b.w,20,5); ctx.fillStyle='rgba(0,0,0,0.04)'; ctx.fill();
        ctx.beginPath(); ctx.roundRect(b.x,b.y,barW,20,5); ctx.fillStyle=b.color+'cc'; ctx.fill();
        ctx.font="400 8px 'DM Mono',monospace"; ctx.fillStyle='var(--ink-3)';
        ctx.textAlign='left'; ctx.textBaseline='top'; ctx.fillText(b.label,b.x,b.y-14);
      });
      t += 0.016; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [inView]);
  return <div ref={wRef}><canvas ref={ref} width={340} height={200} style={{ display:'block',maxWidth:'100%' }} /></div>;
}

// ─── Prob canvas — larger ─────────────────────────────────────────────────────
function ProbCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const W = 460, H = 300; // increased from 320x200
    let t = 0, raf: number;
    const pts = [
      { x: 80,  y: 70,  label: 'Exposure', phase: 0   },
      { x: 230, y: 70,  label: 'Hedging',  phase: 0.8 },
      { x: 380, y: 70,  label: 'Tactical', phase: 1.6 },
      { x: 80,  y: 190, label: 'Cash',     phase: 2.4 },
      { x: 230, y: 190, label: 'Sizing',   phase: 3.2 },
      { x: 380, y: 190, label: 'Entry',    phase: 4.0 },
    ];
    function draw() {
      ctx.clearRect(0, 0, W, H);
      pts.forEach((a, i) => {
        pts.forEach((b, j) => {
          if (j <= i) return;
          const d = Math.hypot(b.x - a.x, b.y - a.y);
          if (d > 200) return;
          const pulse = (Math.sin(t + a.phase) + 1) / 2;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(1,41,86,${0.06 + pulse * 0.12})`; ctx.lineWidth = 1; ctx.stroke();
        });
      });
      pts.forEach(p => {
        const pulse = (Math.sin(t * 1.1 + p.phase) + 1) / 2;
        const r = 7 + pulse * 4;
        ctx.beginPath(); ctx.arc(p.x, p.y, r + 7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(1,41,86,${0.05 + pulse * 0.07})`; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(1,41,86,${0.35 + pulse * 0.35})`; ctx.fill();
        ctx.font = "600 9px 'DM Mono',monospace";
        ctx.fillStyle = `rgba(1,41,86,${0.6 + pulse * 0.3})`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText(p.label, p.x, p.y + r + 7);
        const pct = Math.round(60 + pulse * 35);
        ctx.font = "500 8px 'DM Mono',monospace";
        ctx.fillStyle = `rgba(1,41,86,${0.4 + pulse * 0.3})`;
        ctx.textBaseline = 'bottom';
        ctx.fillText(pct + '%', p.x, p.y - r - 4);
      });
      t += 0.018;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} width={460} height={300} style={{ display: 'block', maxWidth: '100%' }} />;
}

const wv = (i = 0) => ({ initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: i * 0.1, duration: 0.65 } });

function SectionDivider() {
  return (
    <div style={{ padding: '0 5vw' }}>
      <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.9 }}
        style={{ height: 1, background: 'var(--border)', transformOrigin: 'left' }} />
    </div>
  );
}

export default function StrategyView() {
  return (
    <div>

      {/* SECTION 1 · STRATEGY HERO */}
      <section style={{ padding: '130px 5vw 100px', position: 'relative', overflow: 'hidden', minHeight: '88vh', display: 'flex', alignItems: 'center' }}>
        <div style={{ position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(1,41,86,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(1,41,86,0.04) 1px,transparent 1px)',backgroundSize:'64px 64px',pointerEvents:'none' }} />
        <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse at 75% 50%,rgba(242,240,235,0) 20%,rgba(242,240,235,0.72) 80%)',pointerEvents:'none' }} />
        <div style={{ position:'relative',zIndex:1,display:'grid',gridTemplateColumns: typeof window !== 'undefined' && window.innerWidth <= 768 ? '1fr' : '1fr 1fr',gap:'6vw',alignItems:'center',width:'100%' }}>
          <div>
            <motion.div {...wv(0)}><Label>Investment Framework</Label></motion.div>
            <motion.div {...wv(0.3)}>
              <Display size="xl" style={{ marginBottom:'1.8rem',lineHeight:1.0 }}>
                Inside the<br /><It>Investment Engine.</It>
              </Display>
            </motion.div>
            <motion.div {...wv(0.6)}>
              <Body style={{ maxWidth:460,fontSize:'1.02rem',lineHeight:1.85,marginBottom:'1.4rem' }}>
                An institutionally disciplined investment approach integrating quantitative intelligence, fundamental research, and adaptive portfolio management.
              </Body>
            </motion.div>
            <motion.div {...wv(0.9)}>
              <Body style={{ maxWidth:460,lineHeight:1.85 }}>
                Every capital decision flows through four interconnected stages — from research and analysis through to allocation and continuous monitoring.
              </Body>
            </motion.div>
          </div>
          <motion.div initial={{ opacity:0,x:30 }} animate={{ opacity:1,x:0 }} transition={{ delay:0.4,duration:0.8 }} style={{ display:'flex',justifyContent:'center' }}>
            <StrategyHeroCanvas />
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* SECTION 2 · INVESTMENT PHILOSOPHY — updated points, no "Long-term ownership" */}
      <section style={{ padding: '100px 5vw' }}>
        <div style={{ display:'grid',gridTemplateColumns: typeof window !== 'undefined' && window.innerWidth <= 768 ? '1fr' : '1.1fr 0.9fr',gap:'8vw',alignItems:'center' }}>
          <motion.div {...wv(0)}>
            <Label>Investment Philosophy</Label>
            <div style={{ fontFamily:"'Instrument Serif',serif",fontSize:'clamp(1.8rem,3vw,2.8rem)',fontWeight:400,color:'var(--ink)',lineHeight:1.25,letterSpacing:'-0.02em',marginBottom:'2rem' }}>
              "We seek high-quality businesses with durable growth potential and allocate capital dynamically based on market conditions, valuation opportunities, and{' '}
              <em style={{ color:'var(--teal)',fontStyle:'italic' }}>risk-reward considerations.</em>"
            </div>
            <Body>
              The philosophy integrates tactical allocation discipline and active sector rotation with research intensity and capital efficiency — responding dynamically to evolving market conditions without anchoring to static positions or benchmark constraints.
            </Body>
          </motion.div>
          <motion.div {...wv(0.3)}>
            <PhilosophyList />
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* SECTION 3 · FOUR PILLARS — intro para removed */}
      <section style={{ padding: '100px 5vw' }}>
        <motion.div {...wv(0)} style={{ marginBottom:'3.5rem' }}>
          <Label>The Quantamental Edge</Label>
          <Display size="lg">Four pillars of our<br /><It>investment discipline.</It></Display>
        </motion.div>
        <div style={{ display:'grid',gridTemplateColumns: typeof window !== 'undefined' && window.innerWidth <= 768 ? '1fr' : 'repeat(4,1fr)',gap:16 }}>
          {[
            { n:'1', title:'Market Regime Intelligence', summary:'Assessing macro conditions, liquidity, valuation environment, and market structure to understand prevailing dynamics.', detail:'Macro analysis covers economic cycle mapping, liquidity conditions, credit spreads, and global capital flows. Sector rotation signals and valuation environment analysis drive net exposure decisions across our three-state regime model.' },
            { n:'2', title:'Quantitative Analytics', summary:'Proprietary screeners, probability models, and historical market studies provide data-driven decision support.', detail:'Proprietary quantitative screens identify opportunity sets across the Indian equity universe. Statistical analysis and historical market studies inform position sizing. Probability-weighted models validate conviction scores for every holding.' },
            { n:'3', title:'Fundamental Research', summary:'Business quality, promoter integrity, financial strength, and competitive moat assessment underpin every holding.', detail:'Deep research covers business model evaluation, competitive advantage durability, promoter background and track record, industry expert interactions, forensic accounting review, and financial analysis of RoE trajectory and capital allocation history.' },
            { n:'4', title:'Dynamic Capital Allocation', summary:'Capital rotates toward opportunities with superior risk-reward while actively managing downside exposure.', detail:'Flexible 0–100% mandate across equity, debt, cash, and derivatives. Capital is deployed only when reward-to-risk thresholds are met. Reallocation is driven by conviction evolution, regime shifts, and emerging asymmetric opportunities.' },
          ].map((p, i) => (
            <motion.div key={p.n} {...wv(i * 0.1)}>
              <PillarCard {...p} />
            </motion.div>
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* SECTION 4 · RESEARCH PROCESS */}
      <section style={{ padding: '100px 5vw' }}>
        <motion.div {...wv(0)} style={{ marginBottom:'4rem' }}>
          <Label>Research Process</Label>
          <Display size="lg" style={{ maxWidth:480 }}>From idea to <It>conviction.</It></Display>
        </motion.div>
        <div style={{ display:'grid',gridTemplateColumns: typeof window !== 'undefined' && window.innerWidth <= 768 ? '1fr' : 'repeat(4,1fr)',gap:16,position:'relative' }}>
          <div style={{ position:'absolute',top:-1,left:'12.5%',right:'12.5%',height:1,background:'linear-gradient(90deg,transparent,var(--teal),transparent)',opacity:0.15 }} />
          {[
            { n:'Step 01', title:'Idea Generation', items:['Proprietary quantitative screeners','Secondary research & sector mapping','Opportunity sourcing across market cap'] },
            { n:'Step 02', title:'Fundamental Analysis', items:['Business quality & moat assessment','Promoter evaluation & due diligence','Industry expert consultations','Forensic accounting review'] },
            { n:'Step 03', title:'Valuation', items:['Discounted Cash Flow modelling','Peer and relative comparison','Risk-reward asymmetry assessment'] },
            { n:'Step 04', title:'Investment Decision', items:['Position sizing & portfolio fit','Capital allocation priority','Entry rules & active monitoring'] },
          ].map((s, i) => <StepCard key={s.n} {...s} delay={i * 0.12} />)}
        </div>
      </section>

      <SectionDivider />

      {/* SECTION 5 · PORTFOLIO CONSTRUCTION — updated bullet points */}
      <section style={{ padding: '100px 5vw' }}>
        <div style={{ display:'grid',gridTemplateColumns: typeof window !== 'undefined' && window.innerWidth <= 768 ? '1fr' : '1fr 1fr',gap:'8vw',alignItems:'center' }}>
          <motion.div {...wv(0)}>
            <Label>Portfolio Construction</Label>
            <Display size="lg" style={{ marginBottom:'1.4rem' }}>
              Focused.<br />Disciplined.<br /><It>Adaptive.</It>
            </Display>
            <Body style={{ marginBottom:'2rem' }}>
              The portfolio typically holds 12–15 high-conviction positions with disciplined exposure management and active monitoring across full market cycles.
            </Body>
            <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
              {[
                ['~12–15 Positions', 'Concentrated alpha, not diluted diversification'],
                ['Tactical Allocation', 'Capital deployed and rotated based on prevailing regime probability and evolving risk-reward asymmetry'],
                ['Active Sector Rotation', 'Systematic reallocation across sectors driven by macro signals, earnings momentum, and relative valuation'],
                ['Derivative Overlay', 'Strategic use of derivatives for portfolio hedging, tactical exposure management, and asymmetric opportunity expression'],
                ['0–100% Equity Flex', 'Full mandate; cash is an active allocation decision'],
              ].map(([title, desc]) => (
                <ConstructionRow key={title} title={title} desc={desc} />
              ))}
            </div>
          </motion.div>
          <motion.div {...wv(0.3)} style={{ display:'flex',justifyContent:'center' }}>
            <PortfolioConstCanvas />
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* SECTION 6 · MARKET REGIME FRAMEWORK */}
      <section style={{ padding: '100px 5vw' }}>
        <motion.div {...wv(0)} style={{ marginBottom:'3rem' }}>
          <Label>Market Regime Framework</Label>
          <Display size="lg" style={{ maxWidth:520 }}>Three states.<br /><It>One adaptive system.</It></Display>
        </motion.div>
        <motion.div {...wv(0.3)}>
          <div style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:20,overflow:'hidden' }}>
            <div style={{ display:'grid',gridTemplateColumns:'120px 1fr 1fr 1fr',gap:0,padding:'0.9rem 1.4rem',borderBottom:'1px solid var(--border)',background:'var(--bg-alt)' }}>
              {['Regime','Equity Exposure','Hedging','Cash Level'].map(h => (
                <div key={h} style={{ fontFamily:"'DM Mono',monospace",fontSize:'0.58rem',letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--ink-3)',textAlign:h==='Regime'?'left':'center' }}>{h}</div>
              ))}
            </div>
            <RegimeRow label="Expansion"    equity="70–100%" hedging="Minimal"  cash="Low"      color="var(--teal)" />
            <RegimeRow label="Consolidation" equity="40–70%" hedging="Moderate" cash="Moderate" color="#B8860B" />
            <RegimeRow label="Correction"   equity="0–40%"  hedging="Elevated" cash="High"     color="var(--blue)" />
          </div>
        </motion.div>
        <motion.div {...wv(0.5)} style={{ marginTop:'2rem' }}>
          <Body style={{ maxWidth:680 }}>
            Regime classification is updated continuously using macro indicators, liquidity conditions, credit market signals, and market breadth data. There are no fixed allocations — every position reflects the current regime probability assessment.
          </Body>
        </motion.div>
      </section>

      <SectionDivider />

      {/* SECTION 7 · PROBABILISTIC INTELLIGENCE — larger graphic */}
      <section style={{ padding: '100px 5vw' }}>
        <div style={{ display:'grid',gridTemplateColumns: typeof window !== 'undefined' && window.innerWidth <= 768 ? '1fr' : '1fr 1fr',gap:'8vw',alignItems:'center' }}>
          <motion.div {...wv(0)}>
            <Label>Probabilistic Intelligence Layer</Label>
            <Display size="lg" style={{ marginBottom:'1.4rem' }}>
              Decision support.<br /><It>Not automation.</It>
            </Display>
            <Body style={{ marginBottom:'1.6rem' }}>
              The investment process incorporates proprietary probability frameworks derived from historical market data. These models assist human judgment — they do not replace it.
            </Body>
            <Body style={{ marginBottom:'2rem' }}>
              Each investment decision is supported by a probability-weighted scenario analysis covering base, bull, and bear cases. Position sizes are derived from expected value calculations, not conviction alone.
            </Body>
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              {['Exposure decisions','Hedging calibration','Tactical positioning','Cash allocation'].map(item => (
                <div key={item} style={{ display:'flex',alignItems:'center',gap:10 }}>
                  <div style={{ width:5,height:5,borderRadius:'50%',background:'var(--teal)',flexShrink:0 }} />
                  <span style={{ fontSize:'0.85rem',color:'var(--ink-2)' }}>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div {...wv(0.3)} style={{ display:'flex',justifyContent:'center' }}>
            <ProbCanvas />
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* SECTION 8 · RISK MANAGEMENT */}
      <section style={{ padding: '100px 5vw' }}>
        <div style={{ display:'grid',gridTemplateColumns: typeof window !== 'undefined' && window.innerWidth <= 768 ? '1fr' : '1fr 1fr',gap:'8vw',alignItems:'center' }}>
          <motion.div {...wv(0)} style={{ display:'flex',justifyContent:'center' }}>
            <div>
              <RiskFlowCanvas />
              <div style={{ display:'grid',gridTemplateColumns: typeof window !== 'undefined' && window.innerWidth <= 768 ? '1fr' : '1fr 1fr',gap:12,marginTop:24 }}>
                {[['Tactical Hedging','Systematic downside protection'],['Cash Flexibility','0–100% allocation range'],['Regime Adaptation','Macro-driven exposure shifts'],['Exposure Control','Dynamic gross / net management']].map(([t,d]) => (
                  <div key={t} style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,padding:'0.9rem 1rem' }}>
                    <div style={{ fontSize:'0.78rem',fontWeight:500,color:'var(--ink)',marginBottom:3 }}>{t}</div>
                    <div style={{ fontSize:'0.7rem',color:'var(--ink-3)',lineHeight:1.5 }}>{d}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          <motion.div {...wv(0.3)}>
            <Label>Risk Management & Capital Allocation</Label>
            <Display size="lg" style={{ marginBottom:'1.4rem' }}>
              Intelligent risk.<br /><It>Adaptive capital.</It>
            </Display>
            <Body style={{ marginBottom:'1.6rem' }}>
              Risk management is not a constraint on returns — it is the foundation of them. Every allocation decision integrates rigorous downside risk assessment, regime probability, and portfolio-level exposure control.
            </Body>
            <Body>
              As market conditions evolve, capital is reallocated — hedges adjusted, cash deployed or preserved, and gross exposure shifted to reflect the prevailing risk-reward environment. The framework is dynamic, never static.
            </Body>
          </motion.div>
        </div>
      </section>

      <PageFooter disc="© 2026 Super Capital | For Super Capital by Elevate Securities" />
    </div>
  );
}

// ── Sub-components ──
function PhilosophyList() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: '-80px' });
  // Updated: removed "Long-term ownership", added "Tactical allocation" and "Active sector rotation"
  const items = ['Research intensity', 'Active sector rotation', 'Tactical Allocation', 'Capital efficiency', 'Risk-adjusted decision making'];
  return (
    <div ref={ref} style={{ display:'flex',flexDirection:'column',gap:0 }}>
      {items.map((item, i) => (
        <React.Fragment key={item}>
          <motion.div
            initial={{ opacity:0,x:20 }} animate={inView ? { opacity:1,x:0 } : { opacity:0,x:20 }}
            transition={{ delay:i*0.18,duration:0.5 }}
            style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderLeft:`3px solid rgba(1,41,86,${0.3+i*0.14})`,borderRadius:12,padding:'1rem 1.4rem',display:'flex',alignItems:'center',gap:14 }}
          >
            <div style={{ width:30,height:30,borderRadius:'50%',background:`rgba(1,41,86,${0.07+i*0.07})`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'DM Mono',monospace",fontSize:'0.6rem',color:'var(--teal)',flexShrink:0 }}>{i+1}</div>
            <div style={{ fontSize:'0.9rem',color:'var(--ink)' }}>{item}</div>
          </motion.div>
          {i < items.length - 1 && (
            <motion.div initial={{ scaleY:0 }} animate={inView ? { scaleY:1 } : { scaleY:0 }}
              transition={{ delay:i*0.18+0.28,duration:0.28 }}
              style={{ width:1.5,height:22,background:'linear-gradient(to bottom,var(--teal),transparent)',marginLeft:55,opacity:0.4,transformOrigin:'top' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function ConstructionRow({ title, desc }: { title: string; desc: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'flex',gap:14,alignItems:'flex-start',padding:'0.8rem 0',borderBottom:'1px solid var(--border)',transition:'background 0.2s' }}>
      <div style={{ width:7,height:7,borderRadius:'50%',background:hov?'var(--teal)':'var(--ink-3)',marginTop:6,flexShrink:0,transition:'background 0.3s' }} />
      <div>
        <span style={{ fontSize:'0.88rem',fontWeight:500,color:'var(--ink)' }}>{title}</span>
        <span style={{ fontSize:'0.82rem',color:'var(--ink-3)' }}> — {desc}</span>
      </div>
    </div>
  );
}
