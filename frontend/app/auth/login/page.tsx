'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/lib/authStore'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const { login, isLoading } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid credentials')
    }
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div className="logo-mark">IS</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--c-text)' }}>
            InterviewSaarthi
          </span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: 'var(--c-text)', marginBottom: 6 }}>
          Welcome back 👋
        </h2>
        <p style={{ fontSize: 14, color: 'var(--c-muted)' }}>
          Sign in to continue your interview prep
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--c-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Email Address
          </label>
          <input
            type="email" required className="inp"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Password
            </label>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type={showPass ? 'text' : 'password'} required className="inp"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={{ paddingRight: 44 }}
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-muted)', fontSize: 16 }}>
              {showPass ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={isLoading}>
          <span className="shimmer" />
          {isLoading ? 'Signing in...' : 'Sign In →'}
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--c-border)' }} />
          <span style={{ fontSize: 11, color: 'var(--c-muted)', fontFamily: 'var(--font-mono)' }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'var(--c-border)' }} />
        </div>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--c-muted)' }}>
          Don't have an account?{' '}
          <Link href="/auth/signup" style={{ color: 'var(--c-accent2)', fontWeight: 600, textDecoration: 'none' }}>
            Create one free →
          </Link>
        </p>
      </form>

      {/* Trust badges */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
        {['🔒 Secure', '⚡ Instant', '🤖 AI-Powered'].map(b => (
          <span key={b} style={{ fontSize: 11, color: 'var(--c-muted)', fontFamily: 'var(--font-mono)' }}>{b}</span>
        ))}
      </div>
    </div>
  )
}
