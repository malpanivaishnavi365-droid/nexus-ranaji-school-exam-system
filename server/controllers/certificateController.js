const { query } = require('../config/db');

const getStudentCertificates = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const classId = req.user.class_id;

    // Fetch user details
    const userRows = await query(
      `SELECT u.id, u.name, u.email, u.class_id, c.class_name 
       FROM users u 
       LEFT JOIN classes c ON u.class_id = c.id 
       WHERE u.id = ?`,
      [studentId]
    );
    const studentInfo = userRows[0] || {};

    // Fetch unlocked certificates
    const certificates = await query(
      `SELECT cert.*, crs.course_name, crs.description as course_desc, s.subject_name
       FROM certificates cert
       JOIN courses crs ON cert.course_id = crs.id
       LEFT JOIN subjects s ON crs.subject_id = s.id
       WHERE cert.student_id = ?
       ORDER BY cert.id DESC`,
      [studentId]
    );

    // Fetch total courses & completion status for student's class
    const availableCourses = await query(
      `SELECT crs.*, s.subject_name 
       FROM courses crs 
       LEFT JOIN subjects s ON crs.subject_id = s.id
       WHERE crs.class_id = ?`,
      [classId || studentInfo.class_id || 0]
    );

    const courseProgressList = [];

    for (const crs of availableCourses) {
      // Find all published quizzes for this course
      const courseQuizzes = await query(
        "SELECT id, title FROM exams WHERE subject_id = ? AND class_id = ? AND status = 'published'",
        [crs.subject_id, crs.class_id]
      );

      const quizIds = courseQuizzes.map(q => q.id);
      let completedQuizzesCount = 0;
      let totalQuizzesCount = courseQuizzes.length;

      if (quizIds.length > 0) {
        const attempts = await query(
          `SELECT DISTINCT exam_id FROM exam_attempts 
           WHERE student_id = ? AND exam_id IN (?) AND status = 'completed'`,
          [studentId, quizIds]
        );
        completedQuizzesCount = attempts.length;
      }

      const isCompleted = totalQuizzesCount > 0 && completedQuizzesCount === totalQuizzesCount;
      const completionPercentage = totalQuizzesCount > 0 ? Math.round((completedQuizzesCount / totalQuizzesCount) * 100) : 0;

      courseProgressList.push({
        courseId: crs.id,
        courseName: crs.course_name,
        subjectName: crs.subject_name,
        description: crs.description,
        totalQuizzes: totalQuizzesCount,
        completedQuizzes: completedQuizzesCount,
        progressPercentage: completionPercentage,
        isCompleted
      });
    }

    res.json({
      success: true,
      student: {
        id: studentInfo.id,
        name: studentInfo.name,
        studentCode: `NRES-STU-${String(studentInfo.id).padStart(4, '0')}`,
        className: studentInfo.class_name || 'Standard Grade'
      },
      certificates,
      coursesProgress: courseProgressList
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStudentCertificates };
