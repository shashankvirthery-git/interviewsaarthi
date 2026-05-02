'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { interviewAPI, aiAPI } from '@/services/api'
import { useVoice } from '@/hooks/useVoice'
import FeedbackPanel from '@/components/interview/FeedbackPanel'
import toast from 'react-hot-toast'

interface Message {
  role: 'ai' | 'user'
  content: string
  feedback?: any
  score?: number
}

export default function InterviewSessionPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [interview, setInterview] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [questionCount, setQuestionCount] = useState(0)
  const [showFeedback, setShowFeedback] = useState<any>(null)
  const [canAnswer, setCanAnswer] = useState(false)
  const [timer, setTimer] = useState(0)
  const [conversationHistory, setConversationHistory] = useState<any[]>([])

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const timerRef = useRef<NodeJS.Timeout>()
  const initializedRef = useRef(false) // prevent double-call in StrictMode

  const { isListening, isSupported: voiceSupported, startListening, stopListening } = useVoice((text) => {
    setInput(prev => prev ? prev + ' ' + text : text)
  })

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    interviewAPI.getOne(id)
      .then(r => {
        setInterview(r.data.interview)
        timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
        askFirstQuestion(r.data.interview)
      })
      .catch(() => {
        toast.error('Interview not found')
        router.push('/interview')
      })

    return () => clearInterval(timerRef.current)
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  const askFirstQuestion = async (iv: any) => {
    setIsTyping(true)
    try {
      const res = await aiAPI.generateQuestion({
        role: iv.role,
        interviewType: iv.interviewType,
        difficulty: iv.difficulty,
        conversationHistory: []
      })
      const q = res.data.question
      setCurrentQuestion(q)
      setQuestionCount(1)
      await new Promise(r => setTimeout(r, 600))
      setMessages([{ role: 'ai', content: q }])
      setConversationHistory([{ role: 'assistant', content: q }])
      setCanAnswer(true)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load first question')
    } finally {
      setIsTyping(false)
      inputRef.current?.focus()
    }
  }

  const handleSubmit = async () => {
    if (!input.trim() || !canAnswer || isEvaluating) return

    const userAnswer = input.trim()
    setInput('')
    setCanAnswer(false)
    setIsEvaluating(true)

    setMessages(prev => [...prev, { role: 'user', content: userAnswer }])

    const updatedHistory = [...conversationHistory, { role: 'user', content: userAnswer }]

    try {
      const evalRes = await aiAPI.evaluateAnswer({
        question: currentQuestion,
        answer: userAnswer,
        role: interview.role,
        interviewType: interview.interviewType,
        difficulty: interview.difficulty
      })
      const evaluation = evalRes.data.evaluation

      await interviewAPI.addQA(id, {
        question: currentQuestion,
        answer: userAnswer,
        score: evaluation.score,
        feedback: {
          strengths: evaluation.strengths,
          weaknesses: evaluation.weaknesses,
          improvements: evaluation.improvements,
          idealAnswer: evaluation.idealAnswer
        }
      })

      setMessages(prev => {
        const updated = [...prev]
        const lastIdx = updated.map(m => m.role).lastIndexOf('user')
        if (lastIdx >= 0) updated[lastIdx] = { ...updated[lastIdx], feedback: evaluation, score: evaluation.score }
        return updated
      })

      setIsEvaluating(false)
      setIsTyping(true)
      await new Promise(r => setTimeout(r, 500))

      const nextRes = await aiAPI.generateQuestion({
        role: interview.role,
        interviewType: interview.interviewType,
        difficulty: interview.difficulty,
        conversationHistory: updatedHistory
      })
      const nextQ = nextRes.data.question
      setCurrentQuestion(nextQ)
      setQuestionCount(prev => prev + 1)

      const newHistory = [...updatedHistory, { role: 'assistant', content: nextQ }]
      setConversationHistory(newHistory)

      await new Promise(r => setTimeout(r, 300))
      setMessages(prev => [...prev, { role: 'ai', content: nextQ }])
      setCanAnswer(true)
    } catch (err: any) {
      toast.error('Something went wrong. Try again.')
      setIsEvaluating(false)
      setCanAnswer(true)
    } finally {
      setIsTyping(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  const handleEndInterview = async () => {
    if (isEnding || questionCount < 2) {
      if (questionCount < 2) toast.error('Answer at least 2 questions first.')
      return
    }
    setIsEnding(true)
    clearInterval(timerRef.current)
    try {
      const ivRes = await interviewAPI.getOne(id)
      const reportRes = await aiAPI.generateReport({
        questions: ivRes.data.interview.questions,
        role: interview.role,
        interviewType: interview.interviewType,
        difficulty: interview.difficulty
      })
      await interviewAPI.complete(id, { finalReport: reportRes.data.report })
      toast.success('Interview complete! Generating report...')
      router.push(`/report/${id}`)
    } catch {
      toast.error('Failed to end interview')
      setIsEnding(false)
    }
  }

  const scoreColor = (s: number) =>
    s >= 7 ? '#00e5ff' : s >= 5 ? '#ffd166' : '#ff4d6d'

  const diffColor = interview?.difficulty === 'Easy' ? '#06ffa5' : interview?.difficulty === 'Medium' ? '#ffd166' : '#ff4d6d'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--c-bg)' }}>

      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 52, flexShrink: 0,
        background: 'var(--c-surface)', borderBottom: '1px solid var(--c-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#06ffa5', boxShadow: '0 0 8px #06ffa5' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--c-text)' }}>
            {interview?.interviewType} Interview
          </span>
          <span style={{ fontSize: 12, color: 'var(--c-muted)' }}>·</span>
          <span style={{ fontSize: 12, color: 'var(--c-muted)' }}>{interview?.role}</span>
          <span style={{ fontSize: 12, color: 'var(--c-muted)' }}>·</span>
          <span style={{
            padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            color: diffColor, background: `${diffColor}18`, border: `1px solid ${diffColor}40`,
          }}>{interview?.difficulty}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 12, color: 'var(--c-muted)', fontFamily: 'var(--font-mono)' }}>{formatTime(timer)}</span>
          <span style={{ fontSize: 12, color: 'var(--c-muted)', fontFamily: 'var(--font-mono)' }}>Q{questionCount}</span>
          <button onClick={handleEndInterview} disabled={isEnding || questionCount < 2}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: 'rgba(255,77,109,.1)', color: '#ff4d6d', border: '1px solid rgba(255,77,109,.25)',
              cursor: questionCount < 2 ? 'not-allowed' : 'pointer', opacity: questionCount < 2 ? 0.5 : 1,
              transition: 'all .15s', fontFamily: 'var(--font-body)',
            }}>
            {isEnding ? 'Ending...' : '⏹ End Interview'}
          </button>
        </div>
      </header>

      {/* Chat */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {messages.map((msg, i) => (
            <div key={i} className="chat-msg" style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>

              {msg.role === 'ai' && (
                <div style={{ display: 'flex', gap: 12, maxWidth: '85%' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    background: 'linear-gradient(135deg,#6c63ff,#00e5ff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)',
                    marginTop: 2,
                  }}>AI</div>
                  <div style={{
                    background: 'var(--c-card)', border: '1px solid var(--c-border)',
                    borderRadius: '16px 16px 16px 4px', padding: '12px 16px',
                  }}>
                    <p style={{ fontSize: 14, color: 'var(--c-text)', lineHeight: 1.6 }}>{msg.content}</p>
                  </div>
                </div>
              )}

              {msg.role === 'user' && (
                <div style={{ maxWidth: '85%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{
                      background: 'rgba(108,99,255,.15)', border: '1px solid rgba(108,99,255,.25)',
                      borderRadius: '16px 16px 4px 16px', padding: '12px 16px',
                    }}>
                      <p style={{ fontSize: 14, color: 'var(--c-text)', lineHeight: 1.6 }}>{msg.content}</p>
                    </div>
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                      background: 'linear-gradient(135deg,#6c63ff,#5b54e8)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)',
                      marginTop: 2,
                    }}>You</div>
                  </div>

                  {/* Score badge */}
                  {msg.score !== undefined && (
                    <button onClick={() => setShowFeedback(msg.feedback)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '4px 12px', borderRadius: 20, cursor: 'pointer',
                        fontSize: 12, fontWeight: 600, border: 'none',
                        background: `${scoreColor(msg.score)}18`,
                        color: scoreColor(msg.score),
                        outline: `1px solid ${scoreColor(msg.score)}40`,
                        transition: 'all .15s',
                      }}>
                      ⭐ {msg.score}/10 — View Feedback
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {(isTyping || isEvaluating) && (
            <div className="chat-msg" style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: 'linear-gradient(135deg,#6c63ff,#00e5ff)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: '#fff',
                }}>AI</div>
                <div style={{
                  background: 'var(--c-card)', border: '1px solid var(--c-border)',
                  borderRadius: '16px 16px 16px 4px', padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: 12, color: 'var(--c-muted)' }}>
                    {isEvaluating ? 'Evaluating' : 'Thinking'}
                  </span>
                  <div className="typing-dots"><span/><span/><span/></div>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{
        flexShrink: 0, borderTop: '1px solid var(--c-border)',
        background: 'var(--c-surface)', padding: '14px 16px',
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea ref={inputRef} value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={canAnswer ? 'Type your answer... (Enter to send, Shift+Enter for new line)' : 'Waiting...'}
              disabled={!canAnswer}
              rows={3}
              style={{
                width: '100%', padding: '12px 16px',
                background: 'var(--c-card)',
                border: `1px solid ${canAnswer ? 'rgba(108,99,255,.4)' : 'var(--c-border)'}`,
                borderRadius: 14, color: 'var(--c-text)',
                fontSize: 14, fontFamily: 'var(--font-body)',
                resize: 'none', outline: 'none', lineHeight: 1.6,
                transition: 'border-color .2s',
                opacity: canAnswer ? 1 : 0.5,
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
            {voiceSupported && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
  <button onClick={isListening ? stopListening : startListening}
    disabled={!canAnswer}
    style={{
      width: 42, height: 42, borderRadius: 12, border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
      background: isListening ? 'rgba(255,77,109,.3)' : 'var(--c-card)',
      outline: isListening ? '2px solid #ff4d6d' : '1px solid var(--c-border)',
      transition: 'all .15s', opacity: canAnswer ? 1 : 0.4,
      boxShadow: isListening ? '0 0 16px rgba(255,77,109,.5)' : 'none',
      animation: isListening ? 'tdots 1s infinite' : 'none',
      position: 'relative',
    }}>
    {isListening ? '🔴' : '🎤'}
  </button>
  {isListening && (
    <span style={{
      fontSize: 9, color: '#ff4d6d', fontFamily: 'var(--font-mono)',
      fontWeight: 700, letterSpacing: '.05em',
      animation: 'pgFade .3s ease',
    }}>REC●</span>
  )}
</div>
            )}
            <button onClick={handleSubmit} disabled={!canAnswer || !input.trim()}
              style={{
                width: 42, height: 42, borderRadius: 12, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                background: canAnswer && input.trim() ? 'linear-gradient(135deg,#6c63ff,#5b54e8)' : 'var(--c-card)',
                outline: '1px solid var(--c-border)',
                transition: 'all .2s', opacity: canAnswer && input.trim() ? 1 : 0.4,
                boxShadow: canAnswer && input.trim() ? '0 4px 15px rgba(108,99,255,.4)' : 'none',
              }}>↑</button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--c-muted)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>
          Question {questionCount} · Answer at least 2 questions, then click "End Interview" to get your report
        </p>
      </div>

      {/* Feedback modal */}
      {showFeedback && <FeedbackPanel feedback={showFeedback} onClose={() => setShowFeedback(null)} />}
    </div>
  )
}
