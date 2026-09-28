const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { generateToken } = require('../config/jwt');

const register = async (req, res, next) => {
  try {
    const { name, email, password, class_id, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    // Check if user exists
    const existingUsers = await query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userRole = role === 'admin' ? 'admin' : 'student';
    const selectedClass = userRole === 'student' ? (class_id || null) : null;

    const result = await query(
      'INSERT INTO users (name, email, password, role, class_id, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), hashedPassword, userRole, selectedClass, 'active']
    );

    const newUserId = result.insertId;

    // Fetch newly created user without password
    const [newUser] = await query('SELECT id, name, email, role, class_id, created_at FROM users WHERE id = ?', [newUserId]);

    const token = generateToken({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      class_id: newUser.class_id
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: newUser
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const identifier = req.body.email || req.body.username;
    const { password, role } = req.body;

    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Please enter your Student ID / Email.' });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Please enter your password.' });
    }

    const cleanIdentifier = identifier.toLowerCase().trim();
    const users = await query(
      'SELECT u.*, c.class_name FROM users u LEFT JOIN classes c ON u.class_id = c.id WHERE LOWER(u.email) = ? OR LOWER(u.name) = ?',
      [cleanIdentifier, cleanIdentifier]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const user = users[0];

    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact Admin.' });
    }

    // If role parameter is provided, enforce role match
    if (role && role === 'student' && user.role !== 'student') {
      return res.status(401).json({ success: false, message: 'Invalid Student ID or Password.' });
    }
    if (role && (role === 'faculty' || role === 'admin') && user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Invalid Faculty ID or Password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      class_id: user.class_id
    });

    delete user.password;

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
};

const studentLogin = async (req, res, next) => {
  try {
    const identifier = req.body.username || req.body.email;
    const { password } = req.body;

    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your Student ID.' });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Please enter your password.' });
    }

    const cleanIdentifier = identifier.toLowerCase().trim();
    const users = await query(
      `SELECT u.*, c.class_name 
       FROM users u 
       LEFT JOIN classes c ON u.class_id = c.id 
       WHERE (LOWER(u.email) = ? OR LOWER(u.name) = ?)`,
      [cleanIdentifier, cleanIdentifier]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid Student ID or Password.' });
    }

    const user = users[0];

    // Enforce student role check strictly
    if (user.role !== 'student') {
      return res.status(401).json({ success: false, message: 'Invalid Student ID or Password.' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your student account has been deactivated. Contact Admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid Student ID or Password.' });
    }

    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      class_id: user.class_id
    });

    delete user.password;

    res.json({
      success: true,
      message: 'Student Sign-In successful!',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
};

const facultyLogin = async (req, res, next) => {
  try {
    const identifier = req.body.username || req.body.email;
    const { password } = req.body;

    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your Faculty ID.' });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Please enter your password.' });
    }

    const cleanIdentifier = identifier.toLowerCase().trim();
    const users = await query(
      `SELECT u.*, c.class_name 
       FROM users u 
       LEFT JOIN classes c ON u.class_id = c.id 
       WHERE (LOWER(u.email) = ? OR LOWER(u.name) = ?)`,
      [cleanIdentifier, cleanIdentifier]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid Faculty ID or Password.' });
    }

    const user = users[0];

    // Enforce faculty / admin role check strictly
    if (user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Invalid Faculty ID or Password.' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your faculty account has been deactivated. Contact Administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid Faculty ID or Password.' });
    }

    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      class_id: user.class_id
    });

    delete user.password;

    res.json({
      success: true,
      message: 'Faculty Sign-In successful!',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const users = await query(
      `SELECT u.id, u.name, u.email, u.role, u.class_id, u.status, u.created_at, c.class_name 
       FROM users u 
       LEFT JOIN classes c ON u.class_id = c.id 
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
};

module.exports = {
  register,
  login,
  studentLogin,
  facultyLogin,
  getProfile,
  logout
};

