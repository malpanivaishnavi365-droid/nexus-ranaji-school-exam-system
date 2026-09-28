const { query } = require('../config/db');

const checkAndAwardBadges = async (studentId, examId, attemptResult) => {
  try {
    const newlyAwarded = [];

    // Fetch all badge definitions
    const badges = await query('SELECT * FROM badges');
    const badgeMap = {};
    badges.forEach(b => { badgeMap[b.code] = b; });

    // Helper to award badge safely
    const award = async (code) => {
      const badge = badgeMap[code];
      if (!badge) return;

      const existing = await query(
        'SELECT id FROM student_badges WHERE student_id = ? AND badge_id = ?',
        [studentId, badge.id]
      );

      if (existing.length === 0) {
        await query(
          'INSERT INTO student_badges (student_id, badge_id) VALUES (?, ?)',
          [studentId, badge.id]
        );

        // Create notification
        await query(
          `INSERT INTO notifications (student_id, title, message, type)
           VALUES (?, ?, ?, 'badge')`,
          [
            studentId,
            `Badge Earned: ${badge.title} ${badge.icon}`,
            `Congratulations! You unlocked the "${badge.title}" badge: ${badge.description}`
          ]
        );

        newlyAwarded.push(badge);
      }
    };

    // Rule 1: First Step (1 completed attempt)
    const attempts = await query(
      "SELECT id, percentage, score, exam_id FROM exam_attempts WHERE student_id = ? AND status = 'completed'",
      [studentId]
    );

    if (attempts.length >= 1) {
      await award('first_step');
    }

    // Rule 2: Quiz Champion (5 completed attempts)
    if (attempts.length >= 5) {
      await award('quiz_champion');
    }

    // Rule 3: Perfect Score (100% on current attempt or any attempt)
    if (attemptResult.percentage >= 100 || attempts.some(a => parseFloat(a.percentage) >= 100)) {
      await award('perfect_score');
    }

    // Rule 4: Consistent Learner (3 attempts with >= 80%)
    const highScoring = attempts.filter(a => parseFloat(a.percentage) >= 80);
    if (highScoring.length >= 3) {
      await award('consistent_learner');
    }

    // Rule 5: Subject Explorer (completed all published quizzes for this subject)
    const examInfo = await query('SELECT subject_id, class_id FROM exams WHERE id = ?', [examId]);
    if (examInfo.length > 0) {
      const { subject_id, class_id } = examInfo[0];
      const publishedQuizzes = await query(
        "SELECT id FROM exams WHERE subject_id = ? AND class_id = ? AND status = 'published'",
        [subject_id, class_id]
      );
      const completedQuizIds = new Set(attempts.map(a => a.exam_id));
      const allSubjectCompleted = publishedQuizzes.every(q => completedQuizIds.has(q.id));

      if (publishedQuizzes.length > 0 && allSubjectCompleted) {
        await award('subject_explorer');
      }

      // Check Science Master specifically if subject is General Science
      const subjectRecord = await query('SELECT subject_name FROM subjects WHERE id = ?', [subject_id]);
      if (subjectRecord.length > 0 && subjectRecord[0].subject_name === 'General Science') {
        if (publishedQuizzes.length > 0 && allSubjectCompleted) {
          await award('science_master');
        }
      }
    }

    return newlyAwarded;
  } catch (err) {
    console.error('Error in badge engine:', err);
    return [];
  }
};

module.exports = { checkAndAwardBadges };
