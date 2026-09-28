const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    // Fetch student info with class name
    const userRows = await query(
      `SELECT u.id, u.name, u.email, u.class_id, c.class_name 
       FROM users u 
       LEFT JOIN classes c ON u.class_id = c.id 
       WHERE u.id = ?`,
      [studentId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const student = userRows[0];
    const classId = student.class_id;

    // 1. Fetch published exams for this student's class
    let publishedExams = [];
    if (classId) {
      publishedExams = await query(
        "SELECT id, subject_id, title FROM exams WHERE class_id = ? AND status = 'published'",
        [classId]
      );
    } else {
      publishedExams = await query(
        "SELECT id, subject_id, title FROM exams WHERE status = 'published'"
      );
    }

    const totalQuizzesForClass = publishedExams.length;

    // 2. Fetch completed attempts for this student
    const completedAttempts = await query(
      `SELECT a.*, e.title as exam_title, s.subject_name 
       FROM exam_attempts a
       JOIN exams e ON a.exam_id = e.id
       LEFT JOIN subjects s ON e.subject_id = s.id
       WHERE a.student_id = ? AND a.status = 'completed'
       ORDER BY a.id DESC`,
      [studentId]
    );

    // Calculate Overall Average Score
    const totalPercentageSum = completedAttempts.reduce((sum, a) => sum + parseFloat(a.percentage || 0), 0);
    const overallScore = completedAttempts.length > 0
      ? Math.round(totalPercentageSum / completedAttempts.length)
      : 0;

    // Count unique completed exams
    const completedExamIds = new Set(completedAttempts.map(a => a.exam_id));
    const testsCompletedCount = completedExamIds.size;

    // Calculate Course Progress %
    const courseProgressPercentage = totalQuizzesForClass > 0
      ? Math.round((testsCompletedCount / totalQuizzesForClass) * 100)
      : (testsCompletedCount > 0 ? 100 : 0);

    // 3. Badges Earned Count
    const badgeRows = await query(
      'SELECT COUNT(*) as cnt FROM student_badges WHERE student_id = ?',
      [studentId]
    );
    const badgesEarnedCount = badgeRows[0].cnt;

    // 4. Continue Learning (Subjects Progress)
    const allSubjects = await query('SELECT * FROM subjects ORDER BY id ASC');
    const continueLearningList = [];

    for (const sub of allSubjects) {
      // Published quizzes for this subject in student's class
      const subQuizzes = publishedExams.filter(e => e.subject_id === sub.id);
      const totalSubQuizzes = subQuizzes.length;

      if (totalSubQuizzes === 0) continue;

      const subQuizIds = new Set(subQuizzes.map(q => q.id));
      const completedSubCount = Array.from(completedExamIds).filter(id => subQuizIds.has(id)).length;
      const progressPct = Math.round((completedSubCount / totalSubQuizzes) * 100);

      continueLearningList.push({
        subjectId: sub.id,
        subjectName: sub.subject_name,
        code: sub.code,
        totalQuizzes: totalSubQuizzes,
        completedQuizzes: completedSubCount,
        progressPercentage: progressPct,
        isCompleted: progressPct >= 100
      });
    }

    // 5. Unread Notifications Count
    const unreadNotifRows = await query(
      'SELECT COUNT(*) as cnt FROM notifications WHERE student_id = ? AND is_read = FALSE',
      [studentId]
    );
    const unreadNotificationsCount = unreadNotifRows[0].cnt;

    // 6. Recent Quiz Results (Top 5)
    const recentResults = completedAttempts.slice(0, 5).map(a => ({
      attemptId: a.id,
      examTitle: a.exam_title,
      subjectName: a.subject_name,
      score: a.score,
      percentage: a.percentage,
      status: a.percentage >= 40 ? 'PASS' : 'FAIL',
      date: a.end_time || a.created_at
    }));

    res.json({
      success: true,
      dashboard: {
        studentName: student.name,
        studentId: `NRES-STU-${String(student.id).padStart(4, '0')}`,
        email: student.email,
        className: student.class_name || 'Standard Grade',
        overallScore,
        testsCompleted: `${testsCompletedCount} / ${totalQuizzesForClass}`,
        testsCompletedCount,
        totalQuizzesForClass,
        courseProgress: courseProgressPercentage,
        badgesEarned: badgesEarnedCount,
        unreadNotificationsCount,
        continueLearning: continueLearningList,
        recentResults
      }
    });
  } catch (err) {
    next(err);
  }
};

const getStudents = async (req, res, next) => {
  try {
    const { class_id, search } = req.query;

    let sql = `SELECT u.id, u.name, u.email, u.role, u.class_id, u.status, u.created_at, c.class_name 
               FROM users u 
               LEFT JOIN classes c ON u.class_id = c.id 
               WHERE u.role = 'student'`;
    const params = [];

    if (class_id) {
      sql += ` AND u.class_id = ?`;
      params.push(class_id);
    }

    if (search) {
      sql += ` AND (u.name LIKE ? OR u.email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY u.id DESC`;

    const students = await query(sql, params);
    res.json({ success: true, students });
  } catch (err) {
    next(err);
  }
};

const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const students = await query(
      `SELECT u.id, u.name, u.email, u.role, u.class_id, u.status, u.created_at, c.class_name 
       FROM users u 
       LEFT JOIN classes c ON u.class_id = c.id 
       WHERE u.id = ? AND u.role = 'student'`,
      [id]
    );

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    res.json({ success: true, student: students[0] });
  } catch (err) {
    next(err);
  }
};

const createStudent = async (req, res, next) => {
  try {
    const { name, email, password, class_id } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existing = await query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await query(
      'INSERT INTO users (name, email, password, role, class_id, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), hashedPassword, 'student', class_id || null, 'active']
    );

    res.status(201).json({
      success: true,
      message: 'Student created successfully!',
      studentId: result.insertId
    });
  } catch (err) {
    next(err);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, class_id, status, password } = req.body;

    const existing = await query('SELECT id FROM users WHERE id = ? AND role = ?', [id, 'student']);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    let sql = 'UPDATE users SET name = ?, email = ?, class_id = ?, status = ?';
    let params = [name.trim(), email.toLowerCase().trim(), class_id || null, status || 'active'];

    if (password && password.trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password.trim(), salt);
      sql += ', password = ?';
      params.push(hashedPassword);
    }

    sql += ' WHERE id = ?';
    params.push(id);

    await query(sql, params);

    res.json({ success: true, message: 'Student updated successfully.' });
  } catch (err) {
    next(err);
  }
};

const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM users WHERE id = ? AND role = ?', [id, 'student']);
    res.json({ success: true, message: 'Student deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStudentDashboard,
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};
