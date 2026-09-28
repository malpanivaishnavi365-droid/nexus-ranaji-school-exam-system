const express = require('express');
const router = express.Router();
const { getSubjects, createSubject, updateSubject, deleteSubject } = require('../controllers/subjectController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authenticateToken);

router.get('/', getSubjects);
router.post('/', authorizeRoles('admin'), createSubject);
router.put('/:id', authorizeRoles('admin'), updateSubject);
router.delete('/:id', authorizeRoles('admin'), deleteSubject);

module.exports = router;
