const express = require('express');
const router = express.Router();
const { getStudentDashboard, getStudents, getStudentById, createStudent, updateStudent, deleteStudent } = require('../controllers/studentController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authenticateToken);

router.get('/dashboard', getStudentDashboard);
router.get('/', getStudents);
router.get('/:id', getStudentById);
router.post('/', authorizeRoles('admin'), createStudent);
router.put('/:id', authorizeRoles('admin'), updateStudent);
router.delete('/:id', authorizeRoles('admin'), deleteStudent);

module.exports = router;
