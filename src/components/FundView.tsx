import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Label, Display, It, Body, Btn, PageFooter } from './UI';
import type { AppView } from '../types';

interface Props { setView: (v: AppView) => void; }

// ─────────────────────────────────────────────
// HERO GRAPHIC: Elegant geometric lattice with
// rotating outer ring and breathing core glyph
// ─────────────────────────────────────────────
function HeroGraphic() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const W = 520, H = 520; cv.width = W; cv.height = H;
    const cx = W / 2, cy = H / 2;
    let t = 0, raf: number;

    // Outer polygon vertices helper
    function poly(n: number, r: number, rot = 0): [number, number][] {
      return Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + rot;
        return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
      });
    }

    // Draw a closed polygon path
    function drawPoly(pts: [number, number][], stroke: string, lw = 1) {
      ctx.beginPath();
      pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
      ctx.closePath();
      ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke();
    }

    // Connect all vertices of two sets with lines
    function lattice(a: [number, number][], b: [number, number][], alpha: number) {
      a.forEach(pa => b.forEach(pb => {
        ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]);
        ctx.strokeStyle = `rgba(11,110,106,${alpha})`; ctx.lineWidth = 0.5; ctx.stroke();
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // --- Concentric faint guide circles ---
      [220, 170, 118, 68].forEach((r, i) => {
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,0,0,${0.04 + i * 0.012})`; ctx.lineWidth = 1; ctx.stroke();
      });

      // --- Slowly rotating outer hexagon ---
      const hex6 = poly(6, 215, t * 0.004);
      drawPoly(hex6, `rgba(11,110,106,0.18)`, 1.2);

      // --- Counter-rotating 12-gon ---
      const gon12 = poly(12, 168, -t * 0.007);
      drawPoly(gon12, `rgba(11,110,106,0.10)`, 0.8);

      // --- Inner rotating square ---
      const sq4 = poly(4, 115, t * 0.011 + Math.PI / 4);
      drawPoly(sq4, `rgba(11,110,106,0.16)`, 1);

      // --- Lattice between hex and 12-gon ---
      // Connect every other hex vertex to nearest 12-gon vertices
      hex6.forEach((hv, hi) => {
        const nb = gon12[hi * 2 % 12];
        ctx.beginPath(); ctx.moveTo(hv[0], hv[1]); ctx.lineTo(nb[0], nb[1]);
        ctx.strokeStyle = `rgba(11,110,106,0.09)`; ctx.lineWidth = 0.6; ctx.stroke();
      });

      // --- Lattice: 12-gon ↔ square ---
      lattice(gon12.filter((_, i) => i % 3 === 0), sq4, 0.07);

      // --- Spokes from center to hex vertices ---
      hex6.forEach(([x, y]) => {
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y);
        ctx.strokeStyle = `rgba(11,110,106,0.06)`; ctx.lineWidth = 0.7; ctx.stroke();
      });

      // --- Breathing inner triangle ---
      const breath = 1 + Math.sin(t * 0.045) * 0.06;
      const tri3 = poly(3, 64 * breath, t * 0.018);
      drawPoly(tri3, `rgba(11,110,106,0.5)`, 1.5);

      // --- Spinning inner crosshair ---
      const ch = poly(4, 46 * breath, t * 0.03 + Math.PI / 4);
      ch.forEach(([x, y]) => {
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y);
        ctx.strokeStyle = `rgba(11,110,106,0.3)`; ctx.lineWidth = 1; ctx.stroke();
      });

      // --- Core circle: pure white fill, teal stroke ---
      ctx.beginPath(); ctx.arc(cx, cy, 28 * breath, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(242,240,235,0.95)'; ctx.fill();
      ctx.strokeStyle = 'rgba(11,110,106,0.55)'; ctx.lineWidth = 1.5; ctx.stroke();

      // --- Ticker dots on outer polygon edges ---
      hex6.forEach(([ax, ay], i) => {
        const [bx, by] = hex6[(i + 1) % 6];
        const s = (Math.sin(t * 0.06 + i * 1.05) + 1) / 2;
        ctx.beginPath(); ctx.arc(ax + (bx - ax) * s, ay + (by - ay) * s, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(11,110,106,0.55)'; ctx.fill();
      });

      // --- Tiny dots at 12-gon vertices ---
      gon12.forEach(([x, y]) => {
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(11,110,106,0.25)'; ctx.fill();
      });

      t += 1;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <canvas ref={ref} width={520} height={520} style={{ display: 'block', maxWidth: '100%', opacity: 0.92 }} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Flow steps (under hero)
// ─────────────────────────────────────────────
function FlowDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: '-80px' });
  const steps = ['Research', 'Analysis', 'Allocation', 'Risk Mgmt'];
  return (
    <div ref={ref} style={{ display: 'flex', alignItems: 'center', gap: 0, justifyContent: 'flex-start', flexWrap: 'wrap' }}>
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ delay: i * 0.18, duration: 0.55 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            <div style={{
              width: 88, height: 88, borderRadius: '50%',
              background: 'rgba(11,110,106,0.06)',
              border: `1.5px solid rgba(11,110,106,${0.2 + i * 0.15})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'DM Mono',monospace", fontSize: '0.58rem',
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--teal)', textAlign: 'center',
            }}>
              <span style={{ padding: '0 10px', lineHeight: 1.5 }}>{s}</span>
            </div>
          </motion.div>
          {i < steps.length - 1 && (
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={inView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
              transition={{ delay: i * 0.18 + 0.35, duration: 0.4 }}
              style={{ width: 36, height: 1.5, background: 'linear-gradient(90deg,var(--teal),rgba(11,110,106,0.25))', transformOrigin: 'left', flexShrink: 0, margin: '0 2px' }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Philosophy flow
// ─────────────────────────────────────────────
function PhilosophyFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: '-80px' });
  const items = ['Market Regime', 'Research', 'Decision', 'Capital Allocation'];
  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {items.map((item, i) => (
        <React.Fragment key={item}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ delay: i * 0.2, duration: 0.5 }}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderLeft: `3px solid rgba(11,110,106,${0.25 + i * 0.22})`,
              borderRadius: 12, padding: '1rem 1.4rem',
              display: 'flex', alignItems: 'center', gap: 14,
            }}
          >
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: `rgba(11,110,106,${0.07 + i * 0.07})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Mono',monospace", fontSize: '0.62rem', color: 'var(--teal)', flexShrink: 0 }}>{i + 1}</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 400, color: 'var(--ink)' }}>{item}</div>
          </motion.div>
          {i < items.length - 1 && (
            <motion.div
              initial={{ scaleY: 0 }}
              animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
              transition={{ delay: i * 0.2 + 0.3, duration: 0.3 }}
              style={{ width: 1.5, height: 26, background: 'linear-gradient(to bottom, rgba(11,110,106,0.4), transparent)', marginLeft: 55, transformOrigin: 'top' }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// STRATEGY ADVANTAGE GRAPHIC 1:
// Regime Wheel – clean geometric arc dial
// ─────────────────────────────────────────────
function RegimeWheelGraphic() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const W = 220, H = 220; cv.width = W; cv.height = H;
    const cx = W / 2, cy = H / 2;
    let t = 0, raf: number;

    const segs = [
      { label: 'EXPANSION',     a0: -Math.PI / 2,                end: -Math.PI / 2 + (Math.PI * 2) / 3, c: '#0B6E6A' },
      { label: 'CONSOLIDATION', a0: -Math.PI / 2 + (Math.PI * 2) / 3, end: -Math.PI / 2 + (Math.PI * 4) / 3, c: '#888888' },
      { label: 'CORRECTION',    a0: -Math.PI / 2 + (Math.PI * 4) / 3, end: -Math.PI / 2 + Math.PI * 2, c: '#1840A8' },
    ];

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Which segment is "active"
      const activeIdx = Math.floor(((t * 0.012) % 3));

      segs.forEach((seg, i) => {
        const active = i === activeIdx;
        const r = active ? 92 : 82;
        const alpha = active ? 1 : 0.28;
        const gap = 0.04;

        // Arc segment
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, seg.a0 + gap, seg.end - gap);
        ctx.closePath();
        ctx.fillStyle = seg.c + Math.round(alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();

        // Outer stroke for active
        if (active) {
          ctx.beginPath();
          ctx.arc(cx, cy, r, seg.a0 + gap, seg.end - gap);
          ctx.strokeStyle = seg.c + 'cc'; ctx.lineWidth = 2; ctx.stroke();
        }

        // Label along arc midpoint
        const mid = (seg.a0 + seg.end) / 2;
        const lr = active ? 64 : 58;
        const lx = cx + Math.cos(mid) * lr;
        const ly = cy + Math.sin(mid) * lr;
        ctx.font = `${active ? '600' : '400'} 7px 'DM Mono', monospace`;
        ctx.fillStyle = active ? '#fff' : `${seg.c}88`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(seg.label, lx, ly);
      });

      // Animated needle
      const needleAngle = -Math.PI / 2 + ((activeIdx / 3) * Math.PI * 2 + Math.PI / 3)
        + Math.sin(t * 0.05) * 0.06;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(needleAngle);
      ctx.beginPath(); ctx.moveTo(0, 7); ctx.lineTo(0, -70);
      ctx.strokeStyle = 'rgba(11,110,106,0.7)'; ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.stroke();
      ctx.restore();

      // Center circle
      ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fillStyle = 'var(--bg)'; ctx.fill();
      ctx.strokeStyle = 'rgba(11,110,106,0.2)'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.font = "500 7px 'DM Mono', monospace";
      ctx.fillStyle = 'var(--teal)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('REGIME', cx, cy);

      t += 1;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} width={220} height={220} style={{ display: 'block' }} />;
}

// ─────────────────────────────────────────────
// STRATEGY ADVANTAGE GRAPHIC 2:
// Portfolio constellation – clean orbiting dots
// ─────────────────────────────────────────────
function PortfolioConstellation() {
  const ref = useRef<HTMLCanvasElement>(null);
  const wRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wRef, { once: false, margin: '-60px' });
  const phaseRef = useRef(0);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const W = 220, H = 220; cv.width = W; cv.height = H;
    const cx = W / 2, cy = H / 2;
    let t = 0, raf: number;

    const N = 13;
    const nodes = [{ x: cx, y: cy, r: 16 }];
    for (let i = 1; i < N; i++) {
      const angle = ((i - 1) / (N - 1)) * Math.PI * 2 - Math.PI / 2;
      const ring = i <= 6 ? 72 : 112;
      nodes.push({ x: cx + Math.cos(angle) * ring, y: cy + Math.sin(angle) * ring, r: 5 + (i % 3) * 2 });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const vis = Math.min(N, 1 + Math.floor(phaseRef.current * (N - 1) * 1.1));

      // Guide rings
      [72, 112].forEach(r => {
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,0,0,0.05)'; ctx.lineWidth = 1; ctx.stroke();
      });

      // Edges from center
      for (let i = 1; i < vis; i++) {
        ctx.beginPath(); ctx.moveTo(nodes[0].x, nodes[0].y); ctx.lineTo(nodes[i].x, nodes[i].y);
        ctx.strokeStyle = `rgba(11,110,106,${0.1 + Math.sin(t * 0.04 + i) * 0.03})`; ctx.lineWidth = 0.8; ctx.stroke();
      }
      // Outer ring connections
      for (let i = 7; i < vis; i++) {
        ctx.beginPath(); ctx.moveTo(nodes[i - 6].x, nodes[i - 6].y); ctx.lineTo(nodes[i].x, nodes[i].y);
        ctx.strokeStyle = 'rgba(11,110,106,0.06)'; ctx.lineWidth = 0.6; ctx.stroke();
      }

      nodes.slice(0, vis).forEach((n, i) => {
        const pulse = (Math.sin(t * 0.05 + i * 0.7) + 1) / 2;
        if (i === 0) {
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 8, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(11,110,106,0.06)'; ctx.fill();
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(11,110,106,0.9)'; ctx.fill();
          ctx.font = "600 7px 'DM Mono', monospace"; ctx.fillStyle = '#fff';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('CORE', n.x, n.y);
        } else {
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r + pulse * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(11,110,106,${0.07 + pulse * 0.05})`; ctx.fill();
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(11,110,106,${0.22 + pulse * 0.14})`;
          ctx.strokeStyle = 'rgba(11,110,106,0.35)'; ctx.lineWidth = 1;
          ctx.fill(); ctx.stroke();
        }
      });
      t += 1;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!inView) { phaseRef.current = 0; return; }
    let f = 0;
    const id = setInterval(() => { phaseRef.current = Math.min(1, f / 60); f++; if (f > 60) clearInterval(id); }, 16);
    return () => clearInterval(id);
  }, [inView]);

  return <div ref={wRef}><canvas ref={ref} width={220} height={220} style={{ display: 'block' }} /></div>;
}

// ─────────────────────────────────────────────
// STRATEGY ADVANTAGE GRAPHIC 3:
// Probability grid – minimal point network
// ─────────────────────────────────────────────
function ProbabilityGrid() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const W = 220, H = 220; cv.width = W; cv.height = H;
    let t = 0, raf: number;

    const pts = Array.from({ length: 9 }, (_, i) => ({
      x: 30 + (i % 3) * 80, y: 30 + Math.floor(i / 3) * 80,
      phase: i * 0.7, val: 55 + i * 5,
    }));

    function draw() {
      ctx.clearRect(0, 0, W, H);
      // Connections
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[j].x - pts[i].x, dy = pts[j].y - pts[i].y;
        if (Math.hypot(dx, dy) < 100) {
          const pulse = (Math.sin(t * 0.05 + pts[i].phase) + 1) / 2;
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(11,110,106,${0.07 + pulse * 0.1})`; ctx.lineWidth = 0.8; ctx.stroke();
        }
      }
      pts.forEach(p => {
        const pulse = (Math.sin(t * 0.06 + p.phase) + 1) / 2;
        const r = 6 + pulse * 4;
        // outer ring
        ctx.beginPath(); ctx.arc(p.x, p.y, r + 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(11,110,106,${0.05 + pulse * 0.04})`; ctx.fill();
        // dot
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(11,110,106,${0.28 + pulse * 0.38})`; ctx.fill();
        // probability text
        ctx.font = "500 7.5px 'DM Mono', monospace";
        ctx.fillStyle = `rgba(11,110,106,${0.55 + pulse * 0.3})`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText(`${p.val}%`, p.x, p.y + r + 3);
      });
      t += 1;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} width={220} height={220} style={{ display: 'block' }} />;
}

