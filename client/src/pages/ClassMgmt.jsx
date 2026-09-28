import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Modal from '../components/Modal';
import { GraduationCap, Plus, Edit2, Trash2 } from 'lucide-react';

const ClassMgmt = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [className, setClassName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await API.get('/classes');
      if (res.data.success) setClasses(res.data.classes);
    } catch (err) {
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditId(null);
    setClassName('');
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setIsEditing(true);
    setEditId(c.id);
    setClassName(c.class_name);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!className.trim()) return;
    setSaving(true);
    try {
      if (isEditing) {
        await API.put(`/classes/${editId}`, { class_name: className });
      } else {
        await API.post('/classes', { class_name: className });
      }
      setShowModal(false);
      fetchClasses();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving class.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete class "${name}"?`)) return;
    try {
      await API.delete(`/classes/${id}`);
      fetchClasses();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting class.');
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2>Class Management</h2>
          <p style={{ color: 'var(--text-muted)' }}>Define and organize academic classes/grades for student enrollment.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={18} /> Add Class
        </button>
      </div>

      {loading ? (
        <div>Loading classes...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Class Name</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No classes defined yet.
                  </td>
                </tr>
              ) : (
                classes.map((c) => (
                  <tr key={c.id}>
                    <td>#{c.id}</td>
                    <td><strong>{c.class_name}</strong></td>
                    <td>{c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleOpenEdit(c)} className="btn btn-secondary btn-sm">
                          <Edit2 size={14} /> Edit
                        </button>
                        <button onClick={() => handleDelete(c.id, c.class_name)} className="btn btn-danger btn-sm">
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
        title={isEditing ? 'Edit Class' : 'Create New Class'}
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary">
              {saving ? 'Saving...' : isEditing ? 'Update Class' : 'Create Class'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Class Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Class 10"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClassMgmt;
