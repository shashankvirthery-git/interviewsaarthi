"use client"

import { useRouter } from "next/navigation";

export default function AptitudePage() {
  const router = useRouter();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Select Aptitude Category</h1>

      <button onClick={() => router.push("/aptitude/quant")}>
        Quantitative
      </button>

      <br /><br />

      <button onClick={() => router.push("/aptitude/reasoning")}>
        Reasoning
      </button>

      <br /><br />

      <button onClick={() => router.push("/aptitude/verbal")}>
        Verbal
      </button>
    </div>
  );
}