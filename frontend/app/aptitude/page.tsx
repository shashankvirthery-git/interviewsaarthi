"use client"

import { useRouter } from "next/navigation";
import { useState } from "react";

const categories = [
  {
    id: "quant",
    label: "Quantitative",
    emoji: "🔢",
    desc: "Numbers, ratios, percentages, time & work",
    color: "#6c63ff",
    bg: "rgba(108,99,255,.1)",
    border: "rgba(108,99,255,.3)",
    glow: "rgba(108,99,255,.4)",
    tag: "25 Questions",
  },
  {
    id: "reasoning",
    label: "Logical Reasoning",
    emoji: "🧠",
    desc: "Patterns, sequences, puzzles, syllogisms",
    color: "#00e5ff",
    bg: "rgba(0,229,255,.1)",
    border: "rgba(0,229,255,.3)",
    glow: "rgba(0,229,255,.4)",
    tag: "25 Questions",
  },
  {
    id: "verbal",
    label: "Verbal Ability",
    emoji: "📖",
    desc: "Grammar, vocabulary, reading comprehension",
    color: "#06ffa5",
    bg: "rgba(6,255,165,.1)",
    border: "rgba(6,255,165,.3)",
    glow: "rgba(6,255,165,.4)",
    tag: "25 Questions",
  },
];

export default function AptitudePage() {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--c-bg)",
      padding: "48px 32px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div className="orb orb-purple" style={{ opacity: 0.15 }} />
        <div className="orb orb-cyan" style={{ opacity: 0.1 }} />
        <div className="orb orb-green" style={{ opacity: 0.08 }} />
        <div className="grid-overlay" />
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <button
  onClick={() => router.push('/dashboard')}
  style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "8px 14px", borderRadius: 10, marginBottom: 24,
    background: "rgba(255,255,255,.04)", border: "1px solid var(--c-border)",
    color: "var(--c-muted)", cursor: "pointer", fontSize: 13,
    fontFamily: "var(--font-body)",
  }}
>
  ← Back
</button>

        {/* Header */}
        <div style={{ marginBottom: 48, animation: "pgFade .4s ease forwards" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 14px", borderRadius: 20,
            background: "rgba(108,99,255,.1)", border: "1px solid rgba(108,99,255,.25)",
            marginBottom: 20,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6c63ff", boxShadow: "0 0 8px #6c63ff" }} />
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#a89fff", letterSpacing: ".08em" }}>
              AI-POWERED QUIZ
            </span>
          </div>

          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 800,
            color: "var(--c-text)", lineHeight: 1.15, marginBottom: 12,
          }}>
            Aptitude{" "}
            <span className="grad-text">Practice</span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--c-muted)", lineHeight: 1.6 }}>
            Select a category to start an AI-generated quiz with 25 questions.
            Test your skills and track your performance.
          </p>
        </div>

        {/* Stats bar */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12, marginBottom: 36,
          animation: "pgFade .5s .1s ease both",
        }}>
          {[
            { label: "Total Questions", value: "75", icon: "📝" },
            { label: "Categories", value: "3", icon: "📂" },
            { label: "AI Generated", value: "Live", icon: "⚡" },
          ].map((s) => (
            <div key={s.label} style={{
              background: "var(--c-card)", border: "1px solid var(--c-border)",
              borderRadius: 14, padding: "14px 16px", textAlign: "center",
            }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--c-text)" }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "var(--c-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: ".06em", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Category Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {categories.map((cat, i) => {
            const isHov = hovered === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => router.push(`/aptitude/${cat.id}`)}
                onMouseEnter={() => setHovered(cat.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: "flex", alignItems: "center", gap: 20,
                  padding: "22px 24px", borderRadius: 16, cursor: "pointer",
                  background: isHov ? cat.bg : "var(--c-card)",
                  border: `1px solid ${isHov ? cat.border : "var(--c-border)"}`,
                  transition: "all .25s cubic-bezier(.34,1.56,.64,1)",
                  transform: isHov ? "translateX(6px) scale(1.01)" : "none",
                  boxShadow: isHov ? `0 8px 32px ${cat.glow}` : "none",
                  animation: `pgFade .4s ${0.1 + i * 0.08}s ease both`,
                }}
              >
                {/* Emoji icon */}
                <div style={{
                  width: 56, height: 56, borderRadius: 14, flexShrink: 0,
                  background: isHov ? cat.bg : "rgba(255,255,255,.04)",
                  border: `1px solid ${isHov ? cat.border : "var(--c-border)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26, transition: "all .25s",
                  boxShadow: isHov ? `0 0 20px ${cat.glow}` : "none",
                }}>
                  {cat.emoji}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <p style={{
                      fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17,
                      color: isHov ? cat.color : "var(--c-text)", transition: "color .2s",
                    }}>{cat.label}</p>
                    <span style={{
                      fontSize: 10, padding: "2px 8px", borderRadius: 20,
                      background: isHov ? cat.bg : "rgba(255,255,255,.05)",
                      color: isHov ? cat.color : "var(--c-muted)",
                      border: `1px solid ${isHov ? cat.border : "var(--c-border)"}`,
                      fontFamily: "var(--font-mono)", fontWeight: 600, transition: "all .2s",
                    }}>{cat.tag}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--c-muted)", lineHeight: 1.5 }}>{cat.desc}</p>
                </div>

                {/* Arrow */}
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isHov ? cat.color : "rgba(255,255,255,.04)",
                  color: isHov ? "#000" : "var(--c-muted)",
                  fontSize: 16, fontWeight: 700, transition: "all .25s",
                  transform: isHov ? "translateX(2px)" : "none",
                }}>→</div>
              </div>
            );
          })}
        </div>

        {/* Bottom tip */}
        <div style={{
          marginTop: 32, padding: "14px 18px", borderRadius: 12,
          background: "rgba(108,99,255,.06)", border: "1px solid rgba(108,99,255,.15)",
          animation: "pgFade .4s .4s ease both",
        }}>
          <p style={{ fontSize: 12, color: "var(--c-muted)", lineHeight: 1.7 }}>
            💡 <strong style={{ color: "var(--c-accent2)" }}>How it works:</strong>{" "}
            Click a category → AI generates 25 fresh questions → Answer all → Submit to see your score with correct answers highlighted.
          </p>
        </div>
      </div>
    </div>
  );
}