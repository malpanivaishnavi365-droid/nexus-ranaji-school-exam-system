const express = require('express');
const router = express.Router();
const { getStudentBadges } = require('../controllers/badgeController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getStudentBadges);

module.exports = router;
