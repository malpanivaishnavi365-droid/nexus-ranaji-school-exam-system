const express = require('express');
const router = express.Router();
const { createQuestion, updateQuestion, deleteQuestion } = require('../controllers/questionController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authenticateToken);

router.post('/', authorizeRoles('admin'), createQuestion);
router.put('/:id', authorizeRoles('admin'), updateQuestion);
router.delete('/:id', authorizeRoles('admin'), deleteQuestion);

module.exports = router;
