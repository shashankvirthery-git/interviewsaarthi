'use client'

interface FeedbackPanelProps {
  feedback: {
    score: number
    strengths: string[]
    weaknesses: string[]
    improvements: string[]
    idealAnswer: string
  }
  onClose: () => void
}

export default function FeedbackPanel({ feedback, onClose }: FeedbackPanelProps) {
  const { score, strengths, weaknesses, improvements, idealAnswer } = feedback

  const pct = (score / 10) * 100
  const color = score >= 7 ? '#38a3f8' : score >= 5 ? '#f97316' : '#ef4444'
  const label = score >= 8 ? 'Excellent' : score >= 6 ? 'Good' : score >= 4 ? 'Average' : 'Needs Work'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg bg-surface-card border border-surface-border rounded-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border flex-shrink-0">
          <h2 className="font-semibold text-white" style={{fontFamily:'Syne,sans-serif'}}>Answer Feedback</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-xl leading-none">×</button>
        </div>

        <div className="overflow-y-auto p-6 space-y-5">
          {/* Score */}
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#252a38" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke={color} strokeWidth="3"
                  strokeDasharray={`${pct} ${100 - pct}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.8s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-white leading-none" style={{fontFamily:'Syne,sans-serif'}}>{score}</span>
                <span className="text-xs text-slate-500">/10</span>
              </div>
            </div>
            <div>
              <p className="text-lg font-semibold" style={{ color, fontFamily:'Syne,sans-serif' }}>{label}</p>
              <p className="text-sm text-slate-400 mt-0.5">
                {score >= 8 ? 'Great answer! Keep it up.' : score >= 6 ? 'Solid response with room to grow.' : score >= 4 ? 'Covers basics, needs more depth.' : 'Needs significant improvement.'}
              </p>
            </div>
          </div>

          {/* Strengths */}
          {strengths?.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2">✓ Strengths</h3>
              <ul className="space-y-1.5">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-green-400 mt-0.5 flex-shrink-0">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {weaknesses?.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">⚠ Weaknesses</h3>
              <ul className="space-y-1.5">
                {weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {improvements?.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">↑ Improvements</h3>
              <ul className="space-y-1.5">
                {improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-brand-400 mt-0.5 flex-shrink-0">→</span>
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ideal Answer */}
          {idealAnswer && (
            <div className="bg-brand-500/8 border border-brand-500/20 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">💡 Ideal Answer</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{idealAnswer}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-surface-border flex-shrink-0">
          <button onClick={onClose}
            className="w-full py-2.5 bg-brand-500 hover:bg-brand-400 text-white rounded-xl text-sm font-medium transition-all">
            Continue Interview
          </button>
        </div>
      </div>
    </div>
  )
}
