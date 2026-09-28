import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  UserCheck,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
  BookOpen,
  Award,
  FileText,
  CheckCircle2,
  BarChart3,
  HelpCircle,
  KeyRound,
  Sparkles,
  X,
  Building
} from 'lucide-react';

const Login = () => {
  const [activeRole, setActiveRole] = useState('student'); // 'student' | 'faculty'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals for Help and Forgot Password
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const { studentLogin, facultyLogin } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Input Validation
    if (!username || !username.trim()) {
      setError(activeRole === 'student' ? 'Please enter your Student ID.' : 'Please enter your Faculty ID.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      if (activeRole === 'student') {
        const res = await studentLogin(username, password);
        if (res && res.success) {
          navigate('/student/dashboard');
        }
      } else {
        const res = await facultyLogin(username, password);
        if (res && res.success) {
          navigate('/admin/dashboard');
        }
      }
    } catch (err) {
      if (!err.response) {
        setError('Unable to connect to the server. Please check your network connection.');
      } else if (err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(
          activeRole === 'student'
            ? 'Invalid Student ID or Password.'
            : 'Invalid Faculty ID or Password.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Demo Quick Fill Helpers
  const fillDemoStudent = () => {
    setActiveRole('student');
    setUsername('john@student.com');
    setPassword('student123');
    setError('');
  };

  const fillDemoTeacher = () => {
    setActiveRole('faculty');
    setUsername('teacher@school.com');
    setPassword('teacher123');
    setError('');
  };

  const fillDemoAdmin = () => {
    setActiveRole('faculty');
    setUsername('admin@school.com');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="nres-login-page">
      <div className="nres-login-wrapper">
        {/* LEFT COLUMN: School Branding & Promotional Panel */}
        <div className="nres-promo-panel">
          <div className="nres-promo-pattern" />

          <div className="nres-promo-header">
            <div className="nres-promo-badge">
              <Sparkles size={14} /> Nexus Ranaji School Portal
            </div>

            <h1 className="nres-school-title">
              NEXUS RANAJI<br />
              <span>ENGLISH SCHOOL</span>
            </h1>

            <p className="nres-promo-motto">
              Learn • Practice • Perform • Achieve
            </p>

            <div className="nres-feature-list">
              <div className="nres-feature-item">
                <div className="nres-feature-icon">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="nres-feature-title">Online Examinations</div>
                  <div className="nres-feature-desc">
                    Real-time online tests, automated timekeeper & secure exam hall
                  </div>
                </div>
              </div>

              <div className="nres-feature-item">
                <div className="nres-feature-icon">
                  <BookOpen size={20} />
                </div>
                <div>
                  <div className="nres-feature-title">Study Materials & Notes</div>
                  <div className="nres-feature-desc">
                    Comprehensive syllabus resources, question banks & revision guides
                  </div>
                </div>
              </div>

              <div className="nres-feature-item">
                <div className="nres-feature-icon">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <div className="nres-feature-title">Instant Results & Analytics</div>
                  <div className="nres-feature-desc">
                    Immediate scorecard generation, rank tracking & detailed review
                  </div>
                </div>
              </div>

              <div className="nres-feature-item">
                <div className="nres-feature-icon">
                  <Award size={20} />
                </div>
                <div>
                  <div className="nres-feature-title">Certificates & Progress</div>
                  <div className="nres-feature-desc">
                    Performance badges, digital merit certificates & academic growth logs
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="nres-promo-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} style={{ color: '#fbbf24' }} />
              <span>Institutional Portal Code: <strong>NRES-2026</strong></span>
            </div>
            <span>Estd. 2026</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Sign-In Form Section */}
        <div className="nres-form-section">
          <div>
            <div className="nres-form-header">
              <div className="nres-logo-emblem">
                <Building size={32} />
              </div>
              <h2 className="nres-portal-title">
                {activeRole === 'student' ? 'Student Sign-In' : 'Faculty Sign-In'}
              </h2>
              <p className="nres-portal-subtitle">
                {activeRole === 'student'
                  ? 'Sign in to access your online exams & study portal'
                  : 'Sign in to manage classes, examinations & grade evaluation'}
              </p>
            </div>

            {/* Login Type Switcher */}
            <div className="nres-tab-switcher">
              <button
                type="button"
                className={`nres-tab-btn ${activeRole === 'student' ? 'active' : ''}`}
                onClick={() => handleRoleChange('student')}
              >
                <GraduationCap size={18} className="tab-icon" />
                <span>Student Login</span>
              </button>
              <button
                type="button"
                className={`nres-tab-btn ${activeRole === 'faculty' ? 'active' : ''}`}
                onClick={() => handleRoleChange('faculty')}
              >
                <UserCheck size={18} className="tab-icon" />
                <span>Faculty Login</span>
              </button>
            </div>

            {/* Error Notification Alert */}
            {error && (
              <div className="nres-error-alert">
                <ShieldAlert size={20} style={{ minWidth: '20px' }} />
                <span>{error}</span>
              </div>
            )}

            {/* Sign-In Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="nres-field-group">
                <label className="nres-label">
                  {activeRole === 'student' ? 'Username / Student ID' : 'Username / Faculty ID'}
                </label>
                <div className="nres-input-wrapper">
                  <input
                    type="text"
                    className="nres-input"
                    placeholder={
                      activeRole === 'student'
                        ? 'Enter Student ID or Email'
                        : 'Enter Faculty ID or Email'
                    }
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                  {activeRole === 'student' ? (
                    <GraduationCap size={20} className="nres-input-icon" />
                  ) : (
                    <UserCheck size={20} className="nres-input-icon" />
                  )}
                </div>
              </div>

              <div className="nres-field-group">
                <label className="nres-label">Password</label>
                <div className="nres-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="nres-input"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <Lock size={20} className="nres-input-icon" />
                  <button
                    type="button"
                    className="nres-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="nres-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>SIGN IN</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Auxiliary Options: Forgot Password & Help */}
            <div className="nres-aux-row">
              <button
                type="button"
                className="nres-aux-link"
                onClick={() => setShowForgotModal(true)}
              >
                Forgot Password?
              </button>
              <button
                type="button"
                className="nres-aux-link"
                onClick={() => setShowHelpModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <HelpCircle size={15} /> Need Help?
              </button>
            </div>

            {/* Demo Accounts Quick Fill Bar */}
            <div className="nres-demo-bar">
              <div className="nres-demo-label">DEMO QUICK ACCESS</div>
              <div className="nres-demo-btns">
                <button type="button" className="nres-demo-chip" onClick={fillDemoStudent}>
                  🎓 Student Demo
                </button>
                <button type="button" className="nres-demo-chip" onClick={fillDemoTeacher}>
                  👨‍🏫 Teacher Demo
                </button>
              </div>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="nres-footer-text">
            <strong>Nexus Ranaji English School</strong> • Online Examination & Learning Portal<br />
            © 2026 Nexus Ranaji English School. All rights reserved.
          </div>
        </div>
      </div>

      {/* HELP MODAL */}
      {showHelpModal && (
        <div className="modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #2e1065, #4c1d95)', color: '#fff' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontSize: '1.15rem' }}>
                <HelpCircle size={20} style={{ color: '#fbbf24' }} /> Portal Sign-In Help
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem', fontSize: '0.9rem', color: '#334155' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ color: '#1e1b4b', marginBottom: '0.4rem', fontSize: '0.95rem' }}>
                  🎓 Student Access Guidance
                </h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  Use your assigned Student ID or registered email. Default passwords can be obtained from your class teacher or the school administrative office.
                </p>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ color: '#1e1b4b', marginBottom: '0.4rem', fontSize: '0.95rem' }}>
                  👨‍🏫 Faculty Access Guidance
                </h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  Faculty members must log in via the Faculty Login tab using their staff credentials. Access is restricted to authorized teaching and administrative personnel.
                </p>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong>Technical Support Helpline:</strong><br />
                📧 Email: support@nexusranaji.edu.in<br />
                📞 Desk: +91 (020) 2456-7890 (Mon-Sat, 8 AM - 5 PM)
              </div>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowHelpModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #2e1065, #4c1d95)', color: '#fff' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontSize: '1.15rem' }}>
                <KeyRound size={20} style={{ color: '#fbbf24' }} /> Password Recovery
              </h3>
              <button
                onClick={() => setShowForgotModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem', fontSize: '0.9rem', color: '#334155' }}>
              <p style={{ marginBottom: '1rem', color: '#475569' }}>
                For security reasons in the Examination Portal, automated online password reset is managed through your institution administrator.
              </p>

              <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', padding: '1rem', borderRadius: '10px', marginBottom: '1rem' }}>
                <strong style={{ color: '#92400e', display: 'block', marginBottom: '0.3rem' }}>
                  Recovery Instructions:
                </strong>
                <ul style={{ paddingLeft: '1.2rem', color: '#b45309', fontSize: '0.85rem' }}>
                  <li><strong>Students:</strong> Please contact your Class Teacher or IT Department to request a password reset ticket.</li>
                  <li><strong>Faculty:</strong> Contact the System Administrator or Vice Principal's Office.</li>
                </ul>
              </div>

              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Ensure you carry your valid School Identification Card when requesting password reset verification.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowForgotModal(false)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
