const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, default: '' },
  score: { type: Number, default: 0 },
  feedback: {
    strengths: [String],
    weaknesses: [String],
    improvements: [String],
    idealAnswer: { type: String, default: '' }
  },
  isFollowUp: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  interviewType: {
    type: String,
    enum: ['HR', 'Technical', 'Behavioral'],
    required: true
  },
  role: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed'],
    default: 'in_progress'
  },
  questions: [questionSchema],
  overallScore: { type: Number, default: 0 },
  finalReport: {
    summary: { type: String, default: '' },
    keyStrengths: [String],
    keyWeaknesses: [String],
    improvementRoadmap: [String],
    suggestedTopics: [String],
    overallScore: { type: Number, default: 0 }
  },
  duration: { type: Number, default: 0 }, // in minutes
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
}, { timestamps: true });

// Auto-calculate overall score before save
interviewSchema.pre('save', function(next) {
  if (this.questions && this.questions.length > 0) {
    const answeredQs = this.questions.filter(q => q.answer && q.score > 0);
    if (answeredQs.length > 0) {
      const total = answeredQs.reduce((sum, q) => sum + q.score, 0);
      this.overallScore = Math.round(total / answeredQs.length * 10) / 10;
    }
  }
  next();
});

module.exports = mongoose.model('Interview', interviewSchema);
