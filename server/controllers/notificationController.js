const { query } = require('../config/db');

const getNotifications = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const notifications = await query(
      'SELECT * FROM notifications WHERE student_id = ? ORDER BY id DESC LIMIT 50',
      [studentId]
    );

    const unreadCount = notifications.filter(n => !n.is_read).length;

    res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    await query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND student_id = ?',
      [id, studentId]
    );

    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    next(err);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    await query(
      'UPDATE notifications SET is_read = TRUE WHERE student_id = ?',
      [studentId]
    );

    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
