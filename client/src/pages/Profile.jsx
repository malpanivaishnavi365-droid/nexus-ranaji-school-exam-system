import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, GraduationCap, Calendar } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            fontSize: '2rem',
            fontWeight: '800'
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ fontSize: '1.5rem' }}>{user.name}</h2>
          <span className={`badge ${user.role === 'admin' ? 'badge-draft' : 'badge-published'}`} style={{ marginTop: '0.4rem' }}>
            {user.role === 'admin' ? 'Teacher / Administrator' : 'Enrolled Student'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <User size={20} color="var(--primary)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>FULL NAME</div>
              <div style={{ fontSize: '1rem', fontWeight: '600' }}>{user.name}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Mail size={20} color="var(--secondary)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>EMAIL ADDRESS</div>
              <div style={{ fontSize: '1rem', fontWeight: '600' }}>{user.email}</div>
            </div>
          </div>

          {user.role === 'student' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <GraduationCap size={20} color="var(--accent-warning)" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>CLASS / GRADE</div>
                <div style={{ fontSize: '1rem', fontWeight: '600' }}>{user.class_name || 'Unassigned'}</div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Shield size={20} color="var(--accent-success)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>ACCOUNT ROLE</div>
              <div style={{ fontSize: '1rem', fontWeight: '600', textTransform: 'capitalize' }}>{user.role}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
