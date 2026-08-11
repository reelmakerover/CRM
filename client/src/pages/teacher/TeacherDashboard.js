import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiUsers, FiFolder, FiCheckSquare, FiClipboard, FiHelpCircle, 
  FiArrowRight, FiClock, FiCalendar, FiAward, FiAlertTriangle, FiPhoneCall
} from 'react-icons/fi';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [attStats, setAttStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/teachers/my-data'),
      api.get('/attendance/stats')
    ])
      .then(([teacherRes, attRes]) => {
        setData(teacherRes.data);
        setAttStats(attRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <div className="animate-spin h-10 w-10 border-4 border-amber-600 border-t-transparent rounded-full"/>
        <span className="text-slate-500 text-sm font-medium">Loading your faculty portal...</span>
      </div>
    );
  }

  const batches = data?.batches || [];
  const totalStudents = data?.totalStudents || 0;
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-amber-200 border border-white/15">
              <FiCalendar size={13} /> {today}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {user?.name || 'Faculty Member'}! 👋
            </h1>
            <p className="text-amber-100 text-sm max-w-xl">
              {user?.specialization ? `${user.specialization} · ` : ''}Manage your running batches, mark daily student attendance with instant WhatsApp parent alerts, and organize chapter tests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              to="/teacher/attendance" 
              className="bg-white text-amber-900 hover:bg-amber-50 font-bold px-5 py-3 rounded-2xl shadow-lg transition-all flex items-center gap-2 text-sm"
            >
              <FiCheckSquare size={16} /> Take Today's Attendance
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold flex-shrink-0 border border-amber-100">
            <FiFolder />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{batches.length}</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Assigned Batches</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold flex-shrink-0 border border-blue-100">
            <FiUsers />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalStudents}</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Enrolled Students</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold flex-shrink-0 border border-emerald-100">
            <FiCheckSquare />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">{attStats?.totalPresentToday || 0}</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Present Today</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl font-bold flex-shrink-0 border border-rose-100">
            <FiAlertTriangle />
          </div>
          <div>
            <div className="text-2xl font-black text-rose-600">{attStats?.totalAbsentToday || 0}</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Absent Today</div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link 
          to="/teacher/batches" 
          className="card p-6 bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center text-lg font-bold mb-4 group-hover:bg-amber-500 group-hover:text-white transition-colors">
            <FiFolder />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center justify-between">
            <span>Running Batch Folders</span>
            <FiArrowRight className="text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" size={16} />
          </h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            Open batch folders to see student lists, enrollment details, parent contacts & individual attendance %.
          </p>
        </Link>

        <Link 
          to="/teacher/attendance" 
          className="card p-6 bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center text-lg font-bold mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <FiCheckSquare />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center justify-between">
            <span>Daily Attendance & WhatsApp</span>
            <FiArrowRight className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" size={16} />
          </h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            Mark attendance in 10 seconds. Auto-generate personalized WhatsApp alerts to absent students' parents.
          </p>
        </Link>

        <Link 
          to="/teacher/exams" 
          className="card p-6 bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center text-lg font-bold mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <FiClipboard />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center justify-between">
            <span>Chapter-Wise Tests</span>
            <FiArrowRight className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={16} />
          </h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            Create chapter tests, assign question sets, set duration & negative marking rules for your subject.
          </p>
        </Link>
      </div>

      {/* Running Batches Quick Table */}
      <div className="card overflow-hidden bg-white border border-slate-200 shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-slate-900 text-base">Your Assigned Running Batches</h2>
            <p className="text-xs text-slate-500">Live overview of batches and student enrollment</p>
          </div>
          <Link to="/teacher/batches" className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1">
            View All Folders <FiArrowRight size={12}/>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Batch Name</th>
                <th>Course</th>
                <th>Timing</th>
                <th>Enrolled Students</th>
                <th>Today's Attendance</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map(b => {
                const bStat = attStats?.batches?.find(s => s.batchId === b.id);
                const isMarked = bStat?.isMarkedToday;

                return (
                  <tr key={b.id}>
                    <td>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span className="text-amber-500">📁</span> {b.name}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-slate-100 text-slate-700 text-xs font-medium">
                        {b.course?.name || 'General'}
                      </span>
                    </td>
                    <td className="text-xs text-slate-600 font-medium">
                      <div className="flex items-center gap-1"><FiClock size={12} className="text-slate-400"/> {b.timing || 'Regular Batch'}</div>
                    </td>
                    <td>
                      <span className="font-bold text-slate-800 text-sm">{b.students?.length || 0}</span>
                      <span className="text-slate-400 text-xs ml-1">students</span>
                    </td>
                    <td>
                      {isMarked ? (
                        <div className="flex items-center gap-2">
                          <span className="badge bg-emerald-100 text-emerald-800 text-xs font-semibold">
                            ✓ Marked ({bStat.todaySummary.present} Present / {bStat.todaySummary.absent} Absent)
                          </span>
                        </div>
                      ) : (
                        <span className="badge bg-amber-100 text-amber-800 text-xs font-bold animate-pulse">
                          Pending for Today
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/teacher/attendance?batchId=${b.id}`} 
                          className="btn-primary text-xs py-1.5 px-3 rounded-lg shadow-xs flex items-center gap-1"
                        >
                          <FiCheckSquare size={13} /> {isMarked ? 'Review / WhatsApp' : 'Take Attendance'}
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {batches.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No batches currently assigned. Please contact the administrator.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
