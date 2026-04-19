const Groq = require('groq-sdk');

const getGroq = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

const callGroq = async (prompt, systemMsg = 'You are a helpful AI assistant.', maxTokens = 1024) => {
  const groq = getGroq();
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY not set in .env file');

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemMsg },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: maxTokens,
  });

  return completion.choices[0].message.content;
};

const parseJSON = (raw) => {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Could not parse AI response as JSON');
  }
};

// Generate interview question
const generateQuestion = async (req, res) => {
  try {
    const { role, interviewType, difficulty, conversationHistory = [] } = req.body;
    console.log(`📝 Generating ${interviewType} question for ${role} (${difficulty})`);

    const system = `You are a professional ${interviewType} interviewer for a ${role} position at ${difficulty} difficulty. Ask one natural question at a time. Reply with ONLY the question text, nothing else.`;

    let userMsg = conversationHistory.length === 0
      ? 'Ask the first interview question.'
      : `Recent conversation:\n${conversationHistory.slice(-6).map(m => `${m.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${m.content}`).join('\n')}\n\nAsk the next appropriate question.`;

    const question = await callGroq(userMsg, system, 200);
    console.log(`✅ Question generated`);
    res.json({ success: true, question: question.trim() });
  } catch (error) {
    console.error('❌ generateQuestion:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Evaluate answer
const evaluateAnswer = async (req, res) => {
  try {
    const { question, answer, role, interviewType, difficulty } = req.body;

    if (!answer || answer.trim().length < 3) {
      return res.json({ success: true, evaluation: { score: 1, strengths: [], weaknesses: ['No answer provided'], improvements: ['Give a detailed answer'], idealAnswer: 'A thoughtful answer is expected.' } });
    }

    const system = `You are an expert interview evaluator. Respond with valid JSON only. No markdown. No extra text.`;
    const prompt = `Evaluate this ${interviewType} answer for ${role} (${difficulty}).\nQuestion: ${question}\nAnswer: ${answer}\n\nJSON only: {"score":7,"strengths":["point1","point2"],"weaknesses":["point1"],"improvements":["tip1","tip2"],"idealAnswer":"brief model answer"}`;

    const raw = await callGroq(prompt, system, 600);
    const evaluation = parseJSON(raw);
    console.log(`✅ Evaluation done, score: ${evaluation.score}`);
    res.json({ success: true, evaluation });
  } catch (error) {
    console.error('❌ evaluateAnswer:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Follow-up
const generateFollowUp = async (req, res) => {
  try {
    const { question, answer, role, interviewType } = req.body;
    const prompt = `As a ${interviewType} interviewer for ${role}: Q: "${question}" A: "${answer}". Ask ONE follow-up question. Reply with ONLY the question.`;
    const followUp = await callGroq(prompt, 'You are a professional interviewer.', 150);
    res.json({ success: true, followUp: followUp.trim() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Final report
const generateReport = async (req, res) => {
  try {
    const { questions, role, interviewType, difficulty } = req.body;
    const qa = questions.filter(q => q.answer).map((q, i) => `Q${i+1}: ${q.question}\nA: ${q.answer}\nScore: ${q.score}/10`).join('\n\n');

    const system = `You are an expert interview coach. Respond with valid JSON only. No markdown. No extra text.`;
    const prompt = `Final report for ${role} ${interviewType} interview (${difficulty}).\n\n${qa}\n\nJSON only: {"overallScore":7,"summary":"2-3 sentences","keyStrengths":["s1","s2","s3"],"keyWeaknesses":["w1","w2","w3"],"improvementRoadmap":["step1","step2","step3","step4","step5"],"suggestedTopics":["t1","t2","t3","t4","t5"]}`;

    const raw = await callGroq(prompt, system, 1024);
    const report = parseJSON(raw);
    console.log(`✅ Report generated, score: ${report.overallScore}`);
    res.json({ success: true, report });
  } catch (error) {
    console.error('❌ generateReport:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Analyze resume
const analyzeResume = async (req, res) => {
  try {
    const { resumeText, targetRole, jobDescription } = req.body;

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ success: false, message: 'Please paste your resume text (minimum 50 characters).' });
    }

    // Check for garbled/binary text
    const nonAscii = (resumeText.match(/[^\x00-\x7F]/g) || []).length;
    if (nonAscii > resumeText.length * 0.3) {
      return res.status(400).json({ success: false, message: 'Resume text appears to be garbled (binary PDF data). Please PASTE your resume text manually in the text box instead of uploading.' });
    }

    console.log(`📄 Analyzing resume for ${targetRole} (${resumeText.length} chars)`);

    const jd = jobDescription ? `\nJob Description:\n${jobDescription}` : '';
    const system = `You are an expert ATS resume reviewer. Respond with valid JSON only. No markdown. No extra text.`;
    const prompt = `Analyze this resume for ${targetRole || 'Software Developer'}.${jd}\n\nResume:\n${resumeText.slice(0, 2500)}\n\nJSON only:\n{"atsScore":72,"overallRating":"Good","summary":"2-3 sentence assessment","sections":{"contact":{"score":85,"status":"Good","feedback":"feedback here"},"summary":{"score":70,"status":"Average","feedback":"feedback here"},"experience":{"score":80,"status":"Good","feedback":"feedback here"},"skills":{"score":75,"status":"Good","feedback":"feedback here"},"education":{"score":85,"status":"Good","feedback":"feedback here"},"formatting":{"score":70,"status":"Average","feedback":"feedback here"}},"strengths":["s1","s2","s3"],"weaknesses":["w1","w2","w3"],"missingKeywords":["k1","k2","k3","k4"],"suggestedKeywords":["k1","k2","k3","k4"],"improvements":[{"priority":"High","action":"action1"},{"priority":"High","action":"action2"},{"priority":"Medium","action":"action3"},{"priority":"Low","action":"action4"}],"interviewReadiness":65,"estimatedCallbackRate":"35%"}`;

    const raw = await callGroq(prompt, system, 1500);
    const analysis = parseJSON(raw);
    console.log(`✅ Resume analyzed, ATS: ${analysis.atsScore}`);
    res.json({ success: true, analysis });
  } catch (error) {
    console.error('❌ analyzeResume:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { generateQuestion, evaluateAnswer, generateFollowUp, generateReport, analyzeResume };
