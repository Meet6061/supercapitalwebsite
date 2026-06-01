import { useState } from 'react';
import { supabase } from '../lib/supabase';
import logoSrc from '../components/logo.png';

interface Props { onBack: () => void; }

export default function LoginPage({ onBack }: Props) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function login() {
    if (!email || !password) return;
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#F2F0EB', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'2rem' }}>

      {/* Back to site */}
      <button onClick={onBack} style={{ position:'fixed', top:20, left:24, background:'none', border:'none', cursor:'pointer', fontFamily:"'DM Mono',monospace", fontSize:'0.65rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(0,0,0,0.35)' }}>
        ← Back to Site
      </button>

      {/* Logo */}
      <img src={logoSrc} alt="Super Capital" style={{ height:60, mixBlendMode:'multiply', marginBottom:'2rem' }} />

      {/* Login card */}
      <div style={{ width:'100%', maxWidth:380, background:'#fff', border:'1px solid rgba(0,0,0,0.09)', borderRadius:20, padding:'2.5rem 2rem' }}>

        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.9rem', fontWeight:600, color:'#0D0D0D', marginBottom:'0.4rem', letterSpacing:'-0.02em' }}>
          Investor Login
        </div>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.62rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(1,41,86,0.5)', marginBottom:'2rem' }}>
          Super Capital Portal
        </div>

        <div style={{ marginBottom:'1rem' }}>
          <div style={lbl}>Email</div>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com" style={inp}
            onKeyDown={e => e.key === 'Enter' && login()} />
        </div>

        <div style={{ marginBottom:'1.5rem' }}>
          <div style={lbl}>Password</div>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••" style={inp}
            onKeyDown={e => e.key === 'Enter' && login()} />
        </div>

        {error && (
          <div style={{ fontSize:'0.8rem', color:'#c0392b', marginBottom:'1rem', padding:'10px 14px', background:'rgba(192,57,43,0.06)', borderRadius:8 }}>
            {error}
          </div>
        )}

        <button onClick={login} disabled={loading}
          style={{ width:'100%', background:'#012956', color:'#F2F0EB', border:'none', borderRadius:100, padding:'13px', fontFamily:"'DM Mono',monospace", fontSize:'0.72rem', letterSpacing:'0.12em', textTransform:'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <div style={{ marginTop:'1.5rem', fontSize:'0.75rem', color:'rgba(0,0,0,0.32)', textAlign:'center', lineHeight:1.7 }}>
          Access restricted to registered investors.<br />
          Contact <a href="mailto:sfm@supercapital.co.in" style={{ color:'#012956' }}>sfm@supercapital.co.in</a>
        </div>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { fontFamily:"'DM Mono',monospace", fontSize:'0.58rem', letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(0,0,0,0.4)', marginBottom:6, display:'block' };
const inp: React.CSSProperties = { width:'100%', background:'#F2F0EB', border:'1px solid rgba(0,0,0,0.12)', borderRadius:10, padding:'11px 14px', fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:'0.9rem', color:'#0D0D0D', outline:'none', boxSizing:'border-box' };
