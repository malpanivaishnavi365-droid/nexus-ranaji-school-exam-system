const { query } = require('../config/db');

const getSubjects = async (req, res, next) => {
  try {
    const subjects = await query('SELECT * FROM subjects ORDER BY subject_name ASC');
    res.json({ success: true, subjects });
  } catch (err) {
    next(err);
  }
};

const createSubject = async (req, res, next) => {
  try {
    const { subject_name, code } = req.body;
    if (!subject_name || !subject_name.trim()) {
      return res.status(400).json({ success: false, message: 'Subject name is required.' });
    }

    const existing = await query('SELECT id FROM subjects WHERE subject_name = ?', [subject_name.trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Subject already exists.' });
    }

    const result = await query('INSERT INTO subjects (subject_name, code) VALUES (?, ?)', [
      subject_name.trim(),
      code ? code.trim() : null
    ]);

    res.status(201).json({ success: true, message: 'Subject created successfully!', subjectId: result.insertId });
  } catch (err) {
    next(err);
  }
};

const updateSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { subject_name, code } = req.body;
    if (!subject_name || !subject_name.trim()) {
      return res.status(400).json({ success: false, message: 'Subject name is required.' });
    }

    await query('UPDATE subjects SET subject_name = ?, code = ? WHERE id = ?', [
      subject_name.trim(),
      code ? code.trim() : null,
      id
    ]);

    res.json({ success: true, message: 'Subject updated successfully.' });
  } catch (err) {
    next(err);
  }
};

const deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM subjects WHERE id = ?', [id]);
    res.json({ success: true, message: 'Subject deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject
};
