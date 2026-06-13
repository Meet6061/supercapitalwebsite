import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Label, Display, It, Body, Section, PageFooter } from './UI';
import meetPhoto from './Meet.png';
import naishadhPhoto from './Naishadh.jpeg';

function useMobile() {
  const [mob, setMob] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const h = () => setMob(window.innerWidth <= 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return mob;
}

const fade = (i = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay: i * 0.1, duration: 0.6 },
});

// ── Image card — sits alongside the existing name card ──────────────────────
function PhotoCard({ photo, name, delay, mobileHeight }: { photo: string; name: string; delay: number; mobileHeight?: number }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div {...fade(delay)} style={{ height: '100%' }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: 'var(--bg-card)',
          border: `1px solid ${hov ? 'rgba(1,41,86,0.28)' : 'var(--border)'}`,
          borderRadius: 20,
          overflow: 'hidden',
          height: mobileHeight ? mobileHeight : '100%',
          minHeight: 0,
          transition: 'all 0.42s cubic-bezier(.22,.8,.4,1)',
          transform: hov ? 'translateY(-6px)' : 'none',
          boxShadow: hov ? '0 28px 72px rgba(1,41,86,0.08)' : '0 1px 4px rgba(0,0,0,0.03)',
          position: 'relative',
        }}
      >
        <img
          src={photo}
          alt={name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            filter: hov ? 'none' : 'saturate(0.92)',
            transition: 'filter 0.42s',
          }}
        />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, transparent 60%, rgba(1,41,86,0.12) 100%)', pointerEvents:'none' }} />
      </div>
    </motion.div>
  );
}

