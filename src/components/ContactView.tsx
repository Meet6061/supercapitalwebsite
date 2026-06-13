import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Label, Display, It, Body, Section, PageFooter } from './UI';
import { Globe } from './magicui/globe';

function useMobile() {
  const [mob, setMob] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const h = () => setMob(window.innerWidth <= 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return mob;
}

const INFO_ROWS = [
  ['Entity',     'Super Fund Managers LLP'],
  ['Trust',      'Super Capital Trust'],
  ['Regulatory', 'SEBI Cat. III AIF'],
  ['Minimum',    '₹1 Crore'],
  ['Email',      'sfm@supercapital.co.in'],
  ['Phone',      '+91 63533 73149'],
  ['Address',    'GIDC Plot 1/12 Highway, Near Saij Overbridge, Kalol Industrial Estate, Gandhi Nagar, Kalol, Gujarat – 382725'],
];

export default function ContactView() {
  const mob = useMobile();

  return (
    <div>
      <Section style={{ paddingTop: mob ? 100 : 120 }}>
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.6 }}>
          <Label>Investor Relations</Label>
          <Display size="xl" style={{ marginBottom:'1.4rem' }}>Connect<br /><It>with us.</It></Display>
          <Body style={{ maxWidth:500, marginBottom:'3.5rem' }}>
            For eligible investors and prospective capital allocators. We respond within 48 hours.
          </Body>
        </motion.div>

        <div style={{ display:'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1.5fr', gap: mob ? '2rem' : '5vw' }}>
          {/* Contact details */}
          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1,duration:0.6 }}>
            <div style={f.sectionLabel}>Contact Details</div>
            <div style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:16,overflow:'hidden' }}>
              {INFO_ROWS.map(([k,v],i) => (
                <div key={k} style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'1rem 1.3rem',borderBottom:i<INFO_ROWS.length-1?'1px solid var(--border)':'none',flexWrap:'wrap',gap:'0.5rem' }}>
                  <span style={{ fontSize:'0.82rem',color:'var(--ink-3)',flexShrink:0,paddingTop:1 }}>{k}</span>
                  <span style={{ fontSize:'0.82rem',color:'var(--ink)',fontWeight:400,textAlign:'right',maxWidth:'60%' }}>{v}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Globe */}
          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2,duration:0.6 }}>
            <div style={{
              position:'relative', overflow:'hidden', borderRadius:24,
              background:'var(--bg-dark)', color:'#fff',
              minHeight: mob ? 380 : 460,
              display:'flex', flexDirection:'column', justifyContent:'flex-start',
              padding: mob ? '2rem 1.6rem' : '2.4rem 2.4rem 0',
            }}>
              <div style={{ position:'absolute',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse at 30% 20%,rgba(11,110,106,0.18) 0%,transparent 60%)' }}/>
              <div style={{ position:'relative', zIndex:1 }}>
                <div style={{ fontFamily:"'DM Mono',monospace",fontSize:'0.6rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'rgba(255,255,255,0.5)',marginBottom:'0.8rem' }}>
                  Built for India's Future 
                </div>
                <div style={{ fontFamily:"'Cormorant Garamond','Instrument Serif',serif",fontSize:'clamp(1.4rem,2.4vw,2.2rem)',fontWeight:600,lineHeight:1.28,color:'#fff',letterSpacing:'-0.02em',maxWidth:420 }}>
                  Aligned with the innovation, enterprise, and growth shaping tomorrow's economy.
                </div>
              </div>
              <div style={{ position:'relative', flex:1, minHeight: mob ? 260 : 320 }}>
                <Globe />
              </div>
              <div style={{ pointerEvents:'none', position:'absolute', inset:0, background:'radial-gradient(circle at 50% 200%, rgba(0,0,0,0.35), rgba(255,255,255,0))' }} />
            </div>
          </motion.div>
        </div>
      </Section>
      <PageFooter disc="© 2026 Super Capital" />
    </div>
  );
}

const f: Record<string,React.CSSProperties> = {
  sectionLabel: { fontFamily:"'DM Mono',monospace",fontSize:'0.82rem',letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--ink-3)',display:'block',marginBottom:'1.2rem' },
};
