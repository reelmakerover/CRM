import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiBook, FiCalendar, FiClipboard, FiTrendingUp, FiDollarSign, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../utils/api';

const StatCard = ({ icon, label, value, sub, color, link }) => (
  <Link to={link || '#'} className={`card p-6 flex items-center gap-4 group ${link ? 'cursor-pointer' : ''}`}>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-slate-500 text-sm">{label}</div>
      <div className="text-slate-900 font-bold text-2xl">{value ?? '—'}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
    {link && <FiArrowRight className="text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all flex-shrink-0" />}
  </Link>
);

const PIE_COLORS = ['#2563eb', '#f59e0b', '#10b981', '#8b5cf6'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/students/stats'),
      api.get('/students?limit=5'),
      api.get('/batches'),
      api.get('/exams'),
    ]).then(([statsRes, studentsRes, batchesRes, examsRes]) => {
      setStats({
        ...statsRes.data,
        batches: batchesRes.data.length,
        exams: examsRes.data.length,
        activeBatches: batchesRes.data.filter(b => b.status === 'active').length,
      });
      setRecentStudents(studentsRes.data.slice(0, 6));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const feeData = [
    { name: 'Collected', value: stats.feeStats?.paidAmount || 0 },
    { name: 'Pending', value: stats.feeStats?.pendingAmount || 0 },
  ];



  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm mt-1">D's Education ERP — Welcome back, Admin</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<FiUsers className="text-primary-600" />} label="Total Students" value={stats.total} sub={`${stats.active} active`} color="bg-primary-50" link="/admin/students" />
        <StatCard icon={<FiCalendar className="text-emerald-600" />} label="Active Batches" value={stats.activeBatches} sub={`${stats.batches} total`} color="bg-emerald-50" link="/admin/batches" />
        <StatCard icon={<FiClipboard className="text-violet-600" />} label="Total Exams" value={stats.exams} sub="Mock tests created" color="bg-violet-50" link="/admin/exams" />
        <StatCard icon={<FiDollarSign className="text-gold-600" />} label="Fee Collected" value={`₹${((stats.feeStats?.paidAmount || 0)/1000).toFixed(0)}K`} sub={`₹${((stats.feeStats?.pendingAmount || 0)/1000).toFixed(0)}K pending`} color="bg-yellow-50" link="/admin/students" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-6">Student Enrollment Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.enrollmentTrend || []} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="students" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-800 mb-6">Fee Collection</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={feeData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                {feeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={v => `₹${v.toLocaleString()}`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {feeData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i] }} />
                <span className="text-slate-600">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Students + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Students */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-800">Recent Students</h3>
            <Link to="/admin/students" className="text-primary-600 text-sm hover:underline flex items-center gap-1">
              View All <FiArrowRight className="text-xs" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Fees Status</th>
                  <th>Enrolled</th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.length > 0 ? recentStudents.map(s => (
                  <tr key={s.id} className="hover:bg-primary-50/30">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {s.name[0]}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 text-sm">{s.name}</div>
                          <div className="text-slate-400 text-xs">{s.enrollmentNo}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="text-sm">{s.course?.name || '—'}</span></td>
                    <td>
                      <span className={`badge text-xs ${s.fees?.pendingAmount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {s.fees?.pendingAmount > 0 ? `₹${s.fees.pendingAmount} due` : 'Paid'}
                      </span>
                    </td>
                    <td><span className="text-xs text-slate-500">{new Date(s.createdAt).toLocaleDateString('en-IN')}</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="text-center py-8 text-slate-400">No students yet. <Link to="/admin/students" className="text-primary-600 hover:underline">Add students →</Link></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-800 mb-5">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { icon: <FiUsers className="text-primary-600" />, label: 'Add New Student', path: '/admin/students', color: 'bg-primary-50 hover:bg-primary-100' },
              { icon: <FiBook className="text-violet-600" />, label: 'Create Exam', path: '/admin/exams', color: 'bg-violet-50 hover:bg-violet-100' },
              { icon: <FiCalendar className="text-emerald-600" />, label: 'Add Batch', path: '/admin/batches', color: 'bg-emerald-50 hover:bg-emerald-100' },
              { icon: <FiTrendingUp className="text-gold-600" />, label: 'View Results', path: '/admin/results', color: 'bg-yellow-50 hover:bg-yellow-100' },
              { icon: <FiAlertCircle className="text-rose-600" />, label: 'Send Notification', path: '/admin/notifications', color: 'bg-rose-50 hover:bg-rose-100' },
            ].map((a, i) => (
              <Link key={i} to={a.path} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${a.color}`}>
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">{a.icon}</div>
                <span className="text-slate-700 text-sm font-medium">{a.label}</span>
                <FiArrowRight className="ml-auto text-slate-400 text-sm" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
