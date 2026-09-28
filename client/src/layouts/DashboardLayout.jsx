import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  return (
    <div className="app-container">
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div style={{ display: 'flex', flex: 1 }}>
          <Sidebar isOpen={sidebarOpen} />
          <main className="main-content">
            <div className="content-body">
              <Outlet />
            </div>
          </main>
        </div>
        {user && user.role === 'student' && <BottomNav />}
      </div>
    </div>
  );
};

export default DashboardLayout;
