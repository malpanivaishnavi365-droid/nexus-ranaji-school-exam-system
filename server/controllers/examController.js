const { query } = require('../config/db');
const { checkAndAwardBadges } = require('../utils/badgeEngine');
const { checkAndGenerateCertificates } = require('../utils/courseEngine');

const getExams = async (req, res, next) => {
  try {
    const { class_id, status, subject_id } = req.query;
    let sql = `SELECT e.*, s.subject_name, c.class_name, ch.title as chapter_title,
               (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) as question_count
               FROM exams e
               LEFT JOIN subjects s ON e.subject_id = s.id
               LEFT JOIN classes c ON e.class_id = c.id
               LEFT JOIN chapters ch ON e.chapter_id = ch.id
               WHERE 1=1`;
    const params = [];

    // Filter by student's class if role is student
    if (req.user.role === 'student') {
      sql += ` AND e.status = 'published'`;
      if (req.user.class_id) {
        sql += ` AND e.class_id = ?`;
        params.push(req.user.class_id);
      }
      if (subject_id) {
        sql += ` AND e.subject_id = ?`;
        params.push(subject_id);
      }
    } else {
      // Admin filters
      if (class_id) {
        sql += ` AND e.class_id = ?`;
        params.push(class_id);
      }
      if (status) {
        sql += ` AND e.status = ?`;
        params.push(status);
      }
      if (subject_id) {
        sql += ` AND e.subject_id = ?`;
        params.push(subject_id);
      }
    }

    sql += ` ORDER BY e.id DESC`;

    const exams = await query(sql, params);

    // If student, attach attempt status
    if (req.user.role === 'student') {
      const attempts = await query(
        `SELECT exam_id, id as attempt_id, score, percentage, status, created_at 
         FROM exam_attempts WHERE student_id = ?`,
        [req.user.id]
      );
      const attemptMap = {};
      attempts.forEach(a => { attemptMap[a.exam_id] = a; });

      exams.forEach(exam => {
        exam.attempt = attemptMap[exam.id] || null;
      });
    }

    res.json({ success: true, exams });
  } catch (err) {
    next(err);
  }
};

const getExamById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const exams = await query(
      `SELECT e.*, s.subject_name, c.class_name, ch.title as chapter_title,
       (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) as question_count
       FROM exams e
       LEFT JOIN subjects s ON e.subject_id = s.id
       LEFT JOIN classes c ON e.class_id = c.id
       LEFT JOIN chapters ch ON e.chapter_id = ch.id
       WHERE e.id = ?`,
      [id]
    );

    if (exams.length === 0) {
      return res.status(404).json({ success: false, message: 'Examination not found.' });
    }

    const exam = exams[0];

    // If student, check class access authorization
    if (req.user.role === 'student' && req.user.class_id && exam.class_id !== req.user.class_id) {
      return res.status(403).json({ success: false, message: 'This examination is not available for your class.' });
    }

    // If student, check if user has an existing attempt
    if (req.user.role === 'student') {
      const attempts = await query(
        `SELECT * FROM exam_attempts WHERE exam_id = ? AND student_id = ? ORDER BY id DESC LIMIT 1`,
        [id, req.user.id]
      );
      exam.attempt = attempts[0] || null;
    }

    res.json({ success: true, exam });
  } catch (err) {
    next(err);
  }
};

