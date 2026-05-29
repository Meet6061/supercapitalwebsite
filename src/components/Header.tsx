import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { AppView } from '../types';

interface HeaderProps {
  current: AppView;
  setView: (v: AppView) => void;
}

const links: { view: AppView; label: string }[] = [
  { view: 'home',     label: 'Overview' },
  { view: 'fund',     label: 'The Fund' },
  { view: 'strategy', label: 'Strategy' },
  { view: 'about',    label: 'About Us' },
  { view: 'contact',  label: 'Investor Inquiry' },
];

export default function Header({ current, setView }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  function nav(v: AppView) {
    setView(v);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <header style={styles.header}>
      <div style={styles.inner}>

        {/* Brand — Logo image only */}
        <div style={styles.brand} onClick={() => nav('home')}>
          <img
            src="/logo.jpg"
            alt="Super Capital"
            style={{ height: 48, width: 'auto', display: 'block', objectFit: 'contain' }}
          />
        </div>

        {/* Desktop Nav */}
        <nav style={styles.nav}>
          {links.map(l => (
            <button
              key={l.view}
              onClick={() => nav(l.view)}
              style={{
                ...styles.navLink,
                color: current === l.view ? 'var(--ink)' : 'var(--ink-2)',
                fontWeight: current === l.view ? 500 : 400,
              }}
            >
              {l.label}
            </button>
          ))}
        </nav>

        {/* CTA */}
        <button style={styles.cta} onClick={() => nav('contact')}>
          Connect
        </button>

        {/* Mobile toggle */}
        <button style={styles.mobileToggle} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div style={styles.drawer}>
          {links.map(l => (
            <button
              key={l.view}
              onClick={() => nav(l.view)}
              style={{
                ...styles.drawerLink,
                color: current === l.view ? 'var(--ink)' : 'var(--ink-2)',
                fontWeight: current === l.view ? 500 : 300,
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
    background: 'rgba(242,240,235,0.88)',
    backdropFilter: 'blur(18px)',
    borderBottom: '1px solid rgba(0,0,0,0.09)',
  },
  inner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    height: 72, padding: '0 5vw',
  },
  brand: {
    cursor: 'pointer',
    display: 'flex', alignItems: 'center',
  },
  nav: {
    display: 'flex', gap: '2.5rem', listStyle: 'none',
  },
  navLink: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontSize: '0.83rem', letterSpacing: '0.01em',
    padding: 0, transition: 'color 0.2s',
  },
  cta: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase',
    padding: '9px 22px', borderRadius: 100,
    background: 'var(--ink)', color: 'var(--bg)',
    border: 'none', cursor: 'pointer',
  },
  mobileToggle: {
    display: 'none',
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--ink)',
  },
  drawer: {
    borderTop: '1px solid var(--border)',
    padding: '1rem 5vw',
    display: 'flex', flexDirection: 'column', gap: '0.5rem',
    background: 'rgba(242,240,235,0.97)',
  },
  drawerLink: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontSize: '1rem', padding: '0.5rem 0', textAlign: 'left',
  },
};
