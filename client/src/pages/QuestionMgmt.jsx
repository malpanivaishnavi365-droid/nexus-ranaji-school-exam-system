import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Modal from '../components/Modal';
import { useSearchParams } from 'react-router-dom';
import { HelpCircle, Plus, Edit2, Trash2, CheckCircle, Filter } from 'lucide-react';

const QuestionMgmt = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialExamId = searchParams.get('exam_id') || '';

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(initialExamId);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form states
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState('A');
  const [marks, setMarks] = useState(2);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      fetchQuestions(selectedExamId);
    } else {
      setQuestions([]);
    }
  }, [selectedExamId]);

  const fetchExams = async () => {
    try {
      const res = await API.get('/exams');
      if (res.data.success) {
        setExams(res.data.exams);
        if (!selectedExamId && res.data.exams.length > 0) {
          setSelectedExamId(res.data.exams[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching exams:', err);
    }
  };

  const fetchQuestions = async (examId) => {
    setLoading(true);
    try {
      const res = await API.get(`/exams/${examId}/questions`);
      if (res.data.success) setQuestions(res.data.questions);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    if (!selectedExamId) {
      alert('Please select an examination first.');
      return;
    }
    setIsEditing(false);
    setEditId(null);
    setQuestionText('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectOption('A');
    setMarks(2);
    setShowModal(true);
  };

  const handleOpenEdit = (q) => {
    setIsEditing(true);
    setEditId(q.id);
    setQuestionText(q.question_text);
    setOptionA(q.option_a);
    setOptionB(q.option_b);
    setOptionC(q.option_c);
    setOptionD(q.option_d);
    setCorrectOption(q.correct_option);
    setMarks(q.marks || 1);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!questionText || !optionA || !optionB || !optionC || !optionD) {
      alert('Please fill in all question options.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        exam_id: selectedExamId,
        question_text: questionText,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC,
        option_d: optionD,
        correct_option: correctOption,
        marks: parseInt(marks) || 1
      };

      if (isEditing) {
        await API.put(`/questions/${editId}`, payload);
      } else {
        await API.post('/questions', payload);
      }
      setShowModal(false);
      fetchQuestions(selectedExamId);
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving question.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await API.delete(`/questions/${id}`);
      fetchQuestions(selectedExamId);
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting question.');
    }
  };

  const currentExam = exams.find(e => String(e.id) === String(selectedExamId));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2>Question Bank Management</h2>
          <p style={{ color: 'var(--text-muted)' }}>Add multiple-choice questions (MCQs), set option choices, correct key, and point values.</p>
        </div>
        <button onClick={handleOpenAdd} disabled={!selectedExamId} className="btn btn-primary">
          <Plus size={18} /> Add MCQ Question
        </button>
      </div>

      {/* Exam Selector Toolbar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Filter size={18} color="var(--primary)" />
        <label style={{ fontWeight: '700', fontSize: '0.9rem' }}>Select Examination:</label>
        <select
          className="form-select"
          value={selectedExamId}
          onChange={(e) => {
            setSelectedExamId(e.target.value);
            setSearchParams({ exam_id: e.target.value });
          }}
          style={{ maxWidth: '400px' }}
        >
          <option value="">-- Choose Examination --</option>
          {exams.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title} ({e.class_name} - {e.subject_name})
            </option>
          ))}
        </select>

        {currentExam && (
          <span className="badge badge-published" style={{ marginLeft: 'auto' }}>
            Target: {currentExam.class_name} | Total Marks: {currentExam.total_marks}
          </span>
        )}
      </div>

      {/* Questions List */}
      {!selectedExamId ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          Select an examination from the dropdown above to manage its question bank.
        </div>
      ) : loading ? (
        <div>Loading question bank...</div>
      ) : questions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <HelpCircle size={48} color="var(--text-light)" style={{ marginBottom: '1rem' }} />
          <h3>No Questions Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>There are no questions added to this examination yet. Click "Add MCQ Question" to create one.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {questions.map((q, idx) => (
            <div key={q.id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '1.05rem', lineHeight: '1.5' }}>
                  Q{idx + 1}. {q.question_text}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-warning">Marks: {q.marks || 1}</span>
                  <button onClick={() => handleOpenEdit(q)} className="btn btn-secondary btn-sm" title="Edit Question">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(q.id)} className="btn btn-danger btn-sm" title="Delete Question">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Options Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.875rem' }}>
                {['A', 'B', 'C', 'D'].map((optKey) => {
                  const isCorrect = q.correct_option === optKey;
                  const optVal = q[`option_${optKey.toLowerCase()}`];

                  return (
                    <div key={optKey} style={{
                      padding: '0.6rem 0.875rem',
                      borderRadius: '6px',
                      background: isCorrect ? 'var(--accent-success-bg)' : '#f8fafc',
                      border: `1px solid ${isCorrect ? 'var(--accent-success)' : 'var(--border-light)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span><strong>{optKey}:</strong> {optVal}</span>
                      {isCorrect && (
                        <span style={{ color: 'var(--accent-success)', fontWeight: '800', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <CheckCircle size={12} /> Correct
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Question Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? 'Edit MCQ Question' : 'Add MCQ Question'}
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary">
              {saving ? 'Saving...' : isEditing ? 'Update Question' : 'Add Question'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Question Text</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. What is the capital of Maharashtra?"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Option A</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Mumbai"
                value={optionA}
                onChange={(e) => setOptionA(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Option B</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Pune"
                value={optionB}
                onChange={(e) => setOptionB(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Option C</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Nagpur"
                value={optionC}
                onChange={(e) => setOptionC(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Option D</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Nashik"
                value={optionD}
                onChange={(e) => setOptionD(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Correct Answer Choice</label>
              <select
                className="form-select"
                value={correctOption}
                onChange={(e) => setCorrectOption(e.target.value)}
                required
              >
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Question Marks</label>
              <input
                type="number"
                className="form-input"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                min={1}
                required
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default QuestionMgmt;
