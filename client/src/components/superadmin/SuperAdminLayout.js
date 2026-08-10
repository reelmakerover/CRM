import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  FiShield, FiHome, FiActivity, FiLogOut, FiMenu, FiX, FiChevronRight, FiLayout, FiUser
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { icon: <FiHome />, label: 'Dashboard', path: '/superadmin/dashboard' },
  { icon: <FiShield />, label: 'Manage Admins', path: '/superadmin/admins' },
  { icon: <FiLayout />, label: 'Content Manager', path: '/superadmin/content' },
  { icon: <FiUser />, label: 'Profile & Security', path: '/superadmin/profile' },
];

export default function SuperAdminLayout() {
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
      <div className={`p-5 border-b border-white/10 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-rose-700 rounded-xl flex items-center justify-center flex-shrink-0">
          <FiShield className="text-white text-lg" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-sm">D's Education</div>
            <div className="text-rose-300 text-xs font-medium">SUPER ADMIN</div>
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map(item => (
          <NavLink key={item.path} to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active bg-white/10' : 'hover:bg-white/5 text-white/70'} ${collapsed ? 'justify-center px-2' : ''} flex items-center gap-3 p-3 rounded-lg transition-all`}>
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            {!collapsed && <FiChevronRight className="ml-auto text-xs opacity-40" />}
          </NavLink>
        ))}
      </nav>

      <div className={`p-3 border-t border-white/10 ${collapsed ? '' : ''}`}>
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.name?.[0]}
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-medium truncate">{user?.name}</div>
              <div className="text-rose-300 text-xs">Super Admin</div>
            </div>
          </div>
        )}
        <button onClick={handleLogout}
          className={`w-full flex items-center gap-3 p-3 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all ${collapsed ? 'justify-center px-2' : ''}`}>
          <FiLogOut className="flex-shrink-0 text-lg" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <aside className={`hidden lg:flex flex-col bg-slate-900 transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-16' : 'w-64'}`}>
        <SidebarContent />
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-full bg-slate-800 text-white p-1.5 rounded-r-lg shadow-lg hover:bg-slate-700 transition-all z-10">
          {collapsed ? <FiChevronRight className="text-xs" /> : <FiX className="text-xs" />}
        </button>
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-slate-900 flex flex-col">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-slate-600 hover:text-rose-600">
              <FiMenu size={22} />
            </button>
            <div>
              <div className="text-slate-800 font-semibold">Super Admin Control Panel</div>
              <div className="text-slate-400 text-xs">D's Education System Center</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-rose-600 flex items-center justify-center text-white text-xs font-bold">{user?.name?.[0]}</div>
              <span className="text-slate-700 text-sm font-medium">{user?.name}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
