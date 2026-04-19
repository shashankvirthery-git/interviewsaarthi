const Interview = require('../models/Interview');

// @desc    Create new interview
// @route   POST /api/interviews
const createInterview = async (req, res) => {
  try {
    const { interviewType, role, difficulty } = req.body;

    const interview = await Interview.create({
      userId: req.user._id,
      interviewType,
      role,
      difficulty
    });

    res.status(201).json({ success: true, interview });
  } catch (error) {
    console.error('Create interview error:', error);
    res.status(500).json({ success: false, message: 'Failed to create interview' });
  }
};

// @desc    Add question+answer to interview
// @route   PUT /api/interviews/:id/qa
const addQA = async (req, res) => {
  try {
    const { question, answer, score, feedback, isFollowUp } = req.body;

    const interview = await Interview.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        $push: {
          questions: { question, answer, score, feedback, isFollowUp: isFollowUp || false }
        }
      },
      { new: true }
    );

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    res.json({ success: true, interview });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update interview' });
  }
};

// @desc    Complete interview with final report
// @route   PUT /api/interviews/:id/complete
const completeInterview = async (req, res) => {
  try {
    const { finalReport } = req.body;

    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    interview.status = 'completed';
    interview.completedAt = new Date();
    interview.finalReport = finalReport;

    // Calculate overall score
    const answeredQs = interview.questions.filter(q => q.answer && q.score > 0);
    if (answeredQs.length > 0) {
      const total = answeredQs.reduce((sum, q) => sum + q.score, 0);
      interview.overallScore = Math.round((total / answeredQs.length) * 10) / 10;
    }

    // Calculate duration
    const start = new Date(interview.startedAt);
    const end = new Date();
    interview.duration = Math.round((end - start) / 60000);

    await interview.save();

    res.json({ success: true, interview });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to complete interview' });
  }
};

// @desc    Get all interviews for user
// @route   GET /api/interviews
const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id })
      .select('-questions.feedback.idealAnswer')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, interviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch interviews' });
  }
};

// @desc    Get single interview
// @route   GET /api/interviews/:id
const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    res.json({ success: true, interview });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch interview' });
  }
};

// @desc    Delete interview
// @route   DELETE /api/interviews/:id
const deleteInterview = async (req, res) => {
  try {
    await Interview.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, message: 'Interview deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete interview' });
  }
};

module.exports = { createInterview, addQA, completeInterview, getInterviews, getInterview, deleteInterview };
