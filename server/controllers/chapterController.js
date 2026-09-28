const { query } = require('../config/db');

const getChaptersBySubject = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const classId = req.user.class_id;

    let sql = 'SELECT * FROM chapters WHERE subject_id = ?';
    const params = [subjectId];

    if (classId) {
      sql += ' AND class_id = ?';
      params.push(classId);
    }

    sql += ' ORDER BY chapter_number ASC';

    const chapters = await query(sql, params);

    // Attach published quiz info for each chapter
    for (const ch of chapters) {
      const quizzes = await query(
        `SELECT id, title, duration, total_marks, passing_marks 
         FROM exams 
         WHERE chapter_id = ? AND status = 'published' AND class_id = ?`,
        [ch.id, classId || ch.class_id]
      );
      
      // Check attempt status for student
      for (const q of quizzes) {
        const attempts = await query(
          'SELECT score, percentage, status FROM exam_attempts WHERE exam_id = ? AND student_id = ? ORDER BY id DESC LIMIT 1',
          [q.id, req.user.id]
        );
        q.attempt = attempts[0] || null;
      }

      ch.quizzes = quizzes;
    }

    res.json({ success: true, chapters });
  } catch (err) {
    next(err);
  }
};

module.exports = { getChaptersBySubject };
