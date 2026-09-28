const express = require('express');
const router = express.Router();
const { getStudentCertificates } = require('../controllers/certificateController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getStudentCertificates);

module.exports = router;
