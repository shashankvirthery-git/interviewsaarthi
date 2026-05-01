"use client"

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { aptitudeAPI } from "@/services/api";

const CATEGORY_META: Record<string, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  quant:     { label: "Quantitative",    emoji: "🔢", color: "#6c63ff", bg: "rgba(108,99,255,.12)", border: "rgba(108,99,255,.35)" },
  reasoning: { label: "Logical Reasoning", emoji: "🧠", color: "#00e5ff", bg: "rgba(0,229,255,.12)",  border: "rgba(0,229,255,.35)"  },
  verbal:    { label: "Verbal Ability",   emoji: "📖", color: "#06ffa5", bg: "rgba(6,255,165,.12)",   border: "rgba(6,255,165,.35)"  },
};

export default function CategoryPage() {
  const { category } = useParams() as { category: string };
  const router = useRouter();
  const meta = CATEGORY_META[category] || { label: category, emoji: "🧩", color: "#6c63ff", bg: "rgba(108,99,255,.12)", border: "rgba(108,99,255,.35)" };

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [selected, setSelected]   = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore]         = useState(0);
  const [current, setCurrent]     = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await aptitudeAPI.generate(category);
        setQuestions(res.data.questions);
      } catch (e: any) {
        setError("Failed to load questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [category]);

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      // compare just first char (A/B/C/D) to handle "A. ..." format
      const sel = selected[i]?.charAt(0);
      const ans = q.answer?.charAt(0);
      if (sel && ans && sel === ans) correct++;
    });
    setScore(correct);
    setSubmitted(true);
    setCurrent(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const answered = Object.keys(selected).length;
  const progress = questions.length ? (answered / questions.length) * 100 : 0;

  /* ── Loading ── */
  if (loading) return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", background: "var(--c-bg)", gap: 20,
    }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div className="orb orb-purple" style={{ opacity: .12 }} />
        <div className="orb orb-cyan" style={{ opacity: .08 }} />
        <div className="grid-overlay" />
      </div>
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16, animation: "orbFloat 2s ease-in-out infinite" }}>{meta.emoji}</div>
        <div style={{
          width: 48, height: 48, border: `3px solid ${meta.color}`,
          borderTopColor: "transparent", borderRadius: "50%",
          animation: "spin .8s linear infinite", margin: "0 auto 20px",
        }} />
        <p style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--c-text)", marginBottom: 8 }}>
          Generating {meta.label} Questions
        </p>
        <p style={{ fontSize: 13, color: "var(--c-muted)", fontFamily: "var(--font-mono)" }}>
          AI is crafting 25 fresh questions for you...
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--c-bg)", padding: 32,
    }}>
      <div style={{
        background: "var(--c-card)", border: "1px solid rgba(255,77,109,.3)",
        borderRadius: 20, padding: 40, textAlign: "center", maxWidth: 400,
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--c-text)", marginBottom: 8 }}>
          Failed to load
        </h2>
        <p style={{ color: "var(--c-muted)", fontSize: 14, marginBottom: 24 }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary" style={{ width: "auto", padding: "12px 28px" }}>
          <span className="shimmer" /> Try Again
        </button>
      </div>
    </div>
  );

  const pct = Math.round((score / questions.length) * 100);

  /* ── Results ── */
  if (submitted) return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)", padding: "40px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div className="orb orb-purple" style={{ opacity: .15 }} />
        <div className="orb orb-cyan" style={{ opacity: .1 }} />
        <div className="grid-overlay" />
      </div>
      <div style={{ maxWidth: 720, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Score Card */}
        <div style={{
          background: "var(--c-card)", border: `1px solid ${meta.border}`,
          borderRadius: 24, padding: "36px 32px", textAlign: "center", marginBottom: 32,
          boxShadow: `0 0 60px ${meta.bg}`, animation: "pgFade .4s ease",
        }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>
            {pct >= 80 ? "🏆" : pct >= 60 ? "🎯" : pct >= 40 ? "📚" : "💪"}
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 800, color: "var(--c-text)", marginBottom: 6 }}>
            {pct >= 80 ? "Excellent!" : pct >= 60 ? "Good Job!" : pct >= 40 ? "Keep Practicing!" : "Don't Give Up!"}
          </h2>
          <p style={{ color: "var(--c-muted)", marginBottom: 24, fontSize: 14 }}>
            {meta.emoji} {meta.label} Quiz Results
          </p>

          {/* Score ring display */}
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 120, height: 120, borderRadius: "50%",
            background: `conic-gradient(${meta.color} ${pct * 3.6}deg, rgba(255,255,255,.06) 0deg)`,
            marginBottom: 20, position: "relative",
          }}>
            <div style={{
              width: 90, height: 90, borderRadius: "50%",
              background: "var(--c-card)", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: meta.color }}>{pct}%</span>
              <span style={{ fontSize: 10, color: "var(--c-muted)", fontFamily: "var(--font-mono)" }}>{score}/{questions.length}</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28 }}>
            {[
              { label: "Correct", value: score, color: "#06ffa5" },
              { label: "Wrong", value: questions.length - score, color: "#ff4d6d" },
              { label: "Score", value: `${pct}%`, color: meta.color },
            ].map(s => (
              <div key={s.label} style={{
                background: "rgba(255,255,255,.03)", border: "1px solid var(--c-border)",
                borderRadius: 12, padding: "14px 10px",
              }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "var(--c-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={() => window.location.reload()} className="btn-primary" style={{ width: "auto", padding: "12px 28px" }}>
              <span className="shimmer" /> 🔄 Try Again
            </button>
            <button onClick={() => router.push("/aptitude")} style={{
              padding: "12px 28px", borderRadius: 12, cursor: "pointer",
              background: "rgba(255,255,255,.04)", border: "1px solid var(--c-border)",
              color: "var(--c-muted)", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-body)",
            }}>
              ← Back
            </button>
          </div>
        </div>

        {/* Answer Review */}
        <h3 style={{
          fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700,
          color: "var(--c-text)", marginBottom: 16,
        }}>Answer Review</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {questions.map((q, i) => {
            const sel = selected[i]?.charAt(0);
            const ans = q.answer?.charAt(0);
            const isCorrect = sel === ans;
            return (
              <div key={i} style={{
                background: "var(--c-card)",
                border: `1px solid ${isCorrect ? "rgba(6,255,165,.25)" : "rgba(255,77,109,.25)"}`,
                borderRadius: 16, padding: "18px 20px",
                animation: `pgFade .3s ${i * 0.03}s ease both`,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                    background: isCorrect ? "rgba(6,255,165,.2)" : "rgba(255,77,109,.2)",
                    border: `1px solid ${isCorrect ? "#06ffa5" : "#ff4d6d"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, color: isCorrect ? "#06ffa5" : "#ff4d6d", fontWeight: 800,
                    marginTop: 1,
                  }}>{isCorrect ? "✓" : "✗"}</span>
                  <p style={{ fontSize: 14, color: "var(--c-text)", fontWeight: 600, lineHeight: 1.5 }}>
                    <span style={{ color: "var(--c-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>Q{i + 1}. </span>
                    {q.question}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10, paddingLeft: 36, flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: 12, padding: "4px 12px", borderRadius: 20,
                    background: "rgba(6,255,165,.1)", border: "1px solid rgba(6,255,165,.3)",
                    color: "#06ffa5", fontFamily: "var(--font-mono)",
                  }}>✓ {q.answer}</span>
                  {!isCorrect && selected[i] && (
                    <span style={{
                      fontSize: 12, padding: "4px 12px", borderRadius: 20,
                      background: "rgba(255,77,109,.1)", border: "1px solid rgba(255,77,109,.3)",
                      color: "#ff4d6d", fontFamily: "var(--font-mono)",
                    }}>✗ Your: {selected[i]}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  /* ── Quiz ── */
  const q = questions[current];
  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)", padding: "32px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div className="orb orb-purple" style={{ opacity: .12 }} />
        <div className="orb orb-cyan" style={{ opacity: .08 }} />
        <div className="grid-overlay" />
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <button onClick={() => router.push("/aptitude")} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
            borderRadius: 10, background: "rgba(255,255,255,.04)", border: "1px solid var(--c-border)",
            color: "var(--c-muted)", cursor: "pointer", fontSize: 13, fontFamily: "var(--font-body)",
          }}>← Back</button>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>{meta.emoji}</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: meta.color, fontSize: 15 }}>{meta.label}</span>
          </div>

          <div style={{
            padding: "6px 14px", borderRadius: 20,
            background: meta.bg, border: `1px solid ${meta.border}`,
            fontSize: 12, color: meta.color, fontFamily: "var(--font-mono)",
          }}>
            {answered}/{questions.length}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          height: 4, borderRadius: 4, background: "var(--c-border)",
          marginBottom: 28, overflow: "hidden",
        }}>
          <div style={{
            height: "100%", borderRadius: 4, background: meta.color,
            width: `${progress}%`, transition: "width .4s ease",
            boxShadow: `0 0 12px ${meta.color}`,
          }} />
        </div>

        {/* Question navigator dots */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
          {questions.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{
              width: 28, height: 28, borderRadius: 8, cursor: "pointer", fontSize: 10,
              fontFamily: "var(--font-mono)", fontWeight: 700, transition: "all .2s",
              background: selected[i]
                ? (i === current ? meta.color : meta.bg)
                : (i === current ? "rgba(255,255,255,.15)" : "rgba(255,255,255,.04)"),
              border: i === current ? `2px solid ${meta.color}` : "1px solid var(--c-border)",
              color: selected[i] ? (i === current ? "#000" : meta.color) : (i === current ? "var(--c-text)" : "var(--c-muted)"),
              boxShadow: i === current ? `0 0 12px ${meta.bg}` : "none",
            }}>{i + 1}</button>
          ))}
        </div>

        {/* Question Card */}
        <div key={current} style={{
          background: "var(--c-card)", border: `1px solid ${meta.border}`,
          borderRadius: 20, padding: "28px 28px 24px",
          boxShadow: `0 4px 40px ${meta.bg}`, marginBottom: 16,
          animation: "pgFade .25s ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <span style={{
              padding: "4px 12px", borderRadius: 20,
              background: meta.bg, border: `1px solid ${meta.border}`,
              fontSize: 11, color: meta.color, fontFamily: "var(--font-mono)", fontWeight: 700,
            }}>Q {current + 1} of {questions.length}</span>
          </div>

          <p style={{
            fontSize: 16, fontWeight: 600, color: "var(--c-text)",
            lineHeight: 1.65, marginBottom: 24, fontFamily: "var(--font-display)",
          }}>{q.question}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {q.options.map((opt: string) => {
              const isSelected = selected[current] === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setSelected({ ...selected, [current]: opt })}
                  style={{
                    padding: "13px 18px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                    background: isSelected ? meta.bg : "rgba(255,255,255,.03)",
                    border: `${isSelected ? "2px" : "1px"} solid ${isSelected ? meta.color : "var(--c-border)"}`,
                    color: isSelected ? meta.color : "var(--c-text)",
                    fontSize: 14, fontFamily: "var(--font-body)", fontWeight: isSelected ? 600 : 400,
                    transition: "all .18s cubic-bezier(.34,1.56,.64,1)",
                    transform: isSelected ? "translateX(4px)" : "none",
                    boxShadow: isSelected ? `0 0 16px ${meta.bg}` : "none",
                    display: "flex", alignItems: "center", gap: 10,
                  }}
                >
                  <span style={{
                    width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                    background: isSelected ? meta.color : "rgba(255,255,255,.06)",
                    border: `1px solid ${isSelected ? meta.color : "var(--c-border)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 800, color: isSelected ? "#000" : "var(--c-muted)",
                    transition: "all .18s",
                  }}>{opt.charAt(0)}</span>
                  {opt.length > 2 ? opt.slice(2).trim() : opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", gap: 10, justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
            style={{
              padding: "11px 20px", borderRadius: 12, cursor: current === 0 ? "not-allowed" : "pointer",
              background: "rgba(255,255,255,.04)", border: "1px solid var(--c-border)",
              color: current === 0 ? "var(--c-border)" : "var(--c-muted)",
              fontSize: 13, fontFamily: "var(--font-body)", fontWeight: 600,
            }}
          >← Prev</button>

          {current < questions.length - 1 ? (
            <button
              onClick={() => setCurrent(current + 1)}
              style={{
                padding: "11px 28px", borderRadius: 12, cursor: "pointer",
                background: meta.bg, border: `1px solid ${meta.border}`,
                color: meta.color, fontSize: 13, fontFamily: "var(--font-body)", fontWeight: 700,
                transition: "all .2s",
              }}
            >Next →</button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={answered < questions.length}
              className="btn-primary"
              style={{ width: "auto", padding: "11px 28px", opacity: answered < questions.length ? .5 : 1 }}
            >
              <span className="shimmer" />
              {answered < questions.length
                ? `Answer ${questions.length - answered} more`
                : "🎯 Submit Quiz"}
            </button>
          )}
        </div>

        {answered < questions.length && current === questions.length - 1 && (
          <p style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "var(--c-muted)", fontFamily: "var(--font-mono)" }}>
            {questions.length - answered} question{questions.length - answered !== 1 ? "s" : ""} unanswered — use the dots above to go back
          </p>
        )}
      </div>
    </div>
  );
}