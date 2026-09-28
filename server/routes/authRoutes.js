const express = require('express');
const router = express.Router();
const { register, login, studentLogin, facultyLogin, getProfile, logout } = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/student/login', studentLogin);
router.post('/faculty/login', facultyLogin);
router.get('/profile', authenticateToken, getProfile);
router.post('/logout', authenticateToken, logout);

module.exports = router;