const createExam = async (req, res, next) => {
  try {
    const { title, subject_id, class_id, chapter_id, duration, total_marks, passing_marks, exam_date, status, description, max_attempts } = req.body;

    if (!title || !subject_id || !class_id || !duration) {
      return res.status(400).json({ success: false, message: 'Title, subject, class, and duration are required.' });
    }

    const result = await query(
      `INSERT INTO exams (title, subject_id, class_id, chapter_id, duration, total_marks, passing_marks, exam_date, status, description, max_attempts)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        subject_id,
        class_id,
        chapter_id || null,
        duration,
        total_marks || 100,
        passing_marks || 40,
        exam_date || null,
        status || 'draft',
        description || null,
        max_attempts || 3
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Examination created successfully!',
      examId: result.insertId
    });
  } catch (err) {
    next(err);
  }
};

const updateExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, subject_id, class_id, chapter_id, duration, total_marks, passing_marks, exam_date, status, description, max_attempts } = req.body;

    await query(
      `UPDATE exams SET title = ?, subject_id = ?, class_id = ?, chapter_id = ?, duration = ?, 
       total_marks = ?, passing_marks = ?, exam_date = ?, status = ?, description = ?, max_attempts = ? 
       WHERE id = ?`,
      [
        title.trim(),
        subject_id,
        class_id,
        chapter_id || null,
        duration,
        total_marks || 100,
        passing_marks || 40,
        exam_date || null,
        status || 'draft',
        description || null,
        max_attempts || 3,
        id
      ]
    );

    res.json({ success: true, message: 'Examination updated successfully.' });
  } catch (err) {
    next(err);
  }
};

const deleteExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM exams WHERE id = ?', [id]);
    res.json({ success: true, message: 'Examination deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// Start Exam Attempt
const startExam = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.id;

    // Fetch exam details
    const exams = await query('SELECT * FROM exams WHERE id = ?', [examId]);
    if (exams.length === 0) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }
    const exam = exams[0];

    // Enforce class authorization
    if (req.user.role === 'student' && req.user.class_id && exam.class_id !== req.user.class_id) {
      return res.status(403).json({ success: false, message: 'Access denied. Exam is for another class.' });
    }

    // Check existing attempts count
    const existingAttempts = await query(
      'SELECT * FROM exam_attempts WHERE exam_id = ? AND student_id = ? ORDER BY id DESC',
      [examId, studentId]
    );

    const completedAttempts = existingAttempts.filter(a => a.status === 'completed');
    const maxAllowed = exam.max_attempts || 3;

    if (completedAttempts.length >= maxAllowed) {
      return res.status(400).json({
        success: false,
        message: `Maximum attempts (${maxAllowed}) reached for this examination.`,
        attemptId: completedAttempts[0].id
      });
    }

    // Check if there is an in-progress attempt to resume
    const inProgress = existingAttempts.find(a => a.status === 'in_progress');
    if (inProgress) {
      return res.json({
        success: true,
        message: 'Resuming examination attempt.',
        attempt: inProgress
      });
    }

    // Fetch questions count
    const questions = await query('SELECT id FROM questions WHERE exam_id = ?', [examId]);
    const startTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const result = await query(
      `INSERT INTO exam_attempts (exam_id, student_id, start_time, status, total_questions) 
       VALUES (?, ?, ?, 'in_progress', ?)`,
      [examId, studentId, startTime, questions.length]
    );

    const [newAttempt] = await query('SELECT * FROM exam_attempts WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Examination started!',
      attempt: newAttempt
    });
  } catch (err) {
    next(err);
  }
};

// Submit Exam Attempt
const submitExam = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.id;
    const { answers } = req.body; // Array of { question_id, selected_option, match_pairs }

    // Find in-progress attempt
    const attempts = await query(
      'SELECT * FROM exam_attempts WHERE exam_id = ? AND student_id = ? AND status = ? ORDER BY id DESC LIMIT 1',
      [examId, studentId, 'in_progress']
    );

    if (attempts.length === 0) {
      return res.status(400).json({ success: false, message: 'No active attempt found for this exam.' });
    }

    const attempt = attempts[0];
    const examQuestions = await query('SELECT * FROM questions WHERE exam_id = ?', [examId]);
    const examData = (await query('SELECT total_marks, passing_marks FROM exams WHERE id = ?', [examId]))[0];

    let attemptedCount = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let totalScore = 0;

    const answerMap = {};
    if (Array.isArray(answers)) {
      answers.forEach(a => {
        if (a.question_id) answerMap[a.question_id] = a;
      });
    }

    // Clear previous attempt answers if any
    await query('DELETE FROM answers WHERE attempt_id = ?', [attempt.id]);

    for (const q of examQuestions) {
      const userAns = answerMap[q.id] || {};
      let isCorrect = false;
      let marksObtained = 0;
      let selectedOpt = null;
      let selectedJson = null;

      if (q.question_type === 'match') {
        selectedJson = userAns.match_pairs ? JSON.stringify(userAns.match_pairs) : null;
        if (userAns.match_pairs && Object.keys(userAns.match_pairs).length > 0) {
          attemptedCount++;
          let matchDataObj = {};
          try {
            matchDataObj = typeof q.match_data === 'string' ? JSON.parse(q.match_data) : (q.match_data || {});
          } catch (e) {
            matchDataObj = {};
          }

          const correctPairs = matchDataObj.correct_pairs || {};
          const userPairs = userAns.match_pairs || {};

          // Verify every left item index matches the correct right item index
          const pairKeys = Object.keys(correctPairs);
          let allMatched = pairKeys.length > 0;

          for (const k of pairKeys) {
            if (String(userPairs[k]) !== String(correctPairs[k])) {
              allMatched = false;
              break;
            }
          }

          if (allMatched) {
            isCorrect = true;
            marksObtained = q.marks || 1;
            correctCount++;
            totalScore += marksObtained;
          } else {
            incorrectCount++;
          }
        }
      } else {
        // MCQ Type
        selectedOpt = userAns.selected_option || null;
        if (selectedOpt) {
          attemptedCount++;
          if (q.correct_option && selectedOpt.toUpperCase() === q.correct_option.toUpperCase()) {
            isCorrect = true;
            marksObtained = q.marks || 1;
            correctCount++;
            totalScore += marksObtained;
          } else {
            incorrectCount++;
          }
        }
      }

      await query(
        `INSERT INTO answers (attempt_id, question_id, selected_option, selected_answer_json, is_correct, marks_obtained) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [attempt.id, q.id, selectedOpt, selectedJson, isCorrect, marksObtained]
      );
    }

    const totalQuestions = examQuestions.length;
    const unansweredCount = totalQuestions - attemptedCount;
    const maxMarks = examQuestions.reduce((sum, q) => sum + (q.marks || 1), 0) || examData.total_marks || 100;
    const percentage = maxMarks > 0 ? parseFloat(((totalScore / maxMarks) * 100).toFixed(2)) : 0;
    const endTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await query(
      `UPDATE exam_attempts 
       SET end_time = ?, score = ?, percentage = ?, status = 'completed', 
           total_questions = ?, attempted = ?, correct = ?, incorrect = ?, unanswered = ? 
       WHERE id = ?`,
      [
        endTime,
        totalScore,
        percentage,
        totalQuestions,
        attemptedCount,
        correctCount,
        incorrectCount,
        unansweredCount,
        attempt.id
      ]
    );

    // Trigger Badge Engine & Course Engine
    const newlyAwardedBadges = await checkAndAwardBadges(studentId, examId, { score: totalScore, percentage });
    await checkAndGenerateCertificates(studentId, req.user.class_id);

    res.json({
      success: true,
      message: 'Examination submitted successfully!',
      result: {
        attemptId: attempt.id,
        score: totalScore,
        maxMarks,
        percentage,
        totalQuestions,
        attempted: attemptedCount,
        correct: correctCount,
        incorrect: incorrectCount,
        unanswered: unansweredCount,
        status: percentage >= (examData.passing_marks || 40) ? 'PASS' : 'FAIL',
        newlyAwardedBadges
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  startExam,
  submitExam
};
