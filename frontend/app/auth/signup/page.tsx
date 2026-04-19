'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/lib/authStore'

const ROLES = ['Frontend Developer','Backend Developer','Full Stack Developer','Data Scientist','DevOps Engineer','Product Manager','Mobile Developer','Other']
const LEVELS = ['Fresher','1-2 years','3-5 years','5+ years']

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Full Stack Developer', experienceLevel: 'Fresher' })
  const [showPass, setShowPass] = useState(false)
  const [step, setStep] = useState(1)
  const { signup, isLoading } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) { setStep(2); return }
    try {
      await signup(form)
      toast.success('Account created! Let\'s start.')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Signup failed')
    }
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div className="logo-mark">IS</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--c-text)' }}>
            InterviewSaarthi
          </span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: 'var(--c-text)', marginBottom: 6 }}>
          {step === 1 ? 'Create your account' : 'Your profile'}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--c-muted)' }}>
          {step === 1 ? 'Start your interview journey today — it\'s free' : 'Tell us about yourself for personalised questions'}
        </p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
        {[1, 2].map(s => (
          <div key={s} style={{
            flex: s === step ? 2 : 1, height: 3, borderRadius: 2,
            background: s <= step ? 'var(--c-accent)' : 'var(--c-border)',
            transition: 'all .3s',
          }} />
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="page-enter">
            <div style={{ marginBottom: 14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--c-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'.06em' }}>Full Name</label>
              <input type="text" required className="inp" placeholder="John Doe"
                value={form.name} onChange={e => setForm({...form,name:e.target.value})} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--c-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'.06em' }}>Email</label>
              <input type="email" required className="inp" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form,email:e.target.value})} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--c-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'.06em' }}>Password</label>
              <div style={{ position:'relative' }}>
                <input type={showPass?'text':'password'} required className="inp" placeholder="Min 6 characters"
                  value={form.password} onChange={e => setForm({...form,password:e.target.value})} style={{paddingRight:44}}
                  minLength={6} />
                <button type="button" onClick={()=>setShowPass(!showPass)}
                  style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--c-muted)',fontSize:16}}>
                  {showPass?'🙈':'👁'}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="page-enter">
            <div style={{ marginBottom: 14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--c-muted)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.06em' }}>Target Role</label>
              <select className="inp" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--c-muted)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.06em' }}>Experience Level</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {LEVELS.map(l=>(
                  <button key={l} type="button"
                    onClick={()=>setForm({...form,experienceLevel:l})}
                    style={{
                      padding:'10px 12px', borderRadius:10, fontSize:13, fontWeight:500, cursor:'pointer',
                      transition:'all .15s', textAlign:'center', fontFamily:'var(--font-body)',
                      background: form.experienceLevel===l ? 'rgba(108,99,255,.2)' : 'rgba(5,6,15,.6)',
                      border: form.experienceLevel===l ? '1px solid var(--c-accent)' : '1px solid var(--c-border)',
                      color: form.experienceLevel===l ? 'var(--c-accent2)' : 'var(--c-muted)',
                    }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ display:'flex', gap:10 }}>
          {step === 2 && (
            <button type="button" onClick={()=>setStep(1)}
              style={{
                flex:'0 0 48px', padding:'13px', background:'rgba(30,34,64,.6)',
                border:'1px solid var(--c-border)', borderRadius:12, color:'var(--c-muted)',
                cursor:'pointer', fontSize:18, transition:'all .15s',
              }}>←</button>
          )}
          <button type="submit" className="btn-primary" disabled={isLoading} style={{flex:1}}>
            <span className="shimmer" />
            {isLoading ? 'Creating...' : step === 1 ? 'Continue →' : 'Create Account 🚀'}
          </button>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0' }}>
          <div style={{flex:1,height:1,background:'var(--c-border)'}}/>
          <span style={{fontSize:11,color:'var(--c-muted)',fontFamily:'var(--font-mono)'}}>OR</span>
          <div style={{flex:1,height:1,background:'var(--c-border)'}}/>
        </div>

        <p style={{ textAlign:'center', fontSize:14, color:'var(--c-muted)' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{color:'var(--c-accent2)',fontWeight:600,textDecoration:'none'}}>
            Sign in →
          </Link>
        </p>
      </form>
    </div>
  )
}
