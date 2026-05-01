'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/authStore'
import Logo from '@/components/ui/Logo'
import toast from 'react-hot-toast'
import { useState } from 'react'

const NAV = [
  { href:'/dashboard',         icon:'⬡',  label:'Dashboard',   desc:'Overview & stats' },
  { href:'/interview',         icon:'🎤', label:'Interview',   desc:'New AI session' },
  { href:'/resume',            icon:'📄', label:'Resume AI',   desc:'ATS analyzer' },
  { href:'/dashboard/history', icon:'◫',  label:'History',     desc:'Past sessions' },
  { href:'/aptitude', icon:'🧮', label:'Aptitude', desc:'AI practice quiz' },
]

// Generate a gradient based on name
const nameToGradient = (name: string) => {
  const gradients = [
    'linear-gradient(135deg,#6c63ff,#00e5ff)',
    'linear-gradient(135deg,#f97316,#ffd166)',
    'linear-gradient(135deg,#06ffa5,#00e5ff)',
    'linear-gradient(135deg,#ff4d6d,#6c63ff)',
    'linear-gradient(135deg,#ffd166,#06ffa5)',
  ]
  const idx = (name?.charCodeAt(0) || 0) % gradients.length
  return gradients[idx]
}

export default function Sidebar() {
  const pathname  = usePathname()
  const router    = useRouter()
  const { user, logout } = useAuthStore()
  const [logoutHover, setLogoutHover] = useState(false)
  const [cardHover, setCardHover] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('See you soon! 👋')
    router.push('/auth/login')
  }

  const initials = user?.name?.split(' ').map((n:string)=>n[0]).join('').toUpperCase().slice(0,2) || 'U'
  const gradient = nameToGradient(user?.name || '')

  return (
    <aside style={{
      position:'fixed', left:0, top:0, height:'100%', width:220,
      background:'var(--c-surface)', borderRight:'1px solid var(--c-border)',
      display:'flex', flexDirection:'column', zIndex:20,
    }}>
      {/* Logo */}
      <div style={{ padding:'18px 16px 14px', borderBottom:'1px solid var(--c-border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Logo size={36} />
          <div>
            <p style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13.5, color:'var(--c-text)', lineHeight:1.2 }}>InterviewSaarthi</p>
            <p style={{ fontSize:10, color:'var(--c-muted)', fontFamily:'var(--font-mono)' }}>AI Coach · Groq</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'10px 10px', display:'flex', flexDirection:'column', gap:2 }}>
        <p style={{ fontSize:10, fontWeight:700, color:'var(--c-muted)', textTransform:'uppercase', letterSpacing:'.08em', padding:'8px 6px 6px', fontFamily:'var(--font-mono)' }}>Navigation</p>
        {NAV.map(n => {
          const active = pathname === n.href || (n.href !== '/dashboard' && pathname.startsWith(n.href))
          return (
            <Link key={n.href} href={n.href} className={`sidebar-link ${active?'active':''}`}>
              <span style={{ fontSize:15, flexShrink:0 }}>{n.icon}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:13, fontWeight:600, lineHeight:1.2, color:active?'var(--c-accent2)':'var(--c-text)' }}>{n.label}</p>
                <p style={{ fontSize:10, color:'var(--c-muted)', lineHeight:1 }}>{n.desc}</p>
              </div>
              {active && <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--c-accent2)', flexShrink:0, boxShadow:'0 0 8px var(--c-accent2)' }} />}
            </Link>
          )
        })}
      </nav>

      {/* Status */}
      <div style={{ margin:'0 10px 10px', padding:'9px 12px', borderRadius:10, background:'rgba(6,255,165,.05)', border:'1px solid rgba(6,255,165,.12)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--c-green)', boxShadow:'0 0 8px var(--c-green)', flexShrink:0 }} />
          <span style={{ fontSize:11, color:'var(--c-green)', fontFamily:'var(--font-mono)' }}>Groq AI Online</span>
        </div>
      </div>

      {/* ── 3D User Card ── */}
      <div style={{ padding:'10px 10px 14px', borderTop:'1px solid var(--c-border)' }}>
        <div
          onMouseEnter={()=>setCardHover(true)}
          onMouseLeave={()=>setCardHover(false)}
          style={{
            padding:'10px 12px', borderRadius:14, marginBottom:8,
            background: cardHover ? 'rgba(108,99,255,.1)' : 'rgba(30,34,64,.4)',
            border:`1px solid ${cardHover ? 'rgba(108,99,255,.3)' : 'var(--c-border)'}`,
            transition:'all .25s cubic-bezier(.34,1.56,.64,1)',
            transform: cardHover ? 'translateY(-2px) scale(1.02)' : 'none',
            boxShadow: cardHover ? '0 8px 24px rgba(108,99,255,.2)' : 'none',
            cursor:'default',
          }}
        >
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {/* Avatar with 3D ring */}
            <div style={{ position:'relative', flexShrink:0 }}>
              <div style={{
                width:36, height:36, borderRadius:10,
                background: gradient,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:'var(--font-display)', fontWeight:800, fontSize:13, color:'#fff',
                position:'relative', zIndex:1,
                boxShadow: cardHover ? `0 0 0 2px var(--c-bg), 0 0 0 4px rgba(108,99,255,.5)` : '0 2px 8px rgba(0,0,0,.3)',
                transition:'box-shadow .25s',
              }}>{initials}</div>
              {/* Online dot */}
              <div style={{
                position:'absolute', bottom:-2, right:-2, zIndex:2,
                width:10, height:10, borderRadius:'50%',
                background:'var(--c-green)', border:'2px solid var(--c-surface)',
                boxShadow:'0 0 6px var(--c-green)',
              }} />
            </div>

            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:700, color:'var(--c-text)', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily:'var(--font-display)' }}>
                {user?.name}
              </p>
              <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:2 }}>
                <span style={{
                  fontSize:9, fontWeight:600, padding:'1px 6px', borderRadius:6,
                  background:'rgba(108,99,255,.15)', color:'var(--c-accent2)',
                  border:'1px solid rgba(108,99,255,.2)', fontFamily:'var(--font-mono)',
                }}>{user?.experienceLevel}</span>
              </div>
            </div>
          </div>

          {/* Role tag */}
          {cardHover && (
            <div style={{
              marginTop:8, padding:'4px 8px', borderRadius:6,
              background:'rgba(0,229,255,.06)', border:'1px solid rgba(0,229,255,.12)',
              animation:'pgFade .2s ease',
            }}>
              <p style={{ fontSize:10, color:'var(--c-muted)', fontFamily:'var(--font-mono)' }}>
                🎯 {user?.role}
              </p>
            </div>
          )}
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          onMouseEnter={()=>setLogoutHover(true)}
          onMouseLeave={()=>setLogoutHover(false)}
          style={{
            width:'100%', padding:'8px 12px', borderRadius:10, fontSize:12, fontWeight:600,
            color: logoutHover ? '#fff' : 'var(--c-muted)',
            background: logoutHover ? 'linear-gradient(135deg,rgba(255,77,109,.25),rgba(255,77,109,.1))' : 'transparent',
            border: logoutHover ? '1px solid rgba(255,77,109,.4)' : '1px solid var(--c-border)',
            cursor:'pointer', fontFamily:'var(--font-body)',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            transition:'all .2s cubic-bezier(.34,1.56,.64,1)',
            transform: logoutHover ? 'scale(1.02)' : 'none',
            boxShadow: logoutHover ? '0 4px 15px rgba(255,77,109,.15)' : 'none',
          }}
        >
          <span style={{ fontSize:14, transition:'transform .2s', transform: logoutHover ? 'translateX(-2px)' : 'none', display:'inline-block' }}>↩</span>
          {logoutHover ? 'Logout' : 'Sign Out'}
        </button>
      </div>
    </aside>
  )
}
