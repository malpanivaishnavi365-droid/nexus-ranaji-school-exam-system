const { query } = require('../config/db');

const getClasses = async (req, res, next) => {
  try {
    const classes = await query('SELECT * FROM classes ORDER BY class_name ASC');
    res.json({ success: true, classes });
  } catch (err) {
    next(err);
  }
};

const createClass = async (req, res, next) => {
  try {
    const { class_name } = req.body;
    if (!class_name || !class_name.trim()) {
      return res.status(400).json({ success: false, message: 'Class name is required.' });
    }

    const existing = await query('SELECT id FROM classes WHERE class_name = ?', [class_name.trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Class already exists.' });
    }

    const result = await query('INSERT INTO classes (class_name) VALUES (?)', [class_name.trim()]);
    res.status(201).json({ success: true, message: 'Class created successfully!', classId: result.insertId });
  } catch (err) {
    next(err);
  }
};

const updateClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { class_name } = req.body;
    if (!class_name || !class_name.trim()) {
      return res.status(400).json({ success: false, message: 'Class name is required.' });
    }

    await query('UPDATE classes SET class_name = ? WHERE id = ?', [class_name.trim(), id]);
    res.json({ success: true, message: 'Class updated successfully.' });
  } catch (err) {
    next(err);
  }
};

const deleteClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM classes WHERE id = ?', [id]);
    res.json({ success: true, message: 'Class deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getClasses,
  createClass,
  updateClass,
  deleteClass
};
