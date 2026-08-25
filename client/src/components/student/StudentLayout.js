import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { FiHome, FiClipboard, FiBarChart2, FiUser, FiLogOut, FiMenu, FiX, FiBook, FiVideo, FiGift, FiLayers, FiZap } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { icon: <FiHome />, label: 'Dashboard', path: '/student/dashboard' },
  { icon: <FiClipboard />, label: 'Start Test', path: '/student/exams', badge: 'Free' },
  { icon: <FiLayers />, label: 'Enroll in Course', path: '/student/courses', badge: 'Join' },
  { icon: <FiBarChart2 />, label: 'My Results', path: '/student/results' },
  { icon: <FiVideo />, label: 'Video Lectures', path: '/student/lectures' },
  { icon: <FiUser />, label: 'Profile', path: '/student/profile' },
];

export default function StudentLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, student, logout } = useAuth();
  const navigate = useNavigate();

  const isEnrolled = Boolean(student?.batchId || student?.batch?.name || student?.courseId || student?.course?.name);

  const filteredNav = NAV.filter(item => {
    if (!isEnrolled) {
      // Unenrolled students: show Dashboard, Video Lectures, Demo Tests, Enroll in Course, Profile
      return ['/student/dashboard', '/student/lectures', '/student/exams', '/student/courses', '/student/profile'].includes(item.path);
    }
    // Enrolled students: hide "Enroll in Course", show all active features
    if (isEnrolled && item.path === '/student/courses') return false;
    return true;
  });

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/'); };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Nav */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <FiBook className="text-white text-sm" />
            </div>
            <div>
              <div className="font-display font-bold text-primary-900 text-sm">D's Education</div>
              <div className="text-primary-500 text-xs">Student Portal</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {filteredNav.map(item => (
              <NavLink key={item.path} to={item.path}
                className={({ isActive }) => `flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all relative ${
                  isActive 
                    ? 'bg-primary-600 text-white' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-primary-700'
                }`}>
                {item.icon} {item.label}
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                    item.badge === 'Free' 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-amber-400 text-slate-950'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold">
                {user?.name?.[0]}
              </div>
              <div className="hidden md:block">
                <div className="text-slate-800 text-sm font-medium">{user?.name}</div>
                <div className="text-slate-400 text-xs">{student?.enrollmentNo || 'Student'}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-slate-500 hover:text-rose-600 text-sm transition-colors">
              <FiLogOut size={16}/> <span className="hidden md:block">Logout</span>
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-slate-600 p-1">
              {mobileOpen ? <FiX size={20}/> : <FiMenu size={20}/>}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 px-4 py-3 flex flex-col gap-1">
            {filteredNav.map(item => (
              <NavLink key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${isActive ? 'bg-primary-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
                {item.icon} {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
