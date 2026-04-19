const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createInterview, addQA, completeInterview,
  getInterviews, getInterview, deleteInterview
} = require('../controllers/interviewController');

router.use(protect);

router.post('/', createInterview);
router.get('/', getInterviews);
router.get('/:id', getInterview);
router.put('/:id/qa', addQA);
router.put('/:id/complete', completeInterview);
router.delete('/:id', deleteInterview);

module.exports = router;
