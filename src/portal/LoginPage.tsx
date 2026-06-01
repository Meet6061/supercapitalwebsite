import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import logoSrc from '../components/logo.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleLogin() {
    if (!email || !password) return;
    setStatus('loading');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMsg(error.message);
      setStatus('error');
    }
  }

  return (
    <div style={{ minHeight:'100vh',background:'#F2F0EB',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem' }}>

      {/* Logo */}
      <div style={{ marginBottom:'2.5rem', textAlign:'center' }}>
        <img src={logoSrc} alt="Super Capital" style={{ height:64, mixBlendMode:'multiply' }} />
      </div>

      {/* Card */}
      <div style={{ width:'100%',maxWidth:380,background:'#fff',border:'1px solid rgba(0,0,0,0.09)',borderRadius:20,padding:'2.5rem 2rem' }}>
        <div style={{ fontFamily:"'DM Mono',monospace",fontSize:'0.62rem',letterSpacing:'0.22em',textTransform:'uppercase',color:'rgba(1,41,86,0.5)',marginBottom:'0.6rem' }}>
          Investor Portal
        </div>
        <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'1.8rem',fontWeight:600,color:'#0D0D0D',marginBottom:'2rem',letterSpacing:'-0.02em' }}>
          Sign In
        </div>

        <div style={{ marginBottom:'1rem' }}>
          <label style={lbl}>Email Address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com" style={inp}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        </div>
        <div style={{ marginBottom:'1.5rem' }}>
          <label style={lbl}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••" style={inp}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        </div>

        {status === 'error' && (
          <div style={{ fontSize:'0.8rem',color:'#c0392b',marginBottom:'1rem',padding:'10px 14px',background:'rgba(192,57,43,0.06)',borderRadius:8 }}>
            {errorMsg}
          </div>
        )}

        <button onClick={handleLogin} disabled={status === 'loading'}
          style={{ width:'100%',background:'#012956',color:'#F2F0EB',border:'none',borderRadius:100,padding:'13px',fontFamily:"'DM Mono',monospace",fontSize:'0.72rem',letterSpacing:'0.12em',textTransform:'uppercase',cursor:'pointer',opacity:status==='loading'?0.6:1 }}>
          {status === 'loading' ? 'Signing in…' : 'Sign In'}
        </button>

        <div style={{ marginTop:'1.5rem',fontSize:'0.75rem',color:'rgba(0,0,0,0.35)',textAlign:'center',lineHeight:1.6 }}>
          Access restricted to registered investors.<br/>
          Contact <a href="mailto:sfm@supercapital.co.in" style={{ color:'#012956' }}>sfm@supercapital.co.in</a> for access.
        </div>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { fontFamily:"'DM Mono',monospace",fontSize:'0.58rem',letterSpacing:'0.16em',textTransform:'uppercase',color:'rgba(0,0,0,0.45)',marginBottom:6,display:'block' };
const inp: React.CSSProperties = { width:'100%',background:'#F2F0EB',border:'1px solid rgba(0,0,0,0.12)',borderRadius:10,padding:'11px 14px',fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:'0.9rem',color:'#0D0D0D',outline:'none',boxSizing:'border-box' };
