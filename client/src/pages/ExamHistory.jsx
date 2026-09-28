import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Clock, Award, Eye, FileSpreadsheet } from 'lucide-react';

const ExamHistory = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get('/results');
        if (res.data.success) {
          setResults(res.data.results);
        }
      } catch (err) {
        console.error('Error fetching exam history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading exam history...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>My Examination History</h2>
        <p style={{ color: 'var(--text-muted)' }}>Review your past examination submissions, scores, and detailed answer evaluations.</p>
      </div>

      {results.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <Clock size={48} color="var(--text-light)" style={{ marginBottom: '1rem' }} />
          <h3>No Examination Records</h3>
          <p style={{ color: 'var(--text-muted)' }}>You haven't completed any examinations yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Exam Title</th>
                <th>Subject</th>
                <th>Class</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Status</th>
                <th>Date Taken</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.attempt_id}>
                  <td><strong>{r.exam_title}</strong></td>
                  <td>{r.subject_name}</td>
                  <td>{r.class_name}</td>
                  <td>{r.score} / {r.total_marks}</td>
                  <td><strong>{r.percentage}%</strong></td>
                  <td>
                    <span className={`badge ${r.pass_fail_status === 'PASS' ? 'badge-pass' : 'badge-fail'}`}>
                      {r.pass_fail_status}
                    </span>
                  </td>
                  <td>{r.end_time ? new Date(r.end_time).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <button
                      onClick={() => navigate(`/student/result/${r.attempt_id}`)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Eye size={14} /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExamHistory;
