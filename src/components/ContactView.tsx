import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Label, Display, It, Body, Section, PageFooter } from './UI';
import { supabase } from '../lib/supabase';
import { notifyNewLead } from '../lib/sendEmail';

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

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactView() {
  const mob = useMobile();
  const [status, setStatus] = useState<Status>('idle');
  const [form, setForm] = useState({
    full_name: '', organisation: '', email: '', mobile: '',
    investor_type: 'High Net-Worth Individual', allocation: '', message: '',
  });

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleSubmit() {
    if (!form.full_name || !form.email) return;
    setStatus('submitting');
    try {
      // 1. Save to Supabase leads table
      const { error } = await supabase.from('leads').insert([{
        full_name:     form.full_name,
        organisation:  form.organisation,
        email:         form.email,
        mobile:        form.mobile,
        investor_type: form.investor_type,
        allocation:    form.allocation,
        message:       form.message,
        status:        'new',
      }]);
      if (error) throw error;

      // 2. Trigger email notification (non-blocking)
      await notifyNewLead(form);

      setStatus('success');
      setForm({ full_name:'', organisation:'', email:'', mobile:'',
                investor_type:'High Net-Worth Individual', allocation:'', message:'' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  }

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

          {/* Form */}
          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2,duration:0.6 }}>
            <div style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:16,padding:'2rem' }}>
              <div style={f.sectionLabel}>Investor Inquiry Form</div>
              <div style={{ height:'1.4rem' }}/>

              {status === 'success' ? (
                <div style={{ textAlign:'center', padding:'3rem 1rem' }}>
                  <div style={{ fontSize:'2rem', marginBottom:'1rem' }}>✓</div>
                  <div style={{ fontSize:'1rem', fontWeight:500, marginBottom:'0.5rem' }}>Inquiry Submitted</div>
                  <div style={{ fontSize:'0.85rem', color:'var(--ink-3)' }}>
                    We've received your inquiry and will respond within 48 hours.
                  </div>
                  <button style={{ ...f.submit, marginTop:'2rem', width:'auto', padding:'10px 28px' }}
                    onClick={() => setStatus('idle')}>Submit Another</button>
                </div>
              ) : (
                <>
                  <div style={{ display:'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap:'1rem' }}>
                    <FField label="Full Name *" type="text" placeholder="Your name"
                      value={form.full_name} onChange={v => set('full_name', v)} />
                    <FField label="Organisation" type="text" placeholder="Firm / Family Office"
                      value={form.organisation} onChange={v => set('organisation', v)} />
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap:'1rem' }}>
                    <FField label="Email *" type="email" placeholder="email@domain.com"
                      value={form.email} onChange={v => set('email', v)} />
                    <FField label="Mobile" type="tel" placeholder="+91"
                      value={form.mobile} onChange={v => set('mobile', v)} />
                  </div>
                  <FSel label="Investor Type"
                    options={['High Net-Worth Individual','Family Office','Institutional Investor','Sophisticated Investor']}
                    value={form.investor_type} onChange={v => set('investor_type', v)} />
                  <FField label="Intended Allocation (₹ Cr)" type="text" placeholder="e.g. 2–5 Crores"
                    value={form.allocation} onChange={v => set('allocation', v)} />
                  <div style={{ marginBottom:'1rem' }}>
                    <div style={f.label}>Message</div>
                    <textarea style={{ ...f.input, height:100, resize:'vertical', lineHeight:1.6 }}
                      placeholder="Any specific questions…"
                      value={form.message}
                      onChange={e => set('message', e.target.value)} />
                  </div>

                  {status === 'error' && (
                    <div style={{ fontSize:'0.82rem', color:'#c0392b', marginBottom:'1rem', padding:'10px 14px', background:'rgba(192,57,43,0.06)', borderRadius:8 }}>
                      Something went wrong. Please email us directly at sfm@supercapital.co.in
                    </div>
                  )}

                  <button
                    style={{ ...f.submit, opacity: status === 'submitting' ? 0.6 : 1, cursor: status === 'submitting' ? 'not-allowed' : 'pointer' }}
                    onClick={handleSubmit}
                    disabled={status === 'submitting'}
                  >
                    {status === 'submitting' ? 'Submitting…' : 'Submit Inquiry'}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </Section>
      <PageFooter disc="© 2026 Super Capital | For Super Capital by Elevate Securities" />
    </div>
  );
}

function FField({ label,type,placeholder,value,onChange }:{
  label:string; type:string; placeholder:string; value:string; onChange:(v:string)=>void;
}) {
  return (
    <div style={{ marginBottom:'1rem' }}>
      <div style={f.label}>{label}</div>
      <input type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)} style={f.input} />
    </div>
  );
}

function FSel({ label,options,value,onChange }:{
  label:string; options:string[]; value:string; onChange:(v:string)=>void;
}) {
  return (
    <div style={{ marginBottom:'1rem' }}>
      <div style={f.label}>{label}</div>
      <select value={value} onChange={e => onChange(e.target.value)} style={f.input}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

const f: Record<string,React.CSSProperties> = {
  sectionLabel: { fontFamily:"'DM Mono',monospace",fontSize:'0.82rem',letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--ink-3)',display:'block',marginBottom:'1.2rem' },
  label: { fontFamily:"'DM Mono',monospace",fontSize:'0.6rem',letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:5,display:'block' },
  input: { width:'100%',background:'var(--bg)',border:'1px solid var(--border-md)',borderRadius:10,padding:'10px 14px',fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:'0.88rem',color:'var(--ink)',outline:'none',WebkitAppearance:'none',appearance:'none',boxSizing:'border-box' } as React.CSSProperties,
  submit: { width:'100%',fontFamily:"'DM Mono',monospace",fontSize:'0.72rem',letterSpacing:'0.1em',textTransform:'uppercase',padding:'13px 28px',borderRadius:100,background:'var(--ink)',color:'var(--bg)',border:'none',cursor:'pointer' },
};
