import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, Plus, Edit2, Trash2, HelpCircle, Eye, ToggleLeft, ToggleRight } from 'lucide-react';

const ExamMgmt = () => {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [classId, setClassId] = useState('');
  const [duration, setDuration] = useState(15);
  const [totalMarks, setTotalMarks] = useState(10);
  const [passingMarks, setPassingMarks] = useState(4);
  const [examDate, setExamDate] = useState('');
  const [status, setStatus] = useState('draft');

  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [examsRes, classesRes, subjectsRes] = await Promise.all([
        API.get('/exams'),
        API.get('/classes'),
        API.get('/subjects')
      ]);

      if (examsRes.data.success) setExams(examsRes.data.exams);
      if (classesRes.data.success) setClasses(classesRes.data.classes);
      if (subjectsRes.data.success) setSubjects(subjectsRes.data.subjects);
    } catch (err) {
      console.error('Error loading exam management data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditId(null);
    setTitle('');
    setSubjectId(subjects.length > 0 ? subjects[0].id : '');
    setClassId(classes.length > 0 ? classes[0].id : '');
    setDuration(15);
    setTotalMarks(10);
    setPassingMarks(4);
    setExamDate('');
    setStatus('draft');
    setShowModal(true);
  };

  const handleOpenEdit = (e) => {
    setIsEditing(true);
    setEditId(e.id);
    setTitle(e.title);
    setSubjectId(e.subject_id);
    setClassId(e.class_id);
    setDuration(e.duration);
    setTotalMarks(e.total_marks);
    setPassingMarks(e.passing_marks);
    setExamDate(e.exam_date ? new Date(e.exam_date).toISOString().slice(0, 16) : '');
    setStatus(e.status);
    setShowModal(true);
  };

  const handleSave = async (evt) => {
    evt.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title,
        subject_id: subjectId,
        class_id: classId,
        duration: parseInt(duration),
        total_marks: parseInt(totalMarks),
        passing_marks: parseInt(passingMarks),
        exam_date: examDate || null,
        status
      };

      if (isEditing) {
        await API.put(`/exams/${editId}`, payload);
      } else {
        await API.post('/exams', payload);
      }
      setShowModal(false);
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving examination.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (exam) => {
    const newStatus = exam.status === 'published' ? 'draft' : 'published';
    try {
      await API.put(`/exams/${exam.id}`, {
        ...exam,
        status: newStatus
      });
      fetchInitialData();
    } catch (err) {
      alert('Error updating status.');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete exam "${title}"?`)) return;
    try {
      await API.delete(`/exams/${id}`);
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting exam.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2>Examination Management</h2>
          <p style={{ color: 'var(--text-muted)' }}>Configure exam titles, duration, passing thresholds, and publish status.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={18} /> Schedule Test / Create Exam
        </button>
      </div>

      {loading ? (
        <div>Loading examinations...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Subject</th>
                <th>Target Class</th>
                <th>Scheduled Date</th>
                <th>Duration</th>
                <th>Marks (Total/Pass)</th>
                <th>Questions</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No examinations created yet. Click "Schedule Test / Create Exam" to begin.
                  </td>
                </tr>
              ) : (
                exams.map((e) => (
                  <tr key={e.id}>
                    <td><strong>{e.title}</strong></td>
                    <td>{e.subject_name}</td>
                    <td>{e.class_name}</td>
                    <td>{e.exam_date ? new Date(e.exam_date).toLocaleString() : 'Immediate / Open'}</td>
                    <td>{e.duration} mins</td>
                    <td>{e.total_marks} / {e.passing_marks}</td>
                    <td>
                      <button
                        onClick={() => navigate(`/admin/questions?exam_id=${e.id}`)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        <HelpCircle size={12} /> {e.question_count} MCQs
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(e)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                        title="Click to toggle publish status"
                      >
                        <span className={`badge ${e.status === 'published' ? 'badge-published' : 'badge-draft'}`}>
                          {e.status}
                        </span>
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button onClick={() => navigate(`/admin/questions?exam_id=${e.id}`)} className="btn btn-secondary btn-sm" title="Questions Bank">
                          <HelpCircle size={14} /> Questions
                        </button>
                        <button onClick={() => handleOpenEdit(e)} className="btn btn-secondary btn-sm" title="Edit Exam">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(e.id, e.title)} className="btn btn-danger btn-sm" title="Delete Exam">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Exam Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? 'Edit Examination' : 'Create New Examination'}
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary">
              {saving ? 'Saving...' : isEditing ? 'Update Exam' : 'Create Exam'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Examination Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Mathematics Mid-Term Exam"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Select Subject</label>
              <select
                className="form-select"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                required
              >
                <option value="">-- Choose Subject --</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.subject_name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Select Target Class</label>
              <select
                className="form-select"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                required
              >
                <option value="">-- Choose Class --</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.class_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Duration (Minutes)</label>
              <input
                type="number"
                className="form-input"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
                min={1}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Marks</label>
              <input
                type="number"
                className="form-input"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                required
                min={1}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Passing Marks</label>
              <input
                type="number"
                className="form-input"
                value={passingMarks}
                onChange={(e) => setPassingMarks(e.target.value)}
                required
                min={1}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Exam Date & Time (Optional)</label>
              <input
                type="datetime-local"
                className="form-input"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="draft">Draft (Hidden from students)</option>
                <option value="published">Published (Visible to students)</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExamMgmt;
