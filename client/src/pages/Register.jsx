
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { BookOpen, UserPlus, ShieldAlert } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [classId, setClassId] = useState('');
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await API.get('/classes');

        if (res.data.success) {
          setClasses(res.data.classes || []);

          if (res.data.classes && res.data.classes.length > 0) {
            setClassId(String(res.data.classes[0].id));
          }
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError('Unable to load classes.');
      }
    };

    fetchClasses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!classId) {
      setError('Please select a class.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        class_id: classId,
        role: 'student'
      });

      navigate('/student/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        padding: '1.5rem'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2.5rem',
          borderRadius: '16px'
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              background: 'var(--primary)',
              color: '#fff',
              padding: '0.8rem',
              borderRadius: '12px',
              marginBottom: '0.75rem'
            }}
          >
            <BookOpen size={28} />
          </div>

          <h2
            style={{
              fontSize: '1.75rem',
              color: 'var(--text-main)',
              margin: 0
            }}
          >
            Student Registration
          </h2>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              marginTop: '0.25rem'
            }}
          >
            Create an account to take online examinations
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: 'var(--accent-danger-bg)',
              color: 'var(--accent-danger)',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem'
            }}
          >
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">
              Full Name
            </label>

            <input
              type="text"
              className="form-input"
              placeholder="e.g. Alice Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">
              Email Address
            </label>

            <input
              type="email"
              className="form-input"
              placeholder="alice@student.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Assign Class */}
          <div className="form-group">
            <label className="form-label">
              Assign Class
            </label>

            <select
              className="form-select"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              required
            >
              <option value="">
                -- Select Class --
              </option>

              {classes.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                >
                  {c.class_name}
                </option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">
              Password
            </label>

            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !classId}
            style={{
              width: '100%',
              marginTop: '0.5rem',
              padding: '0.8rem'
            }}
          >
            {loading ? (
              'Creating Account...'
            ) : (
              <>
                <UserPlus size={18} />
                Register Now
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div
          style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            fontSize: '0.875rem'
          }}
        >
          Already registered?{' '}
          <Link
            to="/login"
            style={{ fontWeight: '700' }}
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};



export default Register;

