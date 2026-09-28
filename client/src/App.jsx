import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import AvailableExams from './pages/AvailableExams';
import ExamInstructions from './pages/ExamInstructions';
import ExamPage from './pages/ExamPage';
import ResultPage from './pages/ResultPage';
import ExamHistory from './pages/ExamHistory';
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import StudentMgmt from './pages/StudentMgmt';
import ClassMgmt from './pages/ClassMgmt';
import SubjectMgmt from './pages/SubjectMgmt';
import ExamMgmt from './pages/ExamMgmt';
import QuestionMgmt from './pages/QuestionMgmt';
import AdminResults from './pages/AdminResults';

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Student Suite Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<DashboardLayout />}>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="exams" element={<AvailableExams />} />
              <Route path="instructions/:id" element={<ExamInstructions />} />
              <Route path="exam/:id" element={<ExamPage />} />
              <Route path="result/:id" element={<ResultPage />} />
              <Route path="history" element={<ExamHistory />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Admin / Teacher Suite Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<DashboardLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<StudentMgmt />} />
              <Route path="classes" element={<ClassMgmt />} />
              <Route path="subjects" element={<SubjectMgmt />} />
              <Route path="exams" element={<ExamMgmt />} />
              <Route path="questions" element={<QuestionMgmt />} />
              <Route path="results" element={<AdminResults />} />
            </Route>
          </Route>

          {/* Fallback Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
