'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { interviewAPI } from '@/services/api'
import toast from 'react-hot-toast'

export default function HistoryPage() {
  const [interviews, setInterviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    interviewAPI.getAll()
      .then(r => setInterviews(r.data.interviews))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this interview?')) return
    try {
      await interviewAPI.delete(id)
      toast.success('Deleted')
      setInterviews(prev => prev.filter(i => i._id !== id))
    } catch {
      toast.error('Failed to delete')
    }
  }

  const scoreColor = (s: number) =>
    s >= 7 ? 'text-brand-400' : s >= 5 ? 'text-yellow-400' : 'text-red-400'

  const statusBadge = (s: string) =>
    s === 'completed'
      ? 'bg-green-500/15 text-green-400 border-green-500/25'
      : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25'

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="typing-dots"><span/><span/><span/></div>
    </div>
  )

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white" style={{fontFamily:'Syne,sans-serif'}}>Interview History</h1>
        <Link href="/interview"
          className="px-4 py-2 bg-brand-500 hover:bg-brand-400 text-white rounded-xl text-sm font-medium transition-all btn-shimmer">
          + New
        </Link>
      </div>

      {interviews.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">🎤</div>
          <p className="text-white font-medium mb-2">No interviews yet</p>
          <p className="text-slate-400 text-sm mb-6">Start your first mock interview to build your confidence.</p>
          <Link href="/interview" className="px-5 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold">
            Start Interview
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map(iv => (
            <div key={iv._id} className="glass-card rounded-xl p-5 flex items-center justify-between hover:border-brand-500/30 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusBadge(iv.status)}`}>
                    {iv.status === 'completed' ? 'Completed' : 'In Progress'}
                  </span>
                  <span className="text-xs text-slate-500">{iv.interviewType}</span>
                  <span className="text-xs text-slate-500">·</span>
                  <span className="text-xs text-slate-500">{iv.difficulty}</span>
                </div>
                <p className="text-sm font-medium text-white truncate">{iv.role}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {new Date(iv.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                  {iv.questions?.length > 0 && ` · ${iv.questions.length} questions`}
                </p>
              </div>

              <div className="flex items-center gap-4 ml-4">
                {iv.overallScore > 0 && (
                  <div className="text-center">
                    <p className={`text-xl font-bold ${scoreColor(iv.overallScore)}`} style={{fontFamily:'Syne,sans-serif'}}>
                      {iv.overallScore}
                    </p>
                    <p className="text-xs text-slate-500">/10</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {iv.status === 'completed' && (
                    <Link href={`/report/${iv._id}`}
                      className="px-3 py-1.5 text-xs bg-brand-500/15 text-brand-400 hover:bg-brand-500/25 rounded-lg transition-colors border border-brand-500/20">
                      View Report
                    </Link>
                  )}
                  <button onClick={() => handleDelete(iv._id)}
                    className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
