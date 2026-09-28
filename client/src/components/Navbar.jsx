import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Shield, BookOpen, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      height: '64px',
      background: '#ffffff',
      borderBottom: '1px solid var(--border-light)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSidebar}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #4c1d95 0%, #2e1065 100%)',
            color: '#fbbf24',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            boxShadow: '0 2px 8px rgba(76, 29, 149, 0.3)'
          }}>
            <BookOpen size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#1e1b4b', lineHeight: 1.1 }}>
              Nexus Ranaji <span style={{ color: '#6d28d9' }}>English School</span>
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: '600', color: '#64748b', letterSpacing: '0.02em' }}>
              Online Examination & Learning Portal
            </span>
          </div>

        </div>
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>{user.name}</span>
            <span className={`badge ${user.role === 'admin' ? 'badge-draft' : 'badge-published'}`} style={{ fontSize: '0.65rem', alignSelf: 'flex-end' }}>
              {user.role === 'admin' ? 'Teacher / Admin' : `Student ${user.class_name ? `(${user.class_name})` : ''}`}
            </span>
          </div>

          <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
