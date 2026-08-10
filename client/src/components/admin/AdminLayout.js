import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  FiBook, FiHome, FiUsers, FiLayers, FiCalendar, FiClipboard,
  FiHelpCircle, FiBarChart2, FiAward, FiBell, FiSettings,
  FiLogOut, FiMenu, FiX, FiChevronRight, FiFileText, FiLayout,
  FiPhoneCall, FiGift, FiVideo
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { icon: <FiHome />, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: <FiGift />, label: 'Exam Kits & Store', path: '/admin/exam-kits' },
  { icon: <FiPhoneCall />, label: 'Telecaller & Leads', path: '/admin/leads' },
  { icon: <FiUsers />, label: 'Students', path: '/admin/students' },
  { icon: <FiBook />, label: 'Courses', path: '/admin/courses' },
  { icon: <FiVideo />, label: 'Lectures', path: '/admin/lectures' },
  { icon: <FiCalendar />, label: 'Batches', path: '/admin/batches' },
  { icon: <FiClipboard />, label: 'Exams', path: '/admin/exams' },
  { icon: <FiHelpCircle />, label: 'Questions', path: '/admin/questions' },
  { icon: <FiBarChart2 />, label: 'Student Exam Results', path: '/admin/results' },
  { icon: <FiAward />, label: 'Toppers', path: '/admin/toppers' },
  { icon: <FiBell />, label: 'Notifications', path: '/admin/notifications' },
  { icon: <FiFileText />, label: 'Blogs', path: '/admin/blogs' },
  { icon: <FiLayout />, label: 'Website Content', path: '/admin/content' },
  { icon: <FiSettings />, label: 'Settings', path: '/admin/settings' },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`p-5 border-b border-white/10 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <FiBook className="text-white text-lg" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-sm">D's Education</div>
            <div className="text-primary-400 text-xs">Admin Panel</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.filter(item => {
          if (user?.role === 'superadmin' || user?.role === 'admin') return true;
          if (item.label === 'Dashboard') return true;
          return user?.permissions?.includes(item.label.toLowerCase());
        }).map(item => (
          <NavLink key={item.path} to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}>
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="text-sm">{item.label}</span>}
            {!collapsed && <FiChevronRight className="ml-auto text-xs opacity-40" />}
          </NavLink>
        ))}

        {/* Quick Actions for Sidebar */}
        {!collapsed && (user?.role === 'superadmin' || user?.role === 'admin') && (
          <div className="mt-8 px-4 pb-4">
            <div className="text-[10px] font-bold text-primary-400 uppercase tracking-wider mb-4 opacity-50 px-2">Quick Actions</div>
            <div className="space-y-2">
              <NavLink to="/admin/students" className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs text-white/70 hover:bg-white/5 hover:text-white transition-all">
                <div className="w-6 h-6 rounded bg-primary-500/20 flex items-center justify-center text-primary-400"><FiUsers size={12} /></div>
                <span>New Student</span>
              </NavLink>
              <NavLink to="/admin/exams" className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs text-white/70 hover:bg-white/5 hover:text-white transition-all">
                <div className="w-6 h-6 rounded bg-violet-500/20 flex items-center justify-center text-violet-400"><FiClipboard size={12} /></div>
                <span>Create Exam</span>
              </NavLink>
              <NavLink to="/admin/notifications" className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs text-white/70 hover:bg-white/5 hover:text-white transition-all">
                <div className="w-6 h-6 rounded bg-rose-500/20 flex items-center justify-center text-rose-400"><FiBell size={12} /></div>
                <span>Send Notice</span>
              </NavLink>
              <NavLink to="/admin/batches" className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs text-white/70 hover:bg-white/5 hover:text-white transition-all">
                <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-400"><FiCalendar size={12} /></div>
                <span>Add Batch</span>
              </NavLink>
              <NavLink to="/admin/results" className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs text-white/70 hover:bg-white/5 hover:text-white transition-all">
                <div className="w-6 h-6 rounded bg-gold-500/20 flex items-center justify-center text-gold-400"><FiBarChart2 size={12} /></div>
                <span>View Results</span>
              </NavLink>
            </div>
          </div>
        )}
      </nav>

      {/* User */}
      <div className={`p-3 border-t border-white/10 ${collapsed ? '' : ''}`}>
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.name?.[0]}
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-medium truncate">{user?.name}</div>
              <div className="text-primary-400 text-xs">Administrator</div>
            </div>
          </div>
        )}
        <button onClick={handleLogout}
          className={`sidebar-link w-full text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 ${collapsed ? 'justify-center px-2' : ''}`}>
          <FiLogOut className="flex-shrink-0" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col bg-gradient-to-b from-primary-900 via-primary-800 to-primary-900 transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-16' : 'w-64'}`}>
        <SidebarContent />
        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-full bg-primary-700 text-white p-1.5 rounded-r-lg shadow-lg hover:bg-primary-600 transition-all z-10">
          {collapsed ? <FiChevronRight className="text-xs" /> : <FiX className="text-xs" />}
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-gradient-to-b from-primary-900 via-primary-800 to-primary-900 flex flex-col">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-slate-600 hover:text-primary-600">
              <FiMenu size={22} />
            </button>
            <div>
              <div className="text-slate-800 font-semibold">Admin Dashboard</div>
              <div className="text-slate-400 text-xs">D's Education ERP</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">{user?.name?.[0]}</div>
              <span className="text-slate-700 text-sm font-medium">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
