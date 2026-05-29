import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Label, Display, It, Body, PageFooter } from './UI';

// ─── Strategy Hero Canvas: Four-lane signal flow ─────────────────────────────
// Four horizontal waveform lanes, each representing a discipline.
// Clean, unique vs FundView's geometric lattice. No neon, no blur/shadow mess.
function StrategyHeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const W = 480, H = 460;
    let t = 0, raf: number;

    // Four signal lanes
    const lanes = [
      { label: 'RESEARCH',   sub: 'Idea Generation',    y: 82,  amp: 18, freq: 1.4, phase: 0,    color: '#0B6E6A', alpha: 0.85 },
      { label: 'ANALYSIS',   sub: 'Fundamental Quality', y: 186, amp: 14, freq: 1.9, phase: 1.1,  color: '#0B6E6A', alpha: 0.65 },
      { label: 'ALLOCATION', sub: 'Portfolio Sizing',    y: 290, amp: 16, freq: 1.6, phase: 2.3,  color: '#1840A8', alpha: 0.70 },
      { label: 'MONITORING', sub: 'Risk & Review',       y: 390, amp: 12, freq: 2.2, phase: 3.5,  color: '#1840A8', alpha: 0.55 },
    ];

    // Moving scan-line position (0→1 across the wave area)
    const WAVE_X0 = 158, WAVE_X1 = W - 28;

    function drawWave(lane: typeof lanes[0], scanX: number) {
      const { y, amp, freq, phase, color } = lane;
      const steps = 200;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const px = WAVE_X0 + (i / steps) * (WAVE_X1 - WAVE_X0);
        const nx = i / steps; // 0..1
        // Compound wave for organic feel
        const wy = y
          + Math.sin(nx * freq * Math.PI * 2 + phase + t * 0.55) * amp
          + Math.sin(nx * freq * 0.5 * Math.PI * 2 + phase * 1.3 + t * 0.3) * amp * 0.35;
        i === 0 ? ctx.moveTo(px, wy) : ctx.lineTo(px, wy);
      }
      ctx.strokeStyle = color + Math.round(lane.alpha * 255).toString(16).padStart(2, '0');
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Traveling dot on the wave
      const dotNx = ((t * 0.012 + phase * 0.15) % 1 + 1) % 1;
      const dotX = WAVE_X0 + dotNx * (WAVE_X1 - WAVE_X0);
      const dotY = y
        + Math.sin(dotNx * freq * Math.PI * 2 + phase + t * 0.55) * amp
        + Math.sin(dotNx * freq * 0.5 * Math.PI * 2 + phase * 1.3 + t * 0.3) * amp * 0.35;

      // Outer ring (soft, no glow/blur)
      ctx.beginPath(); ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
      ctx.strokeStyle = color + '30'; ctx.lineWidth = 1; ctx.stroke();
      // Inner fill
      ctx.beginPath(); ctx.arc(dotX, dotY, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = color + 'cc'; ctx.fill();

      // Vertical scan cursor at scanX
      const scanNx = (scanX - WAVE_X0) / (WAVE_X1 - WAVE_X0);
      const scanY = y
        + Math.sin(scanNx * freq * Math.PI * 2 + phase + t * 0.55) * amp
        + Math.sin(scanNx * freq * 0.5 * Math.PI * 2 + phase * 1.3 + t * 0.3) * amp * 0.35;
      ctx.beginPath(); ctx.arc(scanX, scanY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(242,240,235,0.95)'; ctx.fill();
      ctx.strokeStyle = color + 'aa'; ctx.lineWidth = 1.2; ctx.stroke();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.022;

      // Faint horizontal baseline for each lane
      lanes.forEach(lane => {
        ctx.beginPath();
        ctx.moveTo(WAVE_X0, lane.y);
        ctx.lineTo(WAVE_X1, lane.y);
        ctx.strokeStyle = 'rgba(0,0,0,0.055)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Vertical scan line traveling across
      const scanNorm = (Math.sin(t * 0.18) + 1) / 2;
      const scanX = WAVE_X0 + scanNorm * (WAVE_X1 - WAVE_X0);
      ctx.beginPath();
      ctx.moveTo(scanX, lanes[0].y - 36);
      ctx.lineTo(scanX, lanes[lanes.length - 1].y + 36);
      ctx.strokeStyle = 'rgba(11,110,106,0.07)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw waves
      lanes.forEach(lane => drawWave(lane, scanX));

      // Left labels — large, elegant, no overlap
      lanes.forEach((lane, i) => {
        // Number
        ctx.font = "400 11px 'DM Mono', monospace";
        ctx.fillStyle = lane.color + '55';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`0${i + 1}`, WAVE_X0 - 56, lane.y);

        // Main label — prominent, serif-flavoured mono
        ctx.font = "600 13px 'DM Mono', monospace";
        ctx.fillStyle = lane.color + 'cc';
        ctx.textAlign = 'right';
        ctx.fillText(lane.label, WAVE_X0 - 16, lane.y - 7);

        // Sub-label
        ctx.font = "400 9.5px 'DM Mono', monospace";
        ctx.fillStyle = 'rgba(0,0,0,0.32)';
        ctx.fillText(lane.sub, WAVE_X0 - 16, lane.y + 9);
      });

      // Connector ticks between lanes (left anchor)
      for (let i = 0; i < lanes.length - 1; i++) {
        const ya = lanes[i].y + 28, yb = lanes[i + 1].y - 28;
        ctx.beginPath();
        ctx.moveTo(WAVE_X0 - 16, ya);
        ctx.lineTo(WAVE_X0 - 16, yb);
        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.textAlign = 'left';
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} width={480} height={460} style={{ display: 'block', maxWidth: '100%' }} />;
}

// ─── Pillar card with hover reveal ────────────────────────────────────────────
function PillarCard({ n, title, summary, detail }: { n: string; title: string; summary: string; detail: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${hov ? 'rgba(11,110,106,0.35)' : 'var(--border)'}`,
        borderRadius: 18, padding: '2.2rem 2rem',
        transition: 'all 0.38s cubic-bezier(.22,.8,.4,1)',
        transform: hov ? 'translateY(-7px)' : 'none',
        boxShadow: hov ? '0 24px 64px rgba(11,110,106,0.1), 0 4px 16px rgba(0,0,0,0.05)' : '0 1px 4px rgba(0,0,0,0.03)',
        cursor: 'default', position: 'relative', overflow: 'hidden', minHeight: 240,
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
        background: `linear-gradient(90deg, transparent, rgba(11,110,106,${hov ? 0.7 : 0.2}), transparent)`,
        transition: 'opacity 0.4s',
      }} />
      <div style={{
        position: 'absolute', top: -50, right: -50, width: 130, height: 130, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(11,110,106,0.1) 0%, transparent 70%)',
        opacity: hov ? 1 : 0, transition: 'opacity 0.38s', pointerEvents: 'none',
      }} />
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: '1.2rem', opacity: 0.7 }}>Pillar {n}</div>
      <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: '1.35rem', fontWeight: 400, color: 'var(--ink)', lineHeight: 1.2, marginBottom: '1rem' }}>{title}</div>
      {/* Summary: hidden when hovered */}
      <div style={{ fontSize: '0.83rem', color: 'var(--ink-3)', lineHeight: 1.75, opacity: hov ? 0 : 1, transition: 'opacity 0.28s' }}>{summary}</div>
      {/* Detail: shown on hover */}
      <div style={{
        position: 'absolute', inset: 0, padding: '2.2rem 2rem',
        background: 'var(--bg-card)', opacity: hov ? 1 : 0,
        transition: 'opacity 0.32s', pointerEvents: 'none',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: '0.7rem', opacity: 0.7 }}>Approach</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--ink-2)', lineHeight: 1.8 }}>{detail}</div>
      </div>
    </div>
  );
}

// ─── Research step card ────────────────────────────────────────────────────────
function StepCard({ n, title, items, delay }: { n: string; title: string; items: string[]; delay: number }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${hov ? 'rgba(11,110,106,0.3)' : 'var(--border)'}`,
        borderTop: '2.5px solid var(--teal)',
        borderRadius: 16, padding: '1.8rem 1.6rem',
        transition: 'all 0.34s cubic-bezier(.22,.8,.4,1)',
        transform: hov ? 'translateY(-5px)' : 'none',
        boxShadow: hov ? '0 18px 48px rgba(0,0,0,0.07)' : 'none',
        cursor: 'default',
      }}
    >
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: '1rem', opacity: 0.65 }}>{n}</div>
      <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: '1.18rem', fontWeight: 400, color: 'var(--ink)', lineHeight: 1.2, marginBottom: '1.1rem' }}>{title}</div>
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(item => (
          <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--teal)', marginTop: 7, flexShrink: 0 }} />
            <div style={{ fontSize: '0.8rem', color: 'var(--ink-3)', lineHeight: 1.65 }}>{item}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Portfolio construction canvas ────────────────────────────────────────────
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
        ctx.strokeStyle = 'rgba(11,110,106,0.08)'; ctx.lineWidth = 1; ctx.stroke();
      });
      for (let i = 1; i < vis; i++) {
        ctx.beginPath(); ctx.moveTo(nodes[0].x, nodes[0].y); ctx.lineTo(nodes[i].x, nodes[i].y);
        ctx.strokeStyle = `rgba(11,110,106,${0.10 + Math.sin(t + i * 0.5) * 0.03})`; ctx.lineWidth = 1; ctx.stroke();
      }
      nodes.slice(0, vis).forEach((n, i) => {
        const pulse = (Math.sin(t * 0.9 + i * 0.8) + 1) / 2;
        if (i === 0) {
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r + 12);
          g.addColorStop(0, 'rgba(11,110,106,0.15)'); g.addColorStop(1, 'transparent');
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 12, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fillStyle = 'var(--teal)'; ctx.fill();
          ctx.font = "600 7.5px 'DM Mono',monospace"; ctx.fillStyle = '#fff';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('CORE', n.x, n.y);
        } else {
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r + pulse * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(11,110,106,${0.07 + pulse * 0.05})`; ctx.fill();
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(11,110,106,${0.22 + pulse * 0.12})`;
          ctx.strokeStyle = 'rgba(11,110,106,0.38)'; ctx.lineWidth = 1;
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
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'grid', gridTemplateColumns: '120px 1fr 1fr 1fr',
        gap: 0, padding: '1.1rem 1.4rem',
        borderBottom: '1px solid var(--border)',
        background: hov ? 'var(--bg-alt)' : 'transparent',
        transition: 'background 0.25s', alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--ink)' }}>{label}</span>
      </div>
      <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)', textAlign: 'center' }}>{equity}</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)', textAlign: 'center' }}>{hedging}</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)', textAlign: 'center' }}>{cash}</div>
    </div>
  );
}

