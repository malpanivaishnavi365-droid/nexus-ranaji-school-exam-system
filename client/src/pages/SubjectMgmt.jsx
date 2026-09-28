import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Modal from '../components/Modal';
import { BookOpen, Plus, Edit2, Trash2 } from 'lucide-react';

const SubjectMgmt = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [subjectName, setSubjectName] = useState('');
  const [code, setCode] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await API.get('/subjects');
      if (res.data.success) setSubjects(res.data.subjects);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditId(null);
    setSubjectName('');
    setCode('');
    setShowModal(true);
  };

  const handleOpenEdit = (s) => {
    setIsEditing(true);
    setEditId(s.id);
    setSubjectName(s.subject_name);
    setCode(s.code || '');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!subjectName.trim()) return;
    setSaving(true);
    try {
      if (isEditing) {
        await API.put(`/subjects/${editId}`, { subject_name: subjectName, code });
      } else {
        await API.post('/subjects', { subject_name: subjectName, code });
      }
      setShowModal(false);
      fetchSubjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving subject.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete subject "${name}"?`)) return;
    try {
      await API.delete(`/subjects/${id}`);
      fetchSubjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting subject.');
    }
  };

  return (
    <div style={{ maxWidth: '850px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2>Subject Management</h2>
          <p style={{ color: 'var(--text-muted)' }}>Configure academic subjects and course codes for examination categorization.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={18} /> Add Subject
        </button>
      </div>

      {loading ? (
        <div>Loading subjects...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Subject Name</th>
                <th>Course Code</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No subjects added yet.
                  </td>
                </tr>
              ) : (
                subjects.map((s) => (
                  <tr key={s.id}>
                    <td>#{s.id}</td>
                    <td><strong>{s.subject_name}</strong></td>
                    <td><span className="badge badge-published">{s.code || 'N/A'}</span></td>
                    <td>{s.created_at ? new Date(s.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleOpenEdit(s)} className="btn btn-secondary btn-sm">
                          <Edit2 size={14} /> Edit
                        </button>
                        <button onClick={() => handleDelete(s.id, s.subject_name)} className="btn btn-danger btn-sm">
                          <Trash2 size={14} /> Delete
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

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? 'Edit Subject' : 'Create New Subject'}
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary">
              {saving ? 'Saving...' : isEditing ? 'Update Subject' : 'Create Subject'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Subject Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Mathematics"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Course Code (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. MATH101"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SubjectMgmt;
