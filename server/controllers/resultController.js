const { query } = require('../config/db');

const getAllResults = async (req, res, next) => {
  try {
    const { student_id, class_id, subject_id, exam_id, search, sort_by } = req.query;

    let sql = `SELECT a.id as attempt_id, a.score, a.percentage, a.status as attempt_status, 
               a.start_time, a.end_time, a.total_questions, a.attempted, a.correct, a.incorrect, a.unanswered,
               u.id as student_id, u.name as student_name, u.email as student_email,
               e.id as exam_id, e.title as exam_title, e.total_marks, e.passing_marks,
               s.subject_name, c.class_name
               FROM exam_attempts a
               JOIN users u ON a.student_id = u.id
               JOIN exams e ON a.exam_id = e.id
               LEFT JOIN subjects s ON e.subject_id = s.id
               LEFT JOIN classes c ON e.class_id = c.id
               WHERE a.status = 'completed'`;

    const params = [];

    // If student, lock to student's own attempts
    if (req.user.role === 'student') {
      sql += ` AND a.student_id = ?`;
      params.push(req.user.id);
    } else if (student_id) {
      sql += ` AND a.student_id = ?`;
      params.push(student_id);
    }

    if (class_id) {
      sql += ` AND e.class_id = ?`;
      params.push(class_id);
    }

    if (subject_id) {
      sql += ` AND e.subject_id = ?`;
      params.push(subject_id);
    }

    if (exam_id) {
      sql += ` AND a.exam_id = ?`;
      params.push(exam_id);
    }

    if (search) {
      sql += ` AND (u.name LIKE ? OR e.title LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (sort_by === 'marks_asc') {
      sql += ` ORDER BY a.score ASC`;
    } else if (sort_by === 'marks_desc') {
      sql += ` ORDER BY a.score DESC`;
    } else if (sort_by === 'percentage_desc') {
      sql += ` ORDER BY a.percentage DESC`;
    } else {
      sql += ` ORDER BY a.id DESC`;
    }

    const results = await query(sql, params);

    // Format pass/fail status
    const formatted = results.map(r => ({
      ...r,
      pass_fail_status: r.percentage >= (r.passing_marks || 40) ? 'PASS' : 'FAIL'
    }));

    res.json({ success: true, results: formatted });
  } catch (err) {
    next(err);
  }
};

const getResultById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const attempts = await query(
      `SELECT a.*, 
       u.name as student_name, u.email as student_email,
       e.title as exam_title, e.total_marks, e.passing_marks, e.duration,
       s.subject_name, c.class_name
       FROM exam_attempts a
       JOIN users u ON a.student_id = u.id
       JOIN exams e ON a.exam_id = e.id
       LEFT JOIN subjects s ON e.subject_id = s.id
       LEFT JOIN classes c ON e.class_id = c.id
       WHERE a.id = ?`,
      [id]
    );

    if (attempts.length === 0) {
      return res.status(404).json({ success: false, message: 'Result attempt not found.' });
    }

    const attempt = attempts[0];

    // Ensure student can only view their own result unless admin
    if (req.user.role === 'student' && attempt.student_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Fetch detailed question-by-question response breakdown
    const answers = await query(
      `SELECT ans.id, ans.question_id, ans.selected_option, ans.is_correct, ans.marks_obtained,
       q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.marks
       FROM answers ans
       JOIN questions q ON ans.question_id = q.id
       WHERE ans.attempt_id = ?
       ORDER BY q.id ASC`,
      [id]
    );

    attempt.pass_fail_status = attempt.percentage >= (attempt.passing_marks || 40) ? 'PASS' : 'FAIL';

    res.json({
      success: true,
      result: attempt,
      questionBreakdown: answers
    });
  } catch (err) {
    next(err);
  }
};

const getLeaderboard = async (req, res, next) => {
  try {
    const { exam_id, class_id } = req.query;

    let sql = `SELECT a.student_id, u.name as student_name, c.class_name, e.title as exam_title,
               MAX(a.score) as top_score, MAX(a.percentage) as top_percentage
               FROM exam_attempts a
               JOIN users u ON a.student_id = u.id
               JOIN exams e ON a.exam_id = e.id
               LEFT JOIN classes c ON e.class_id = c.id
               WHERE a.status = 'completed'`;

    const params = [];
    if (exam_id) {
      sql += ` AND a.exam_id = ?`;
      params.push(exam_id);
    }
    if (class_id) {
      sql += ` AND e.class_id = ?`;
      params.push(class_id);
    }

    sql += ` GROUP BY a.student_id, u.name, c.class_name, e.title ORDER BY top_percentage DESC, top_score DESC LIMIT 10`;

    const leaderboard = await query(sql, params);
    
    // Assign rank numbers
    const ranked = leaderboard.map((item, index) => ({
      rank: index + 1,
      ...item
    }));

    res.json({ success: true, leaderboard: ranked });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllResults,
  getResultById,
  getLeaderboard
};
