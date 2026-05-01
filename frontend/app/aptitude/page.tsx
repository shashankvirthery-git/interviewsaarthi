"use client"
import { useRouter } from "next/navigation";

const categories = [
  { id: "quant", label: "Quantitative", emoji: "🔢", desc: "Numbers, ratios, percentages" },
  { id: "reasoning", label: "Logical Reasoning", emoji: "🧠", desc: "Patterns, sequences, puzzles" },
  { id: "verbal", label: "Verbal Ability", emoji: "📖", desc: "Grammar, vocabulary, reading" },
];

export default function AptitudePage() {
  const router = useRouter();

  return (
    <div style={{ padding: 32, maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Aptitude Practice</h1>
      <p style={{ color: "#666", marginBottom: 32 }}>Select a category to start an AI-generated quiz</p>

      {categories.map((cat) => (
        <div
          key={cat.id}
          onClick={() => router.push(`/aptitude/${cat.id}`)}
          style={{
            padding: "18px 24px", marginBottom: 16, borderRadius: 12,
            border: "1px solid #ddd", cursor: "pointer", display: "flex",
            alignItems: "center", gap: 16, background: "#fff",
            transition: "all .2s", boxShadow: "0 2px 8px rgba(0,0,0,.05)"
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "#6c63ff")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "#ddd")}
        >
          <span style={{ fontSize: 32 }}>{cat.emoji}</span>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16 }}>{cat.label}</p>
            <p style={{ color: "#888", fontSize: 13 }}>{cat.desc}</p>
          </div>
          <span style={{ marginLeft: "auto", color: "#6c63ff", fontSize: 20 }}>→</span>
        </div>
      ))}
    </div>
  );
}