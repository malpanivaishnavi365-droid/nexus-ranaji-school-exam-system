const { query } = require('../config/db');

const getQuestionsByExam = async (req, res, next) => {
  try {
    const { examId } = req.params;

    let sql = 'SELECT * FROM questions WHERE exam_id = ? ORDER BY id ASC';
    const questions = await query(sql, [examId]);

    // If request is from student taking exam, strip correct_option and correct_pairs for security!
    if (req.user.role === 'student') {
      const sanitized = questions.map(q => {
        let safeMatchData = null;
        if (q.question_type === 'match' && q.match_data) {
          try {
            const parsed = typeof q.match_data === 'string' ? JSON.parse(q.match_data) : q.match_data;
            safeMatchData = {
              left_items: parsed.left_items || [],
              right_items: parsed.right_items || []
              // Notice: correct_pairs is omitted for security!
            };
          } catch (e) {
            safeMatchData = null;
          }
        }

        return {
          id: q.id,
          exam_id: q.exam_id,
          question_type: q.question_type || 'mcq',
          question_text: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          match_data: safeMatchData,
          marks: q.marks
        };
      });

      return res.json({ success: true, questions: sanitized });
    }

    res.json({ success: true, questions });
  } catch (err) {
    next(err);
  }
};

const createQuestion = async (req, res, next) => {
  try {
    const { exam_id, question_type, question_text, option_a, option_b, option_c, option_d, correct_option, match_data, marks } = req.body;

    if (!exam_id || !question_text) {
      return res.status(400).json({ success: false, message: 'Exam ID and question text are required.' });
    }

    const type = question_type || 'mcq';

    const result = await query(
      `INSERT INTO questions (exam_id, question_type, question_text, option_a, option_b, option_c, option_d, correct_option, match_data, marks) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        exam_id,
        type,
        question_text.trim(),
        option_a ? option_a.trim() : null,
        option_b ? option_b.trim() : null,
        option_c ? option_c.trim() : null,
        option_d ? option_d.trim() : null,
        correct_option ? correct_option.toUpperCase() : null,
        match_data ? (typeof match_data === 'string' ? match_data : JSON.stringify(match_data)) : null,
        marks || 1
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Question added successfully!',
      questionId: result.insertId
    });
  } catch (err) {
    next(err);
  }
};

const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question_type, question_text, option_a, option_b, option_c, option_d, correct_option, match_data, marks } = req.body;

    const type = question_type || 'mcq';

    await query(
      `UPDATE questions SET question_type = ?, question_text = ?, option_a = ?, option_b = ?, option_c = ?, 
       option_d = ?, correct_option = ?, match_data = ?, marks = ? 
       WHERE id = ?`,
      [
        type,
        question_text.trim(),
        option_a ? option_a.trim() : null,
        option_b ? option_b.trim() : null,
        option_c ? option_c.trim() : null,
        option_d ? option_d.trim() : null,
        correct_option ? correct_option.toUpperCase() : null,
        match_data ? (typeof match_data === 'string' ? match_data : JSON.stringify(match_data)) : null,
        marks || 1,
        id
      ]
    );

    res.json({ success: true, message: 'Question updated successfully.' });
  } catch (err) {
    next(err);
  }
};

const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM questions WHERE id = ?', [id]);
    res.json({ success: true, message: 'Question deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getQuestionsByExam,
  createQuestion,
  updateQuestion,
  deleteQuestion
};
