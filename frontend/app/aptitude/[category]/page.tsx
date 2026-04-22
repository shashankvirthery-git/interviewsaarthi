"use client"

import { useParams } from "next/navigation";

export default function CategoryPage() {
  const { category } = useParams();

  return (
    <div style={{ padding: "20px" }}>
      <h1>{category} Test Page</h1>
      <p>AI questions yahan aayenge 👀</p>
    </div>
  );
}