// ─── Risk flow diagram ────────────────────────────────────────────────────────
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
      { label: 'Market Conditions', x: 50,  y: 34, w: 110, color: '#0B6E6A' },
      { label: 'Risk Assessment',   x: 170, y: 98, w: 110, color: '#1840A8' },
      { label: 'Portfolio Adjust.', x: 50,  y: 160, w: 110, color: '#555' },
    ];
    function draw() {
      ctx.clearRect(0, 0, W, H);
      if (!inView) { raf = requestAnimationFrame(draw); return; }

      // Connecting arrows
      const arrowPts = [
        { x1: 155, y1: 54, x2: 195, y2: 98 },
        { x1: 195, y1: 118, x2: 155, y2: 160 },
      ];
      arrowPts.forEach(a => {
        ctx.beginPath(); ctx.moveTo(a.x1, a.y1); ctx.lineTo(a.x2, a.y2);
        ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
      });

      boxes.forEach((b, i) => {
        const barW = (0.45 + 0.22 * Math.sin(t * 0.6 + i * 1.1)) * b.w;
        // Track
        ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, 20, 5);
        ctx.fillStyle = 'rgba(0,0,0,0.04)'; ctx.fill();
        // Bar
        ctx.beginPath(); ctx.roundRect(b.x, b.y, barW, 20, 5);
        ctx.fillStyle = b.color + 'cc'; ctx.fill();
        // Label
        ctx.font = "400 8px 'DM Mono',monospace";
        ctx.fillStyle = 'var(--ink-3)'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText(b.label, b.x, b.y - 14);
      });

      t += 0.016;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [inView]);
  return <div ref={wRef}><canvas ref={ref} width={340} height={200} style={{ display: 'block', maxWidth: '100%' }} /></div>;
}

