import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { ShieldCheck, Clock, AlertTriangle, ArrowLeft, Play } from 'lucide-react';

const ExamInstructions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await API.get(`/exams/${id}`);
        if (res.data.success) {
          setExam(res.data.exam);
        }
      } catch (err) {
        console.error('Error fetching exam instructions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id]);

  const handleStartExam = async () => {
    if (!agreed) return;
    setStarting(true);
    try {
      const res = await API.post(`/exams/${id}/start`);
      if (res.data.success) {
        navigate(`/student/exam/${id}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start examination.');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading examination details...</div>;
  }

  if (!exam) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Exam not found.</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate('/student/exams')} className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem' }}>
        <ArrowLeft size={16} /> Back to Exams
      </button>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
          <span className="badge badge-published" style={{ marginBottom: '0.5rem' }}>{exam.subject_name}</span>
          <h1 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>{exam.title}</h1>
          <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            <span>Class: <strong>{exam.class_name}</strong></span>
            <span>Duration: <strong>{exam.duration} Minutes</strong></span>
            <span>Total Marks: <strong>{exam.total_marks}</strong></span>
          </div>
        </div>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck color="var(--primary)" /> Examination Rules & Instructions
        </h3>

        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.925rem', color: 'var(--text-main)' }}>
            <li>
              <strong>Multiple Choice Questions:</strong> Each question has 4 options (A, B, C, D) with only 1 correct answer.
            </li>
            <li>
              <strong>Navigation:</strong> You can move back and forth between questions using the <em>Previous</em>, <em>Next</em>, or side <em>Question Navigation Palette</em>.
            </li>
            <li>
              <strong>Mark for Review:</strong> If you are unsure of an answer, click <em>Mark for Review</em> to highlight the question chip in orange.
            </li>
            <li>
              <strong>Countdown Timer:</strong> A persistent timer will display at the top right of your screen. The timer continues running even if you switch questions.
            </li>
            <li>
              <strong>Automatic Submission:</strong> When the countdown timer reaches zero (00:00), the examination will automatically terminate and submit your saved responses.
            </li>
            <li>
              <strong>Network & Page Refresh:</strong> Do not refresh or exit the browser window during an active examination.
            </li>
          </ul>
        </div>

        <div style={{
          background: 'var(--accent-warning-bg)',
          border: '1px solid var(--accent-warning)',
          color: '#92400e',
          padding: '1rem',
          borderRadius: '8px',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
          marginBottom: '1.5rem',
          fontSize: '0.875rem'
        }}>
          <AlertTriangle size={24} style={{ shrink: 0 }} />
          <span>
            Please ensure you have a stable internet connection before launching the exam. Clicking <strong>Begin Examination</strong> starts your official timer.
          </span>
        </div>

        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <input
            type="checkbox"
            id="agree-checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="agree-checkbox" style={{ fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>
            I have carefully read and agree to all the examination rules and instructions above.
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            onClick={() => navigate('/student/exams')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleStartExam}
            disabled={!agreed || starting}
            className="btn btn-success btn-lg"
          >
            {starting ? 'Initializing Exam Engine...' : <><Play size={18} /> Begin Examination</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamInstructions;
