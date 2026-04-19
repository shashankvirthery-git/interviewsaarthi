'use client'
import { useEffect, useRef } from 'react'

const QUOTES = [
  "Preparation is the key to success",
  "Every expert was once a beginner",
  "Practice makes permanent",
  "Your next opportunity starts with preparation",
  "Confidence comes from being prepared",
  "Success is where preparation meets opportunity",
  "The best interviews are the ones you practiced",
  "Turn your weaknesses into strengths",
  "Knowledge is power in every interview",
  "Your dream job awaits the prepared candidate",
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const particlesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = particlesRef.current
    if (!container) return
    const count = 18
    container.innerHTML = ''
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div')
      p.className = 'particle'
      p.style.left = Math.random() * 100 + '%'
      p.style.top = Math.random() * 100 + '%'
      p.style.animationDelay = Math.random() * 8 + 's'
      p.style.animationDuration = (6 + Math.random() * 6) + 's'
      p.style.opacity = '0'
      // Alternate accent colors
      const colors = ['#6c63ff', '#00e5ff', '#06ffa5', '#ffd166']
      p.style.background = colors[Math.floor(Math.random() * colors.length)]
      container.appendChild(p)
    }
  }, [])

  const doubled = [...QUOTES, ...QUOTES]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden', background: 'var(--c-bg)' }}>
      {/* ── Animated background ── */}
      <div className="orb orb-purple" />
      <div className="orb orb-cyan" />
      <div className="orb orb-green" />
      <div className="grid-overlay" />
      <div ref={particlesRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }} />

      {/* ── Left panel (hidden on small screens) ── */}
      <div style={{
        flex: '0 0 50%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'flex-start', padding: '60px', position: 'relative', zIndex: 2,
      }} className="hidden-mobile">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 64 }}>
          <div className="logo-mark" style={{ width: 52, height: 52, fontSize: 18 }}>IS</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--c-text)' }}>
            InterviewSaarthi
          </span>
        </div>

        <div style={{ maxWidth: 440 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px',
            borderRadius: 20, border: '1px solid rgba(108,99,255,.3)',
            background: 'rgba(108,99,255,.08)', marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--c-green)', display: 'inline-block', animation: 'tdots 2s infinite' }} />
            <span style={{ fontSize: 12, color: 'var(--c-green)', fontFamily: 'var(--font-mono)' }}>AI-Powered Interview Coach</span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 800,
            lineHeight: 1.08, letterSpacing: '-0.02em', marginBottom: 20,
          }}>
            Ace Every<br />
            <span className="grad-text">Interview</span><br />
            You Walk Into
          </h1>

          <p style={{ fontSize: 16, color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: 40 }}>
            Practice with a realistic AI interviewer. Get instant feedback on every answer, detect your weak spots, and follow a personalized roadmap to your dream job.
          </p>

          {/* Feature list */}
          {[
            { icon: '🎯', text: 'HR, Technical & Behavioral interviews' },
            { icon: '⚡', text: 'Real-time answer evaluation & scoring' },
            { icon: '📈', text: 'Progress tracking with weak area detection' },
            { icon: '🗣️', text: 'Voice input support' },
          ].map(f => (
            <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: 'rgba(108,99,255,.12)',
                border: '1px solid rgba(108,99,255,.2)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 14, flexShrink: 0,
              }}>{f.icon}</div>
              <span style={{ fontSize: 14, color: 'var(--c-muted)' }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div style={{
        flex: '0 0 50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 48px', position: 'relative', zIndex: 2,
        borderLeft: '1px solid var(--c-border)',
        background: 'rgba(5,6,15,.5)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {children}
        </div>
      </div>

      {/* ── Ticker ── */}
      <div className="ticker-wrap" style={{ zIndex: 10 }}>
        <div className="ticker-inner">
          {doubled.map((q, i) => (
            <span key={i}><em>//</em>{q}</span>
          ))}
        </div>
      </div>

      <style>{`
        @media(max-width:768px){
          .hidden-mobile{display:none!important;}
          div[style*="flex: 0 0 50%"]:last-of-type{flex:1!important;border-left:none!important;}
        }
      `}</style>
    </div>
  )
}
