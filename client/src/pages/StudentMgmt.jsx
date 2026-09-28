import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Modal from '../components/Modal';
import { Users, UserPlus, Edit2, Trash2, Search, Filter } from 'lucide-react';

const StudentMgmt = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [classId, setClassId] = useState('');
  const [status, setStatus] = useState('active');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [studentsRes, classesRes] = await Promise.all([
        API.get('/students'),
        API.get('/classes')
      ]);
      if (studentsRes.data.success) setStudents(studentsRes.data.students);
      if (classesRes.data.success) setClasses(classesRes.data.classes);
    } catch (err) {
      console.error('Error loading student management data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setName('');
    setEmail('');
    setPassword('');
    setClassId(classes.length > 0 ? classes[0].id : '');
    setStatus('active');
    setShowModal(true);
  };

  const handleOpenEditModal = (student) => {
    setIsEditing(true);
    setEditId(student.id);
    setName(student.name);
    setEmail(student.email);
    setPassword(''); // Empty unless changing
    setClassId(student.class_id || '');
    setStatus(student.status || 'active');
    setShowModal(true);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (isEditing) {
        await API.put(`/students/${editId}`, {
          name,
          email,
          class_id: classId,
          status,
          password
        });
      } else {
        await API.post('/students', {
          name,
          email,
          password,
          class_id: classId
        });
      }
      setShowModal(false);
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving student record.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudent = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete student "${name}"?`)) return;
    try {
      await API.delete(`/students/${id}`);
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting student.');
    }
  };

  // Filtered list logic
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.email.toLowerCase().includes(search.toLowerCase());
    const matchesClass = classFilter ? String(s.class_id) === String(classFilter) : true;
    return matchesSearch && matchesClass;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2>Student Directory & Management</h2>
          <p style={{ color: 'var(--text-muted)' }}>Add, edit, assign classes, or manage active status of enrolled students.</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <UserPlus size={18} /> Add New Student
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search student by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
        </div>

        <div style={{ width: '200px' }}>
          <select
            className="form-select"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.class_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading students...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Class</th>
                <th>Status</th>
                <th>Registered Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No student records found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id}>
                    <td>#{s.id}</td>
                    <td><strong>{s.name}</strong></td>
                    <td>{s.email}</td>
                    <td>{s.class_name || 'Unassigned'}</td>
                    <td>
                      <span className={`badge ${s.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>{s.created_at ? new Date(s.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleOpenEditModal(s)} className="btn btn-secondary btn-sm" title="Edit Student">
                          <Edit2 size={14} /> Edit
                        </button>
                        <button onClick={() => handleDeleteStudent(s.id, s.name)} className="btn btn-danger btn-sm" title="Delete Student">
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

      {/* Modal Dialog */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? 'Edit Student Record' : 'Register New Student'}
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleSaveStudent} disabled={saving} className="btn btn-primary">
              {saving ? 'Saving...' : isEditing ? 'Update Student' : 'Add Student'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveStudent}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assign Class</label>
            <select
              className="form-select"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
            >
              <option value="">-- Select Class --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.class_name}</option>
              ))}
            </select>
          </div>

          {isEditing && (
            <div className="form-group">
              <label className="form-label">Account Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">{isEditing ? 'New Password (leave blank to keep current)' : 'Password'}</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isEditing}
              minLength={6}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentMgmt;
