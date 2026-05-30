import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Label, Display, It, Body, Section, PageFooter } from './UI';

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
  ['Email',      'investors@supercapital.in'],
];

export default function ContactView() {
  const mob = useMobile();
  return (
    <div>
      <Section style={{ paddingTop: mob ? 100 : 120 }}>
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.6 }}>
          <Label>Investor Relations</Label>
          <Display size="xl" style={{ marginBottom:'1.4rem' }}>Connect<br /><It>with us.</It></Display>
          <Body style={{ maxWidth:500, marginBottom:'3.5rem' }}>For eligible investors and prospective capital allocators. We respond within 48 hours.</Body>
        </motion.div>

        <div style={{ display:'grid',gridTemplateColumns: mob ? '1fr' : '1fr 1.5fr',gap: mob ? '2rem' : '5vw' }}>
          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1,duration:0.6 }}>
            <div style={f.sectionLabel}>Contact Details</div>
            <div style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:16,overflow:'hidden' }}>
              {INFO_ROWS.map(([k,v],i) => (
                <div key={k} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'1rem 1.3rem',borderBottom:i<INFO_ROWS.length-1?'1px solid var(--border)':'none',flexWrap:'wrap',gap:'0.5rem' }}>
                  <span style={{ fontSize:'0.82rem',color:'var(--ink-3)' }}>{k}</span>
                  <span style={{ fontSize:'0.82rem',color:'var(--ink)',fontWeight:400 }}>{v}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2,duration:0.6 }}>
            <div style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:16,padding:'2rem' }}>
              <div style={f.sectionLabel}>Investor Inquiry Form</div>
              <div style={{ height:'1.4rem' }}/>
              <div style={{ display:'grid',gridTemplateColumns: mob ? '1fr' : '1fr 1fr',gap:'1rem' }}>
                <FField label="Full Name" type="text" placeholder="Your name"/>
                <FField label="Organisation" type="text" placeholder="Firm / Family Office"/>
              </div>
              <div style={{ display:'grid',gridTemplateColumns: mob ? '1fr' : '1fr 1fr',gap:'1rem' }}>
                <FField label="Email" type="email" placeholder="email@domain.com"/>
                <FField label="Mobile" type="tel" placeholder="+91"/>
              </div>
              <FSel label="Investor Type" options={['High Net-Worth Individual','Family Office','Institutional Investor','Sophisticated Investor']}/>
              <FField label="Intended Allocation (₹ Cr)" type="text" placeholder="e.g. 2–5 Crores"/>
              <div style={{ marginBottom:'1rem' }}>
                <div style={f.label}>Message</div>
                <textarea style={{ ...f.input,height:100,resize:'vertical',lineHeight:1.6 }} placeholder="Any specific questions…"/>
              </div>
              <button style={f.submit}>Submit Inquiry</button>
            </div>
          </motion.div>
        </div>
      </Section>
      <PageFooter disc="This inquiry does not constitute a solicitation of securities. SEBI Cat. III AIF." />
    </div>
  );
}

function FField({ label,type,placeholder }:{ label:string;type:string;placeholder:string }) {
  return (
    <div style={{ marginBottom:'1rem' }}>
      <div style={f.label}>{label}</div>
      <input type={type} placeholder={placeholder} style={f.input}/>
    </div>
  );
}
function FSel({ label,options }:{ label:string;options:string[] }) {
  return (
    <div style={{ marginBottom:'1rem' }}>
      <div style={f.label}>{label}</div>
      <select style={f.input}>{options.map(o=><option key={o}>{o}</option>)}</select>
    </div>
  );
}

const f:Record<string,React.CSSProperties>={
  sectionLabel:{ fontFamily:"'DM Mono',monospace",fontSize:'0.62rem',letterSpacing:'0.22em',textTransform:'uppercase',color:'var(--ink-3)',display:'block',marginBottom:'1.2rem' },
  label:{ fontFamily:"'DM Mono',monospace",fontSize:'0.6rem',letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:5,display:'block' },
  input:{ width:'100%',background:'var(--bg)',border:'1px solid var(--border-md)',borderRadius:10,padding:'10px 14px',fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:'0.88rem',color:'var(--ink)',outline:'none',WebkitAppearance:'none',appearance:'none',boxSizing:'border-box' } as React.CSSProperties,
  submit:{ width:'100%',fontFamily:"'DM Mono',monospace",fontSize:'0.72rem',letterSpacing:'0.1em',textTransform:'uppercase',padding:'13px 28px',borderRadius:100,background:'var(--ink)',color:'var(--bg)',border:'none',cursor:'pointer' },
};
