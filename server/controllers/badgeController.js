const { query } = require('../config/db');

const getStudentBadges = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    // Fetch all badges
    const allBadges = await query('SELECT * FROM badges ORDER BY id ASC');

    // Fetch earned badges for this student
    const earnedRecords = await query(
      `SELECT sb.badge_id, sb.earned_at, b.code, b.title, b.description, b.icon, b.requirement
       FROM student_badges sb
       JOIN badges b ON sb.badge_id = b.id
       WHERE sb.student_id = ?
       ORDER BY sb.earned_at DESC`,
      [studentId]
    );

    const earnedBadgeIds = new Set(earnedRecords.map(r => r.badge_id));

    const earned = earnedRecords.map(r => ({
      id: r.badge_id,
      code: r.code,
      title: r.title,
      description: r.description,
      icon: r.icon,
      requirement: r.requirement,
      earned_at: r.earned_at,
      is_earned: true
    }));

    const locked = allBadges
      .filter(b => !earnedBadgeIds.has(b.id))
      .map(b => ({
        id: b.id,
        code: b.code,
        title: b.title,
        description: b.description,
        icon: b.icon,
        requirement: b.requirement,
        is_earned: false
      }));

    res.json({
      success: true,
      earned,
      locked,
      totalEarned: earned.length,
      totalBadges: allBadges.length
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStudentBadges };
