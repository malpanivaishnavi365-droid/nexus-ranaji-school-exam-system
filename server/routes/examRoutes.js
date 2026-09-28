const express = require('express');
const router = express.Router();
const {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  startExam,
  submitExam
} = require('../controllers/examController');
const { getQuestionsByExam } = require('../controllers/questionController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authenticateToken);

router.get('/', getExams);
router.get('/:id', getExamById);
router.post('/', authorizeRoles('admin'), createExam);
router.put('/:id', authorizeRoles('admin'), updateExam);
router.delete('/:id', authorizeRoles('admin'), deleteExam);

// Question nested endpoint
router.get('/:examId/questions', getQuestionsByExam);

// Exam attempt & execution
router.post('/:examId/start', authorizeRoles('student'), startExam);
router.post('/:examId/submit', authorizeRoles('student'), submitExam);

module.exports = router;
