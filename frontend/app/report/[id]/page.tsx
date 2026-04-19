'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { interviewAPI } from '@/services/api'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

export default function ReportPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [interview, setInterview] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'roadmap'>('overview')

  useEffect(() => {
    interviewAPI.getOne(id)
      .then(r => setInterview(r.data.interview))
      .catch(() => router.push('/dashboard'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="typing-dots"><span/><span/><span/></div>
    </div>
  )

  if (!interview) return null

  const report = interview.finalReport
  const questions = interview.questions || []
  const answeredQs = questions.filter((q: any) => q.answer)

  const scoreColor = (s: number) =>
    s >= 7 ? '#38a3f8' : s >= 5 ? '#f97316' : '#ef4444'

  const scoreLabel = (s: number) =>
    s >= 8 ? 'Excellent' : s >= 6 ? 'Good' : s >= 4 ? 'Average' : 'Needs Work'

  const overall = report?.overallScore || interview.overallScore || 0
  const pct = (overall / 10) * 100

  // Chart data for per-question scores
  const questionScores = answeredQs.map((q: any, i: number) => ({
    name: `Q${i + 1}`,
    score: q.score,
  }))

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard/history" className="text-xs text-slate-400 hover:text-white transition-colors">← History</Link>
          </div>
          <h1 className="text-3xl font-bold text-white" style={{fontFamily:'Syne,sans-serif'}}>Interview Report</h1>
          <p className="text-slate-400 text-sm mt-1">
            {interview.interviewType} · {interview.role} · {interview.difficulty} ·{' '}
            {new Date(interview.completedAt || interview.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
          </p>
        </div>
        <Link href="/interview"
          className="px-4 py-2 bg-brand-500 hover:bg-brand-400 text-white rounded-xl text-sm font-medium transition-all btn-shimmer whitespace-nowrap">
          Retake →
        </Link>
      </div>

      {/* Score Hero */}
      <div className="glass-card rounded-2xl p-8 mb-6 flex flex-col md:flex-row items-center gap-8">
        {/* Ring */}
        <div className="relative w-36 h-36 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-36 h-36 -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#252a38" strokeWidth="2.5" />
            <circle
              cx="18" cy="18" r="15.9" fill="none"
              stroke={scoreColor(overall)} strokeWidth="2.5"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-white" style={{fontFamily:'Syne,sans-serif'}}>{overall}</span>
            <span className="text-sm text-slate-400">/10</span>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <p className="text-2xl font-bold mb-1" style={{ color: scoreColor(overall), fontFamily:'Syne,sans-serif' }}>
            {scoreLabel(overall)}
          </p>
          {report?.summary && <p className="text-slate-300 text-sm leading-relaxed mb-4">{report.summary}</p>}
          <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-slate-400">
            <span>📝 {answeredQs.length} questions answered</span>
            {interview.duration > 0 && <span>⏱ {interview.duration} min</span>}
          </div>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 mb-6 bg-surface-card border border-surface-border rounded-xl p-1">
        {(['overview', 'questions', 'roadmap'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
              activeTab === tab
                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                : 'text-slate-400 hover:text-white'
            }`}>
            {tab === 'overview' ? '📊 Overview' : tab === 'questions' ? '💬 Q&A' : '🗺 Roadmap'}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Score chart */}
          {questionScores.length > 0 && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4 text-sm" style={{fontFamily:'Syne,sans-serif'}}>Score Per Question</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={questionScores}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252a38" />
                  <XAxis dataKey="name" stroke="#475569" fontSize={11} />
                  <YAxis domain={[0,10]} stroke="#475569" fontSize={11} />
                  <Tooltip contentStyle={{ background:'#181c27', border:'1px solid #252a38', borderRadius:8, fontSize:12 }} />
                  <Bar dataKey="score" radius={[4,4,0,0]}
                    fill="#38a3f8"
                    label={{ position:'top', fill:'#94a3b8', fontSize:10 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Strengths */}
            {report?.keyStrengths?.length > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-green-400 mb-3">✓ Key Strengths</h3>
                <ul className="space-y-2">
                  {report.keyStrengths.map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-green-400 mt-0.5 flex-shrink-0">•</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {report?.keyWeaknesses?.length > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-red-400 mb-3">⚠ Key Weaknesses</h3>
                <ul className="space-y-2">
                  {report.keyWeaknesses.map((w: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>{w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Suggested Topics */}
          {report?.suggestedTopics?.length > 0 && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-brand-400 mb-3">📚 Topics to Study</h3>
              <div className="flex flex-wrap gap-2">
                {report.suggestedTopics.map((t: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-brand-500/10 border border-brand-500/20 text-brand-300 rounded-full text-xs">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Q&A */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          {answeredQs.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center text-slate-400 text-sm">No answered questions found.</div>
          ) : (
            answeredQs.map((q: any, i: number) => (
              <div key={i} className="glass-card rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-xs text-slate-500 font-mono mt-0.5">Q{i+1}</span>
                    <p className="text-sm text-white font-medium leading-relaxed">{q.question}</p>
                  </div>
                  <span className="flex-shrink-0 text-sm font-bold px-3 py-1 rounded-full border"
                    style={{ color: scoreColor(q.score), borderColor: scoreColor(q.score) + '40', background: scoreColor(q.score) + '15' }}>
                    {q.score}/10
                  </span>
                </div>

                <div className="bg-surface-muted rounded-xl p-3 mb-3">
                  <p className="text-xs text-slate-500 mb-1">Your Answer</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{q.answer}</p>
                </div>

                {q.feedback?.idealAnswer && (
                  <div className="bg-brand-500/8 border border-brand-500/15 rounded-xl p-3">
                    <p className="text-xs text-brand-400 mb-1">💡 Ideal Answer</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{q.feedback.idealAnswer}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Roadmap */}
      {activeTab === 'roadmap' && (
        <div className="space-y-5">
          {report?.improvementRoadmap?.length > 0 && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-5 text-sm" style={{fontFamily:'Syne,sans-serif'}}>Your Improvement Roadmap</h3>
              <div className="space-y-4">
                {report.improvementRoadmap.map((step: string, i: number) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-sm text-slate-300 leading-relaxed">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report?.suggestedTopics?.length > 0 && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4 text-sm" style={{fontFamily:'Syne,sans-serif'}}>📚 Study These Topics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {report.suggestedTopics.map((t: string, i: number) => (
                  <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 bg-surface-muted rounded-xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                    <span className="text-sm text-slate-300">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass-card rounded-2xl p-6 text-center">
            <p className="text-white font-medium mb-1">Ready to improve?</p>
            <p className="text-slate-400 text-sm mb-4">Practice again with the insights from this report.</p>
            <Link href="/interview"
              className="inline-block px-6 py-2.5 bg-brand-500 hover:bg-brand-400 text-white rounded-xl text-sm font-semibold transition-all btn-shimmer">
              Start Another Interview →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
