import React, { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY = { title: '', course: '', subject: '', totalQuestions: 150, questionsPerExam: 50, duration: 60, totalMarks: 50, passingMarks: 20, status: 'draft', instructions: '', shuffleQuestions: true, shuffleOptions: true, negativeMarking: false, negativeMarks: 0.25 };

export default function AdminExams() {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    const [e, c, s] = await Promise.all([api.get('/exams'), api.get('/courses'), api.get('/courses/subjects')]);
    setExams(e.data); setCourses(c.data); setSubjects(s.data);
  };
  useEffect(() => { fetch(); }, []);
  useEffect(() => {
    setFilteredSubjects(form.course ? subjects.filter(s => String(s.course?.id || s.courseId || s.course) === String(form.course)) : subjects);
  }, [form.course, subjects]);

  const openAdd = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit = (e) => { setForm({ ...e, course: e.course?.id || e.course, subject: e.subject?.id || e.subject }); setEditing(e); setModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      editing ? await api.put(`/exams/${editing.id}`, form) : await api.post('/exams', form);
      toast.success(editing ? 'Exam updated' : 'Exam created');
      fetch(); setModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const toggleStatus = async (exam) => {
    const newStatus = exam.status === 'active' ? 'draft' : 'active';
    await api.put(`/exams/${exam.id}`, { status: newStatus });
    toast.success(`Exam ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    fetch();
  };

  const inp = (f, type = 'text') => ({
    value: form[f] ?? '',
    onChange: e => setForm(p => ({ ...p, [f]: type === 'number' ? Number(e.target.value) : e.target.value }))
  });

  const statusBadge = { draft: 'bg-slate-100 text-slate-600', active: 'bg-emerald-100 text-emerald-700', completed: 'bg-blue-100 text-blue-700' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold text-slate-900">Exam Management</h1><p className="text-slate-500 text-sm">{exams.length} exams created</p></div>
        <button onClick={openAdd} className="btn-primary"><FiPlus /> Create Exam</button>
      </div>

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead><tr><th>Exam</th><th>Course / Subject</th><th>Questions</th><th>Duration</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {exams.map(e => (
              <tr key={e.id}>
                <td>
                  <div className="font-medium text-slate-900">{e.title}</div>
                  <div className="text-xs text-slate-400">{e.negativeMarking ? '−ve marking' : 'No negative'} · Shuffle: {e.shuffleQuestions ? 'On' : 'Off'}</div>
                </td>
                <td>
                  <div className="text-sm">{e.course?.name || '—'}</div>
                  <div className="text-xs text-slate-400">{e.subject?.name || '—'}</div>
                </td>
                <td>
                  <div className="text-sm">{e.questionsPerExam} / {e.totalQuestions} pool</div>
                  <div className="text-xs text-slate-400">{e.totalMarks} marks · Pass: {e.passingMarks}</div>
                </td>
                <td className="text-sm">{e.duration} min</td>
                <td><span className={`badge text-xs ${statusBadge[e.status]}`}>{e.status}</span></td>
                <td>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleStatus(e)} title={e.status === 'active' ? 'Deactivate' : 'Activate'}
                      className={`p-2 rounded-lg transition-colors ${e.status === 'active' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-50'}`}>
                      {e.status === 'active' ? <FiToggleRight size={18}/> : <FiToggleLeft size={18}/>}
                    </button>
                    <button onClick={() => openEdit(e)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"><FiEdit2 size={14}/></button>
                    <button onClick={async () => { if(!window.confirm('Delete exam?'))return; await api.delete(`/exams/${e.id}`); toast.success('Deleted'); fetch(); }} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><FiTrash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
            {exams.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-slate-400">No exams yet</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-6 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-semibold text-slate-900">{editing ? 'Edit' : 'Create'} Exam</h2>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><FiX /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
              <div className="col-span-2"><label className="label">Exam Title *</label><input {...inp('title')} className="input" /></div>
              <div><label className="label">Course *</label>
                <select value={form.course} onChange={e => setForm(p => ({...p, course: e.target.value, subject: ''}))} className="input">
                  <option value="">Select course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div><label className="label">Subject *</label>
                <select {...inp('subject')} className="input">
                  <option value="">Select subject</option>
                  {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div><label className="label">Question Pool Size</label><input type="number" {...inp('totalQuestions','number')} className="input" /></div>
              <div><label className="label">Questions Per Student</label><input type="number" {...inp('questionsPerExam','number')} className="input" /></div>
              <div><label className="label">Duration (minutes)</label><input type="number" {...inp('duration','number')} className="input" /></div>
              <div><label className="label">Total Marks</label><input type="number" {...inp('totalMarks','number')} className="input" /></div>
              <div><label className="label">Passing Marks</label><input type="number" {...inp('passingMarks','number')} className="input" /></div>
              <div><label className="label">Status</label>
                <select {...inp('status')} className="input">
                  {['draft','active','completed'].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-span-2 space-y-3">
                {[
                  { field: 'shuffleQuestions', label: 'Shuffle Questions' },
                  { field: 'shuffleOptions', label: 'Shuffle Options' },
                  { field: 'negativeMarking', label: 'Negative Marking' },
                ].map(opt => (
                  <label key={opt.field} className="flex items-center gap-3 cursor-pointer select-none">
                    <div onClick={() => setForm(p => ({...p, [opt.field]: !p[opt.field]}))}
                      className={`w-11 h-6 rounded-full transition-all ${form[opt.field] ? 'bg-primary-600' : 'bg-slate-200'} flex items-center px-0.5`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-all ${form[opt.field] ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                    <span className="text-sm text-slate-700">{opt.label}</span>
                  </label>
                ))}
              </div>
              <div className="col-span-2"><label className="label">Instructions</label><textarea {...inp('instructions')} rows={3} className="input resize-none" placeholder="Exam instructions for students..." /></div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : <><FiSave /> Save Exam</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
