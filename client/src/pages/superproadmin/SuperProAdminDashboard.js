import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiUsers, FiUserCheck, FiZap, FiArrowRight, FiLock, FiKey, FiCpu } from 'react-icons/fi';
import api from '../../utils/api';

export default function SuperProAdminDashboard() {
  const [stats, setStats] = useState({ totalSuperAdmins: 0, totalAdmins: 0, totalStudents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/superproadmin/stats')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-8 text-white shadow-2xl overflow-hidden border border-amber-500/20">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-500/30">
            <FiZap className="text-amber-400" /> Root Super Pro Admin Console
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome to Super Pro Admin Control Center</h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            You hold root authority in the system. You can create, edit, manage, and change passwords for all Super Admins, while monitoring real-time credentials.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Super Admins</span>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold">
                <FiZap />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{stats.totalSuperAdmins}</div>
            <p className="text-slate-500 text-xs mt-1">Super Admins under your management</p>
          </div>
          <Link to="/superproadmin/superadmins" className="mt-6 flex items-center gap-2 text-sm text-amber-600 font-bold hover:gap-3 transition-all">
            Manage Super Admins <FiArrowRight />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Standard Admins</span>
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl font-bold">
                <FiShield />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{stats.totalAdmins}</div>
            <p className="text-slate-500 text-xs mt-1">Operational system administrators</p>
          </div>
          <Link to="/superproadmin/admins" className="mt-6 flex items-center gap-2 text-sm text-rose-600 font-bold hover:gap-3 transition-all">
            View Admins <FiArrowRight />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Students</span>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
                <FiUsers />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{stats.totalStudents}</div>
            <p className="text-slate-500 text-xs mt-1">Enrolled CRM students</p>
          </div>
          <div className="mt-6 text-xs text-slate-400 font-medium">System Wide Active Users</div>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl font-bold flex-shrink-0">
            <FiKey />
          </div>
          <div>
            <h3 className="font-bold text-lg">Super Admin Password & Security Control</h3>
            <p className="text-slate-400 text-xs">Directly inspect and update any Super Admin password whenever needed.</p>
          </div>
        </div>
        <Link to="/superproadmin/superadmins" className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 whitespace-nowrap">
          Open Password Manager
        </Link>
      </div>
    </div>
  );
}
