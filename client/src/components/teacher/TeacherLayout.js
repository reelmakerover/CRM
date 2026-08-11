import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  FiHome, FiFolder, FiCheckSquare, FiClipboard, FiHelpCircle,
  FiBarChart2, FiLogOut, FiMenu, FiX, FiChevronRight, FiUser,
  FiBookOpen, FiCalendar, FiUsers
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { icon: <FiHome />, label: 'Dashboard', path: '/teacher/dashboard' },
  { icon: <FiFolder />, label: 'Running Batches', path: '/teacher/batches' },
  { icon: <FiCheckSquare />, label: 'Daily Attendance & WhatsApp', path: '/teacher/attendance' },
  { icon: <FiClipboard />, label: 'Chapter Tests', path: '/teacher/exams' },
  { icon: <FiHelpCircle />, label: 'Question Bank', path: '/teacher/questions' },
  { icon: <FiBarChart2 />, label: 'Student Results', path: '/teacher/results' },
];

export default function TeacherLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200">
      {/* Header / Logo */}
      <div className={`p-5 border-b border-slate-800 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
          <FiBookOpen className="text-white text-lg" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-sm tracking-tight">D's Education</div>
            <div className="text-amber-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Faculty Portal
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {NAV.map(item => (
          <NavLink 
            key={item.path} 
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                isActive 
                  ? 'bg-amber-500 text-white font-semibold shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              } ${collapsed ? 'justify-center px-2' : ''}`
            }
          >
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && <FiChevronRight className="ml-auto text-xs opacity-40" />}
          </NavLink>
        ))}
      </nav>

      {/* Teacher Profile Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-inner">
            {user?.name?.[0]?.toUpperCase() || 'T'}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-white text-xs font-bold truncate">{user?.name || 'Faculty Member'}</div>
              <div className="text-slate-400 text-[11px] truncate">{user?.specialization || user?.email}</div>
            </div>
          )}
        </div>

        <button 
          onClick={handleLogout}
          className={`mt-3 w-full flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Logout"
        >
          <FiLogOut size={15} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-100 font-sans">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
        <div className="fixed inset-y-0 left-0 z-30 flex flex-col transition-all duration-300 w-inherit">
          <div className={`h-full flex flex-col ${collapsed ? 'w-20' : 'w-64'}`}>
            <SidebarContent />
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 max-w-xs flex-1 flex flex-col h-full bg-slate-900 z-10 shadow-2xl">
            <button 
              onClick={() => setMobileOpen(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <FiX size={20} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 shadow-xs">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileOpen(true)} 
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <FiMenu size={20} />
            </button>
            <button 
              onClick={() => setCollapsed(!collapsed)} 
              className="hidden md:flex p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <FiMenu size={18} />
            </button>
            <div className="text-sm font-semibold text-slate-800">
              Teacher & Faculty Dashboard
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-full text-xs font-semibold text-amber-900">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active Session: <strong>{user?.name}</strong></span>
            </div>
          </div>
        </header>

        {/* Page Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
