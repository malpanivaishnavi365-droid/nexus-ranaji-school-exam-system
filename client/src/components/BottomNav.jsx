import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FileSpreadsheet,
  Award,
  UserCheck
} from 'lucide-react';

const BottomNav = () => {
  const items = [
    { to: '/student/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/student/subjects', label: 'Subjects', icon: BookOpen },
    { to: '/student/exams', label: 'Quizzes', icon: FileSpreadsheet },
    { to: '/student/badges', label: 'Badges', icon: Award },
    { to: '/student/profile', label: 'Profile', icon: UserCheck }
  ];

  return (
    <nav className="nres-bottom-nav">
      <div className="nres-bottom-nav-grid">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nres-bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} className="nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
