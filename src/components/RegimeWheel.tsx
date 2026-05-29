import { useEffect, useRef } from 'react';

const SEGS = [
  { l: 'Expansion',    c: '#012956', s: -Math.PI / 2,          e: Math.PI / 6 + 0.08 },
  { l: 'Consolidation',c: '#1840A8', s: Math.PI / 6 + 0.08,   e: 5 * Math.PI / 6 + 0.08 },
  { l: 'Correction',   c: '#1840A8', s: 5 * Math.PI / 6 + 0.08, e: 3 * Math.PI / 2 },
];

export default function RegimeWheel() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const W = 300, H = 300, cx = 150, cy = 150, r = 110;
    let t = 0, raf: number;

    function frame() {
      ctx.clearRect(0, 0, W, H);
      t += 0.009;

      // outer rings
      [r + 28, r + 50, r + 68].forEach((rr, i) => {
        ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,0,0,${0.05 - i * 0.012})`;
        ctx.lineWidth = 1; ctx.stroke();
      });

      // rotating ticks
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.07);
      for (let i = 0; i < 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        const r1 = r + 54, r2 = i % 4 === 0 ? r + 66 : r + 59;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
        ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
        ctx.strokeStyle = i % 4 === 0 ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.08)';
        ctx.lineWidth = 1; ctx.stroke();
      }
      ctx.restore();

      // segments
      SEGS.forEach(s => {
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, s.s, s.e); ctx.closePath();
        ctx.fillStyle = s.c + '14'; ctx.fill();
        ctx.strokeStyle = s.c + '55'; ctx.lineWidth = 1.5; ctx.stroke();
        const mid = (s.s + s.e) / 2;
        ctx.font = '500 8px DM Mono, monospace';
        ctx.fillStyle = s.c; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(s.l.toUpperCase(), cx + Math.cos(mid) * r * 0.72, cy + Math.sin(mid) * r * 0.72);
      });

      // needle
      const angle = -Math.PI / 2 + t * 0.3;
      ctx.save(); ctx.translate(cx, cy);
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * r * 0.78, Math.sin(angle) * r * 0.78);
      ctx.strokeStyle = '#0D0D0D'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#0D0D0D'; ctx.fill();
      ctx.restore();

      // center hub
      ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx.fillStyle = '#F2F0EB'; ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.font = '400 6.5px DM Mono, monospace';
      ctx.fillStyle = '#888'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('REGIME', cx, cy);

      raf = requestAnimationFrame(frame);
    }
    frame();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={ref}
      width={300}
      height={300}
      style={{ display: 'block', maxWidth: '100%' }}
    />
  );
}
