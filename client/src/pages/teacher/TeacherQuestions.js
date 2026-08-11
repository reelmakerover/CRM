import React, { useEffect, useState, useMemo } from 'react';
import { 
  FiPlus, FiTrash2, FiX, FiSave, FiUpload, FiDownload, FiFilter, FiEdit2, FiFolder, FiHelpCircle 
} from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY = { 
  question: '', 
  optionA: '', 
  optionB: '', 
  optionC: '', 
  optionD: '', 
  correctAnswer: 'A', 
  course: '', 
  subject: '', 
  chapter: '', 
  difficulty: 'medium', 
  marks: 1, 
  explanation: '' 
};

export default function TeacherQuestions() {
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filterCourse, setFilterCourse] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterChapter, setFilterChapter] = useState('');
  const [modal, setModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const params = {};
    if (filterCourse) params.course = filterCourse;
    if (filterSubject) params.subject = filterSubject;
    if (filterChapter) params.chapter = filterChapter;
    try {
      const [q, c, s] = await Promise.all([
        api.get('/exams/questions', { params }).catch(() => ({ data: [] })),
        api.get('/courses').catch(() => ({ data: [] })),
        api.get('/courses/subjects').catch(() => ({ data: [] }))
      ]);
      setQuestions(Array.isArray(q.data) ? q.data : []);
      setCourses(Array.isArray(c.data) ? c.data : []);
      setSubjects(Array.isArray(s.data) ? s.data : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [filterCourse, filterSubject, filterChapter]);

  const filteredSubjects = filterCourse 
    ? (Array.isArray(subjects) ? subjects.filter(s => String(s.course?.id || s.courseId || s.course) === String(filterCourse)) : [])
    : (Array.isArray(subjects) ? subjects : []);

  const modalSubjects = form.course 
    ? (Array.isArray(subjects) ? subjects.filter(s => String(s.course?.id || s.courseId || s.course) === String(form.course)) : [])
    : (Array.isArray(subjects) ? subjects : []);

  const existingChapters = useMemo(() => {
    const set = new Set();
    if (Array.isArray(questions)) {
      questions.forEach(q => {
        if (q.chapter && q.chapter.trim()) set.add(q.chapter.trim());
      });
    }
    return Array.from(set);
  }, [questions]);

  const openAdd = () => {
    setEditingQuestion(null);
    setForm({
      ...EMPTY,
      course: filterCourse || '',
      subject: filterSubject || '',
      chapter: filterChapter || ''
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
      chapter: q.chapter || '',
      difficulty: q.difficulty || 'medium',
      marks: q.marks || 1,
      explanation: q.explanation || ''
    });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.question || !form.optionA || !form.optionB || !form.optionC || !form.optionD) {
      return toast.error('Question text and all 4 options are required');
    }
    if (!form.subject) {
      return toast.error('Please select Subject');
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
      fetch(); 
      setModal(false); 
      setForm(EMPTY); 
      setEditingQuestion(null);
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Failed to save question'); 
    } finally { 
      setSaving(false); 
    }
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
      const blob = new Blob([res.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.setAttribute('download', 'DS_Questions_Template.xlsx');
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (a.parentNode) a.parentNode.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 3000);
      toast.success('Excel Template downloaded (.xlsx)');
    } catch (err) {
      console.error(err);
      toast.error('Failed to download Excel template');
    }
  };

  const inp = (f) => ({ value: form[f] ?? '', onChange: e => setForm(p => ({ ...p, [f]: e.target.value })) });
  const diffColor = { easy: 'bg-emerald-100 text-emerald-700', medium: 'bg-yellow-100 text-yellow-700', hard: 'bg-rose-100 text-rose-700' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FiHelpCircle className="text-amber-600" /> Question Bank
          </h1>
          <p className="text-slate-500 text-sm">{Array.isArray(questions) ? questions.length : 0} questions available in bank</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={downloadTemplate} className="btn-secondary py-2 px-4 text-sm flex items-center gap-1.5 shadow-xs">
            <FiDownload size={15}/> Excel Template
          </button>
          <label className={`btn-secondary py-2 px-4 text-sm cursor-pointer flex items-center gap-1.5 shadow-xs ${importing ? 'opacity-50 pointer-events-none' : ''}`}>
            <FiUpload size={15}/> {importing ? 'Importing Excel...' : 'Import Excel (.xlsx/.csv)'}
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} className="hidden" disabled={importing} />
          </label>
          <button onClick={openAdd} className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5 shadow-md">
            <FiPlus size={16} /> Add Question
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center bg-white">
        <FiFilter className="text-slate-400" />
        <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="input py-2 w-auto min-w-44 text-xs font-semibold">
          <option value="">All Subjects</option>
          {Array.isArray(subjects) && subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {existingChapters.length > 0 && (
          <select value={filterChapter} onChange={e => setFilterChapter(e.target.value)} className="input py-2 w-auto min-w-48 text-xs font-semibold">
            <option value="">All Chapters</option>
            {existingChapters.map(ch => <option key={ch} value={ch}>{ch}</option>)}
          </select>
        )}
      </div>

      {/* Questions Table */}
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
                <th>Question</th>
                <th>Options</th>
                <th>Answer</th>
                <th>Subject & Chapter</th>
                <th>Difficulty</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(questions) && questions.map((q, i) => (
                <tr key={q.id}>
                  <td className="text-slate-400 text-xs">{i + 1}</td>
                  <td className="max-w-xs"><div className="truncate text-sm font-medium text-slate-800">{q.question}</div></td>
                  <td className="text-xs text-slate-500 max-w-xs">
                    <div>A: {q.optionA}</div><div>B: {q.optionB}</div>
                  </td>
                  <td><span className="badge bg-emerald-100 text-emerald-700 font-bold">{q.correctAnswer}</span></td>
                  <td>
                    <div className="text-xs font-medium text-slate-800">{q.subject?.name || '—'}</div>
                    <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200 font-medium">
                      📂 {q.chapter || 'General'}
                    </span>
                  </td>
                  <td><span className={`badge text-xs ${diffColor[q.difficulty] || 'bg-slate-100 text-slate-700'}`}>{q.difficulty}</span></td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(q)} title="Edit Question" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <FiEdit2 size={15}/>
                      </button>
                      <button onClick={() => handleDelete(q.id)} title="Delete Question" className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg">
                        <FiTrash2 size={15}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!Array.isArray(questions) || questions.length === 0) && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No questions found. Add manually or import from Excel.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Question Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-6 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-auto overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">{editingQuestion ? 'Edit Question' : 'Add New Question'}</h2>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><FiX /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="label font-bold text-slate-800">Question *</label>
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
                  <label className="label font-bold text-slate-800">Correct Answer *</label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="label font-bold text-slate-800">Select Subject *</label>
                  <select {...inp('subject')} className="input bg-white w-full font-medium">
                    <option value="">-- Choose Subject --</option>
                    {Array.isArray(modalSubjects) && modalSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label font-bold text-slate-800">Select Course (Optional)</label>
                  <select {...inp('course')} className="input bg-white w-full font-medium">
                    <option value="">-- Default Course --</option>
                    {Array.isArray(courses) && courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="label font-bold text-slate-800 flex items-center gap-1">
                    <FiFolder className="text-amber-600" /> Chapter Folder Name (Optional)
                  </label>
                  <input {...inp('chapter')} className="input bg-white w-full" placeholder="e.g. Chapter 1: Fundamentals of Partnership" />
                  {existingChapters.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {existingChapters.map(ch => (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => setForm(p => ({ ...p, chapter: ch }))}
                          className={`text-xs px-2 py-0.5 rounded border transition-all ${
                            form.chapter === ch 
                              ? 'bg-amber-500 text-white border-amber-600 font-semibold' 
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {ch}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="label">Explanation (Optional)</label>
                <textarea {...inp('explanation')} rows={2} className="input resize-none" placeholder="Provide solution explanation..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50">
              <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : <><FiSave /> {editingQuestion ? 'Save Changes' : 'Add Question'}</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
