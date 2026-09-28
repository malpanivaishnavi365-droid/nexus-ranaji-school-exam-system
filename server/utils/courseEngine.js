const { query } = require('../config/db');

const checkAndGenerateCertificates = async (studentId, classId) => {
  try {
    if (!classId) {
      const u = await query('SELECT class_id FROM users WHERE id = ?', [studentId]);
      if (u.length > 0) classId = u[0].class_id;
    }

    if (!classId) return null;

    // Find all courses for this class
    const courses = await query('SELECT * FROM courses WHERE class_id = ?', [classId]);

    for (const course of courses) {
      // Check if student already has certificate for this course
      const existingCert = await query(
        'SELECT * FROM certificates WHERE student_id = ? AND course_id = ?',
        [studentId, course.id]
      );

      if (existingCert.length > 0) continue; // Already generated

      // Fetch all published quizzes for this course's subject
      const courseQuizzes = await query(
        "SELECT id FROM exams WHERE subject_id = ? AND class_id = ? AND status = 'published'",
        [course.subject_id, classId]
      );

      if (courseQuizzes.length === 0) continue;

      // Check student's completed attempts for these quizzes
      const quizIds = courseQuizzes.map(q => q.id);
      const attempts = await query(
        `SELECT exam_id, MAX(percentage) as best_pct 
         FROM exam_attempts 
         WHERE student_id = ? AND exam_id IN (?) AND status = 'completed'
         GROUP BY exam_id`,
        [studentId, quizIds]
      );

      // Verify that student completed ALL required quizzes
      if (attempts.length === courseQuizzes.length) {
        // Calculate overall average percentage
        const totalPct = attempts.reduce((sum, a) => sum + parseFloat(a.best_pct || 0), 0);
        const finalPercentage = parseFloat((totalPct / attempts.length).toFixed(2));

        const certNum = `NR-CERT-${new Date().getFullYear()}-${studentId}-${course.id}`;
        const issueDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

        await query(
          `INSERT INTO certificates (certificate_number, student_id, course_id, final_percentage, issue_date)
           VALUES (?, ?, ?, ?, ?)`,
          [certNum, studentId, course.id, finalPercentage, issueDate]
        );

        // Send notification
        await query(
          `INSERT INTO notifications (student_id, title, message, type)
           VALUES (?, ?, ?, 'certificate')`,
          [
            studentId,
            'Certificate Unlocked! 🎉',
            `Congratulations! You have completed the "${course.course_name}" with an overall performance of ${finalPercentage}%. Your certificate is ready to view and download.`
          ]
        );

        console.log(`📜 Certificate generated for student #${studentId}: ${certNum}`);
      }
    }
  } catch (err) {
    console.error('Error in course engine:', err);
  }
};

module.exports = { checkAndGenerateCertificates };
