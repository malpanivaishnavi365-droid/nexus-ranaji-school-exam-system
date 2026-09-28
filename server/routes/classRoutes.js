const express = require('express');

const router = express.Router();

const {
    getClasses,
    createClass,
    updateClass,
    deleteClass
} = require('../controllers/classController');

const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');


// ========================================
// PUBLIC ROUTE
// Students can see classes during signup
// ========================================
router.get('/', getClasses);


// ========================================
// ADMIN ROUTES
// Only logged-in admins can modify classes
// ========================================
router.post(
    '/',
    authenticateToken,
    authorizeRoles('admin'),
    createClass
);

router.put(
    '/:id',
    authenticateToken,
    authorizeRoles('admin'),
    updateClass
);

router.delete(
    '/:id',
    authenticateToken,
    authorizeRoles('admin'),
    deleteClass
);


module.exports = router;
