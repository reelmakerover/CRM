import React, { useEffect, useState } from 'react';
import { FiBarChart2, FiAward, FiFilter, FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiSave, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY_RESULT = {
  studentId: '',
  examId: '',
  courseId: '',
  marksObtained: '',
  totalMarks: 100,
  grade: 'A+',
  status: 'pass',
  studentName: '',
  enrollmentNo: ''
};

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  
  const [filterExam, setFilterExam] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('list'); // list | leaderboard
  
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_RESULT);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchResults = async () => {
    try {
      const params = {};
      if (filterExam) params.exam = filterExam;
      const endpoint = view === 'leaderboard' ? '/results/leaderboard' : '/results';
      const r = await api.get(endpoint, { params });
      setResults(r.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load exam results');
    }
  };

  const fetchDependencies = async () => {
    try {
      const [eRes, sRes, cRes] = await Promise.all([
        api.get('/exams').catch(() => ({ data: [] })),
        api.get('/students').catch(() => ({ data: [] })),
        api.get('/courses').catch(() => ({ data: [] }))
      ]);
      setExams(eRes.data || []);
      setStudents(sRes.data || []);
      setCourses(cRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchResults();
  }, [filterExam, view]);

  const openAdd = () => {
    setForm(EMPTY_RESULT);
    setEditing(null);
    setModal(true);
  };

  const openEdit = (r) => {
    setForm({
      studentId: r.studentId || r.student?.id || '',
      examId: r.examId || r.exam?.id || '',
      courseId: r.courseId || r.course?.id || '',
      marksObtained: r.marksObtained ?? 0,
      totalMarks: r.totalMarks ?? 100,
      grade: r.grade || 'A+',
      status: r.status || 'pass',
      studentName: r.student?.name || '',
      enrollmentNo: r.student?.enrollmentNo || ''
    });
    setEditing(r);
    setModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/results/${editing.id}`, form);
        toast.success('Result updated successfully!');
      } else {
        await api.post('/results', form);
        toast.success('Student exam result added successfully!');
      }
      fetchResults();
      setModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save exam result');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this result?')) return;
    try {
      await api.delete(`/results/${id}`);
      toast.success('Result deleted');
      fetchResults();
    } catch (err) {
      toast.error('Failed to delete result');
    }
  };

  const gradeColor = { 
    'A+': 'bg-emerald-100 text-emerald-700 border-emerald-200', 
    'A': 'bg-teal-100 text-teal-700 border-teal-200', 
    'B+': 'bg-blue-100 text-blue-700 border-blue-200', 
    'B': 'bg-primary-100 text-primary-700 border-primary-200', 
    'C': 'bg-yellow-100 text-yellow-700 border-yellow-200', 
    'F': 'bg-rose-100 text-rose-700 border-rose-200' 
  };

  const filteredResults = results.filter(r => {
    const studentName = r.student?.name || '';
    const enrollment = r.student?.enrollmentNo || '';
    const examTitle = r.exam?.title || r.subject?.name || '';
    const q = search.toLowerCase();
    return studentName.toLowerCase().includes(q) || enrollment.toLowerCase().includes(q) || examTitle.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Students Exam Results</h1>
          <p className="text-slate-500 text-sm">View, publish & manage exam scores and rankings for all students.</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <FiPlus /> Add Student Result
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 card p-4">
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-1">
            <button 
              onClick={() => setView('list')} 
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${view === 'list' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <FiBarChart2 size={14} /> All Results
            </button>
            <button 
              onClick={() => setView('leaderboard')} 
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${view === 'leaderboard' ? 'bg-white text-gold-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <FiAward size={14} /> Leaderboard / Rank
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by student name or roll no..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="input pl-9 text-xs py-2 w-full" 
            />
          </div>

          <div className="flex items-center gap-2">
            <FiFilter className="text-slate-400" size={14} />
            <select 
              value={filterExam} 
              onChange={e => setFilterExam(e.target.value)} 
              className="input py-2 text-xs w-auto min-w-[180px]"
            >
              <option value="">All Exams</option>
              {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              {view === 'leaderboard' && <th className="w-16">Rank</th>}
              <th>Student Name</th>
              <th>Exam / Subject</th>
              <th>Marks Score</th>
              <th>Percentage</th>
              <th>Grade</th>
              <th>Status</th>
              <th>Date</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((r, i) => (
              <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                {view === 'leaderboard' && (
                  <td>
                    <span className={`font-bold text-base px-2.5 py-1 rounded-full ${
                      i === 0 ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                      i === 1 ? 'bg-slate-200 text-slate-700' :
                      i === 2 ? 'bg-orange-100 text-orange-700' : 'text-slate-500'
                    }`}>
                      #{r.rank || i + 1}
                    </span>
                  </td>
                )}
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                      {r.student?.name?.[0] || 'S'}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-900">{r.student?.name || 'Student'}</div>
                      <div className="text-xs text-slate-400">{r.student?.enrollmentNo || 'DSE2026'}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="text-sm font-medium text-slate-800">{r.exam?.title || r.subject?.name || 'Commerce Assessment'}</div>
                  <div className="text-xs text-slate-400">{r.course?.name || 'Class 12th Commerce'}</div>
                </td>
                <td>
                  <div className="text-sm font-bold text-slate-900">{r.marksObtained} / {r.totalMarks || 100}</div>
                </td>
                <td>
                  <div className="text-sm font-semibold text-primary-700">
                    {(r.percentage ?? ((r.marksObtained / (r.totalMarks || 100)) * 100)).toFixed(1)}%
                  </div>
                </td>
                <td>
                  <span className={`badge border text-xs px-2.5 py-0.5 font-bold ${gradeColor[r.grade] || 'bg-slate-100 text-slate-600'}`}>
                    {r.grade || 'A+'}
                  </span>
                </td>
                <td>
                  <span className={`badge text-xs flex items-center gap-1 w-max ${
                    r.status === 'pass' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {r.status === 'pass' ? <FiCheckCircle size={12}/> : <FiXCircle size={12}/>}
                    {r.status === 'pass' ? 'Passed' : 'Failed'}
                  </span>
                </td>
                <td className="text-xs text-slate-500">
                  {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}
                </td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button 
                      onClick={() => openEdit(r)} 
                      className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Edit Result"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(r.id)} 
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Result"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredResults.length === 0 && (
              <tr>
                <td colSpan={view === 'leaderboard' ? 9 : 8} className="text-center py-12 text-slate-400">
                  <FiBarChart2 className="mx-auto text-slate-300 text-3xl mb-2" />
                  No student exam results found. Click "+ Add Student Result" to record new marks!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Result Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b bg-slate-50">
              <h2 className="font-bold text-slate-900 text-lg">{editing ? 'Edit Exam Result' : 'Add Student Exam Result'}</h2>
              <button onClick={() => setModal(false)} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"><FiX /></button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="label">Select Student *</label>
                <select 
                  value={form.studentId} 
                  onChange={e => setForm(p => ({ ...p, studentId: e.target.value }))}
                  className="input w-full"
                >
                  <option value="">Select student from list</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.enrollmentNo})</option>)}
                </select>
              </div>

              <div>
                <label className="label">Select Exam *</label>
                <select 
                  value={form.examId} 
                  onChange={e => setForm(p => ({ ...p, examId: e.target.value }))}
                  className="input w-full"
                >
                  <option value="">Select exam</option>
                  {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Select Course</label>
                <select 
                  value={form.courseId} 
                  onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))}
                  className="input w-full"
                >
                  <option value="">Select course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Marks Obtained *</label>
                  <input 
                    type="number" 
                    value={form.marksObtained} 
                    onChange={e => setForm(p => ({ ...p, marksObtained: e.target.value }))}
                    className="input w-full font-semibold text-primary-700" 
                    placeholder="e.g. 95"
                  />
                </div>
                <div>
                  <label className="label">Total Marks *</label>
                  <input 
                    type="number" 
                    value={form.totalMarks} 
                    onChange={e => setForm(p => ({ ...p, totalMarks: e.target.value }))}
                    className="input w-full" 
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Grade</label>
                  <select 
                    value={form.grade} 
                    onChange={e => setForm(p => ({ ...p, grade: e.target.value }))}
                    className="input w-full"
                  >
                    {['A+', 'A', 'B+', 'B', 'C', 'F'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Status</label>
                  <select 
                    value={form.status} 
                    onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                    className="input w-full"
                  >
                    <option value="pass">Passed</option>
                    <option value="fail">Failed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t bg-slate-50">
              <button onClick={() => setModal(false)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                {saving ? 'Saving...' : <><FiSave /> Save Result</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
