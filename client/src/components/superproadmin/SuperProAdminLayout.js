import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  FiShield, FiHome, FiLogOut, FiMenu, FiX, FiChevronRight, FiLayout, FiUser, FiZap, FiUsers
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { icon: <FiHome />, label: 'Dashboard', path: '/superproadmin/dashboard' },
  { icon: <FiZap />, label: 'Manage Super Admins', path: '/superproadmin/superadmins' },
  { icon: <FiShield />, label: 'Manage Admins', path: '/superproadmin/admins' },
  { icon: <FiLayout />, label: 'Content Manager', path: '/superproadmin/content' },
  { icon: <FiUser />, label: 'Profile & Security', path: '/superproadmin/profile' },
];

export default function SuperProAdminLayout() {
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
    <div className="flex flex-col h-full bg-slate-950 text-white">
      <div className={`p-5 border-b border-amber-500/20 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 via-amber-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
          <FiZap className="text-white text-xl animate-pulse" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-sm tracking-wide">D's Education</div>
            <div className="text-amber-400 text-[11px] font-extrabold tracking-widest uppercase flex items-center gap-1">
              <span>SUPER PRO ADMIN</span>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map(item => (
          <NavLink key={item.path} to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-300 border-l-4 border-amber-400' : 'hover:bg-white/5 text-slate-400 hover:text-white'} ${collapsed ? 'justify-center px-2' : ''} flex items-center gap-3 p-3 rounded-lg transition-all`}>
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            {!collapsed && <FiChevronRight className="ml-auto text-xs opacity-40" />}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2 bg-white/5 rounded-xl border border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow">
              {user?.name?.[0]}
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-semibold truncate">{user?.name}</div>
              <div className="text-amber-400 text-[10px] font-bold">Super Pro Admin</div>
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
      <aside className={`hidden lg:flex flex-col bg-slate-950 transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-16' : 'w-64'} shadow-2xl relative z-20`}>
        <SidebarContent />
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-amber-500 text-slate-950 p-1.5 rounded-full shadow-lg hover:bg-amber-400 transition-all z-30">
          {collapsed ? <FiChevronRight className="text-xs font-bold" /> : <FiX className="text-xs font-bold" />}
        </button>
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-slate-950 flex flex-col">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-md">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-slate-300 hover:text-amber-400">
              <FiMenu size={22} />
            </button>
            <div>
              <div className="text-white font-bold text-base flex items-center gap-2">
                <span>Super Pro Admin Central Control</span>
                <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-extrabold bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 rounded-full">
                  ROOT PRIVILEGES
                </span>
              </div>
              <div className="text-slate-400 text-xs">Full System Control & Super Admin Management</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-xl shadow-inner">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 text-xs font-black shadow">
                {user?.name?.[0]}
              </div>
              <span className="text-slate-200 text-sm font-semibold">{user?.name}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-slate-900/5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
