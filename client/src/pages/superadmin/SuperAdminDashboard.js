import React, { useState, useEffect } from 'react';
import { FiShield, FiUsers, FiActivity, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({ totalAdmins: 0, totalStudents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/superadmin/stats')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Super Admin Dashboard</h1>
        <p className="text-slate-500">System overview and control center.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card p-6 flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center text-xl">
              <FiShield />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500">Total Admins</div>
              <div className="text-2xl font-bold text-slate-900">{stats.totalAdmins}</div>
            </div>
          </div>
          <Link to="/superadmin/admins" className="mt-auto flex items-center gap-2 text-sm text-rose-600 font-medium hover:gap-3 transition-all">
            Manage Admins <FiArrowRight />
          </Link>
        </div>

        <div className="card p-6 flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl">
              <FiUsers />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500">Total Students</div>
              <div className="text-2xl font-bold text-slate-900">{stats.totalStudents}</div>
            </div>
          </div>
          <div className="mt-auto text-sm text-slate-400">Registered across all courses</div>
        </div>
      </div>
      
      <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl" />
        <h2 className="text-xl font-bold mb-2 relative z-10">System Status: Online</h2>
        <p className="text-slate-400 relative z-10">D's Education ERP is running smoothly.</p>
      </div>
    </div>
  );
}
