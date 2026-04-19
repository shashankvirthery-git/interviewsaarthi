'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { dashboardAPI } from '@/services/api'
import { useAuthStore } from '@/lib/authStore'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) return (
    <div style={{ background:'var(--c-card)', border:'1px solid var(--c-border2)', borderRadius:8, padding:'8px 12px' }}>
      <p style={{ fontSize:11, color:'var(--c-muted)', marginBottom:2, fontFamily:'var(--font-mono)' }}>{label}</p>
      <p style={{ fontSize:14, fontWeight:700, color:'var(--c-accent2)', fontFamily:'var(--font-display)' }}>{payload[0].value}/10</p>
    </div>
  )
  return null
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardAPI.getStats().then(r => setStats(r.data.stats)).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div className="typing-dots"><span/><span/><span/></div>
    </div>
  )

  const scoreTrend = stats?.scoreTrend?.map((s: any, i: number) => ({ name:`#${i+1}`, score:s.score })).reverse() || []
  const typePerf   = stats?.typePerformance?.map((t: any) => ({ name:t._id, score: Math.round(t.avgScore*10)/10 })) || []
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const scoreColor = (s: number) => s >= 7 ? 'var(--c-accent2)' : s >= 5 ? 'var(--c-gold)' : 'var(--c-danger)'

  return (
    <div className="page-enter" style={{ padding:'32px 36px', maxWidth:1100, margin:'0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom:32, display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div>
          <p style={{ fontSize:12, color:'var(--c-muted)', fontFamily:'var(--font-mono)', marginBottom:6 }}>
            {greeting} ·{' '}
            <span style={{ color:'var(--c-accent)' }}>
              {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}
            </span>
          </p>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:36, fontWeight:800, color:'var(--c-text)', lineHeight:1.1 }}>
            {user?.name?.split(' ')[0]} <span className="grad-text">Dashboard</span>
          </h1>
          <p style={{ fontSize:13, color:'var(--c-muted)', marginTop:6 }}>
            {user?.role} · {user?.experienceLevel}
          </p>
        </div>
        <Link href="/interview" style={{
          display:'inline-flex', alignItems:'center', gap:8, padding:'11px 20px',
          background:'linear-gradient(135deg,#6c63ff,#5b54e8)', borderRadius:12,
          color:'#fff', fontFamily:'var(--font-display)', fontWeight:700, fontSize:14,
          textDecoration:'none', transition:'all .2s', boxShadow:'0 4px 20px rgba(108,99,255,.35)',
          whiteSpace:'nowrap',
        }}>
          🎤 New Interview
        </Link>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {[
          { label:'Total Sessions', value:stats?.totalInterviews ?? 0, icon:'📊', sub:'All time', color:'var(--c-accent)' },
          { label:'Completed',      value:stats?.completedInterviews ?? 0, icon:'✅', sub:'Finished', color:'var(--c-green)' },
          { label:'Avg Score',      value:stats?.averageScore ? `${stats.averageScore}` : '—', icon:'⭐', sub:'/10 average', color:'var(--c-gold)' },
          { label:'Last Score',     value:stats?.lastScore ? `${stats.lastScore}` : '—', icon:'🎯', sub:'/10 recent', color:'var(--c-accent2)' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-20, right:-20, fontSize:52, opacity:.06 }}>{s.icon}</div>
            <div style={{ fontSize:22, marginBottom:8 }}>{s.icon}</div>
            <p style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, color:s.color, lineHeight:1 }}>
              {s.value}
            </p>
            <p style={{ fontSize:11, color:'var(--c-muted)', marginTop:4 }}>{s.sub}</p>
            <p style={{ fontSize:12, fontWeight:600, color:'var(--c-text)', marginTop:2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:20, marginBottom:20 }}>
        {/* Score trend */}
        <div className="glass-card" style={{ padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <div>
              <p style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, color:'var(--c-text)' }}>Score Trend</p>
              <p style={{ fontSize:12, color:'var(--c-muted)', marginTop:2 }}>Performance over time</p>
            </div>
            {scoreTrend.length > 0 && (
              <div style={{ padding:'4px 10px', borderRadius:20, background:'rgba(0,229,255,.08)', border:'1px solid rgba(0,229,255,.15)' }}>
                <span style={{ fontSize:11, color:'var(--c-accent2)', fontFamily:'var(--font-mono)' }}>{scoreTrend.length} sessions</span>
              </div>
            )}
          </div>
          {scoreTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={scoreTrend}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6c63ff" />
                    <stop offset="100%" stopColor="#00e5ff" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" />
                <XAxis dataKey="name" stroke="var(--c-muted)" fontSize={11} fontFamily="var(--font-mono)" />
                <YAxis domain={[0,10]} stroke="var(--c-muted)" fontSize={11} fontFamily="var(--font-mono)" />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="score" stroke="url(#scoreGrad)" strokeWidth={2.5}
                  dot={{ fill:'var(--c-accent2)', r:4, strokeWidth:0 }}
                  activeDot={{ r:6, fill:'var(--c-accent2)', strokeWidth:0 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:200, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10 }}>
              <div style={{ fontSize:40 }}>📈</div>
              <p style={{ color:'var(--c-muted)', fontSize:13 }}>No data yet.</p>
              <Link href="/interview" style={{ fontSize:13, color:'var(--c-accent2)', textDecoration:'none', fontWeight:600 }}>
                Start your first interview →
              </Link>
            </div>
          )}
        </div>

        {/* Weak areas */}
        <div className="glass-card" style={{ padding:24 }}>
          <p style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, color:'var(--c-text)', marginBottom:4 }}>Weak Areas</p>
          <p style={{ fontSize:12, color:'var(--c-muted)', marginBottom:18 }}>Auto-detected from feedback</p>
          {stats?.weakAreas?.length > 0 ? (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {stats.weakAreas.map((w: string, i: number) => (
                <div key={i} style={{
                  display:'flex', alignItems:'flex-start', gap:10, padding:'10px 12px',
                  borderRadius:10, background:'rgba(255,77,109,.05)', border:'1px solid rgba(255,77,109,.1)',
                }}>
                  <span style={{ fontSize:14, color:'var(--c-danger)', marginTop:1 }}>⚠</span>
                  <span style={{ fontSize:12, color:'var(--c-text)', lineHeight:1.5 }}>{w}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, height:150 }}>
              <div style={{ fontSize:36 }}>🎯</div>
              <p style={{ fontSize:12, color:'var(--c-muted)', textAlign:'center' }}>Complete interviews to detect your weak spots</p>
            </div>
          )}
        </div>
      </div>

      {/* Type performance + recent */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        {/* By type */}
        <div className="glass-card" style={{ padding:24 }}>
          <p style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, color:'var(--c-text)', marginBottom:20 }}>By Interview Type</p>
          {typePerf.length > 0 ? (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={typePerf} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" />
                <XAxis dataKey="name" stroke="var(--c-muted)" fontSize={11} />
                <YAxis domain={[0,10]} stroke="var(--c-muted)" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" fill="var(--c-accent)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:150, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--c-muted)', fontSize:13 }}>No data yet</div>
          )}
        </div>

        {/* Recent sessions */}
        <div className="glass-card" style={{ padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <p style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, color:'var(--c-text)' }}>Recent Sessions</p>
            <Link href="/dashboard/history" style={{ fontSize:12, color:'var(--c-accent2)', textDecoration:'none' }}>View all →</Link>
          </div>
          {stats?.recentInterviews?.length > 0 ? (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {stats.recentInterviews.slice(0,4).map((iv: any) => (
                <div key={iv._id} style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'8px 12px', borderRadius:10, background:'rgba(30,34,64,.4)',
                  border:'1px solid var(--c-border)',
                }}>
                  <div>
                    <p style={{ fontSize:12, fontWeight:600, color:'var(--c-text)' }}>{iv.role}</p>
                    <p style={{ fontSize:11, color:'var(--c-muted)' }}>{iv.interviewType} · {iv.difficulty}</p>
                  </div>
                  {iv.overallScore > 0 && (
                    <span style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700, color:scoreColor(iv.overallScore) }}>
                      {iv.overallScore}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ height:130, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--c-muted)', fontSize:13 }}>
              No sessions yet
            </div>
          )}
        </div>
      </div>

      {/* CTA banner */}
      <div style={{
        padding:'24px 28px', borderRadius:18,
        background:'linear-gradient(135deg,rgba(108,99,255,.12),rgba(0,229,255,.06))',
        border:'1px solid rgba(108,99,255,.2)',
        display:'flex', alignItems:'center', justifyContent:'space-between', gap:20,
      }}>
        <div>
          <p style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:18, color:'var(--c-text)', marginBottom:4 }}>
            Ready to practice? 🚀
          </p>
          <p style={{ fontSize:13, color:'var(--c-muted)' }}>
            Start a new session and get instant AI feedback on every answer.
          </p>
        </div>
        <Link href="/interview" style={{
          display:'inline-flex', alignItems:'center', gap:8, padding:'12px 24px',
          background:'linear-gradient(135deg,#6c63ff,#5b54e8)', borderRadius:12,
          color:'#fff', fontFamily:'var(--font-display)', fontWeight:700, fontSize:14,
          textDecoration:'none', boxShadow:'0 4px 20px rgba(108,99,255,.4)', whiteSpace:'nowrap',
          flexShrink:0,
        }}>
          Start Interview →
        </Link>
      </div>
    </div>
  )
}
