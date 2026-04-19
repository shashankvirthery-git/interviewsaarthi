'use client'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { useEffect, useRef } from 'react'

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: any[] = []
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        color: ['#6c63ff','#00e5ff','#06ffa5'][Math.floor(Math.random()*3)],
        opacity: Math.random() * 0.6 + 0.2,
      })
    }

    let animId: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2,'0')
        ctx.fill()
        p.x += p.dx; p.y += p.dy
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
      })
      // Draw connecting lines
      particles.forEach((p, i) => {
        particles.slice(i+1).forEach(q => {
          const dist = Math.hypot(p.x-q.x, p.y-q.y)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(108,99,255,${0.08*(1-dist/120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })
      animId = requestAnimationFrame(draw)
    }
    draw()

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <div style={{ minHeight:'100vh', background:'var(--c-bg)', overflow:'hidden', position:'relative' }}>
      <canvas ref={canvasRef} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:1 }} />
      <div className="orb orb-purple" style={{ zIndex:0 }} />
      <div className="orb orb-cyan" style={{ zIndex:0 }} />
      <div className="grid-overlay" style={{ zIndex:0 }} />

      {/* Nav */}
      <nav style={{
        position:'relative', zIndex:10, display:'flex', alignItems:'center',
        justifyContent:'space-between', padding:'18px 48px',
        borderBottom:'1px solid var(--c-border)', background:'rgba(5,6,15,.7)', backdropFilter:'blur(16px)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Logo size={36} />
          <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:18, color:'var(--c-text)' }}>
            InterviewSaarthi
          </span>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <Link href="/auth/login" style={{ padding:'8px 18px', borderRadius:10, fontSize:14, fontWeight:500, color:'var(--c-muted)', textDecoration:'none' }}>Login</Link>
          <Link href="/auth/signup" style={{ padding:'8px 18px', borderRadius:10, fontSize:14, fontWeight:600, background:'linear-gradient(135deg,#6c63ff,#5b54e8)', color:'#fff', textDecoration:'none', boxShadow:'0 4px 15px rgba(108,99,255,.35)' }}>Get Started →</Link>
        </div>
      </nav>

      {/* Hero */}
      <main style={{ position:'relative', zIndex:5, maxWidth:900, margin:'0 auto', padding:'80px 32px 60px', textAlign:'center' }}>
        <div style={{
          display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px',
          borderRadius:20, border:'1px solid rgba(108,99,255,.3)', background:'rgba(108,99,255,.08)', marginBottom:28,
        }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--c-green)', display:'inline-block', animation:'tdots 2s infinite' }} />
          <span style={{ fontSize:12, color:'var(--c-green)', fontFamily:'var(--font-mono)' }}>Powered by Groq AI — LLaMA 3.3 70B</span>
        </div>

        <h1 style={{ fontFamily:'var(--font-display)', fontSize:72, fontWeight:800, lineHeight:1.06, letterSpacing:'-0.02em', marginBottom:24 }}>
          Ace Every<br />
          <span className="grad-text">Interview</span> You<br />
          Walk Into
        </h1>

        <p style={{ fontSize:18, color:'var(--c-muted)', maxWidth:560, margin:'0 auto 40px', lineHeight:1.7 }}>
          Practice with a realistic AI interviewer, get instant feedback on every answer, and follow a personalized roadmap to your dream job.
        </p>

        <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/auth/signup" style={{ padding:'14px 32px', background:'linear-gradient(135deg,#6c63ff,#5b54e8)', borderRadius:14, color:'#fff', fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, textDecoration:'none', boxShadow:'0 8px 30px rgba(108,99,255,.4)' }}>
            Start Free →
          </Link>
          <Link href="/auth/login" style={{ padding:'14px 32px', background:'rgba(30,34,64,.5)', border:'1px solid var(--c-border)', borderRadius:14, color:'var(--c-text)', fontFamily:'var(--font-display)', fontWeight:600, fontSize:16, textDecoration:'none' }}>
            Sign In
          </Link>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginTop:64, textAlign:'left' }}>
          {[
            { icon:'🎤', title:'Real Interviews', desc:'HR, Technical & Behavioral sessions that feel like the real thing.' },
            { icon:'🧠', title:'AI Feedback', desc:'Instant scoring on correctness, clarity, depth and STAR structure.' },
            { icon:'📄', title:'Resume Analyzer', desc:'Upload PDF → auto-extract text → get ATS score & keyword gaps.' },
          ].map(f => (
            <div key={f.title} style={{ padding:24, borderRadius:16, background:'rgba(17,21,39,.8)', border:'1px solid var(--c-border)', backdropFilter:'blur(8px)' }}>
              <div style={{ fontSize:28, marginBottom:12 }}>{f.icon}</div>
              <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--c-text)', marginBottom:8, fontSize:16 }}>{f.title}</h3>
              <p style={{ fontSize:13, color:'var(--c-muted)', lineHeight:1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
