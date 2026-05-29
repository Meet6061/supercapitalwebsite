import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Label, Display, It, Body, Section, PageFooter } from './UI';

const fade = (i = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay: i * 0.1, duration: 0.6 },
});

// ─── Leadership Card ──────────────────────────────────────────────────────────
function LeaderCard({
  name, role, bio, qualifications, initials, delay,
}: {
  name: string;
  role: string;
  bio: string;
  qualifications: string[];
  initials: string;
  delay: number;
}) {
  const [hov, setHov] = useState(false);

  return (
    <motion.div {...fade(delay)}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: 'var(--bg-card)',
          border: `1px solid ${hov ? 'rgba(11,110,106,0.28)' : 'var(--border)'}`,
          borderRadius: 20,
          padding: '2.8rem 2.6rem',
          transition: 'all 0.42s cubic-bezier(.22,.8,.4,1)',
          transform: hov ? 'translateY(-6px)' : 'none',
          boxShadow: hov
            ? '0 28px 72px rgba(11,110,106,0.08), 0 4px 18px rgba(0,0,0,0.04)'
            : '0 1px 4px rgba(0,0,0,0.03)',
          cursor: 'default',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle top gradient line */}
        <div style={{
          position: 'absolute', top: 0, left: '8%', right: '8%', height: 1,
          background: `linear-gradient(90deg, transparent, rgba(11,110,106,${hov ? 0.55 : 0.15}), transparent)`,
          transition: 'opacity 0.42s',
        }} />

        {/* Avatar + name block */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.6rem', marginBottom: '2rem' }}>
          {/* Monogram avatar */}
          <div style={{
            width: 64, height: 64, borderRadius: 16, flexShrink: 0,
            background: hov ? 'rgba(11,110,106,0.1)' : 'rgba(11,110,106,0.06)',
            border: `1px solid rgba(11,110,106,${hov ? 0.22 : 0.1})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.42s',
          }}>
            <span style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: '1.4rem', fontWeight: 400,
              color: 'var(--teal)', letterSpacing: '-0.02em',
            }}>{initials}</span>
          </div>

          <div>
            <div style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: '1.32rem', fontWeight: 400,
              color: 'var(--ink)', lineHeight: 1.2, marginBottom: '0.3rem',
            }}>{name}</div>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.58rem', letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'var(--teal)', opacity: 0.75,
            }}>{role}</div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)', marginBottom: '1.8rem' }} />

        {/* Bio */}
        <p style={{
          fontSize: '0.86rem', color: 'var(--ink-3)', lineHeight: 1.8,
          marginBottom: '2rem',
        }}>{bio}</p>

        {/* Qualifications */}
        <div>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '0.55rem', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'var(--ink-3)',
            marginBottom: '0.9rem', opacity: 0.7,
          }}>Qualifications</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {qualifications.map(q => (
              <div key={q} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: 'var(--teal)', flexShrink: 0, opacity: 0.6,
                }} />
                <span style={{ fontSize: '0.82rem', color: 'var(--ink-2)', lineHeight: 1.55 }}>{q}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function AboutView() {
  return (
    <div>
      <Section style={{ paddingTop: 120 }}>

        {/* ── Row 1: Intro + Mission side-by-side ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '5vw',
          alignItems: 'stretch',
          marginBottom: '6rem',
        }}>

          {/* Left: About intro */}
          <motion.div {...fade(0)} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Label>About Super Capital</Label>
            <Display size="xl" style={{ marginBottom: '1.4rem' }}>
              Built for<br /><It>India's serious</It><br />investors.
            </Display>
            <Body style={{ maxWidth: 520 }}>
              Super Capital is an institutional alternative investment platform designed to deliver concentrated, research-driven alpha for India's most discerning capital allocators.
            </Body>
          </motion.div>

          {/* Right: Mission card */}
          <motion.div {...fade(1)}>
            <div style={s.missionWrap}>
              <div style={s.missionBg} />
              <div style={s.missionInner}>
                <div style={s.missionLeft}>
                  <Label>Our Mission</Label>
                  <div style={s.missionH}>
                    To be the most rigorously disciplined equity manager in India — where every rupee is deployed with conviction and every decision is governed by process.
                  </div>
                </div>
                <div style={s.missionRight}>
                  {[
                    { val: 'Cat. III', lbl: 'SEBI AIF Registration' },
                    { val: '2024',    lbl: 'Established' },
                    { val: 'India',   lbl: 'Primary Mandate' },
                    { val: '₹1Cr+',  lbl: 'Minimum Commitment' },
                  ].map(({ val, lbl }) => (
                    <div key={lbl} style={s.missionStat}>
                      <div style={s.mStatVal}>{val}</div>
                      <div style={s.mStatLbl}>{lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Row 2: Leadership ── */}
        <motion.div {...fade(2)} style={{ marginBottom: '2.8rem' }}>
          <Label>The People Behind Super Capital</Label>
          <Display size="lg" style={{ marginBottom: '0.6rem' }}>
            Founded on<br /><It>expertise & conviction.</It>
          </Display>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

          <LeaderCard
            delay={3}
            initials="MP"
            name="Meetkumar Shaileshkumar Patel"
            role="Co-Founder & Designated Partner"
            bio="Meet is a member of the key investment team at Super Fund Managers LLP and is actively involved in investment research, portfolio oversight, and operational management. His experience spans investment analysis, financial planning, portfolio construction, and advisory support within regulated financial markets."
            qualifications={[
              'CFA',
              'MBA (Finance), IMT Ghaziabad',
              'B.Tech Mechanical Engineering',
              'NISM Category III AIF Managers Certification',
            ]}
          />

          <LeaderCard
            delay={4}
            initials="NP"
            name="Naishadhkumar Rajeshkumar Patel"
            role="Co-Founder & Designated Partner"
            bio="Naishadh is a member of the key investment team at Super Fund Managers LLP and brings extensive experience across banking, client relationship management, credit assessment, and financial product distribution. His background spans retail banking, HNI client management, branch leadership, and corporate relationship management."
            qualifications={[
              'MBA (Finance)',
              'Bachelor of Commerce (B.Com)',
            ]}
          />

        </div>

      </Section>
      <PageFooter disc="© 2024 Super Fund Managers LLP. SEBI Registered Category III AIF. For eligible investors only." />
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  missionWrap: {
    borderRadius: 24,
    background: 'var(--bg-dark)',
    padding: '52px 5vw 56px',
    position: 'relative',
    overflow: 'hidden',
    color: '#fff',
    height: '100%',
    minHeight: 440,
    display: 'flex',
    alignItems: 'stretch',
  },
  missionBg: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: 'radial-gradient(ellipse at 30% 60%,rgba(11,110,106,0.15) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(24,64,168,0.1) 0%,transparent 60%)',
  },
  missionInner: {
    position: 'relative', zIndex: 1,
    display: 'flex', flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%', gap: '2.4rem',
  },
  missionLeft: {},
  missionH: {
    fontFamily: "'Cormorant Garamond','Instrument Serif',serif",
    fontSize: 'clamp(1.55rem,2.2vw,2.2rem)',
    fontWeight: 600, lineHeight: 1.28,
    color: '#fff', letterSpacing: '-0.02em',
  },
  missionRight: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: 1, background: 'rgba(255,255,255,0.06)',
    borderRadius: 14, overflow: 'hidden',
  },
  missionStat: {
    background: 'rgba(255,255,255,0.03)',
    padding: '1.4rem 1.2rem', textAlign: 'center',
  },
  mStatVal: {
    fontFamily: "'Cormorant Garamond','Instrument Serif',serif",
    fontSize: '2rem', fontWeight: 600,
    color: '#fff', lineHeight: 1, marginBottom: 4,
  },
  mStatLbl: {
    fontFamily: "'DM Mono',monospace",
    fontSize: '0.55rem', letterSpacing: '0.16em',
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
  },
};
