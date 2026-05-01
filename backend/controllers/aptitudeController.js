const axios = require("axios");

exports.generateAptitude = async (req, res) => {
  try {
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }

    const prompt = `Generate 25 ${category} aptitude multiple choice questions.
Return ONLY a JSON array. No markdown, no explanation, no extra text.
Each item must have exactly these fields:
- "question": the question text
- "options": array of exactly 4 strings like ["A. option1", "B. option2", "C. option3", "D. option4"]
- "answer": the correct option string exactly as it appears in options

Example format:
[{"question":"What is 2+2?","options":["A. 3","B. 4","C. 5","D. 6"],"answer":"B. 4"}]`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        max_tokens: 4000,
        temperature: 0.7,
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const raw = response.data.choices[0].message.content;
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) {
      return res.status(500).json({ error: "Failed to parse questions" });
    }
    const parsed = JSON.parse(match[0]);
    res.json({ questions: parsed });

  } catch (error) {
    console.error("APTITUDE ERROR:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate questions" });
  }
};