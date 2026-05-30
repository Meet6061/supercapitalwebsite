import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import type { AppView } from '../types';
import logoSrc from './logo.png';

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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  function nav(v: AppView) {
    setView(v);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <header style={s.header}>
      <div style={s.inner}>

        <div style={s.brand} onClick={() => nav('home')}>
          <img src={logoSrc} alt="Super Capital" style={s.logoImg} />
        </div>

        {/* Desktop nav */}
        {!isMobile && (
          <nav style={s.nav}>
            {links.map(l => (
              <button
                key={l.view}
                onClick={() => nav(l.view)}
                style={{
                  ...s.navLink,
                  color: current === l.view ? 'var(--ink)' : 'var(--ink-2)',
                  fontWeight: current === l.view ? 500 : 400,
                }}
              >
                {l.label}
              </button>
            ))}
          </nav>
        )}

        {/* Desktop CTA */}
        {!isMobile && (
          <button style={s.cta} onClick={() => nav('contact')}>Connect</button>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button style={s.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        )}
      </div>

      {/* Mobile drawer */}
      {isMobile && menuOpen && (
        <div style={s.drawer}>
          {links.map(l => (
            <button
              key={l.view}
              onClick={() => nav(l.view)}
              style={{
                ...s.drawerLink,
                color: current === l.view ? 'var(--ink)' : 'var(--ink-2)',
                fontWeight: current === l.view ? 500 : 300,
                borderBottom: '1px solid var(--border)',
              }}
            >
              {l.label}
            </button>
          ))}
          <button style={{ ...s.cta, marginTop: '1rem', width: '100%' }} onClick={() => nav('contact')}>
            Connect
          </button>
        </div>
      )}
    </header>
  );
}

const s: Record<string, React.CSSProperties> = {
  header: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
    background: 'rgba(242,240,235,0.95)',
    backdropFilter: 'blur(18px)',
    borderBottom: '1px solid rgba(0,0,0,0.09)',
  },
  inner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    height: 90, padding: '0 5vw',
  },
  brand: {
    cursor: 'pointer',
    display: 'flex', alignItems: 'center',
    flexShrink: 0,
    height: '100%',
    padding: '12px 0 2px 0',
  },
  logoImg: {
    height: '225%',
    width: '200%',
    display: 'block',
    objectFit: 'contain',
    objectPosition: 'left center',
  },
  nav: {
    display: 'flex', gap: '2.5rem',
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
    flexShrink: 0,
  },
  hamburger: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 8,
  },
  drawer: {
    borderTop: '1px solid var(--border)',
    padding: '1rem 5vw 1.5rem',
    display: 'flex', flexDirection: 'column',
    background: 'rgba(242,240,235,0.98)',
  },
  drawerLink: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontSize: '1.05rem', padding: '0.9rem 0', textAlign: 'left',
  },
};
