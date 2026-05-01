"use client"

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function CategoryPage() {
  const { category } = useParams();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API}/api/aptitude/generate?category=${category}`);
        setQuestions(res.data.questions);
      } catch {
        alert("Failed to load questions");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [category]);

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (selected[i] === q.answer) correct++;
    });
    setScore(correct);
    setSubmitted(true);
  };

  if (loading) return <p style={{ padding: 20 }}>Loading questions...</p>;

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: "0 auto" }}>
      <h1 style={{ textTransform: "capitalize", marginBottom: 24 }}>{category} Quiz</h1>

      {questions.map((q, i) => (
        <div key={i} style={{ marginBottom: 24, padding: 16, border: "1px solid #ccc", borderRadius: 10 }}>
          <p style={{ fontWeight: 600, marginBottom: 10 }}>{i + 1}. {q.question}</p>
          {q.options.map((opt: string) => {
            const isCorrect = submitted && opt === q.answer;
            const isWrong = submitted && selected[i] === opt && opt !== q.answer;
            return (
              <label key={opt} style={{
                display: "block", padding: "8px 12px", marginBottom: 6,
                borderRadius: 8, cursor: "pointer",
                background: isCorrect ? "#d4edda" : isWrong ? "#f8d7da" : selected[i] === opt ? "#e8f0fe" : "#f5f5f5",
                border: `1px solid ${isCorrect ? "#28a745" : isWrong ? "#dc3545" : "#ddd"}`
              }}>
                <input
                  type="radio" name={`q${i}`} value={opt}
                  disabled={submitted}
                  checked={selected[i] === opt}
                  onChange={() => setSelected({ ...selected, [i]: opt })}
                  style={{ marginRight: 8 }}
                />
                {opt}
              </label>
            );
          })}
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(selected).length < questions.length}
          style={{ padding: "10px 24px", background: "#6c63ff", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 600 }}
        >
          Submit
        </button>
      ) : (
        <div style={{ padding: 16, background: "#e8f0fe", borderRadius: 10, textAlign: "center" }}>
          <h2>Your Score: {score} / {questions.length}</h2>
          <button onClick={() => window.location.reload()} style={{ marginTop: 10, padding: "8px 20px", background: "#6c63ff", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}