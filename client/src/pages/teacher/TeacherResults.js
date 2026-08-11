import React, { useEffect, useState } from 'react';
import { FiBarChart2, FiAward, FiFilter, FiSearch, FiCheckCircle, FiXCircle, FiTrendingUp } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function TeacherResults() {
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [filterExam, setFilterExam] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    try {
      const params = {};
      if (filterExam) params.exam = filterExam;
      const [rRes, exRes] = await Promise.all([
        api.get('/results', { params }),
        api.get('/exams')
      ]);
      setResults(rRes.data || []);
      setExams(exRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load student exam results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [filterExam]);

  const filtered = results.filter(r => {
    const sName = r.student?.name || r.studentName || '';
    const eTitle = r.exam?.title || '';
    const roll = r.student?.enrollmentNo || r.enrollmentNo || '';
    const q = search.toLowerCase();
    return sName.toLowerCase().includes(q) || eTitle.toLowerCase().includes(q) || roll.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FiBarChart2 className="text-amber-600" /> Student Test Results
          </h1>
          <p className="text-slate-500 text-sm">
            View student assessment scores, rank percentages, and pass/fail distribution
          </p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="card p-4 bg-white border border-slate-200 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <FiFilter className="text-slate-400" />
          <select 
            value={filterExam} 
            onChange={e => setFilterExam(e.target.value)} 
            className="input py-2 text-xs font-semibold w-auto min-w-56"
          >
            <option value="">All Tests ({exams.length} available)</option>
            {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title} ({ex.chapter || 'General'})</option>)}
          </select>
        </div>

        <div className="relative w-full max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input 
            type="text" 
            placeholder="Search student or roll no..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9 py-2 text-xs w-full bg-slate-50"
          />
        </div>
      </div>

      {/* Results Table */}
      <div className="card overflow-hidden bg-white border border-slate-200">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-amber-600 border-t-transparent rounded-full"/>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Exam & Chapter</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Status</th>
                <th>Attempt Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const sName = r.student?.name || r.studentName || 'Student';
                const roll = r.student?.enrollmentNo || r.enrollmentNo || `STU-${r.studentId}`;
                const eTitle = r.exam?.title || 'Chapter Test';
                const eChap = r.exam?.chapter || 'General';
                const pct = r.percentage !== undefined ? Math.round(r.percentage) : Math.round((r.marksObtained / (r.totalMarks || 1)) * 100);
                const isPass = r.status === 'pass' || pct >= 40;

                return (
                  <tr key={r.id || i}>
                    <td className="text-slate-400 text-xs font-mono">{i + 1}</td>
                    <td>
                      <div className="font-bold text-slate-900 text-sm">{sName}</div>
                      <div className="text-slate-400 text-xs font-mono">{roll}</div>
                    </td>
                    <td>
                      <div className="font-medium text-slate-800 text-xs">{eTitle}</div>
                      <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        📂 {eChap}
                      </span>
                    </td>
                    <td>
                      <div className="font-bold text-slate-900 text-sm">{r.marksObtained} / {r.totalMarks}</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${isPass ? 'bg-emerald-500' : 'bg-rose-500'}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${isPass ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge text-xs font-semibold flex items-center gap-1 w-fit ${
                        isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isPass ? <FiCheckCircle size={12}/> : <FiXCircle size={12}/>}
                        {isPass ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                    <td className="text-xs text-slate-500">
                      {new Date(r.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                    No student results recorded yet for this selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
