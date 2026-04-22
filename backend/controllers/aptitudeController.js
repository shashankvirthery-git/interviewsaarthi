import axios from "axios";

export const generateAptitude = async (req, res) => {
  try {
    const { category } = req.query;

    // prompt banaya
    const prompt = `Generate 5 ${category} aptitude questions with 4 options and correct answers in simple text format.`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-70b-8192",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = response.data.choices[0].message.content;

    res.json({ questions: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate questions" });
  }
};