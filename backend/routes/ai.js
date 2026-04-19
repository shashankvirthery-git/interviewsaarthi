const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateQuestion, evaluateAnswer, generateFollowUp, generateReport, analyzeResume } = require('../controllers/aiController');

router.use(protect);

router.post('/question', generateQuestion);
router.post('/evaluate', evaluateAnswer);
router.post('/followup', generateFollowUp);
router.post('/report', generateReport);
router.post('/resume-analyze', analyzeResume);

module.exports = router;
