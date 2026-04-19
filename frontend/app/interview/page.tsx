'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { interviewAPI } from '@/services/api'
import { useAuthStore } from '@/lib/authStore'
import toast from 'react-hot-toast'

const TYPES = [
  { id: 'HR',         emoji: '🤝', desc: 'Culture fit & motivation' },
  { id: 'Technical',  emoji: '💻', desc: 'Skills & problem solving' },
  { id: 'Behavioral', emoji: '🧩', desc: 'Past experience & STAR' },
]
const DIFFICULTIES = [
  { id: 'Easy',   emoji: '🟢', color: '#06ffa5', bg: 'rgba(6,255,165,.12)', border: 'rgba(6,255,165,.4)' },
  { id: 'Medium', emoji: '🟡', color: '#ffd166', bg: 'rgba(255,209,102,.12)', border: 'rgba(255,209,102,.4)' },
  { id: 'Hard',   emoji: '🔴', color: '#ff4d6d', bg: 'rgba(255,77,109,.12)', border: 'rgba(255,77,109,.4)' },
]
const ROLES = [
  'Frontend Developer','Backend Developer','Full Stack Developer',
  'React Developer','Node.js Developer','Python Developer',
  'Data Scientist','DevOps Engineer','Product Manager',
  'UI/UX Designer','Mobile Developer','Software Engineer'
]

export default function InterviewSetupPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [form, setForm] = useState({
    interviewType: 'Technical',
    role: user?.role || 'Full Stack Developer',
    difficulty: 'Medium',
  })
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    setLoading(true)
    try {
      const res = await interviewAPI.create(form)
      router.push(`/interview/${res.data.interview._id}`)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to start')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 32, background: 'var(--c-bg)',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div className="orb orb-purple" style={{ opacity: .15 }} />
        <div className="orb orb-cyan" style={{ opacity: .1 }} />
        <div className="grid-overlay" />
      </div>

      <div style={{ width: '100%', maxWidth: 560, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, margin: '0 auto 16px',
            background: 'linear-gradient(135deg,#6c63ff,#00e5ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, boxShadow: '0 8px 32px rgba(108,99,255,.4)',
          }}>🎤</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--c-text)', marginBottom: 8 }}>
            Setup Your Interview
          </h1>
          <p style={{ fontSize: 14, color: 'var(--c-muted)' }}>Configure your AI mock session</p>
        </div>

        <div style={{
          background: 'var(--c-card)', border: '1px solid var(--c-border)',
          borderRadius: 20, padding: 32, display: 'flex', flexDirection: 'column', gap: 28,
        }}>
          {/* Interview Type */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>
              Interview Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {TYPES.map(t => {
                const active = form.interviewType === t.id
                return (
                  <button key={t.id} onClick={() => setForm({ ...form, interviewType: t.id })}
                    style={{
                      padding: '14px 10px', borderRadius: 12, cursor: 'pointer',
                      background: active ? 'rgba(108,99,255,.18)' : 'rgba(5,6,15,.6)',
                      border: active ? '2px solid #6c63ff' : '1px solid var(--c-border)',
                      color: active ? '#a89fff' : 'var(--c-muted)',
                      transition: 'all .2s', textAlign: 'center',
                      boxShadow: active ? '0 0 20px rgba(108,99,255,.2)' : 'none',
                    }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{t.emoji}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', color: active ? '#e0dcff' : 'var(--c-text)' }}>{t.id}</div>
                    <div style={{ fontSize: 10, color: 'var(--c-muted)', marginTop: 3 }}>{t.desc}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Role */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>
              Target Role
            </label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="inp">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>
              Difficulty Level
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {DIFFICULTIES.map(d => {
                const active = form.difficulty === d.id
                return (
                  <button key={d.id} onClick={() => setForm({ ...form, difficulty: d.id })}
                    style={{
                      padding: '14px 10px', borderRadius: 12, cursor: 'pointer',
                      background: active ? d.bg : 'rgba(5,6,15,.6)',
                      border: active ? `2px solid ${d.border}` : '1px solid var(--c-border)',
                      color: active ? d.color : 'var(--c-muted)',
                      transition: 'all .2s', textAlign: 'center',
                      boxShadow: active ? `0 0 20px ${d.bg}` : 'none',
                    }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{d.emoji}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{d.id}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Start Button */}
          <button onClick={handleStart} disabled={loading} className="btn-primary" style={{ fontSize: 16, padding: '15px' }}>
            <span className="shimmer" />
            {loading ? 'Starting...' : '🚀 Start Interview'}
          </button>
        </div>

        {/* Tip */}
        <div style={{
          marginTop: 16, padding: '12px 16px', borderRadius: 12,
          background: 'rgba(108,99,255,.06)', border: '1px solid rgba(108,99,255,.15)',
        }}>
          <p style={{ fontSize: 12, color: 'var(--c-muted)', lineHeight: 1.6 }}>
            💡 <strong style={{ color: 'var(--c-accent2)' }}>Tip:</strong> Answer questions fully and clearly.
            The AI will ask follow-ups based on your responses. You can use voice or text input.
          </p>
        </div>
      </div>
    </div>
  )
}