// ─── Probability node canvas ───────────────────────────────────────────────────
function ProbCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const W = 320, H = 200;
    let t = 0, raf: number;
    const pts = [
      { x: 60,  y: 50,  label: 'Exposure', phase: 0   },
      { x: 160, y: 50,  label: 'Hedging',  phase: 0.8 },
      { x: 260, y: 50,  label: 'Tactical', phase: 1.6 },
      { x: 60,  y: 130, label: 'Cash',     phase: 2.4 },
      { x: 160, y: 130, label: 'Sizing',   phase: 3.2 },
      { x: 260, y: 130, label: 'Entry',    phase: 4.0 },
    ];
    function draw() {
      ctx.clearRect(0, 0, W, H);
      // Edges
      pts.forEach((a, i) => {
        pts.forEach((b, j) => {
          if (j <= i) return;
          const d = Math.hypot(b.x - a.x, b.y - a.y);
          if (d > 130) return;
          const pulse = (Math.sin(t + a.phase) + 1) / 2;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(11,110,106,${0.06 + pulse * 0.12})`; ctx.lineWidth = 1; ctx.stroke();
        });
      });
      // Nodes
      pts.forEach(p => {
        const pulse = (Math.sin(t * 1.1 + p.phase) + 1) / 2;
        const r = 5 + pulse * 3;
        ctx.beginPath(); ctx.arc(p.x, p.y, r + 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(11,110,106,${0.05 + pulse * 0.07})`; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(11,110,106,${0.35 + pulse * 0.35})`; ctx.fill();
        ctx.font = "500 7px 'DM Mono',monospace";
        ctx.fillStyle = `rgba(11,110,106,${0.6 + pulse * 0.3})`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText(p.label, p.x, p.y + r + 5);
        // Probability
        const pct = Math.round(60 + pulse * 35);
        ctx.font = "500 6.5px 'DM Mono',monospace";
        ctx.fillStyle = `rgba(11,110,106,${0.4 + pulse * 0.3})`;
        ctx.textBaseline = 'bottom';
        ctx.fillText(pct + '%', p.x, p.y - r - 3);
      });
      t += 0.018;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} width={320} height={200} style={{ display: 'block', maxWidth: '100%' }} />;
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

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function StrategyView() {
  return (
    <div>

      {/* ══════════════════════════════════════════════
          SECTION 1 · STRATEGY HERO
      ═══════════════════════════════════════════════ */}
      <section style={{ paddingTop: 130, paddingBottom: 100, padding: '130px 5vw 100px', position: 'relative', overflow: 'hidden', minHeight: '88vh', display: 'flex', alignItems: 'center' }}>
        {/* Background grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(11,110,106,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(11,110,106,0.04) 1px,transparent 1px)', backgroundSize: '64px 64px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 75% 50%, rgba(242,240,235,0) 20%, rgba(242,240,235,0.72) 80%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6vw', alignItems: 'center', width: '100%' }}>
          {/* Left: text */}
          <div>
            <motion.div {...wv(0)}>
              <Label>Investment Framework</Label>
            </motion.div>
            <motion.div {...wv(0.3)}>
              <Display size="xl" style={{ marginBottom: '1.8rem', lineHeight: 1.0 }}>
                Inside the<br /><It>Investment Engine.</It>
              </Display>
            </motion.div>
            <motion.div {...wv(0.6)}>
              <Body style={{ maxWidth: 460, fontSize: '1.02rem', lineHeight: 1.85, marginBottom: '1.4rem' }}>
                An institutionally disciplined investment approach integrating quantitative intelligence, fundamental research, and adaptive portfolio management.
              </Body>
            </motion.div>
            <motion.div {...wv(0.9)}>
              <Body style={{ maxWidth: 460, lineHeight: 1.85 }}>
                Every capital decision flows through four interconnected stages — from research and analysis through to allocation and continuous monitoring.
              </Body>
            </motion.div>
          </div>

          {/* Right: strategy pipeline canvas */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.8 }}
            style={{ display: 'flex', justifyContent: 'center' }}>
            <StrategyHeroCanvas />
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ══════════════════════════════════════════════
          SECTION 2 · INVESTMENT PHILOSOPHY
      ═══════════════════════════════════════════════ */}
      <section style={{ padding: '100px 5vw' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '8vw', alignItems: 'center' }}>
          <motion.div {...wv(0)}>
            <Label>Investment Philosophy</Label>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 400, color: 'var(--ink)', lineHeight: 1.25, letterSpacing: '-0.02em', marginBottom: '2rem' }}>
              "We seek high-quality businesses with durable growth potential and allocate capital dynamically based on market conditions, valuation opportunities, and{' '}
              <em style={{ color: 'var(--teal)', fontStyle: 'italic' }}>risk-reward considerations.</em>"
            </div>
            <Body>
              The philosophy combines long-term ownership, research intensity, and capital efficiency with dynamic allocation that responds to evolving market conditions — never anchored to static positions or benchmark constraints.
            </Body>
          </motion.div>
          <motion.div {...wv(0.3)}>
            <PhilosophyList />
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ══════════════════════════════════════════════
          SECTION 3 · FOUR PILLARS
      ═══════════════════════════════════════════════ */}
      <section style={{ padding: '100px 5vw' }}>
        <motion.div {...wv(0)} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6vw', alignItems: 'end', marginBottom: '3.5rem' }}>
          <div>
            <Label>The Quantamental Edge</Label>
            <Display size="lg">Four pillars of our<br /><It>investment discipline.</It></Display>
          </div>
          <Body style={{ maxWidth: 400 }}>
            Each pillar works in concert — no single system drives decisions. Hover any card to see the operational detail behind each pillar.
          </Body>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            {
              n: '1', title: 'Market Regime Intelligence',
              summary: 'Assessing macro conditions, liquidity, valuation environment, and market structure to understand prevailing dynamics.',
              detail: 'Macro analysis covers economic cycle mapping, liquidity conditions, credit spreads, and global capital flows. Sector rotation signals and valuation environment analysis drive net exposure decisions across our three-state regime model.',
            },
            {
              n: '2', title: 'Quantitative Analytics',
              summary: 'Proprietary screeners, probability models, and historical market studies provide data-driven decision support.',
              detail: 'Proprietary quantitative screens identify opportunity sets across the Indian equity universe. Statistical analysis and historical market studies inform position sizing. Probability-weighted models validate conviction scores for every holding.',
            },
            {
              n: '3', title: 'Fundamental Research',
              summary: 'Business quality, promoter integrity, financial strength, and competitive moat assessment underpin every holding.',
              detail: 'Deep research covers business model evaluation, competitive advantage durability, promoter background and track record, industry expert interactions, forensic accounting review, and financial analysis of RoE trajectory and capital allocation history.',
            },
            {
              n: '4', title: 'Dynamic Capital Allocation',
              summary: 'Capital rotates toward opportunities with superior risk-reward while actively managing downside exposure.',
              detail: 'Flexible 0–100% mandate across equity, debt, cash, and derivatives. Capital is deployed only when reward-to-risk thresholds are met. Reallocation is driven by conviction evolution, regime shifts, and emerging asymmetric opportunities.',
            },
          ].map((p, i) => (
            <motion.div key={p.n} {...wv(i * 0.1)}>
              <PillarCard {...p} />
            </motion.div>
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* ══════════════════════════════════════════════
          SECTION 4 · RESEARCH PROCESS
      ═══════════════════════════════════════════════ */}
      <section style={{ padding: '100px 5vw' }}>
        <motion.div {...wv(0)} style={{ marginBottom: '4rem' }}>
          <Label>Research Process</Label>
          <Display size="lg" style={{ maxWidth: 480 }}>From idea to <It>conviction.</It></Display>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, position: 'relative' }}>
          {/* Connecting line */}
          <div style={{ position: 'absolute', top: -1, left: '12.5%', right: '12.5%', height: 1, background: 'linear-gradient(90deg, transparent, var(--teal), transparent)', opacity: 0.15 }} />
          {[
            {
              n: 'Step 01', title: 'Idea Generation',
              items: ['Proprietary quantitative screeners', 'Secondary research & sector mapping', 'Opportunity sourcing across market cap'],
            },
            {
              n: 'Step 02', title: 'Fundamental Analysis',
              items: ['Business quality & moat assessment', 'Promoter evaluation & due diligence', 'Industry expert consultations', 'Forensic accounting review'],
            },
            {
              n: 'Step 03', title: 'Valuation',
              items: ['Discounted Cash Flow modelling', 'Peer and relative comparison', 'Risk-reward asymmetry assessment'],
            },
            {
              n: 'Step 04', title: 'Investment Decision',
              items: ['Position sizing & portfolio fit', 'Capital allocation priority', 'Entry rules & long-term monitoring'],
            },
          ].map((s, i) => (
            <StepCard key={s.n} {...s} delay={i * 0.12} />
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* ══════════════════════════════════════════════
          SECTION 5 · PORTFOLIO CONSTRUCTION
      ═══════════════════════════════════════════════ */}
      <section style={{ padding: '100px 5vw' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8vw', alignItems: 'center' }}>
          <motion.div {...wv(0)}>
            <Label>Portfolio Construction</Label>
            <Display size="lg" style={{ marginBottom: '1.4rem' }}>
              Focused.<br />Disciplined.<br /><It>Adaptive.</It>
            </Display>
            <Body style={{ marginBottom: '2rem' }}>
              The portfolio typically holds 12–15 high-conviction positions with disciplined exposure management and active monitoring across full market cycles.
            </Body>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                ['~12–15 Positions', 'Concentrated alpha, not diluted diversification'],
                ['10% Single-Stock Cap', 'Disciplined sizing protects portfolio downside'],
                ['Long-Term Ownership', 'Holding horizon aligned with value creation cycles'],
                ['Dynamic Rotation', 'Active reallocation as conviction and regime evolve'],
                ['0–100% Equity Flex', 'Full mandate; cash is an active allocation decision'],
              ].map(([title, desc]) => (
                <ConstructionRow key={title} title={title} desc={desc} />
              ))}
            </div>
          </motion.div>
          <motion.div {...wv(0.3)} style={{ display: 'flex', justifyContent: 'center' }}>
            <PortfolioConstCanvas />
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ══════════════════════════════════════════════
          SECTION 6 · MARKET REGIME FRAMEWORK
      ═══════════════════════════════════════════════ */}
      <section style={{ padding: '100px 5vw' }}>
        <motion.div {...wv(0)} style={{ marginBottom: '3rem' }}>
          <Label>Market Regime Framework</Label>
          <Display size="lg" style={{ maxWidth: 520 }}>
            Three states.<br /><It>One adaptive system.</It>
          </Display>
        </motion.div>
        <motion.div {...wv(0.3)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
            {/* Header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 1fr', gap: 0, padding: '0.9rem 1.4rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-alt)' }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Regime</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', textAlign: 'center' }}>Equity Exposure</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', textAlign: 'center' }}>Hedging</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', textAlign: 'center' }}>Cash Level</div>
            </div>
            <RegimeRow label="Expansion"    equity="70–100%"  hedging="Minimal"    cash="Low"      color="var(--teal)" />
            <RegimeRow label="Consolidation" equity="40–70%"  hedging="Moderate"   cash="Moderate" color="#B8860B" />
            <RegimeRow label="Correction"   equity="0–40%"   hedging="Elevated"   cash="High"     color="var(--blue)" />
          </div>
        </motion.div>
        <motion.div {...wv(0.5)} style={{ marginTop: '2rem' }}>
          <Body style={{ maxWidth: 680 }}>
            Regime classification is updated continuously using macro indicators, liquidity conditions, credit market signals, and market breadth data. There are no fixed allocations — every position reflects the current regime probability assessment.
          </Body>
        </motion.div>
      </section>

      <SectionDivider />

      {/* ══════════════════════════════════════════════
          SECTION 7 · PROBABILISTIC INTELLIGENCE
      ═══════════════════════════════════════════════ */}
      <section style={{ padding: '100px 5vw' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8vw', alignItems: 'center' }}>
          <motion.div {...wv(0)}>
            <Label>Probabilistic Intelligence Layer</Label>
            <Display size="lg" style={{ marginBottom: '1.4rem' }}>
              Decision support.<br /><It>Not automation.</It>
            </Display>
            <Body style={{ marginBottom: '1.6rem' }}>
              The investment process incorporates proprietary probability frameworks derived from historical market data. These models assist human judgment — they do not replace it.
            </Body>
            <Body style={{ marginBottom: '2rem' }}>
              Each investment decision is supported by a probability-weighted scenario analysis covering base, bull, and bear cases. Position sizes are derived from expected value calculations, not conviction alone.
            </Body>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Exposure decisions', 'Hedging calibration', 'Tactical positioning', 'Cash allocation'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--teal)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--ink-2)' }}>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div {...wv(0.3)} style={{ display: 'flex', justifyContent: 'center' }}>
            <ProbCanvas />
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ══════════════════════════════════════════════
          SECTION 8 · RISK MANAGEMENT
      ═══════════════════════════════════════════════ */}
      <section style={{ padding: '100px 5vw' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8vw', alignItems: 'center' }}>
          <motion.div {...wv(0)} style={{ display: 'flex', justifyContent: 'center' }}>
            <div>
              <RiskFlowCanvas />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
                {[
                  ['Tactical Hedging',  'Systematic downside protection'],
                  ['Cash Flexibility',  '0–100% allocation range'],
                  ['Regime Adaptation', 'Macro-driven exposure shifts'],
                  ['Exposure Control',  'Dynamic gross / net management'],
                ].map(([t, d]) => (
                  <div key={t} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.9rem 1rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--ink)', marginBottom: 3 }}>{t}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--ink-3)', lineHeight: 1.5 }}>{d}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          <motion.div {...wv(0.3)}>
            <Label>Risk Management & Capital Allocation</Label>
            <Display size="lg" style={{ marginBottom: '1.4rem' }}>
              Intelligent risk.<br /><It>Adaptive capital.</It>
            </Display>
            <Body style={{ marginBottom: '1.6rem' }}>
              Risk management is not a constraint on returns — it is the foundation of them. Every allocation decision integrates rigorous downside risk assessment, regime probability, and portfolio-level exposure control.
            </Body>
            <Body>
              As market conditions evolve, capital is reallocated — hedges adjusted, cash deployed or preserved, and gross exposure shifted to reflect the prevailing risk-reward environment. The framework is dynamic, never static.
            </Body>
          </motion.div>
        </div>
      </section>

      <PageFooter disc="Strategy descriptions are informational only. Not a guarantee of returns. SEBI Category III AIF. For eligible investors only." />
    </div>
  );
}

// ── Sub-components ──
function PhilosophyList() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: '-80px' });
  const items = ['Long-term ownership', 'Dynamic allocation', 'Research intensity', 'Capital efficiency', 'Risk-adjusted decision making'];
  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {items.map((item, i) => (
        <React.Fragment key={item}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ delay: i * 0.18, duration: 0.5 }}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderLeft: `3px solid rgba(11,110,106,${0.3 + i * 0.14})`,
              borderRadius: 12, padding: '1rem 1.4rem',
              display: 'flex', alignItems: 'center', gap: 14,
            }}
          >
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: `rgba(11,110,106,${0.07 + i * 0.07})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Mono',monospace", fontSize: '0.6rem', color: 'var(--teal)', flexShrink: 0 }}>{i + 1}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--ink)' }}>{item}</div>
          </motion.div>
          {i < items.length - 1 && (
            <motion.div
              initial={{ scaleY: 0 }}
              animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
              transition={{ delay: i * 0.18 + 0.28, duration: 0.28 }}
              style={{ width: 1.5, height: 22, background: 'linear-gradient(to bottom, var(--teal), transparent)', marginLeft: 55, opacity: 0.4, transformOrigin: 'top' }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function ConstructionRow({ title, desc }: { title: string; desc: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '0.8rem 0', borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
    >
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: hov ? 'var(--teal)' : 'var(--ink-3)', marginTop: 6, flexShrink: 0, transition: 'background 0.3s' }} />
      <div>
        <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--ink)' }}>{title}</span>
        <span style={{ fontSize: '0.82rem', color: 'var(--ink-3)' }}> — {desc}</span>
      </div>
    </div>
  );
}
