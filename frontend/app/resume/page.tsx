'use client'
import { useState, useRef, useEffect } from 'react'
import { aiAPI } from '@/services/api'
import toast from 'react-hot-toast'

type Analysis = {
  atsScore: number; overallRating: string; summary: string
  sections: Record<string, { score: number; status: string; feedback: string }>
  strengths: string[]; weaknesses: string[]; missingKeywords: string[]
  suggestedKeywords: string[]; improvements: { priority: string; action: string }[]
  interviewReadiness: number; estimatedCallbackRate: string
}

const ROLES = ['Software Engineer','Frontend Developer','Backend Developer','Full Stack Developer','Data Scientist','DevOps Engineer','Product Manager','UI/UX Designer','Mobile Developer','Data Analyst','ML Engineer','Other']
const sc = (s:number) => s>=80?'var(--c-green)':s>=65?'var(--c-accent2)':s>=45?'var(--c-gold)':'var(--c-danger)'
const sl = (s:number) => s>=86?'Excellent':s>=76?'Good':s>=61?'Average':s>=41?'Below Average':'Poor'
const pc = (p:string) => p==='High'?'var(--c-danger)':p==='Medium'?'var(--c-gold)':'var(--c-accent2)'

export default function ResumePage() {
  const [resumeText, setResumeText] = useState('')
  const [targetRole, setTargetRole] = useState('Software Engineer')
  const [jobDesc, setJobDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [analysis, setAnalysis] = useState<Analysis|null>(null)
  const [activeTab, setActiveTab] = useState<'overview'|'sections'|'keywords'|'roadmap'>('overview')
  const [fileName, setFileName] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Animated background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const particles: any[] = Array.from({length:40}, () => ({
      x: Math.random()*canvas.width, y: Math.random()*canvas.height,
      r: Math.random()*1.2+0.3,
      dx: (Math.random()-.5)*.3, dy: (Math.random()-.5)*.3,
      color: ['#6c63ff','#00e5ff','#06ffa5'][Math.floor(Math.random()*3)],
      o: Math.random()*.5+.1,
    }))

    let id: number
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height)
      particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2)
        ctx.fillStyle = p.color + Math.floor(p.o*255).toString(16).padStart(2,'0')
        ctx.fill()
        p.x+=p.dx; p.y+=p.dy
        if(p.x<0||p.x>canvas.width) p.dx*=-1
        if(p.y<0||p.y>canvas.height) p.dy*=-1
      })
      id = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(id)
  }, [])

  // Extract text from PDF using pdf.js
  const extractPDF = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      script.onload = async () => {
        try {
          const pdfjsLib = (window as any).pdfjsLib
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
          const arrayBuffer = await file.arrayBuffer()
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
          let text = ''
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const content = await page.getTextContent()
            text += content.items.map((item: any) => item.str).join(' ') + '\n'
          }
          resolve(text.trim())
        } catch(e) {
          reject(e)
        }
      }
      script.onerror = () => reject(new Error('Failed to load pdf.js'))
      // Only add if not already loaded
      if (!(window as any).pdfjsLib) {
        document.head.appendChild(script)
      } else {
        script.onload!(null as any)
      }
    })
  }

  const processFile = async (file: File) => {
    setFileName(file.name)
    setExtracting(true)
    setResumeText('')

    try {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        toast.loading('Extracting text from PDF...', { id: 'extract' })
        const text = await extractPDF(file)
        if (text && text.length > 50) {
          setResumeText(text)
          toast.success(`✅ Extracted ${text.split(/\s+/).length} words from PDF!`, { id: 'extract' })
        } else {
          toast.error('Could not extract text. Please paste manually.', { id: 'extract' })
        }
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const text = await file.text()
        setResumeText(text)
        toast.success(`✅ Loaded ${text.split(/\s+/).length} words!`)
      } else if (file.type.startsWith('image/')) {
        toast('Image uploaded. Please also paste your resume text below.', { icon: '🖼️' })
      } else {
        toast.error('Unsupported file type. Use PDF or TXT.')
      }
    } catch(e: any) {
      toast.error('Extraction failed. Please paste text manually.', { id: 'extract' })
    } finally {
      setExtracting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const handleAnalyze = async () => {
    if (!resumeText.trim() || resumeText.trim().length < 50) {
      toast.error('Please upload a resume or paste text first')
      return
    }
    setLoading(true); setAnalysis(null)
    try {
      const res = await aiAPI.analyzeResume({ resumeText, targetRole, jobDescription: jobDesc })
      setAnalysis(res.data.analysis)
      setActiveTab('overview')
      toast.success('Analysis complete! 🎯')
    } catch(err: any) {
      toast.error(err?.response?.data?.message || 'Analysis failed')
    } finally {
      setLoading(false) }
  }

  const Ring = ({ score, size=100 }: { score:number, size?:number }) => {
    const pct = (score/100)*100; const c = sc(score)
    return (
      <div style={{ position:'relative', width:size, height:size }}>
        <svg width={size} height={size} viewBox="0 0 36 36" style={{ transform:'rotate(-90deg)' }}>
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--c-border)" strokeWidth="2.5"/>
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={c} strokeWidth="2.5"
            strokeDasharray={`${pct} ${100-pct}`} strokeLinecap="round" className="score-circle"/>
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:size/4, color:c, lineHeight:1 }}>{score}</span>
          <span style={{ fontSize:size/9, color:'var(--c-muted)' }}>/100</span>
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter" style={{ padding:'28px 32px', maxWidth:1100, margin:'0 auto', position:'relative' }}>
      {/* Animated bg canvas */}
      <canvas ref={canvasRef} style={{
        position:'fixed', top:0, left:220, right:0, bottom:0,
        width:'calc(100vw - 220px)', height:'100vh',
        pointerEvents:'none', zIndex:0, opacity:.6,
      }} />

      <div style={{ position:'relative', zIndex:1 }}>
        {/* Header */}
        <div style={{ marginBottom:28, display:'flex', alignItems:'center', gap:14 }}>
          <div style={{
            width:48, height:48, borderRadius:14,
            background:'linear-gradient(135deg,#6c63ff,#00e5ff)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:24,
            boxShadow:'0 4px 20px rgba(108,99,255,.4)',
          }}>📄</div>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:800, color:'var(--c-text)' }}>
              AI Resume Analyzer
            </h1>
            <p style={{ fontSize:13, color:'var(--c-muted)' }}>Upload your resume → Auto-extract → Get ATS score & insights</p>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:analysis?'420px 1fr':'1fr', gap:22 }}>
          {/* Left panel */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

            {/* Upload zone */}
            <div style={{ background:'var(--c-card)', border:'1px solid var(--c-border)', borderRadius:18, padding:20 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--c-muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:12 }}>
                Upload Resume
              </label>

              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e=>{e.preventDefault();setIsDragOver(true)}}
                onDragLeave={()=>setIsDragOver(false)}
                onDrop={handleDrop}
                style={{
                  border:`2px dashed ${isDragOver?'var(--c-accent)':'var(--c-border)'}`,
                  borderRadius:12, padding:'28px 20px', textAlign:'center', cursor:'pointer',
                  background: isDragOver?'rgba(108,99,255,.06)':'rgba(5,6,15,.4)',
                  transition:'all .2s',
                  transform: isDragOver?'scale(1.01)':'none',
                  boxShadow: isDragOver?'0 0 20px rgba(108,99,255,.15)':'none',
                }}>
                {extracting ? (
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                    <div className="typing-dots"><span/><span/><span/></div>
                    <p style={{ fontSize:13, color:'var(--c-accent2)' }}>Extracting text from PDF...</p>
                  </div>
                ) : fileName ? (
                  <div>
                    <div style={{ fontSize:32, marginBottom:8 }}>✅</div>
                    <p style={{ fontSize:13, fontWeight:600, color:'var(--c-green)', marginBottom:4 }}>{fileName}</p>
                    <p style={{ fontSize:11, color:'var(--c-muted)' }}>{resumeText.split(/\s+/).filter(Boolean).length} words extracted · Click to change</p>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize:36, marginBottom:10 }}>📁</div>
                    <p style={{ fontSize:14, fontWeight:600, color:'var(--c-text)', marginBottom:4 }}>Drop PDF here or click to upload</p>
                    <p style={{ fontSize:11, color:'var(--c-muted)' }}>PDF auto-extracts text · TXT · PNG · JPG</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept=".pdf,.txt,.png,.jpg,.jpeg" onChange={handleFileChange} style={{display:'none'}}/>
              </div>

              {/* Status bar */}
              {resumeText && !extracting && (
                <div style={{ marginTop:10, padding:'8px 12px', background:'rgba(6,255,165,.06)', border:'1px solid rgba(6,255,165,.15)', borderRadius:8, display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ color:'var(--c-green)', fontSize:14 }}>✓</span>
                  <span style={{ fontSize:12, color:'var(--c-green)' }}>
                    {resumeText.split(/\s+/).filter(Boolean).length} words ready for analysis
                  </span>
                </div>
              )}

              {/* Manual paste fallback */}
              <div style={{ marginTop:12 }}>
                <label style={{ display:'block', fontSize:11, color:'var(--c-muted)', marginBottom:6 }}>
                  Or paste text manually:
                </label>
                <textarea value={resumeText} onChange={e=>setResumeText(e.target.value)}
                  placeholder="Paste resume text here..."
                  style={{
                    width:'100%', minHeight:90, padding:'10px 12px',
                    background:'rgba(5,6,15,.7)', border:'1px solid var(--c-border)',
                    borderRadius:10, color:'var(--c-text)', fontSize:13,
                    fontFamily:'var(--font-body)', resize:'vertical', outline:'none',
                  }}
                  onFocus={e=>e.target.style.borderColor='var(--c-accent)'}
                  onBlur={e=>e.target.style.borderColor='var(--c-border)'}
                />
              </div>
            </div>

            {/* Settings */}
            <div style={{ background:'var(--c-card)', border:'1px solid var(--c-border)', borderRadius:16, padding:18, display:'flex', flexDirection:'column', gap:12 }}>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--c-muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>Target Role</label>
                <select value={targetRole} onChange={e=>setTargetRole(e.target.value)} className="inp">
                  {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--c-muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>
                  Job Description <span style={{ fontWeight:400, textTransform:'none', color:'var(--c-border2)' }}>(optional)</span>
                </label>
                <textarea value={jobDesc} onChange={e=>setJobDesc(e.target.value)}
                  placeholder="Paste job description for targeted keyword matching..."
                  style={{ width:'100%', minHeight:70, padding:'10px 12px', background:'rgba(5,6,15,.7)', border:'1px solid var(--c-border)', borderRadius:10, color:'var(--c-text)', fontSize:13, fontFamily:'var(--font-body)', resize:'vertical', outline:'none' }}
                  onFocus={e=>e.target.style.borderColor='var(--c-accent)'}
                  onBlur={e=>e.target.style.borderColor='var(--c-border)'}
                />
              </div>
            </div>

            {/* Analyze button */}
            <button onClick={handleAnalyze} disabled={loading||extracting||!resumeText} className="btn-primary" style={{ fontSize:15, padding:14 }}>
              <span className="shimmer"/>
              {loading ? (
                <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <div className="typing-dots"><span/><span/><span/></div>
                  Analyzing with Groq AI...
                </span>
              ) : '🔍 Analyze Resume'}
            </button>

            {/* What you get */}
            <div style={{ padding:'14px 16px', background:'rgba(108,99,255,.05)', border:'1px solid rgba(108,99,255,.12)', borderRadius:12 }}>
              <p style={{ fontSize:11, fontWeight:700, color:'var(--c-accent)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.06em' }}>What you'll get</p>
              {['ATS Score (0-100) with grade','Section-by-section analysis','Missing & suggested keywords','Priority improvement actions','Interview readiness score','Estimated callback rate'].map(f=>(
                <div key={f} style={{ display:'flex', gap:8, alignItems:'center', marginBottom:5 }}>
                  <span style={{ color:'var(--c-green)', fontSize:11 }}>✓</span>
                  <span style={{ fontSize:12, color:'var(--c-muted)' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Results */}
          {analysis && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }} className="page-enter">
              {/* Score hero */}
              <div style={{ background:'var(--c-card)', border:'1px solid var(--c-border)', borderRadius:18, padding:'22px 26px', display:'flex', alignItems:'center', gap:24 }}>
                <Ring score={analysis.atsScore} size={110}/>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                    <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800, color:sc(analysis.atsScore) }}>{sl(analysis.atsScore)}</h2>
                    <span style={{ padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:600, background:`${sc(analysis.atsScore)}18`, color:sc(analysis.atsScore), border:`1px solid ${sc(analysis.atsScore)}40` }}>{analysis.overallRating}</span>
                  </div>
                  <p style={{ fontSize:13, color:'var(--c-muted)', lineHeight:1.6, marginBottom:12 }}>{analysis.summary}</p>
                  <div style={{ display:'flex', gap:20 }}>
                    <div>
                      <p style={{ fontSize:10, color:'var(--c-muted)', fontFamily:'var(--font-mono)', marginBottom:2 }}>Interview Readiness</p>
                      <p style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:sc(analysis.interviewReadiness) }}>{analysis.interviewReadiness}%</p>
                    </div>
                    <div>
                      <p style={{ fontSize:10, color:'var(--c-muted)', fontFamily:'var(--font-mono)', marginBottom:2 }}>Callback Rate</p>
                      <p style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'var(--c-accent2)' }}>{analysis.estimatedCallbackRate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display:'flex', gap:4, background:'var(--c-card)', border:'1px solid var(--c-border)', borderRadius:12, padding:4 }}>
                {([['overview','📊 Overview'],['sections','📋 Sections'],['keywords','🔑 Keywords'],['roadmap','🗺 Roadmap']] as const).map(([t,label])=>(
                  <button key={t} onClick={()=>setActiveTab(t as any)} style={{
                    flex:1, padding:'7px 4px', borderRadius:9, fontSize:12, fontWeight:600,
                    cursor:'pointer', fontFamily:'var(--font-body)', border:'none',
                    background:activeTab===t?'rgba(108,99,255,.18)':'transparent',
                    color:activeTab===t?'var(--c-accent2)':'var(--c-muted)',
                    transition:'all .15s',
                  }}>{label}</button>
                ))}
              </div>

              {activeTab==='overview' && (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }} className="page-enter">
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <div style={{ background:'var(--c-card)', border:'1px solid var(--c-border)', borderRadius:14, padding:16 }}>
                      <p style={{ fontSize:11, fontWeight:700, color:'var(--c-green)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>✓ Strengths</p>
                      {analysis.strengths.map((s,i)=>(
                        <div key={i} style={{ display:'flex', gap:8, marginBottom:8 }}>
                          <span style={{ color:'var(--c-green)', fontSize:12, flexShrink:0 }}>•</span>
                          <span style={{ fontSize:12, color:'var(--c-muted)', lineHeight:1.5 }}>{s}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ background:'var(--c-card)', border:'1px solid var(--c-border)', borderRadius:14, padding:16 }}>
                      <p style={{ fontSize:11, fontWeight:700, color:'var(--c-danger)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>⚠ Weaknesses</p>
                      {analysis.weaknesses.map((w,i)=>(
                        <div key={i} style={{ display:'flex', gap:8, marginBottom:8 }}>
                          <span style={{ color:'var(--c-danger)', fontSize:12, flexShrink:0 }}>•</span>
                          <span style={{ fontSize:12, color:'var(--c-muted)', lineHeight:1.5 }}>{w}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab==='sections' && (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }} className="page-enter">
                  {Object.entries(analysis.sections||{}).map(([key,val])=>(
                    <div key={key} style={{ background:'var(--c-card)', border:'1px solid var(--c-border)', borderRadius:12, padding:'12px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <p style={{ fontSize:13, fontWeight:600, color:'var(--c-text)', textTransform:'capitalize' }}>{key}</p>
                          <span style={{ padding:'2px 8px', borderRadius:10, fontSize:10, fontWeight:600, background:`${sc(val.score)}15`, color:sc(val.score), border:`1px solid ${sc(val.score)}30` }}>{val.status}</span>
                        </div>
                        <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, color:sc(val.score) }}>{val.score}</span>
                      </div>
                      <div style={{ height:3, background:'var(--c-border)', borderRadius:2, marginBottom:6, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${val.score}%`, background:sc(val.score), borderRadius:2 }}/>
                      </div>
                      <p style={{ fontSize:12, color:'var(--c-muted)', lineHeight:1.5 }}>{val.feedback}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab==='keywords' && (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }} className="page-enter">
                  <div style={{ background:'var(--c-card)', border:'1px solid var(--c-border)', borderRadius:14, padding:16 }}>
                    <p style={{ fontSize:11, fontWeight:700, color:'var(--c-danger)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:12 }}>❌ Missing Keywords</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                      {analysis.missingKeywords.map((k,i)=>(
                        <span key={i} style={{ padding:'5px 12px', borderRadius:20, background:'rgba(255,77,109,.1)', border:'1px solid rgba(255,77,109,.25)', color:'var(--c-danger)', fontSize:12, fontWeight:500 }}>{k}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ background:'var(--c-card)', border:'1px solid var(--c-border)', borderRadius:14, padding:16 }}>
                    <p style={{ fontSize:11, fontWeight:700, color:'var(--c-green)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:12 }}>✅ Add These Keywords</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                      {analysis.suggestedKeywords.map((k,i)=>(
                        <span key={i} style={{ padding:'5px 12px', borderRadius:20, background:'rgba(6,255,165,.08)', border:'1px solid rgba(6,255,165,.2)', color:'var(--c-green)', fontSize:12, fontWeight:500 }}>{k}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab==='roadmap' && (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }} className="page-enter">
                  {analysis.improvements.map((imp,i)=>(
                    <div key={i} style={{ display:'flex', gap:12, padding:'12px 14px', background:'var(--c-card)', border:'1px solid var(--c-border)', borderRadius:12 }}>
                      <div style={{ width:26, height:26, borderRadius:8, flexShrink:0, background:`${pc(imp.priority)}15`, border:`1px solid ${pc(imp.priority)}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:pc(imp.priority), fontFamily:'var(--font-mono)' }}>
                        {imp.priority[0]}
                      </div>
                      <div>
                        <span style={{ fontSize:10, fontWeight:700, color:pc(imp.priority), textTransform:'uppercase', letterSpacing:'.05em' }}>{imp.priority} Priority</span>
                        <p style={{ fontSize:13, color:'var(--c-text)', lineHeight:1.5, marginTop:2 }}>{imp.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
