import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, GraduationCap, FileSpreadsheet, HelpCircle, Award, Plus, ArrowRight } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    classes: 0,
    subjects: 0,
    exams: 0
  });
  const [recentExams, setRecentExams] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [studentsRes, classesRes, subjectsRes, examsRes, resultsRes] = await Promise.all([
          API.get('/students'),
          API.get('/classes'),
          API.get('/subjects'),
          API.get('/exams'),
          API.get('/results')
        ]);

        setStats({
          students: studentsRes.data.students?.length || 0,
          classes: classesRes.data.classes?.length || 0,
          subjects: subjectsRes.data.subjects?.length || 0,
          exams: examsRes.data.exams?.length || 0
        });

        if (examsRes.data.success) setRecentExams(examsRes.data.exams.slice(0, 5));
        if (resultsRes.data.success) setRecentResults(resultsRes.data.results.slice(0, 5));
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Admin Analytics...</div>;
  }

  return (
    <div>
      {/* Header & Quick Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2>Teacher & Administrator Dashboard</h2>
          <p style={{ color: 'var(--text-muted)' }}>Overview of school examinations, enrolled students, and recent submissions.</p>
        </div>
        <button onClick={() => navigate('/admin/exams')} className="btn btn-primary">
          <Plus size={18} /> Create Examination
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <Users />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.students}</div>
            <div className="stat-label">Total Enrolled Students</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon info">
            <GraduationCap />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.classes}</div>
            <div className="stat-label">Active Classes</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <BookOpen />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.subjects}</div>
            <div className="stat-label">Academic Subjects</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <FileSpreadsheet />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.exams}</div>
            <div className="stat-label">Total Examinations</div>
          </div>
        </div>
      </div>

      {/* Recent Activity Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Exams Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Recent Examinations</h3>
            <button onClick={() => navigate('/admin/exams')} className="btn btn-outline btn-sm">
              Manage Exams <ArrowRight size={14} />
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Class</th>
                  <th>Status</th>
                  <th>Questions</th>
                </tr>
              </thead>
              <tbody>
                {recentExams.map((e) => (
                  <tr key={e.id}>
                    <td><strong>{e.title}</strong></td>
                    <td>{e.class_name}</td>
                    <td>
                      <span className={`badge ${e.status === 'published' ? 'badge-published' : 'badge-draft'}`}>
                        {e.status}
                      </span>
                    </td>
                    <td>{e.question_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Submissions Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Recent Exam Submissions</h3>
            <button onClick={() => navigate('/admin/results')} className="btn btn-outline btn-sm">
              View All Results <ArrowRight size={14} />
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Exam</th>
                  <th>Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentResults.map((r) => (
                  <tr key={r.attempt_id}>
                    <td><strong>{r.student_name}</strong></td>
                    <td>{r.exam_title}</td>
                    <td>{r.score}/{r.total_marks} ({r.percentage}%)</td>
                    <td>
                      <span className={`badge ${r.pass_fail_status === 'PASS' ? 'badge-pass' : 'badge-fail'}`}>
                        {r.pass_fail_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
