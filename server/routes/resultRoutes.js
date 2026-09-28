const express = require('express');
const router = express.Router();
const { getAllResults, getResultById, getLeaderboard } = require('../controllers/resultController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', getAllResults);
router.get('/leaderboard', getLeaderboard);
router.get('/:id', getResultById);

module.exports = router;
