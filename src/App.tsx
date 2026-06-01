import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { AppView } from './types';
import Header from './components/Header';
import HomeView from './components/HomeView';
import FundView from './components/FundView';
import StrategyView from './components/StrategyView';
import ContactView from './components/ContactView';
import AboutView from './components/AboutView';
import InvestorPortal from './portal/InvestorPortal';

export default function App() {
  const [view, setViewState] = useState<AppView>('home');
  const [portalOpen, setPortalOpen] = useState(false);

  // Check URL hash for portal route — so /portal works on direct access
  useEffect(() => {
    if (window.location.hash === '#portal') setPortalOpen(true);
    const handler = () => {
      if (window.location.hash === '#portal') setPortalOpen(true);
      else setPortalOpen(false);
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  function openPortal() {
    window.location.hash = 'portal';
    setPortalOpen(true);
  }
  function closePortal() {
    window.location.hash = '';
    setPortalOpen(false);
  }

  function setView(v: AppView) {
    setViewState(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes gridDrift{0%{background-position:0 0}100%{background-position:72px 72px}}
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap');
    `;
    document.head.appendChild(style);
  }, []);

  // Portal overlay — completely separate from marketing site
  if (portalOpen) {
    return (
      <div>
        {/* Tiny back button — only visible on login screen, hidden once logged in */}
        <button onClick={closePortal}
          style={{ position:'fixed',top:16,left:16,zIndex:9999,background:'none',border:'none',cursor:'pointer',fontFamily:"'DM Mono',monospace",fontSize:'0.6rem',letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(0,0,0,0.3)',padding:'6px 10px' }}>
          ← Back to Site
        </button>
        <InvestorPortal />
      </div>
    );
  }

  return (
    <>
      <Header current={view} setView={setView} onPortalClick={openPortal} />
      <AnimatePresence mode="wait">
        <motion.main
          key={view}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.45 } }}
          exit={{ opacity: 0, y: -8, transition: { duration: 0.25 } }}
        >
          {view === 'home'     && <HomeView     setView={setView} />}
          {view === 'fund'     && <FundView     setView={setView} />}
          {view === 'strategy' && <StrategyView />}
          {view === 'about'    && <AboutView />}
          {view === 'contact'  && <ContactView  />}
        </motion.main>
      </AnimatePresence>
    </>
  );
}
