# InterviewSaarthi 🎤
**AI-Powered Mock Interview Coach — Powered by Google Gemini**

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)
- Google Gemini API key (free)

---

## 🔑 Get Your API Keys

### Gemini API Key (FREE)
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)

### JWT Secret
Just type any long random string — e.g.: `mysecretkey_interviewsaarthi_2024_xyz`

### MongoDB URI
1. Go to https://mongodb.com/atlas → free cluster
2. Connect → copy connection string

---

## 🗄️ Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev
```

### backend/.env
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/interviewsaarthi
JWT_SECRET=any_long_random_string_here
GEMINI_API_KEY=AIza-your-key-here
PORT=5000
CLIENT_URL=http://localhost:3000
```

---

## 🖥️ Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### frontend/.env.local
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Open → http://localhost:3000

---

## ✨ Features
- Stunning animated auth pages with floating quotes ticker
- Premium dark dashboard with live charts
- HR, Technical & Behavioral interviews via Gemini AI
- Per-answer scoring with strengths/weaknesses/ideal answer
- Voice input (Web Speech API)
- Progress tracking, weak area detection
- Final report with improvement roadmap