function LeaderCard({ name, role, bio, qualifications, initials, delay, compact }: {
  name: string; role: string; bio: string; qualifications: string[]; initials: string; delay: number; compact?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div {...fade(delay)} style={{ height: '100%' }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: 'var(--bg-card)',
          border: `1px solid ${hov ? 'rgba(1,41,86,0.28)' : 'var(--border)'}`,
          borderRadius: compact ? 16 : 20, padding: compact ? '1.4rem 1.3rem' : '2.2rem 1.8rem',
          transition: 'all 0.42s cubic-bezier(.22,.8,.4,1)',
          transform: hov ? 'translateY(-6px)' : 'none',
          boxShadow: hov ? '0 28px 72px rgba(1,41,86,0.08)' : '0 1px 4px rgba(0,0,0,0.03)',
          cursor: 'default', position: 'relative', overflow: 'hidden', height: '100%',
        }}
      >
        <div style={{ position:'absolute',top:0,left:'8%',right:'8%',height:1,background:`linear-gradient(90deg,transparent,rgba(1,41,86,${hov?0.55:0.15}),transparent)`,transition:'opacity 0.42s' }} />
        <div style={{ display:'flex',alignItems:'flex-start',gap: compact ? '0.9rem' : '1.4rem',marginBottom: compact ? '1.1rem' : '1.8rem' }}>
          <div>
            <div style={{ fontFamily:"'Instrument Serif',serif",fontSize: compact ? '1.3rem' : '1.9rem',fontWeight:400,color:'var(--ink)',lineHeight:1.2,marginBottom:'0.3rem' }}>{name}</div>
            <div style={{ fontFamily:"'DM Mono',monospace",fontSize: compact ? '0.5rem' : '0.58rem',letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--teal)',opacity:0.75 }}>{role}</div>
          </div>
        </div>
        <div style={{ height:1,background:'var(--border)',marginBottom: compact ? '1rem' : '1.6rem' }} />
        <p style={{ fontSize: compact ? '0.76rem' : '0.86rem',color:'var(--ink-3)',lineHeight: compact ? 1.65 : 1.8,marginBottom: compact ? '1.1rem' : '1.8rem' }}>{bio}</p>
        <div>
          <div style={{ fontFamily:"'DM Mono',monospace",fontSize: compact ? '0.5rem' : '0.55rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom: compact ? '0.7rem' : '0.9rem',opacity:0.7 }}>Qualifications</div>
          <div style={{ display:'flex',flexDirection:'column',gap: compact ? 5 : 7 }}>
            {qualifications.map(q => (
              <div key={q} style={{ display:'flex',alignItems:'center',gap:10 }}>
                <div style={{ width:4,height:4,borderRadius:'50%',background:'var(--teal)',flexShrink:0,opacity:0.6 }} />
                <span style={{ fontSize: compact ? '0.74rem' : '0.82rem',color:'var(--ink-2)',lineHeight: compact ? 1.45 : 1.55 }}>{q}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AboutView() {
  const mob = useMobile();
  return (
    <div>
      <Section style={{ paddingTop: mob ? 100 : 120 }}>
        {/* Intro + Mission */}
        <div style={{ display:'grid',gridTemplateColumns: mob ? '1fr' : '1fr 1fr',gap: mob ? '2.5rem' : '5vw',alignItems:'stretch',marginBottom: mob ? '3.5rem' : '6rem' }}>
          <motion.div {...fade(0)} style={{ display:'flex',flexDirection:'column',justifyContent:'center' }}>
            <Label>About Super Capital</Label>
            <Display size="xl" style={{ marginBottom:'1.4rem' }}>
              Built for<br /><It>India's serious</It><br />investors.
            </Display>
            <Body style={{ maxWidth:520 }}>
              Super Capital is an institutional alternative investment platform designed to deliver concentrated, research-driven alpha for India's most discerning capital allocators.
            </Body>
          </motion.div>

          <motion.div {...fade(1)}>
            <div style={{ borderRadius:24,background:'var(--bg-dark)',padding: mob ? '36px 6vw' : '52px 5vw 56px',position:'relative',overflow:'hidden',color:'#fff',minHeight: mob ? 'unset' : 440,display:'flex',alignItems:'stretch' }}>
              <div style={{ position:'absolute',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse at 30% 60%,rgba(11,110,106,0.15) 0%,transparent 60%)' }}/>
              <div style={{ position:'relative',zIndex:1,display:'flex',flexDirection:'column',justifyContent:'space-between',width:'100%',gap:'2.4rem' }}>
                <div>
                  <Label>Our Mission</Label>
                  <div style={{ fontFamily:"'Cormorant Garamond','Instrument Serif',serif",fontSize:'clamp(1.3rem,2.2vw,2.2rem)',fontWeight:600,lineHeight:1.28,color:'#fff',letterSpacing:'-0.02em' }}>
                    To be the most rigorously disciplined equity manager in India — where every rupee is deployed with conviction and every decision is governed by process.
                  </div>
                </div>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:1,background:'rgba(255,255,255,0.06)',borderRadius:14,overflow:'hidden' }}>
                  {[
                    { val:'Cat. III', lbl:'IN/AIF3/26-27/2212' },
                    { val:'2026',    lbl:'Established' },
                    { val:'Open-Ended',   lbl:'Fund Category' },
                    { val:'₹1Cr+',  lbl:'Minimum Commitment' },
                  ].map(({ val, lbl }) => (
                    <div key={lbl} style={{ background:'rgba(255,255,255,0.03)',padding:'1.2rem',textAlign:'center' }}>
                      <div style={{ fontFamily:"'Cormorant Garamond','Instrument Serif',serif",fontSize:'1.8rem',fontWeight:600,color:'#fff',lineHeight:1,marginBottom:4 }}>{val}</div>
                      <div style={{ fontFamily:"'DM Mono',monospace",fontSize:'0.5rem',letterSpacing:'0.16em',textTransform:'uppercase',color:'rgba(255,255,255,0.35)' }}>{lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Leadership */}
        <motion.div {...fade(2)} style={{ marginBottom:'2.8rem' }}>
          <Label>The People Behind Super Capital</Label>
          <Display size="lg" style={{ marginBottom:'0.6rem' }}>
            Founded on<br /><It>expertise & conviction.</It>
          </Display>
        </motion.div>

        {/* Leadership cards — single row of 4 on desktop (photo, bio, photo, bio), stacked pairs on mobile */}
        {mob ? (
          <>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 2fr',gap:'2rem',marginBottom:'2rem' }}>
              <PhotoCard photo={meetPhoto} name="Meet Patel" delay={3} mobileHeight={260} />
              <LeaderCard
                delay={3} initials="MP" name="Meet Patel" role="Fund Manager & Designated Partner"
                bio="Meet is fund manager at Super Fund Managers LLP and is actively involved in investment research, portfolio oversight, and operational management. His experience spans investment analysis, financial planning, portfolio construction, and advisory support within regulated financial markets."
                qualifications={['CFA','MBA (Finance), IMT Ghaziabad','NISM Category III AIF Managers Certification']}
              />
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 2fr',gap:'2rem' }}>
              <PhotoCard photo={naishadhPhoto} name="Naishadh Patel" delay={4} mobileHeight={260} />
              <LeaderCard
                delay={4} initials="NP" name="Naishadh Patel" role="Business Development & Designated Partner"
                bio="Naishadh handles Business Development and Operational Activities at Super Fund Managers LLP and brings extensive experience across banking, client relationship management, credit assessment, and financial product distribution. His background spans retail banking, HNI client management, branch leadership, and corporate relationship management."
                qualifications={['MBA (Finance)','Bachelor of Commerce (B.Com)']}
              />
            </div>
          </>
        ) : (
          <div style={{ display:'grid',gridTemplateColumns:'0.78fr 1.55fr 0.78fr 1.55fr',gap:'1.4rem',alignItems:'stretch' }}>
            <PhotoCard photo={meetPhoto} name="Meet Patel" delay={3} />
            <LeaderCard
              compact
              delay={3} initials="MP" name="Meet Patel" role="Fund Manager & Designated Partner"
              bio="Meet is fund manager at Super Fund Managers LLP and is actively involved in investment research, portfolio oversight, and operational management. His experience spans investment analysis, financial planning, portfolio construction, and advisory support within regulated financial markets."
              qualifications={['CFA','MBA (Finance), IMT Ghaziabad','NISM Category III AIF Managers Certification']}
            />
            <PhotoCard photo={naishadhPhoto} name="Naishadh Patel" delay={4} />
            <LeaderCard
              compact
              delay={4} initials="NP" name="Naishadh Patel" role="Business Development & Designated Partner"
              bio="Naishadh handles Business Development and Operational Activities at Super Fund Managers LLP and brings extensive experience across banking, client relationship management, credit assessment, and financial product distribution. His background spans retail banking, HNI client management, branch leadership, and corporate relationship management."
              qualifications={['MBA (Finance)','Bachelor of Commerce (B.Com)']}
            />
          </div>
        )}
      </Section>
      <PageFooter disc="© 2026 Super Capital." />
    </div>
  );
}
