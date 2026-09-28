const express = require('express');
const router = express.Router();
const { getStudyMaterials } = require('../controllers/studyMaterialController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getStudyMaterials);

module.exports = router;
