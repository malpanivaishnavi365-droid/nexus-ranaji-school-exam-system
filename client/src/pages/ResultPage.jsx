import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { Award, CheckCircle, XCircle, HelpCircle, ArrowLeft, Clock } from 'lucide-react';

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resultData, setResultData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await API.get(`/results/${id}`);
        if (res.data.success) {
          setResultData(res.data.result);
          setQuestions(res.data.questionBreakdown || []);
        }
      } catch (err) {
        console.error('Error fetching result:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Calculating evaluation score...</div>;
  }

  if (!resultData) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Result attempt not found.</div>;
  }

  const isPass = resultData.pass_fail_status === 'PASS';

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <button onClick={() => navigate('/student/history')} className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem' }}>
        <ArrowLeft size={16} /> Back to Exam History
      </button>

      {/* Main Result Scorecard Banner */}
      <div className="card" style={{
        textAlign: 'center',
        padding: '2.5rem 1.5rem',
        marginBottom: '2rem',
        borderTop: `6px solid ${isPass ? 'var(--accent-success)' : 'var(--accent-danger)'}`
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: isPass ? 'var(--accent-success-bg)' : 'var(--accent-danger-bg)',
          color: isPass ? 'var(--accent-success)' : 'var(--accent-danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem auto'
        }}>
          <Award size={40} />
        </div>

        <span className={`badge ${isPass ? 'badge-pass' : 'badge-fail'}`} style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>
          {isPass ? 'PASSED EXAMINATION' : 'FAILED EXAMINATION'}
        </span>

        <h1 style={{ fontSize: '2rem', marginTop: '0.75rem', marginBottom: '0.25rem' }}>
          {resultData.exam_title}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Subject: <strong>{resultData.subject_name}</strong> | Student: <strong>{resultData.student_name}</strong>
        </p>

        {/* Circular Percentage / Score Counter */}
        <div style={{
          margin: '2rem auto 1rem auto',
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          border: `4px solid ${isPass ? 'var(--accent-success)' : 'var(--accent-danger)'}`,
          background: '#ffffff',
          boxShadow: 'var(--shadow-md)'
        }}>
          <span style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
            {resultData.percentage}%
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {resultData.score} / {resultData.total_marks} Marks
          </span>
        </div>

        {/* Score Breakdown Summary Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '1rem',
          marginTop: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>{resultData.total_questions}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Questions</div>
          </div>

          <div style={{ background: 'var(--primary-light)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--primary)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)' }}>{resultData.attempted}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--primary-dark)' }}>Attempted</div>
          </div>

          <div style={{ background: 'var(--accent-success-bg)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--accent-success)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-success)' }}>{resultData.correct}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-success)' }}>Correct</div>
          </div>

          <div style={{ background: 'var(--accent-danger-bg)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--accent-danger)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-danger)' }}>{resultData.incorrect}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-danger)' }}>Incorrect</div>
          </div>

          <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-muted)' }}>{resultData.unanswered}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Unanswered</div>
          </div>
        </div>
      </div>

      {/* Question Response Breakdown Section */}
      <div className="card">
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
          Detailed Answer Review
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {questions.map((q, idx) => {
            const isCorrect = q.is_correct;
            const selectedOpt = q.selected_option;

            return (
              <div key={q.id} style={{
                padding: '1.25rem',
                borderRadius: '10px',
                border: `1px solid ${isCorrect ? 'var(--accent-success)' : selectedOpt ? 'var(--accent-danger)' : 'var(--border-light)'}`,
                background: isCorrect ? 'var(--accent-success-bg)' : selectedOpt ? 'var(--accent-danger-bg)' : '#ffffff'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Q{idx + 1}. {q.question_text}</span>
                  {isCorrect ? (
                    <span className="badge badge-pass"><CheckCircle size={14} /> Correct (+{q.marks_obtained})</span>
                  ) : selectedOpt ? (
                    <span className="badge badge-fail"><XCircle size={14} /> Incorrect (0)</span>
                  ) : (
                    <span className="badge badge-warning"><HelpCircle size={14} /> Unanswered</span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.875rem' }}>
                  {['A', 'B', 'C', 'D'].map((optKey) => {
                    const optVal = q[`option_${optKey.toLowerCase()}`];
                    const isUserChoice = selectedOpt === optKey;
                    const isRightChoice = q.correct_option === optKey;

                    let bg = '#ffffff';
                    let border = 'var(--border-light)';

                    if (isRightChoice) {
                      bg = '#d1fae5';
                      border = 'var(--accent-success)';
                    } else if (isUserChoice && !isCorrect) {
                      bg = '#fee2e2';
                      border = 'var(--accent-danger)';
                    }

                    return (
                      <div key={optKey} style={{
                        padding: '0.6rem 0.875rem',
                        borderRadius: '6px',
                        background: bg,
                        border: `1px solid ${border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span><strong>{optKey}:</strong> {optVal}</span>
                        {isUserChoice && <span style={{ fontSize: '0.7rem', fontWeight: '800' }}>(Your Answer)</span>}
                        {isRightChoice && <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--accent-success)' }}>✓ Correct</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
