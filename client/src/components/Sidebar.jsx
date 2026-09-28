import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  FileSpreadsheet,
  HelpCircle,
  Award,
  Clock,
  UserCheck,
  FileText,
  Bell,
  LogOut
} from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  const { user, logout } = useAuth();
  if (!user) return null;

  const isAdmin = user.role === 'admin';

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/classes', label: 'Classes', icon: GraduationCap },
    { to: '/admin/subjects', label: 'Subjects', icon: BookOpen },
    { to: '/admin/exams', label: 'Examinations', icon: FileSpreadsheet },
    { to: '/admin/questions', label: 'Question Bank', icon: HelpCircle },
    { to: '/admin/results', label: 'Results & Leaderboard', icon: Award }
  ];

  const studentLinks = [
    { to: '/student/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/student/subjects', label: 'Subjects', icon: BookOpen },
    { to: '/student/exams', label: 'Quizzes', icon: FileSpreadsheet },
    { to: '/student/study-material', label: 'Study Material', icon: FileText },
    { to: '/student/badges', label: 'Badges', icon: Award },
    { to: '/student/certificate', label: 'Certificates', icon: GraduationCap },
    { to: '/student/notifications', label: 'Notifications', icon: Bell },
    { to: '/student/profile', label: 'Profile', icon: UserCheck }
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <aside style={{
      width: isOpen ? '240px' : '0px',
      transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      background: 'var(--bg-sidebar)',
      color: '#ffffff',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justify-content: 'space-between',
      minHeight: 'calc(100vh - 64px)',
      boxShadow: '2px 0 8px rgba(0,0,0,0.05)'
    }}>
      <div style={{ padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: '700',
          letterSpacing: '0.05em',
          color: '#94a3b8',
          textTransform: 'uppercase',
          padding: '0 0.75rem 0.5rem 0.75rem'
        }}>
          {isAdmin ? 'Faculty Navigation' : 'Student Navigation'}
        </div>

        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                color: isActive ? '#ffffff' : '#94a3b8',
                background: isActive ? 'var(--primary)' : 'transparent',
                fontWeight: isActive ? '700' : '500',
                fontSize: '0.9rem',
                textDecoration: 'none',
                transition: 'all 0.15s ease'
              })}
            >
              <Icon size={18} />
              <span style={{ whiteSpace: 'nowrap' }}>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          onClick={logout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#fca5a5',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.88rem'
          }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
