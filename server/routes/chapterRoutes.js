const express = require('express');
const router = express.Router();
const { getChaptersBySubject } = require('../controllers/chapterController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/subject/:subjectId', authenticateToken, getChaptersBySubject);

module.exports = router;