// ─────────────────────────────────────────────
// Process flow (research → conviction)
// ─────────────────────────────────────────────
function ProcessFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: '-60px' });
  const steps = [
    { n: '01', title: 'Idea Generation', items: ['Proprietary quantitative screeners', 'Secondary research', 'Opportunity discovery'] },
    { n: '02', title: 'Fundamental Analysis', items: ['Business quality assessment', 'Promoter evaluation', 'Financial analysis'] },
    { n: '03', title: 'Valuation', items: ['DCF analysis', 'Relative valuation', 'Risk-reward assessment'] },
    { n: '04', title: 'Investment Decision', items: ['Position sizing', 'Portfolio integration', 'Long-term monitoring'] },
  ];
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: 35, left: '12.5%', right: '12.5%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(11,110,106,0.2), transparent)' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        {steps.map((s, i) => (
          <motion.div key={s.n}
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
            transition={{ delay: i * 0.15, duration: 0.6 }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <div style={{
                width: 70, height: 70, borderRadius: '50%', background: 'var(--bg-card)',
                border: `1.5px solid rgba(11,110,106,${0.18 + i * 0.18})`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1,
              }}>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.62rem', letterSpacing: '0.2em', color: 'var(--teal)', textTransform: 'uppercase' }}>{s.n}</div>
              </div>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: '2px solid rgba(11,110,106,0.35)', borderRadius: 14, padding: '1.4rem 1.2rem' }}>
              <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: '1.1rem', fontWeight: 400, color: 'var(--ink)', marginBottom: '1rem', lineHeight: 1.2 }}>{s.title}</div>
              {s.items.map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(11,110,106,0.5)', marginTop: 7, flexShrink: 0 }} />
                  <div style={{ fontSize: '0.8rem', color: 'var(--ink-3)', lineHeight: 1.65 }}>{item}</div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div
        animate={inView ? { left: ['12.5%', '87.5%'], opacity: [0, 1, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 2.2, delay: 0.8, repeat: Infinity, repeatDelay: 3.5 }}
        style={{ position: 'absolute', top: 29, width: 12, height: 12, borderRadius: '50%', background: 'var(--teal)', opacity: 0 }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Large portfolio viz (portfolio construction section)
// ─────────────────────────────────────────────
function LargePortfolioViz() {
  const ref = useRef<HTMLCanvasElement>(null);
  const wRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wRef, { once: false, margin: '-60px' });
  const progressRef = useRef(0);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const W = 400, H = 340; cv.width = W; cv.height = H;
    const cx = W / 2, cy = H / 2;
    let t = 0, raf: number;
    const N = 14;
    const nodes = [{ x: cx, y: cy, r: 20, label: 'CORE' }];
    for (let i = 1; i < N; i++) {
      const angle = ((i - 1) / (N - 1)) * Math.PI * 2 - Math.PI / 2;
      const ring = i <= 7 ? 96 : 148;
      nodes.push({ x: cx + Math.cos(angle) * ring, y: cy + Math.sin(angle) * ring, r: 7 + (i % 3) * 3, label: '' });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const vis = Math.min(N, Math.floor(progressRef.current * N * 1.1));

      [96, 148].forEach(r => {
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,0,0,0.04)'; ctx.lineWidth = 1; ctx.stroke();
      });

      for (let i = 1; i < vis; i++) {
        ctx.beginPath(); ctx.moveTo(nodes[0].x, nodes[0].y); ctx.lineTo(nodes[i].x, nodes[i].y);
        ctx.strokeStyle = `rgba(11,110,106,${0.09 + Math.sin(t * 0.04 + i * 0.5) * 0.03})`; ctx.lineWidth = 0.8; ctx.stroke();
        if (i > 7) {
          ctx.beginPath(); ctx.moveTo(nodes[i - 7].x, nodes[i - 7].y); ctx.lineTo(nodes[i].x, nodes[i].y);
          ctx.strokeStyle = 'rgba(11,110,106,0.05)'; ctx.lineWidth = 0.6; ctx.stroke();
        }
      }

      nodes.slice(0, vis).forEach((n, i) => {
        const pulse = (Math.sin(t * 0.05 + i * 0.8) + 1) / 2;
        if (i === 0) {
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 10, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(11,110,106,0.07)'; ctx.fill();
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(11,110,106,0.85)'; ctx.fill();
          ctx.font = "600 7px 'DM Mono', monospace"; ctx.fillStyle = '#fff';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('CORE', n.x, n.y);
        } else {
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r + pulse * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(11,110,106,${0.06 + pulse * 0.05})`; ctx.fill();
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(11,110,106,${0.22 + pulse * 0.14})`;
          ctx.strokeStyle = 'rgba(11,110,106,0.3)'; ctx.lineWidth = 1;
          ctx.fill(); ctx.stroke();
        }
      });
      t += 1;
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

  return <div ref={wRef}><canvas ref={ref} width={400} height={340} style={{ display: 'block', maxWidth: '100%' }} /></div>;
}

// ─────────────────────────────────────────────
// Risk layers bar chart
// ─────────────────────────────────────────────
function RiskLayers() {
  const ref = useRef<HTMLCanvasElement>(null);
  const wRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const W = 340, H = 200; cv.width = W; cv.height = H;
    let t = 0, raf: number;
    const layers = [
      { label: 'Market Conditions', c: '#0B6E6A', y: 40 },
      { label: 'Risk Assessment',   c: '#1840A8', y: 104 },
      { label: 'Portfolio Adjust.', c: '#555555', y: 168 },
    ];

    function draw() {
      ctx.clearRect(0, 0, W, H);
      layers.forEach((l, i) => {
        const barW = (0.42 + 0.22 * Math.sin(t * 0.04 + i * 1.1)) * (W - 110);
        // Track
        ctx.beginPath(); ctx.roundRect(100, l.y - 9, W - 108, 20, 5);
        ctx.fillStyle = 'rgba(0,0,0,0.03)'; ctx.fill();
        // Fill bar
        ctx.beginPath(); ctx.roundRect(100, l.y - 9, barW, 20, 5);
        ctx.fillStyle = l.c + 'cc'; ctx.fill();
        // Connector
        if (i < layers.length - 1) {
          ctx.beginPath(); ctx.moveTo(W / 2, l.y + 13); ctx.lineTo(W / 2, layers[i + 1].y - 11);
          ctx.strokeStyle = 'rgba(0,0,0,0.07)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
        }
        ctx.font = "400 9px 'DM Mono', monospace"; ctx.fillStyle = 'var(--ink-3)';
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(l.label, 92, l.y + 1);
      });
      t += 1; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <div ref={wRef}><canvas ref={ref} width={340} height={200} style={{ display: 'block', maxWidth: '100%' }} /></div>;
}

// ─────────────────────────────────────────────
// Pillar card
// ─────────────────────────────────────────────
function PillarCard({ n, title, body, detail }: { n: string; title: string; body: string; detail: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--bg-card)', border: `1px solid ${hov ? 'rgba(11,110,106,0.3)' : 'var(--border)'}`,
        borderRadius: 18, padding: '2.2rem 2rem',
        transition: 'all 0.35s cubic-bezier(.22,.8,.4,1)',
        transform: hov ? 'translateY(-7px)' : 'none',
        cursor: 'default', position: 'relative', overflow: 'hidden', minHeight: 220,
      }}
    >
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: '1.2rem', opacity: 0.65 }}>Pillar {n}</div>
      <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: '1.3rem', fontWeight: 400, color: 'var(--ink)', lineHeight: 1.2, marginBottom: '1rem' }}>{title}</div>
      <div style={{ fontSize: '0.82rem', color: 'var(--ink-3)', lineHeight: 1.75, transition: 'opacity 0.3s', opacity: hov ? 0 : 1 }}>{body}</div>
      <div style={{ position: 'absolute', inset: 0, padding: '2.2rem 2rem', background: 'var(--bg-card)', opacity: hov ? 1 : 0, transition: 'opacity 0.35s', pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: '0.7rem', opacity: 0.65 }}>Approach</div>
        <div style={{ fontSize: '0.84rem', color: 'var(--ink-2)', lineHeight: 1.8 }}>{detail}</div>
      </div>
    </div>
  );
}

