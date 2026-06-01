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
  const [showPortal, setShowPortal] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes gridDrift{0%{background-position:0 0}100%{background-position:72px 72px}}
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap');
    `;
    document.head.appendChild(style);
  }, []);

  function setView(v: AppView) {
    setViewState(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (showPortal) {
    return <InvestorPortal onBack={() => setShowPortal(false)} />;
  }

  return (
    <>
      <Header current={view} setView={setView} onPortalClick={() => setShowPortal(true)} />
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
