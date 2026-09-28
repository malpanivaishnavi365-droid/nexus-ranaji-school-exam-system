const { query } = require('../config/db');

const getStudyMaterials = async (req, res, next) => {
  try {
    const classId = req.user.class_id;
    const { subject_id, type } = req.query;

    let sql = `SELECT sm.*, s.subject_name, c.title as chapter_title, c.chapter_number
               FROM study_materials sm
               LEFT JOIN subjects s ON sm.subject_id = s.id
               LEFT JOIN chapters c ON sm.chapter_id = c.id
               WHERE 1=1`;
    const params = [];

    if (classId) {
      sql += ' AND sm.class_id = ?';
      params.push(classId);
    }

    if (subject_id) {
      sql += ' AND sm.subject_id = ?';
      params.push(subject_id);
    }

    if (type) {
      sql += ' AND sm.material_type = ?';
      params.push(type);
    }

    sql += ' ORDER BY sm.id DESC';

    const materials = await query(sql, params);

    res.json({ success: true, materials });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStudyMaterials };
