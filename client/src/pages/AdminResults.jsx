import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Award, Search, Filter, ArrowUpDown, Eye, Trophy } from 'lucide-react';

const AdminResults = () => {
  const [results, setResults] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, Filters & Sorting
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [examFilter, setExamFilter] = useState('');
  const [sortBy, setSortBy] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchFilteredResults();
  }, [classFilter, subjectFilter, examFilter, sortBy]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [classesRes, subjectsRes, examsRes, leaderboardRes] = await Promise.all([
        API.get('/classes'),
        API.get('/subjects'),
        API.get('/exams'),
        API.get('/results/leaderboard')
      ]);

      if (classesRes.data.success) setClasses(classesRes.data.classes);
      if (subjectsRes.data.success) setSubjects(subjectsRes.data.subjects);
      if (examsRes.data.success) setExams(examsRes.data.exams);
      if (leaderboardRes.data.success) setLeaderboard(leaderboardRes.data.leaderboard);

      await fetchFilteredResults();
    } catch (err) {
      console.error('Error fetching admin results data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredResults = async () => {
    try {
      const params = {};
      if (classFilter) params.class_id = classFilter;
      if (subjectFilter) params.subject_id = subjectFilter;
      if (examFilter) params.exam_id = examFilter;
      if (sortBy) params.sort_by = sortBy;

      const res = await API.get('/results', { params });
      if (res.data.success) setResults(res.data.results);
    } catch (err) {
      console.error('Error filtering results:', err);
    }
  };

  const filteredResults = results.filter(r => {
    return r.student_name.toLowerCase().includes(search.toLowerCase()) ||
           r.exam_title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2>Master Results & Performance Analytics</h2>
          <p style={{ color: 'var(--text-muted)' }}>Analyze student exam performances, filter records, and view top ranking leaderboards.</p>
        </div>
      </div>

      {/* Top Performers Leaderboard Widget */}
      {leaderboard.length > 0 && (
        <div className="card" style={{
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
            <Trophy size={24} color="#f59e0b" />
            <h3 style={{ color: '#ffffff', fontSize: '1.2rem' }}>Top Performers Leaderboard</h3>
          </div>

          <div className="table-container" style={{ background: 'transparent', border: 'none' }}>
            <table className="data-table" style={{ color: '#ffffff' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <th style={{ color: '#94a3b8' }}>Rank</th>
                  <th style={{ color: '#94a3b8' }}>Student</th>
                  <th style={{ color: '#94a3b8' }}>Class</th>
                  <th style={{ color: '#94a3b8' }}>Exam</th>
                  <th style={{ color: '#94a3b8' }}>Top Marks</th>
                  <th style={{ color: '#94a3b8' }}>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((lb) => (
                  <tr key={lb.student_id + lb.exam_title} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td>
                      <span className="badge" style={{
                        background: lb.rank === 1 ? '#f59e0b' : lb.rank === 2 ? '#94a3b8' : lb.rank === 3 ? '#b45309' : 'rgba(255,255,255,0.2)',
                        color: '#ffffff'
                      }}>
                        #{lb.rank}
                      </span>
                    </td>
                    <td><strong style={{ color: '#ffffff' }}>{lb.student_name}</strong></td>
                    <td>{lb.class_name}</td>
                    <td>{lb.exam_title}</td>
                    <td><strong>{lb.top_score} Marks</strong></td>
                    <td><strong style={{ color: '#10b981' }}>{lb.top_percentage}%</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by student name or exam title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
        </div>

        <select className="form-select" value={classFilter} onChange={(e) => setClassFilter(e.target.value)} style={{ width: '150px' }}>
          <option value="">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
        </select>

        <select className="form-select" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} style={{ width: '150px' }}>
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
        </select>

        <select className="form-select" value={examFilter} onChange={(e) => setExamFilter(e.target.value)} style={{ width: '180px' }}>
          <option value="">All Examinations</option>
          {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>

        <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: '180px' }}>
          <option value="">Sort By (Default)</option>
          <option value="marks_desc">Marks: High to Low</option>
          <option value="marks_asc">Marks: Low to High</option>
          <option value="percentage_desc">Percentage: High to Low</option>
        </select>
      </div>

      {/* Results Data Table */}
      {loading ? (
        <div>Loading exam results...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Exam Title</th>
                <th>Subject</th>
                <th>Attempted</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No exam results found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredResults.map((r) => (
                  <tr key={r.attempt_id}>
                    <td><strong>{r.student_name}</strong><br/><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.student_email}</span></td>
                    <td>{r.class_name}</td>
                    <td>{r.exam_title}</td>
                    <td>{r.subject_name}</td>
                    <td>{r.attempted} / {r.total_questions}</td>
                    <td><strong>{r.score}</strong> / {r.total_marks}</td>
                    <td><strong>{r.percentage}%</strong></td>
                    <td>
                      <span className={`badge ${r.pass_fail_status === 'PASS' ? 'badge-pass' : 'badge-fail'}`}>
                        {r.pass_fail_status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => navigate(`/student/result/${r.attempt_id}`)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Eye size={14} /> Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminResults;
