import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CoursesPage from './pages/CoursesPage';
import BatchesPage from './pages/BatchesPage';
import ResultsPage from './pages/ResultsPage';
import ContactPage from './pages/ContactPage';
import BlogsPage from './pages/BlogsPage';
import BlogDetailPage from './pages/BlogDetailPage';
import TestSeriesPage from './pages/TestSeriesPage';
import LecturesPage from './pages/LecturesPage';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminCourses from './pages/admin/AdminCourses';
import AdminBatches from './pages/admin/AdminBatches';
import AdminExams from './pages/admin/AdminExams';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminResults from './pages/admin/AdminResults';
import AdminToppers from './pages/admin/AdminToppers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminBlogs from './pages/admin/AdminBlogs';
import AdminLeads from './pages/admin/AdminLeads';
import AdminExamKits from './pages/admin/AdminExamKits';
import AdminLectures from './pages/admin/AdminLectures';

// Super Admin Pages
import SuperAdminLayout from './components/superadmin/SuperAdminLayout';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import ManageAdmins from './pages/superadmin/ManageAdmins';
import WebsiteContentManager from './pages/superadmin/WebsiteContentManager';
import SuperAdminProfile from './pages/superadmin/SuperAdminProfile';

// Super Pro Admin Pages
import SuperProAdminLayout from './components/superproadmin/SuperProAdminLayout';
import SuperProAdminDashboard from './pages/superproadmin/SuperProAdminDashboard';
import ManageSuperAdmins from './pages/superproadmin/ManageSuperAdmins';

// Student Pages
import StudentLayout from './components/student/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentExams from './pages/student/StudentExams';
import ExamRoom from './pages/student/ExamRoom';
import StudentResults from './pages/student/StudentResults';
import StudentProfile from './pages/student/StudentProfile';
import StudentLectures from './pages/student/StudentLectures';

const ProtectedRoute = ({ children, adminOnly = false, superadminOnly = false, superproadminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full"/></div>;
  if (!user) return <Navigate to="/login" replace />;
  
  if (superproadminOnly && user.role !== 'superproadmin') return <Navigate to="/" replace />;
  if (superadminOnly && !['superadmin', 'superproadmin'].includes(user.role)) return <Navigate to="/" replace />;
  if (adminOnly && !['admin', 'superadmin', 'superproadmin'].includes(user.role)) return <Navigate to="/student/dashboard" replace />;
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    if (user.role === 'superproadmin') return <Navigate to="/superproadmin/dashboard" replace />;
    if (user.role === 'superadmin') return <Navigate to="/superadmin/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', background: '#1e293b', color: '#f1f5f9' } }} />
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/lectures" element={<LecturesPage />} />
          <Route path="/store" element={<TestSeriesPage />} />
          <Route path="/test-series" element={<TestSeriesPage />} />
          <Route path="/batches" element={<BatchesPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="exam-kits" element={<AdminExamKits />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="batches" element={<AdminBatches />} />
            <Route path="exams" element={<AdminExams />} />
            <Route path="questions" element={<AdminQuestions />} />
            <Route path="results" element={<AdminResults />} />
            <Route path="toppers" element={<AdminToppers />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="blogs" element={<AdminBlogs />} />
            <Route path="content" element={<WebsiteContentManager />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="lectures" element={<AdminLectures />} />
          </Route>

          {/* Super Admin */}
          <Route path="/superadmin" element={<ProtectedRoute superadminOnly><SuperAdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="admins" element={<ManageAdmins />} />
            <Route path="content" element={<WebsiteContentManager />} />
            <Route path="profile" element={<SuperAdminProfile />} />
          </Route>

          {/* Super Pro Admin */}
          <Route path="/superproadmin" element={<ProtectedRoute superproadminOnly><SuperProAdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SuperProAdminDashboard />} />
            <Route path="superadmins" element={<ManageSuperAdmins />} />
            <Route path="admins" element={<ManageAdmins />} />
            <Route path="content" element={<WebsiteContentManager />} />
            <Route path="profile" element={<SuperAdminProfile />} />
          </Route>

          {/* Student */}
          <Route path="/student" element={<ProtectedRoute><StudentLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="exams" element={<StudentExams />} />
            <Route path="results" element={<StudentResults />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="lectures" element={<StudentLectures />} />
          </Route>
          <Route path="/student/exam/:examId" element={<ProtectedRoute><ExamRoom /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
