import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Label, Display, It, Body, Btn, PageFooter } from './UI';
import type { AppView } from '../types';

interface Props { setView: (v: AppView) => void; }


// ─────────────────────────────────────────────
// HERO GRAPHIC — Elegant geometric lattice
// Light background, navy palette
// ─────────────────────────────────────────────
function HeroGraphic() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const W = 520, H = 520; cv.width = W; cv.height = H;
    const cx = W / 2, cy = H / 2;
    let t = 0, raf: number;

    function poly(n: number, r: number, rot = 0): [number, number][] {
      return Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + rot;
        return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
      });
    }
    function drawPoly(pts: [number, number][], stroke: string, lw = 1) {
      ctx.beginPath();
      pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
      ctx.closePath();
      ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke();
    }
    function lattice(a: [number, number][], b: [number, number][], alpha: number) {
      a.forEach(pa => b.forEach(pb => {
        ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]);
        ctx.strokeStyle = `rgba(1,41,86,${alpha})`; ctx.lineWidth = 0.5; ctx.stroke();
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      [220, 170, 118, 68].forEach((r, i) => {
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(1,41,86,${0.04 + i * 0.01})`; ctx.lineWidth = 1; ctx.stroke();
      });
      const hex6 = poly(6, 215, t * 0.004);
      drawPoly(hex6, `rgba(1,41,86,0.18)`, 1.2);
      const gon12 = poly(12, 168, -t * 0.007);
      drawPoly(gon12, `rgba(1,41,86,0.10)`, 0.8);
      const sq4 = poly(4, 115, t * 0.011 + Math.PI / 4);
      drawPoly(sq4, `rgba(1,41,86,0.16)`, 1);
      hex6.forEach((hv, hi) => {
        const nb = gon12[hi * 2 % 12];
        ctx.beginPath(); ctx.moveTo(hv[0], hv[1]); ctx.lineTo(nb[0], nb[1]);
        ctx.strokeStyle = `rgba(1,41,86,0.09)`; ctx.lineWidth = 0.6; ctx.stroke();
      });
      lattice(gon12.filter((_, i) => i % 3 === 0), sq4, 0.07);
      hex6.forEach(([x, y]) => {
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y);
        ctx.strokeStyle = `rgba(1,41,86,0.06)`; ctx.lineWidth = 0.7; ctx.stroke();
      });
      const breath = 1 + Math.sin(t * 0.045) * 0.06;
      const tri3 = poly(3, 64 * breath, t * 0.018);
      drawPoly(tri3, `rgba(1,41,86,0.5)`, 1.5);
      const ch = poly(4, 46 * breath, t * 0.03 + Math.PI / 4);
      ch.forEach(([x, y]) => {
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y);
        ctx.strokeStyle = `rgba(1,41,86,0.3)`; ctx.lineWidth = 1; ctx.stroke();
      });
      ctx.beginPath(); ctx.arc(cx, cy, 28 * breath, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(242,240,235,0.97)'; ctx.fill();
      ctx.strokeStyle = 'rgba(1,41,86,0.55)'; ctx.lineWidth = 1.5; ctx.stroke();
      hex6.forEach(([ax, ay], i) => {
        const [bx, by] = hex6[(i + 1) % 6];
        const s = (Math.sin(t * 0.06 + i * 1.05) + 1) / 2;
        ctx.beginPath(); ctx.arc(ax + (bx - ax) * s, ay + (by - ay) * s, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(1,41,86,0.5)'; ctx.fill();
      });
      gon12.forEach(([x, y]) => {
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(1,41,86,0.22)'; ctx.fill();
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
// Flow diagram strip
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
              background: 'rgba(1,41,86,0.06)',
              border: `1.5px solid rgba(1,41,86,${0.2 + i * 0.15})`,
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
              style={{ width: 36, height: 1.5, background: 'linear-gradient(90deg,var(--teal),rgba(1,41,86,0.25))', transformOrigin: 'left', flexShrink: 0, margin: '0 2px' }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Advantage card
// ─────────────────────────────────────────────
function AdvantageCard({ title, body, n, delay }: { title: string; body: string; n: string; delay: number }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.65 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderTop: `2.5px solid rgba(1,41,86,${0.25 + delay * 0.5})`,
        borderRadius: 18, padding: '2.2rem 2rem',
        transition: 'all 0.35s cubic-bezier(.22,.8,.4,1)',
        transform: hov ? 'translateY(-6px)' : 'none',
        boxShadow: hov ? '0 24px 60px rgba(1,41,86,0.08), 0 4px 16px rgba(0,0,0,0.05)' : 'none',
      }}
    >
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: '1.2rem', opacity: 0.6 }}>{n}</div>
      <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: '1.28rem', fontWeight: 400, color: 'var(--ink)', lineHeight: 1.25, marginBottom: '0.9rem' }}>{title}</div>
      <div style={{ fontSize: '0.83rem', color: 'var(--ink-3)', lineHeight: 1.75 }}>{body}</div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Universe allocation canvas
// ─────────────────────────────────────────────
function UniverseViz() {
  const ref = useRef<HTMLCanvasElement>(null);
  const wRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wRef, { once: false, margin: '-60px' });
  const progressRef = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const W = 380, H = 260;
    let t = 0, raf: number;
    const assets = [
      { label: 'Listed Equity',   color: '#012956', x: 80,  y: 80,  r: 64 },
      { label: 'Unlisted Equity', color: '#1840A8', x: 200, y: 60,  r: 44 },
      { label: 'Debt',            color: '#6B7280', x: 290, y: 110, r: 36 },
      { label: 'Derivatives',     color: '#2563EB', x: 160, y: 170, r: 30 },
    ];
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const p = progressRef.current;
      assets.slice(1).forEach((a) => {
        const pulse = (Math.sin(t * 1.2 + a.x) + 1) / 2;
        ctx.beginPath(); ctx.moveTo(assets[0].x, assets[0].y); ctx.lineTo(a.x, a.y);
        ctx.strokeStyle = `rgba(1,41,86,${(0.05 + pulse * 0.07) * p})`; ctx.lineWidth = 1; ctx.stroke();
      });
      assets.forEach((a, i) => {
        const prog = Math.max(0, Math.min(1, (p - i * 0.18) / 0.6));
        const pulse = (Math.sin(t * 0.9 + i * 1.4) + 1) / 2;
        const g = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, a.r + 18);
        g.addColorStop(0, a.color + '18'); g.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(a.x, a.y, (a.r + 18) * prog, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r * prog + pulse * 2, 0, Math.PI * 2);
        ctx.fillStyle = a.color + '20'; ctx.fill();
        ctx.strokeStyle = a.color + '80'; ctx.lineWidth = 1.5; ctx.stroke();
        if (prog > 0.7) {
          ctx.font = `500 ${8 + (a.r > 50 ? 2 : 0)}px 'DM Mono', monospace`;
          ctx.fillStyle = a.color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          const lines = a.label.split(' ');
          if (lines.length > 1) { ctx.fillText(lines[0], a.x, a.y - 6); ctx.fillText(lines[1], a.x, a.y + 8); }
          else ctx.fillText(a.label, a.x, a.y);
        }
      });
      if (p > 0.8) {
        ctx.font = "500 9px 'DM Mono', monospace";
        ctx.fillStyle = `rgba(1,41,86,${(p - 0.8) * 5})`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText('0 – 100%  ALLOCATION FLEXIBILITY', W / 2, H - 22);
      }
      t += 0.014; raf = requestAnimationFrame(draw);
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
  return <div ref={wRef}><canvas ref={ref} width={380} height={260} style={{ display: 'block', maxWidth: '100%' }} /></div>;
}

// ─────────────────────────────────────────────
// Alignment card
// ─────────────────────────────────────────────
function AlignCard({ n, title, body }: { n: string; title: string; body: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 18, padding: '2rem 1.8rem',
        transition: 'all 0.3s cubic-bezier(.22,.8,.4,1)',
        transform: hov ? 'translateY(-5px)' : 'none',
        boxShadow: hov ? '0 16px 44px rgba(0,0,0,0.07)' : 'none',
      }}
    >
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: '1.4rem', opacity: 0.65 }}>{n.padStart(2, '0')}</div>
      <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: '1.2rem', fontWeight: 400, color: 'var(--ink)', lineHeight: 1.25, marginBottom: '0.8rem' }}>{title}</div>
      <div style={{ fontSize: '0.82rem', color: 'var(--ink-3)', lineHeight: 1.75 }}>{body}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Section divider
// ─────────────────────────────────────────────
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

      {/* ═══ SECTION 1 · FUND INTRODUCTION ═══ */}
      <section style={{ position: 'relative', padding: typeof window !== 'undefined' && window.innerWidth <= 768 ? '100px 5vw 60px' : '140px 5vw 100px', overflow: 'hidden', minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* Subtle bg grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(1,41,86,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(1,41,86,0.04) 1px,transparent 1px)', backgroundSize: '64px 64px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 50%, rgba(1,41,86,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} />

        <div style={{ display: 'grid', gridTemplateColumns: typeof window !== 'undefined' && window.innerWidth <= 768 ? '1fr' : '1fr 1fr', gap: '4vw', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <motion.div {...wv(0)}>
              <Label>Super Performance Series I</Label>
            </motion.div>
            <motion.div {...wv(0.5)}>
              <Display size="xl" style={{ marginBottom: '2rem', lineHeight: 1.0 }}>
                An Actively<br />Managed<br /><It>Category III AIF.</It>
              </Display>
            </motion.div>
            <motion.div {...wv(1)}>
              <Body style={{ maxWidth: 520, fontSize: '1.02rem', lineHeight: 1.9, marginBottom: '3rem' }}>
                Super Performance Series I is an actively managed Category III AIF focused on long-term capital appreciation through concentrated investing, dynamic allocation, and research-driven decision making.
              </Body>
            </motion.div>
            <motion.div {...wv(1.5)} style={{ marginBottom: '4rem' }}>
              <FlowDiagram />
            </motion.div>
            <motion.div {...wv(2)} style={{ display: 'flex', gap: '1rem' }}>
              <Btn onClick={() => setView('strategy')}>Explore Strategy</Btn>
              <Btn variant="outline" onClick={() => setView('contact')}>Investor Inquiry</Btn>
            </motion.div>
          </div>
          <motion.div {...wv(0.3)} style={{ display: 'flex', justifyContent: 'center' }}>
            <HeroGraphic />
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ═══ SECTION 2 · THREE STRATEGIC ADVANTAGES ═══ */}
      <section style={{ padding: '100px 5vw' }}>
        <motion.div {...wv(0)} style={{ marginBottom: '3.5rem' }}>
          <Label>Three Strategic Advantages</Label>
          <Display size="lg" style={{ maxWidth: 480 }}>
            What sets our approach <It>apart.</It>
          </Display>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: typeof window !== 'undefined' && window.innerWidth <= 768 ? '1fr' : 'repeat(3, 1fr)', gap: 20 }}>
          <AdvantageCard n="01" delay={0} title="Dynamic Market Regime Investing" body="Capital allocation adapts continuously to changing market environments. The fund moves fluidly across expansion, consolidation, and correction cycles — always positioned for prevailing conditions." />
          <AdvantageCard n="02" delay={0.12} title="Concentrated High-Conviction Portfolio" body="A focused portfolio of approximately 12–15 carefully selected positions. Concentration is a feature, not a risk — it reflects the depth of conviction behind every holding." />
          <AdvantageCard n="03" delay={0.24} title="Quantitative Intelligence, Human Judgment" body="Proprietary probabilistic models and analytical frameworks inform every decision. Technology amplifies research — it does not replace it." />
        </div>
      </section>

      <SectionDivider />

      {/* ═══ SECTION 3 · INVESTMENT UNIVERSE ═══ */}
      <section style={{ padding: '100px 5vw' }}>
        <div style={{ display: 'grid', gridTemplateColumns: typeof window !== 'undefined' && window.innerWidth <= 768 ? '1fr' : '1fr 1fr', gap: typeof window !== 'undefined' && window.innerWidth <= 768 ? '2rem' : '8vw', alignItems: 'center' }}>
          <motion.div {...wv(0)}>
            <Label>Investment Universe</Label>
            <Display size="lg" style={{ marginBottom: '1.4rem' }}>
              Complete flexibility<br />across <It>asset classes.</It>
            </Display>
            <Body style={{ marginBottom: '2.5rem' }}>
              The fund operates with 0–100% allocation flexibility across the full investment universe — enabling disciplined capital deployment wherever risk-reward conditions are most compelling.
            </Body>
            <div style={{ display: 'grid', gridTemplateColumns: typeof window !== 'undefined' && window.innerWidth <= 768 ? '1fr' : '1fr 1fr', gap: 10 }}>
              {[
                ['Listed Equity', 'Primary growth engine'],
                ['Unlisted Equity', 'Early-stage conviction plays'],
                ['Debt Instruments', 'Capital preservation & yield'],
                ['Derivatives', 'Tactical hedging & expression'],
              ].map(([title, desc]) => (
                <div key={title} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem 1.1rem' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--ink-3)', lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div {...wv(0.3)} style={{ display: 'flex', justifyContent: 'center' }}>
            <UniverseViz />
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ═══ SECTION 4 · LONG-TERM ALIGNMENT ═══ */}
      <section style={{ padding: '100px 5vw' }}>
        <motion.div {...wv(0)} style={{ marginBottom: '3.5rem' }}>
          <Label>Built Around Long-Term Alignment</Label>
          <Display size="lg" style={{ maxWidth: 520 }}>
            Structured for enduring <It>partnership.</It>
          </Display>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: typeof window !== 'undefined' && window.innerWidth <= 768 ? '1fr' : 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { n: '1', title: 'Investor Alignment', body: 'Structured around long-term wealth creation with aligned incentives that reward sustainable outperformance, not short-term results.' },
            { n: '2', title: 'Active Stewardship', body: 'Continuous research, portfolio monitoring, and proactive management across full market cycles and changing environments.' },
            { n: '3', title: 'Flexible Participation', body: 'Designed around sophisticated investor needs while maintaining institutional standards, governance, and operational rigour.' },
            { n: '4', title: 'Long-Term Partnership', body: 'Focused on building enduring capital relationships with investors who share our conviction in disciplined, research-led investing.' },
          ].map((c, i) => (
            <motion.div key={c.n} {...wv(i * 0.1)}>
              <AlignCard {...c} />
            </motion.div>
          ))}
        </div>
        <motion.div {...wv(0.5)} style={{ display: 'flex', gap: '1rem', marginTop: '3.5rem', justifyContent: 'center' }}>
          <Btn onClick={() => setView('strategy')}>Explore the Strategy</Btn>
          <Btn variant="outline" onClick={() => setView('contact')}>Investor Inquiry</Btn>
        </motion.div>
      </section>

      <PageFooter disc="Super Performance Series I is a Category III Alternative Investment Fund. SEBI Registered. For eligible investors only. Past performance is not indicative of future results. Capital at risk." />
    </div>
  );
}
