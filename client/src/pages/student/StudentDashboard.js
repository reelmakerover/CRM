// StudentDashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiClipboard, FiBarChart2, FiAward, FiDollarSign, FiArrowRight, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function StudentDashboard() {
  const { user, student } = useAuth();
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);

  useEffect(() => {
    api.get('/results').then(r => setResults(r.data.slice(0, 5))).catch(() => {});
    api.get('/exams').then(r => setExams(r.data.filter(e => e.status === 'active').slice(0, 3))).catch(() => {});
  }, []);

  const bestResult = results.reduce((best, r) => (!best || r.percentage > best.percentage) ? r : best, null);
  const pendingFees = student?.fees?.pendingAmount || 0;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-200 text-sm mb-1">Welcome back,</p>
            <h1 className="font-display text-2xl font-bold">{user?.name}</h1>
            <p className="text-primary-300 text-sm mt-1">{student?.course?.name} · {student?.batch?.name || 'No batch assigned'}</p>
            <p className="text-primary-400 text-xs mt-0.5">ID: {student?.enrollmentNo}</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl font-bold">
            {user?.name?.[0]}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <FiClipboard className="text-primary-600" />, label: 'Exams Taken', value: results.length, color: 'bg-primary-50' },
          { icon: <FiBarChart2 className="text-emerald-600" />, label: 'Best Score', value: bestResult ? `${bestResult.percentage?.toFixed(0)}%` : '—', color: 'bg-emerald-50' },
          { icon: <FiAward className="text-gold-600" />, label: 'Best Rank', value: bestResult?.rank ? `#${bestResult.rank}` : '—', color: 'bg-yellow-50' },
          { icon: <FiDollarSign className={pendingFees > 0 ? 'text-rose-600' : 'text-emerald-600'} />, label: 'Fee Pending', value: `₹${pendingFees}`, color: pendingFees > 0 ? 'bg-rose-50' : 'bg-emerald-50' },
        ].map((s, i) => (
          <div key={i} className="card p-5 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>{s.icon}</div>
            <div>
              <div className="text-slate-500 text-xs">{s.label}</div>
              <div className="font-bold text-slate-900">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Fee Alert */}
      {pendingFees > 0 && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
          <FiAlertCircle className="text-rose-600 flex-shrink-0" />
          <div>
            <div className="font-semibold text-rose-800 text-sm">Fee Payment Due</div>
            <div className="text-rose-700 text-sm">₹{pendingFees} is outstanding. Please contact admin to clear your dues.</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Available Exams */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Available Exams</h2>
            <Link to="/student/exams" className="text-primary-600 text-xs hover:underline flex items-center gap-1">View all <FiArrowRight size={12}/></Link>
          </div>
          {exams.length > 0 ? (
            <div className="space-y-3">
              {exams.map(e => (
                <Link key={e.id} to={`/student/exam/${e.id}`} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-primary-300 hover:bg-primary-50 transition-all group">
                  <div>
                    <div className="font-medium text-slate-900 text-sm">{e.title}</div>
                    <div className="text-slate-400 text-xs">{e.questionsPerExam} questions · {e.duration} min</div>
                  </div>
                  <span className="text-primary-600 group-hover:translate-x-1 transition-transform"><FiArrowRight size={14}/></span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">No active exams at the moment</div>
          )}
        </div>

        {/* Recent Results */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Recent Results</h2>
            <Link to="/student/results" className="text-primary-600 text-xs hover:underline flex items-center gap-1">View all <FiArrowRight size={12}/></Link>
          </div>
          {results.length > 0 ? (
            <div className="space-y-3">
              {results.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div>
                    <div className="font-medium text-slate-900 text-sm">{r.exam?.title || r.subject?.name}</div>
                    <div className="text-slate-400 text-xs">{new Date(r.submittedAt).toLocaleDateString('en-IN')}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary-700">{r.percentage?.toFixed(0)}%</div>
                    <span className={`badge text-xs ${r.status === 'pass' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{r.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">No results yet. Take an exam!</div>
          )}
        </div>
      </div>
    </div>
  );
}