// Alignment card
function AlignCard({ n, title, body }: { n: string; title: string; body: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: '2rem 1.8rem', transition: 'all 0.3s cubic-bezier(.22,.8,.4,1)', transform: hov ? 'translateY(-5px)' : 'none' }}
    >
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: '1.4rem', opacity: 0.65 }}>{n.padStart(2, '0')}</div>
      <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: '1.2rem', fontWeight: 400, color: 'var(--ink)', lineHeight: 1.25, marginBottom: '0.8rem' }}>{title}</div>
      <div style={{ fontSize: '0.82rem', color: 'var(--ink-3)', lineHeight: 1.75 }}>{body}</div>
    </div>
  );
}

// Strategic advantage card  (now with bigger canvas areas)
function AdvantageCard({ title, body, visual, delay }: { title: string; body: string; visual: React.ReactNode; delay: number }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay, duration: 0.65 }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 22, overflow: 'hidden', transition: 'all 0.35s cubic-bezier(.22,.8,.4,1)', transform: hov ? 'translateY(-6px)' : 'none' }}
    >
      <div style={{ height: 240, background: 'rgba(11,110,106,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border)' }}>
        {visual}
      </div>
      <div style={{ padding: '1.8rem' }}>
        <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: '1.25rem', fontWeight: 400, color: 'var(--ink)', lineHeight: 1.2, marginBottom: '0.75rem' }}>{title}</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--ink-3)', lineHeight: 1.75 }}>{body}</div>
      </div>
    </motion.div>
  );
}

