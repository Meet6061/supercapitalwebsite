import React from 'react';

function isMob() { return typeof window !== 'undefined' && window.innerWidth <= 768; }

/* ── Label ── */
export function Label({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontFamily: "'DM Mono', monospace",
      fontSize: '0.62rem', letterSpacing: '0.22em', textTransform: 'uppercase',
      color: 'var(--ink-3)', display: 'block', marginBottom: '1.2rem',
    }}>
      {children}
    </span>
  );
}

/* ── Display heading ── */
export function Display({
  children, size = 'lg', style = {}
}: { children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl'; style?: React.CSSProperties }) {
  const sizes = { sm: 'clamp(1.5rem,2vw,2rem)', md: 'clamp(2rem,3vw,2.8rem)', lg: 'clamp(2.2rem,4.5vw,4rem)', xl: 'clamp(2.6rem,6.5vw,7rem)' };
  return (
    <div style={{
      fontFamily: "'Instrument Serif', serif",
      fontSize: sizes[size], fontWeight: 400,
      lineHeight: 1.1, letterSpacing: '-0.025em',
      color: 'var(--ink)', ...style,
    }}>
      {children}
    </div>
  );
}

/* ── Italic accent ── */
export function It({ children }: { children: React.ReactNode }) {
  return <em style={{ fontStyle: 'italic', color: 'var(--teal)' }}>{children}</em>;
}

/* ── Body text ── */
export function Body({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{ fontSize: '0.95rem', color: 'var(--ink-2)', lineHeight: 1.8, ...style }}>
      {children}
    </p>
  );
}

/* ── Card ── */
export function Card({
  children, style = {}, dark = false, hover = true,
}: { children: React.ReactNode; style?: React.CSSProperties; dark?: boolean; hover?: boolean }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: dark ? 'var(--bg-dark)' : 'var(--bg-card)',
        border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--border)',
        borderRadius: 16, padding: '1.7rem 1.5rem',
        transition: 'transform 0.3s cubic-bezier(.22,.8,.4,1), box-shadow 0.3s',
        transform: hover && hovered ? 'translateY(-5px)' : 'none',
        boxShadow: hover && hovered ? '0 18px 50px rgba(0,0,0,0.09)' : 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── CardIcon ── */
export function CardIcon({ children, color = 'teal' }: { children: React.ReactNode; color?: 'teal' | 'blue' | 'neutral' }) {
  const bgs = { teal: 'var(--teal-bg)', blue: 'var(--blue-bg)', neutral: 'rgba(0,0,0,0.05)' };
  const cols = { teal: 'var(--teal)', blue: 'var(--blue)', neutral: 'var(--ink-2)' };
  return (
    <div style={{
      width: 42, height: 42, borderRadius: 10,
      background: bgs[color], color: cols[color],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: '1.1rem',
    }}>
      {children}
    </div>
  );
}

/* ── CardTitle ── */
export function CardTitle({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ fontSize: '0.98rem', fontWeight: 500, color: 'var(--ink)', marginBottom: '0.5rem', ...style }}>{children}</div>;
}

/* ── CardBody ── */
export function CardBody({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: '0.8rem', color: 'var(--ink-3)', lineHeight: 1.7 }}>{children}</div>;
}

/* ── Button ── */
export function Btn({
  children, variant = 'primary', onClick, style = {}
}: { children: React.ReactNode; variant?: 'primary' | 'outline' | 'ghost'; onClick?: () => void; style?: React.CSSProperties }) {
  const base: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase',
    padding: '13px 28px', borderRadius: 100, cursor: 'pointer',
    border: 'none', transition: 'all 0.2s',
  };
  const variants: Record<string, React.CSSProperties> = {
    primary:  { background: 'var(--ink)', color: 'var(--bg)' },
    outline:  { background: 'transparent', color: 'var(--ink-2)', border: '1px solid var(--border-md)' },
    ghost:    { background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.18)' },
  };
  return <button style={{ ...base, ...variants[variant], ...style }} onClick={onClick}>{children}</button>;
}

/* ── Divider ── */
export function Divider() {
  return <div style={{ height: 1, background: 'var(--border)', margin: '0 5vw' }} />;
}

/* ── Step ── */
export function Step({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div style={{ display: 'flex', gap: '1.1rem', padding: '0.95rem 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.62rem', color: 'var(--ink-3)', minWidth: 26, paddingTop: 3 }}>{num}</span>
      <div>
        <div style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)' }}>{desc}</div>
      </div>
    </div>
  );
}

/* ── Section — mobile: less padding ── */
export function Section({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const mob = isMob();
  return <section style={{ padding: mob ? '52px 5vw' : '90px 5vw', ...style }}>{children}</section>;
}

/* ── Grid — mobile: 1 col ── */
export function Grid({ cols = 2, children, gap = 14 }: { cols?: number; children: React.ReactNode; gap?: number }) {
  const mob = isMob();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : `repeat(${cols}, 1fr)`, gap }}>
      {children}
    </div>
  );
}

/* ── TwoCol — mobile: single col ── */
export function TwoCol({ children, ratio = '1fr 1fr', gap = '5vw', style = {} }: { children: React.ReactNode; ratio?: string; gap?: string; style?: React.CSSProperties }) {
  const mob = isMob();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : ratio, gap: mob ? '2.5rem' : gap, alignItems: 'start', ...style }}>
      {children}
    </div>
  );
}

/* ── Stat ── */
export function Stat({ val, label }: { val: string; label: string }) {
  return (
    <div>
      <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: '2.1rem', lineHeight: 1, marginBottom: 4 }}>{val}</div>
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.6rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{label}</div>
    </div>
  );
}

/* ── InfoRow ── */
export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.3rem', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '0.82rem', color: 'var(--ink-3)' }}>{label}</span>
      <span style={{ fontSize: '0.82rem', color: 'var(--ink)', fontWeight: 400 }}>{value}</span>
    </div>
  );
}

/* ── FeeTable ── */
export function FeeTable({ rows }: { rows: [string, string][] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {['Commitment', 'Fee'].map(h => (
            <th key={h} style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid var(--border-md)' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(([slab, fee]) => (
          <tr key={slab} style={{ borderBottom: '1px solid var(--border)' }}>
            <td style={{ padding: '0.9rem 1rem', fontSize: '0.88rem', color: 'var(--ink-2)' }}>{slab}</td>
            <td style={{ padding: '0.9rem 1rem', fontFamily: "'DM Mono',monospace", fontSize: '0.85rem', color: 'var(--teal)' }}>{fee}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── PageFooter ── */
export function PageFooter({ disc }: { disc: string }) {
  const mob = isMob();
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem 5vw', display: 'flex', flexDirection: mob ? 'column' : 'row', justifyContent: 'space-between', alignItems: mob ? 'flex-start' : 'center', gap: '1rem', flexWrap: 'wrap' }}>
      <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>Super Capital · Super Capital Trust</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--ink-3)', maxWidth: mob ? '100%' : 440, textAlign: mob ? 'left' : 'right', lineHeight: 1.55 }}>{disc}</div>
    </footer>
  );
}
