import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  CheckCircle2,
  Award,
  BookOpen,
  ArrowRight,
  Play,
  Sparkles,
  GraduationCap,
  TrendingUp,
  Clock,
  ChevronRight
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await API.get('/student/dashboard');
        if (res.data.success) {
          setDashboard(res.data.dashboard);
        }
      } catch (err) {
        console.error('Error fetching student dashboard:', err);
        setError('Failed to load dashboard metrics. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        <div className="spinner-border text-primary" role="status" style={{ marginBottom: '1rem' }}></div>
        <p style={{ fontWeight: '600' }}>Loading student portal dashboard...</p>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2.5rem', margin: '2rem 0' }}>
        <h3 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Unable to Load Dashboard</h3>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{error || 'Database connection error.'}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          Retry Loading
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Personalized Welcome Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #3b0764 60%, #4c1d95 100%)',
        color: '#ffffff',
        marginBottom: '1.75rem',
        padding: '2rem 1.75rem',
        borderRadius: '20px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 12px 24px -6px rgba(30, 27, 75, 0.25)'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', padding: '0.3rem 0.75rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            <Sparkles size={14} /> Student Online Portal
          </div>
          <h1 style={{ color: '#ffffff', fontSize: '1.85rem', fontWeight: '800', marginBottom: '0.4rem', fontFamily: 'var(--font-heading)' }}>
            Welcome back, {dashboard.studentName}! 👋
          </h1>
          <p style={{ opacity: 0.9, fontSize: '0.95rem', color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span>Class: <strong>{dashboard.className}</strong></span>
            <span>•</span>
            <span>Student ID: <strong>{dashboard.studentId}</strong></span>
          </p>
        </div>
      </div>

      {/* Overview Dashboard Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <TrendingUp />
          </div>
          <div className="stat-info">
            <div className="stat-value">{dashboard.overallScore}%</div>
            <div className="stat-label">Overall Score</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <CheckCircle2 />
          </div>
          <div className="stat-info">
            <div className="stat-value">{dashboard.testsCompleted}</div>
            <div className="stat-label">Tests Completed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon info">
            <GraduationCap />
          </div>
          <div className="stat-info">
            <div className="stat-value">{dashboard.courseProgress}%</div>
            <div className="stat-label">Course Progress</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <Award />
          </div>
          <div className="stat-info">
            <div className="stat-value">{dashboard.badgesEarned}</div>
            <div className="stat-label">Badges Earned</div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Continue Learning Section */}
        <div className="card">
          <div className="card-title" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="#5b21b6" />
              <span>Continue Learning</span>
            </div>
            <Link to="/student/subjects" style={{ fontSize: '0.85rem', fontWeight: '700', color: '#5b21b6', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              View All <ChevronRight size={16} />
            </Link>
          </div>

          {dashboard.continueLearning.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '1rem 0', textAlign: 'center' }}>
              No active subjects available for your class yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              {dashboard.continueLearning.map((sub) => (
                <div key={sub.subjectId} style={{
                  padding: '1rem 1.15rem',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#1e1b4b' }}>{sub.subjectName}</h4>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Code: {sub.code}</span>
                    </div>
                    <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#5b21b6' }}>
                      {sub.progressPercentage}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.85rem' }}>
                    <div style={{ height: '100%', width: `${sub.progressPercentage}%`, background: 'linear-gradient(90deg, #5b21b6, #f59e0b)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                      Quizzes: {sub.completedQuizzes} / {sub.totalQuizzes} Completed
                    </span>
                    <button
                      onClick={() => navigate(`/student/subjects?subjectId=${sub.subjectId}`)}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '0.35rem 0.85rem' }}
                    >
                      <Play size={14} /> Continue
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Quiz Results */}
        <div className="card">
          <div className="card-title" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="#f59e0b" />
              <span>Recent Quiz Results</span>
            </div>
            <Link to="/student/history" style={{ fontSize: '0.85rem', fontWeight: '700', color: '#5b21b6', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              Full History <ChevronRight size={16} />
            </Link>
          </div>

          {dashboard.recentResults.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b' }}>
              <FileSpreadsheet size={36} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.9rem' }}>You haven't completed any quizzes yet.</p>
              <button onClick={() => navigate('/student/exams')} className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem' }}>
                Take Your First Quiz
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
              {dashboard.recentResults.map((res) => (
                <div key={res.attemptId} style={{
                  padding: '0.9rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justify-content: 'space-between',
                  background: '#ffffff'
                }}>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#1e293b' }}>{res.examTitle}</h4>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                      Subject: <strong>{res.subjectName}</strong> • Score: <strong>{res.score} ({res.percentage}%)</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`badge ${res.status === 'PASS' ? 'badge-pass' : 'badge-fail'}`}>
                      {res.status}
                    </span>
                    <button
                      onClick={() => navigate(`/student/result/${res.attemptId}`)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