function SectionDivider() {
  return (
    <div style={{ padding: '0 5vw', margin: '20px 0' }}>
      <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.9 }} style={{ height: 1, background: 'var(--border)', transformOrigin: 'left' }} />
    </div>
  );
}

const wv = (i = 0) => ({ initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: i * 0.1, duration: 0.65 } });

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
export default function FundView({ setView }: Props) {
  return (
    <div>

      {/* ── HERO ── */}
      <section style={{
        padding: '130px 5vw 100px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '6vw',
        alignItems: 'center',
        minHeight: '90vh',
      }}>
        {/* Left copy */}
        <div>
          <motion.div {...wv(0)}><Label>Super Performance Series I</Label></motion.div>
          <motion.div {...wv(0.5)}>
            <Display size="xl" style={{ marginBottom: '1.6rem', lineHeight: 1.0 }}>
              The Super Performance<br />Series I <It>Framework</It>
            </Display>
          </motion.div>
          <motion.div {...wv(1)}>
            <Body style={{ maxWidth: 560, fontSize: '1rem', lineHeight: 1.9, marginBottom: '3rem' }}>
              An institutionally disciplined investment approach integrating fundamental research, quantitative intelligence, and adaptive portfolio management to identify high-conviction opportunities across market cycles.
            </Body>
          </motion.div>
          <motion.div {...wv(1.2)} style={{ marginBottom: '3.5rem' }}>
            <FlowDiagram />
          </motion.div>
        </div>
        {/* Right graphic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <HeroGraphic />
        </motion.div>
      </section>

      <SectionDivider />

      {/* ── PHILOSOPHY ── */}
      <section style={{ padding: '100px 5vw' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '8vw', alignItems: 'center' }}>
          <motion.div {...wv(0)}>
            <Label>Investment Philosophy</Label>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 'clamp(1.7rem, 2.8vw, 2.6rem)', fontWeight: 400, color: 'var(--ink)', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
              "We believe exceptional returns are generated through disciplined research, intelligent capital allocation, and the ability to adapt across{' '}
              <em style={{ color: 'var(--teal)', fontStyle: 'italic' }}>market cycles.</em>"
            </div>
          </motion.div>
          <motion.div {...wv(0.3)}><PhilosophyFlow /></motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ── THREE STRATEGIC ADVANTAGES ── */}
      <section style={{ padding: '100px 5vw' }}>
        <motion.div {...wv(0)} style={{ marginBottom: '3.5rem' }}>
          <Label>Three Strategic Advantages</Label>
          <Display size="lg" style={{ maxWidth: 500 }}>What sets our approach <It>apart.</It></Display>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          <AdvantageCard delay={0}    title="Dynamic Market Regime Investing"           body="Capital allocation adapts to changing market environments through proprietary regime assessment and tactical positioning across expansion, consolidation, and correction cycles." visual={<RegimeWheelGraphic />} />
          <AdvantageCard delay={0.12} title="Concentrated High-Conviction Portfolio"    body="A focused portfolio of approximately 12–15 carefully selected opportunities backed by deep research and disciplined position sizing for maximum alpha potential."              visual={<PortfolioConstellation />} />
          <AdvantageCard delay={0.24} title="Quantitative Intelligence, Human Judgment" body="Probabilistic models and proprietary analytics support investment decisions while maintaining a fundamentally research-driven, actively managed approach."                   visual={<ProbabilityGrid />} />
        </div>
      </section>

      <SectionDivider />

      {/* ── FOUR PILLARS ── */}
      <section style={{ padding: '100px 5vw' }}>
        <motion.div {...wv(0)} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6vw', alignItems: 'end', marginBottom: '3.5rem' }}>
          <div>
            <Label>The Quantamental Edge</Label>
            <Display size="lg">Four pillars of our<br /><It>investment discipline.</It></Display>
          </div>
          <Body style={{ maxWidth: 400 }}>Each pillar works in concert — no single system drives decisions. The intersection of all four is where conviction is formed.</Body>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { n: '1', title: 'Market Regime Intelligence', body: 'Assessing macro, liquidity, valuation, and market structure to understand prevailing conditions.', detail: 'Three-state regime model drives net portfolio exposure and asset class allocation in real time.' },
            { n: '2', title: 'Quantitative Analytics',     body: 'Leveraging proprietary screeners, probabilistic models, and data-driven insights for decision support.', detail: 'Probability-weighted models validate sizing and conviction scores across every position.' },
            { n: '3', title: 'Fundamental Research',       body: 'Evaluating business quality, growth potential, management capability, and financial strength.', detail: 'Deep bottom-up research on competitive moats, RoE trajectories, balance sheet quality.' },
            { n: '4', title: 'Dynamic Capital Allocation', body: 'Rotating capital towards opportunities with superior risk-reward while managing downside exposure.', detail: 'Flexible 0–100% mandate — capital deployed only when reward-to-risk thresholds are met.' },
          ].map((p, i) => <motion.div key={p.n} {...wv(i * 0.12)}><PillarCard {...p} /></motion.div>)}
        </div>
      </section>

      <SectionDivider />

      {/* ── RESEARCH PROCESS ── */}
      <section style={{ padding: '100px 5vw' }}>
        <motion.div {...wv(0)} style={{ marginBottom: '4rem' }}>
          <Label>Research Process</Label>
          <Display size="lg" style={{ maxWidth: 500 }}>From idea to <It>conviction.</It></Display>
        </motion.div>
        <ProcessFlow />
      </section>

      <SectionDivider />

      {/* ── PORTFOLIO CONSTRUCTION ── */}
      <section style={{ padding: '100px 5vw' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8vw', alignItems: 'center' }}>
          <motion.div {...wv(0)}>
            <Label>Portfolio Construction</Label>
            <Display size="lg" style={{ marginBottom: '1.4rem' }}>Focused.<br />Disciplined.<br /><It>Adaptive.</It></Display>
            <Body style={{ marginBottom: '2.5rem' }}>12–15 high-conviction positions with disciplined exposure management and active monitoring across full market cycles.</Body>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[['Concentrated Investing', 'Maximum alpha through focus, not diversification'], ['10% Single-Stock Cap', 'Disciplined position sizing protects downside'], ['Long-Term Ownership', 'Holding horizon aligned with business value creation'], ['Dynamic Rotation', 'Active reallocation as conviction evolves']].map(([title, desc]) => (
                <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(11,110,106,0.5)', marginTop: 8, flexShrink: 0 }} />
                  <div><span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--ink)' }}>{title}</span><span style={{ fontSize: '0.82rem', color: 'var(--ink-3)' }}> — {desc}</span></div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div {...wv(0.3)} style={{ display: 'flex', justifyContent: 'center' }}>
            <LargePortfolioViz />
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ── RISK & CAPITAL ── */}
      <section style={{ padding: '100px 5vw' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8vw', alignItems: 'center' }}>
          <motion.div {...wv(0)} style={{ display: 'flex', justifyContent: 'center' }}>
            <div>
              <RiskLayers />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 20 }}>
                {[['Tactical Hedging', 'Systematic downside protection'], ['Cash Flexibility', '0–100% allocation range'], ['Regime Adaptation', 'Macro-driven exposure shifts'], ['Exposure Mgmt', 'Dynamic gross / net control']].map(([t, d]) => (
                  <div key={t} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.9rem 1rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--ink)', marginBottom: 3 }}>{t}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--ink-3)', lineHeight: 1.5 }}>{d}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          <motion.div {...wv(0.3)}>
            <Label>Risk & Capital Allocation</Label>
            <Display size="lg" style={{ marginBottom: '1.4rem' }}>Intelligent risk.<br /><It>Adaptive capital.</It></Display>
            <Body style={{ marginBottom: '2rem' }}>Risk management is not a constraint on returns — it is the foundation of them. Every allocation decision integrates rigorous assessment of downside risk, regime probability, and portfolio-level exposure.</Body>
            <Body>As market conditions evolve, capital is reallocated — hedges adjusted, cash deployed or preserved, gross exposure shifted to reflect the prevailing risk-reward environment.</Body>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ── LONG-TERM ALIGNMENT ── */}
      <section style={{ padding: '100px 5vw' }}>
        <motion.div {...wv(0)} style={{ marginBottom: '3.5rem' }}>
          <Label>Built Around Long-Term Alignment</Label>
          <Display size="lg" style={{ maxWidth: 500 }}>Structured for enduring <It>partnership.</It></Display>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { n: '1', title: 'Investor Alignment',    body: 'Structured around long-term wealth creation with aligned incentives that reward sustainable outperformance.' },
            { n: '2', title: 'Active Stewardship',    body: 'Continuous research, portfolio monitoring, and proactive management across full market cycles.' },
            { n: '3', title: 'Flexible Participation', body: 'Designed around sophisticated investor needs while maintaining institutional standards and governance.' },
            { n: '4', title: 'Long-Term Partnership', body: 'Focused on building enduring capital relationships with investors who share conviction in disciplined investing.' },
          ].map((c, i) => <motion.div key={c.n} {...wv(i * 0.1)}><AlignCard {...c} /></motion.div>)}
        </div>
        <motion.div {...wv(0.5)} style={{ display: 'flex', gap: '1rem', marginTop: '3.5rem', justifyContent: 'center' }}>
          <Btn onClick={() => setView('contact')}>Investor Inquiry</Btn>
          <Btn variant="outline" onClick={() => setView('strategy')}>View Strategy</Btn>
        </motion.div>
      </section>

      <PageFooter disc="Super Performance Series I is a Category III Alternative Investment Fund. SEBI Registered. For eligible investors only. Past performance is not indicative of future results. Capital at risk." />
    </div>
  );
}
