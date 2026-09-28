const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Treat 'admin' and 'teacher' interchangeably for exam management
    const userRole = req.user.role;
    const effectiveRoles = allowedRoles.flatMap(r => (r === 'admin' || r === 'teacher' ? ['admin', 'teacher'] : [r]));

    if (!effectiveRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

module.exports = authorizeRoles;
