const Interview = require('../models/Interview');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalInterviews, completedInterviews, recentInterviews] = await Promise.all([
      Interview.countDocuments({ userId }),
      Interview.countDocuments({ userId, status: 'completed' }),
      Interview.find({ userId, status: 'completed' })
        .select('overallScore interviewType role difficulty createdAt finalReport.keyWeaknesses')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    // Calculate average score
    let averageScore = 0;
    if (completedInterviews > 0) {
      const scoreAgg = await Interview.aggregate([
        { $match: { userId: userId, status: 'completed' } },
        { $group: { _id: null, avg: { $avg: '$overallScore' } } }
      ]);
      averageScore = scoreAgg[0] ? Math.round(scoreAgg[0].avg * 10) / 10 : 0;
    }

    // Detect weak areas from all feedback
    const weakAreasAgg = await Interview.aggregate([
      { $match: { userId: userId, status: 'completed' } },
      { $unwind: '$questions' },
      { $unwind: '$questions.feedback.weaknesses' },
      { $group: { _id: '$questions.feedback.weaknesses', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const weakAreas = weakAreasAgg.map(w => w._id).filter(Boolean);

    // Score trend (last 10 interviews)
    const scoreTrend = recentInterviews.map(i => ({
      date: i.createdAt,
      score: i.overallScore,
      type: i.interviewType,
      role: i.role
    })).reverse();

    // Performance by interview type
    const typePerformance = await Interview.aggregate([
      { $match: { userId: userId, status: 'completed' } },
      { $group: { _id: '$interviewType', avgScore: { $avg: '$overallScore' }, count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalInterviews,
        completedInterviews,
        averageScore,
        lastScore: recentInterviews[0]?.overallScore || 0,
        weakAreas,
        scoreTrend,
        typePerformance,
        recentInterviews: recentInterviews.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard data' });
  }
};

module.exports = { getDashboardStats };
