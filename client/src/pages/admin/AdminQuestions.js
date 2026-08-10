import React, { useEffect, useState } from 'react';
import { FiPlus, FiTrash2, FiX, FiSave, FiUpload, FiDownload, FiFilter, FiEdit2 } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY = { question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', course: '', subject: '', difficulty: 'medium', marks: 1 };

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filterCourse, setFilterCourse] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [modal, setModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const fetch = async () => {
    const params = {};
    if (filterCourse) params.course = filterCourse;
    if (filterSubject) params.subject = filterSubject;
    const [q, c, s] = await Promise.all([api.get('/exams/questions', { params }), api.get('/courses'), api.get('/courses/subjects')]);
    setQuestions(q.data); setCourses(c.data); setSubjects(s.data);
  };
  useEffect(() => { fetch(); }, [filterCourse, filterSubject]);

  const filteredSubjects = filterCourse ? subjects.filter(s => String(s.course?.id || s.courseId || s.course) === String(filterCourse)) : subjects;
  const modalSubjects = form.course 
    ? subjects.filter(s => String(s.course?.id || s.courseId || s.course) === String(form.course)) 
    : [];

  const openAdd = () => {
    setEditingQuestion(null);
    setForm({
      ...EMPTY,
      course: filterCourse || '',
      subject: filterSubject || ''
    });
    setModal(true);
  };

  const openEdit = (q) => {
    setEditingQuestion(q);
    setForm({
      question: q.question || '',
      optionA: q.optionA || '',
      optionB: q.optionB || '',
      optionC: q.optionC || '',
      optionD: q.optionD || '',
      correctAnswer: q.correctAnswer || 'A',
      course: q.courseId || q.course?.id || '',
      subject: q.subjectId || q.subject?.id || '',
      difficulty: q.difficulty || 'medium',
      marks: q.marks || 1
    });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.question || !form.optionA || !form.optionB || !form.optionC || !form.optionD) {
      return toast.error('Question text and all 4 options are required');
    }
    if (!form.course || !form.subject) {
      return toast.error('Please select both Course and Subject');
    }

    setSaving(true);
    try {
      if (editingQuestion) {
        await api.put(`/exams/questions/${editingQuestion.id}`, form);
        toast.success('Question updated successfully!');
      } else {
        await api.post('/exams/questions', form);
        toast.success('Question added successfully!');
      }
      fetch(); setModal(false); setForm(EMPTY); setEditingQuestion(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save question'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await api.delete(`/exams/questions/${id}`);
      toast.success('Question deleted');
      fetch();
    } catch (err) { toast.error('Delete failed'); }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const { data } = await api.post('/exams/questions/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImportResult(data);
      if (data.imported > 0) {
        toast.success(data.message || `Successfully imported ${data.imported} questions!`);
        fetch();
      } else {
        toast.error(data.message || 'No questions were imported. Please review errors below.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed. Please check file format.');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const downloadTemplate = async () => {
    try {
      const res = await api.get('/exams/questions/template', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'DS_Questions_Template.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Template downloaded (.xlsx)');
    } catch (err) {
      // Fallback CSV template
      const header = 'Question,Option A,Option B,Option C,Option D,Correct Answer,Course,Subject,Difficulty,Marks,Explanation\n';
      const sample1 = '"Which concept states assets = liabilities + capital?","Assets","Capital","Liabilities","Equity","A","12th Commerce","Accountancy","medium","1","Basic Accounting Equation"\n';
      const sample2 = '"Which concept requires revenue recognition when earned?","Matching","Revenue Recognition","Going Concern","Cost","B","CA Foundation","Principles and Practice of Accounting","medium","1","Revenue realization concept"\n';
      const blob = new Blob([header + sample1 + sample2], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'DS_Questions_Template.csv';
      a.click();
      toast.success('CSV Template downloaded');
    }
  };

  const inp = (f) => ({ value: form[f] ?? '', onChange: e => setForm(p => ({ ...p, [f]: e.target.value })) });
  const diffColor = { easy: 'bg-emerald-100 text-emerald-700', medium: 'bg-yellow-100 text-yellow-700', hard: 'bg-rose-100 text-rose-700' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Question Bank</h1>
          <p className="text-slate-500 text-sm">{questions.length} questions in database</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={downloadTemplate} className="btn-secondary py-2 px-4 text-sm flex items-center gap-1.5 shadow-sm">
            <FiDownload size={15}/> Download Excel Template
          </button>
          <label className={`btn-secondary py-2 px-4 text-sm cursor-pointer flex items-center gap-1.5 shadow-sm ${importing ? 'opacity-50 pointer-events-none' : ''}`}>
            <FiUpload size={15}/> {importing ? 'Importing Excel...' : 'Import Excel (.xlsx/.csv)'}
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} className="hidden" disabled={importing} />
          </label>
          <button onClick={openAdd} className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5 shadow-sm">
            <FiPlus size={16} /> Add Question
          </button>
        </div>
      </div>

      {/* Import Result Feedback */}
      {importResult && (
        <div className={`card p-4 border-l-4 ${importResult.imported > 0 ? 'border-emerald-500 bg-emerald-50/70' : 'border-rose-500 bg-rose-50/70'}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className={`font-semibold ${importResult.imported > 0 ? 'text-emerald-900' : 'text-rose-900'}`}>
                {importResult.imported > 0 ? '🎉 Import Summary' : '⚠️ Import Needs Attention'}
              </div>
              <div className={`text-sm mt-1 ${importResult.imported > 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                ✓ <strong>{importResult.imported}</strong> questions imported successfully out of <strong>{importResult.total}</strong> total rows.
              </div>
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="mt-3 p-3 bg-white/80 rounded-lg border border-rose-200 text-xs text-rose-700 space-y-1 max-h-40 overflow-y-auto font-mono">
                  <div className="font-semibold text-rose-800 mb-1">Issue Details ({importResult.errors.length}):</div>
                  {importResult.errors.map((e, i) => (
                    <div key={i} className="flex items-start gap-1">
                      <span>•</span><span>{e}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setImportResult(null)} className="text-slate-400 hover:text-slate-700 p-1 rounded">
              <FiX size={18}/>
            </button>
          </div>
        </div>
      )}

      {/* Excel Format Guide */}
      <div className="card p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-blue-900 text-sm flex items-center gap-2">
            <span>📊 Supported Excel / CSV Header Columns</span>
          </div>
          <button onClick={downloadTemplate} className="text-xs text-blue-700 hover:text-blue-900 font-medium underline flex items-center gap-1">
            <FiDownload size={12}/> Get Pre-filled Sample
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-11 gap-1.5">
          {['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer', 'Course', 'Subject', 'Difficulty', 'Marks', 'Explanation'].map(h => (
            <div key={h} className="bg-white/80 text-blue-900 text-xs px-2 py-1.5 rounded border border-blue-200 font-medium text-center shadow-xs">
              {h}
            </div>
          ))}
        </div>
        <p className="text-blue-700 text-xs mt-2.5 leading-relaxed">
          ✨ <strong>Smart Import:</strong> Correct Answer can be <code className="bg-blue-100 px-1 py-0.5 rounded">A, B, C, D</code> or <code className="bg-blue-100 px-1 py-0.5 rounded">1, 2, 3, 4</code>. Course & Subject are auto-detected and created if not existing.
        </p>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <FiFilter className="text-slate-400" />
        <select value={filterCourse} onChange={e => { setFilterCourse(e.target.value); setFilterSubject(''); }} className="input py-2 w-auto min-w-40">
          <option value="">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="input py-2 w-auto min-w-40">
          <option value="">All Subjects</option>
          {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Questions Table */}
      <div className="card overflow-hidden">
        <table className="data-table">
          <thead><tr><th>#</th><th>Question</th><th>Options</th><th>Answer</th><th>Course / Subject</th><th>Difficulty</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {questions.map((q, i) => (
              <tr key={q.id}>
                <td className="text-slate-400 text-xs">{i + 1}</td>
                <td className="max-w-xs"><div className="truncate text-sm font-medium text-slate-800">{q.question}</div></td>
                <td className="text-xs text-slate-500 max-w-xs">
                  <div>A: {q.optionA}</div><div>B: {q.optionB}</div>
                </td>
                <td><span className="badge bg-emerald-100 text-emerald-700">{q.correctAnswer}</span></td>
                <td>
                  <div className="text-xs">{q.course?.name || '—'}</div>
                  <div className="text-xs text-slate-400">{q.subject?.name || '—'}</div>
                </td>
                <td><span className={`badge text-xs ${diffColor[q.difficulty]}`}>{q.difficulty}</span></td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(q)} title="Edit Question" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <FiEdit2 size={15}/>
                    </button>
                    <button onClick={() => handleDelete(q.id)} title="Delete Question" className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                      <FiTrash2 size={15}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {questions.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-slate-400">No questions found. Add manually or import from Excel.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Question Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-6 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-semibold text-slate-900">{editingQuestion ? 'Edit Question' : 'Add New Question'}</h2>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><FiX /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="col-span-2">
                <label className="label">Question *</label>
                <textarea {...inp('question')} rows={3} className="input resize-none" placeholder="Enter the question text..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {['A','B','C','D'].map(opt => (
                  <div key={opt}>
                    <label className="label">Option {opt} *</label>
                    <input {...inp(`option${opt}`)} className="input" placeholder={`Option ${opt}`} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Correct Answer *</label>
                  <select {...inp('correctAnswer')} className="input">
                    {['A','B','C','D'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Difficulty</label>
                  <select {...inp('difficulty')} className="input">
                    {['easy','medium','hard'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Marks</label>
                  <input type="number" {...inp('marks')} className="input" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="label font-bold text-slate-800 mb-1">Select Course *</label>
                  <select 
                    value={form.course} 
                    onChange={e => setForm(p => ({ ...p, course: e.target.value, subject: '' }))} 
                    className="input w-full font-medium"
                  >
                    <option value="">-- Choose Course --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label font-bold text-slate-800 mb-1">Select Subject *</label>
                  <select 
                    value={form.subject} 
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    disabled={!form.course}
                    className="input w-full font-medium disabled:bg-slate-200 disabled:cursor-not-allowed text-slate-800"
                  >
                    <option value="">
                      {!form.course ? '-- Select Course First --' : modalSubjects.length === 0 ? 'No subjects found for this course' : '-- Choose Subject --'}
                    </option>
                    {modalSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : <><FiSave /> {editingQuestion ? 'Save Changes' : 'Add Question'}</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
