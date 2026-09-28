import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, Clock, HelpCircle, Award, Play } from 'lucide-react';

const AvailableExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await API.get('/exams');
        if (res.data.success) {
          setExams(res.data.exams);
        }
      } catch (err) {
        console.error('Failed to fetch available exams:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading available examinations...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>Available Examinations</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Examinations published for your enrolled class. Click "Start Exam" to read instructions and proceed.
        </p>
      </div>

      {exams.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <FileSpreadsheet size={48} color="var(--text-light)" style={{ marginBottom: '1rem' }} />
          <h3>No Examinations Available</h3>
          <p style={{ color: 'var(--text-muted)' }}>There are currently no active exams scheduled for your class.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {exams.map((exam) => (
            <div key={exam.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className="badge badge-published">{exam.subject_name}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{exam.class_name}</span>
                </div>

                <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>{exam.title}</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} color="var(--primary)" />
                    <span>Duration: <strong>{exam.duration} Minutes</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <HelpCircle size={16} color="var(--secondary)" />
                    <span>Questions: <strong>{exam.question_count} MCQs</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Award size={16} color="var(--accent-warning)" />
                    <span>Total Marks: <strong>{exam.total_marks}</strong> (Passing: {exam.passing_marks})</span>
                  </div>
                </div>
              </div>

              <div>
                {exam.attempt && exam.attempt.status === 'completed' ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--accent-success-bg)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-success)' }}>
                      Attempted ({exam.attempt.percentage}%)
                    </span>
                    <button
                      onClick={() => navigate(`/student/result/${exam.attempt.attempt_id}`)}
                      className="btn btn-secondary btn-sm"
                    >
                      View Score
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => navigate(`/student/instructions/${exam.id}`)}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    <Play size={16} /> Start Examination
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableExams;
