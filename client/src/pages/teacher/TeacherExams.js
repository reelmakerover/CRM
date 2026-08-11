import React, { useEffect, useState, useMemo } from 'react';
import { 
  FiPlus, FiTrash2, FiEdit2, FiX, FiSave, FiEye, FiFolder, FiClipboard,
  FiCheckCircle, FiClock, FiHelpCircle, FiAward, FiBook, FiList, FiGrid, FiChevronDown, FiChevronRight
} from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY = {
  title: '',
  course: '',
  subject: '',
  chapter: '',
  totalQuestions: 10,
  questionsPerExam: 10,
  duration: 30,
  totalMarks: 20,
  passingMarks: 8,
  status: 'active',
  instructions: '',
  shuffleQuestions: true,
  shuffleOptions: true,
  negativeMarking: false,
  negativeMarks: 0.25,
  isPublic: true,
};

export default function TeacherExams() {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [modal, setModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState('');
  const [viewMode, setViewMode] = useState('folder');
  const [expandedFolders, setExpandedFolders] = useState({});

  const fetchAll = async () => {
    try {
      const [exRes, cRes, sRes] = await Promise.all([
        api.get('/exams'),
        api.get('/courses'),
        api.get('/courses/subjects')
      ]);
      setExams(exRes.data);
      setCourses(cRes.data);
      setSubjects(sRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const modalSubjects = form.course
    ? subjects.filter(s => String(s.course?.id || s.courseId || s.course) === String(form.course))
    : subjects;

  const existingChapters = useMemo(() => {
    const set = new Set();
    exams.forEach(e => {
      if (e.chapter && e.chapter.trim()) set.add(e.chapter.trim());
    });
    return Array.from(set);
  }, [exams]);

  const hierarchy = useMemo(() => {
    let filtered = exams;
    if (filterSubject) {
      filtered = filtered.filter(e => String(e.subject?.id || e.subjectId) === String(filterSubject));
    }

    const map = {};
    filtered.forEach(exam => {
      const subjId = exam.subject?.id ? String(exam.subject.id) : (exam.subject?.name || 'general');
      const subjName = exam.subject?.name || 'General / Other';
      const courseName = exam.course?.name || '';
      const chapName = exam.chapter?.trim() || 'General Tests';

      if (!map[subjId]) {
        map[subjId] = {
          id: subjId,
          subjectName: subjName,
          courseName: courseName,
          chapters: {}
        };
      }

      if (!map[subjId].chapters[chapName]) {
        map[subjId].chapters[chapName] = [];
      }
      map[subjId].chapters[chapName].push(exam);
    });

    return Object.values(map);
  }, [exams, filterSubject]);

  const toggleFolder = (key) => {
    setExpandedFolders(p => ({ ...p, [key]: p[key] === undefined ? false : !p[key] }));
  };

  const openAdd = (defaultSubjId = '', defaultChapter = '') => {
    setEditingExam(null);
    let courseId = '';
    if (defaultSubjId) {
      const sub = subjects.find(s => String(s.id) === String(defaultSubjId));
      if (sub) courseId = sub.course?.id || sub.courseId || '';
    }
    setForm({
      ...EMPTY,
      course: courseId,
      subject: defaultSubjId || '',
      chapter: defaultChapter || ''
    });
    setModal(true);
  };

  const openEdit = (exam) => {
    setEditingExam(exam);
    setForm({
      title: exam.title || '',
      course: exam.courseId || exam.course?.id || '',
      subject: exam.subjectId || exam.subject?.id || '',
      chapter: exam.chapter || '',
      totalQuestions: exam.totalQuestions || 10,
      questionsPerExam: exam.questionsPerExam || 10,
      duration: exam.duration || 30,
      totalMarks: exam.totalMarks || 20,
      passingMarks: exam.passingMarks || 8,
      status: exam.status || 'active',
      instructions: exam.instructions || '',
      shuffleQuestions: exam.shuffleQuestions !== false,
      shuffleOptions: exam.shuffleOptions !== false,
      negativeMarking: !!exam.negativeMarking,
      negativeMarks: exam.negativeMarks || 0.25,
      isPublic: exam.isPublic !== false,
    });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.subject) {
      return toast.error('Please enter Test Title and select Subject');
    }
    setSaving(true);
    try {
      if (editingExam) {
        await api.put(`/exams/${editingExam.id}`, form);
        toast.success('Chapter test updated successfully!');
      } else {
        await api.post('/exams', form);
        toast.success('Chapter test created successfully!');
      }
      fetchAll();
      setModal(false);
      setForm(EMPTY);
      setEditingExam(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save exam');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this test?')) return;
    try {
      await api.delete(`/exams/${id}`);
      toast.success('Exam deleted');
      fetchAll();
    } catch (err) {
      toast.error('Failed to delete exam');
    }
  };

  const inp = (f) => ({ value: form[f] ?? '', onChange: e => setForm(p => ({ ...p, [f]: e.target.value })) });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FiClipboard className="text-amber-600" /> Chapter-Wise Tests Management
          </h1>
          <p className="text-slate-500 text-sm">
            Create chapter tests, specify questions per exam, time limits & negative marking
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setViewMode('folder')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'folder' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FiFolder size={14} className="text-amber-600" /> Folders
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FiList size={14} /> Table
            </button>
          </div>

          <button onClick={() => openAdd()} className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5 shadow-md">
            <FiPlus size={16} /> Create Chapter Test
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card p-3.5 bg-white border border-slate-200 shadow-xs flex items-center gap-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter Subject:</span>
        <select 
          value={filterSubject} 
          onChange={e => setFilterSubject(e.target.value)} 
          className="input py-1.5 px-3 text-xs w-auto min-w-[200px]"
        >
          <option value="">All Subjects ({exams.length} tests)</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* FOLDER VIEW */}
      {viewMode === 'folder' && (
        <div className="space-y-6">
          {hierarchy.length === 0 ? (
            <div className="card p-12 text-center bg-white">
              <div className="text-5xl mb-3">📁</div>
              <h3 className="font-display text-lg font-bold text-slate-800">No Tests Found</h3>
              <p className="text-slate-500 text-sm mt-1">Click "Create Chapter Test" to add your first assessment.</p>
            </div>
          ) : (
            hierarchy.map(subjGroup => {
              const chapKeys = Object.keys(subjGroup.chapters);

              return (
                <div key={subjGroup.id} className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        <FiFolder size={18} />
                      </div>
                      <div>
                        <h2 className="font-bold text-slate-900 text-base">{subjGroup.subjectName}</h2>
                        <span className="text-xs text-slate-500 font-medium">{subjGroup.courseName} · {chapKeys.length} Chapter Folders</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => openAdd(subjGroup.id)}
                      className="btn-secondary text-xs py-1 px-2.5 rounded-lg flex items-center gap-1 hover:bg-amber-50 hover:text-amber-700"
                    >
                      <FiPlus size={12}/> Add Test to {subjGroup.subjectName}
                    </button>
                  </div>

                  <div className="space-y-3 pl-2 sm:pl-4">
                    {chapKeys.map((chapName, cIdx) => {
                      const chapKey = `${subjGroup.id}_chap_${cIdx}`;
                      const isOpen = expandedFolders[chapKey] !== false;
                      const testList = subjGroup.chapters[chapName];

                      return (
                        <div key={chapKey} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                          <div 
                            onClick={() => toggleFolder(chapKey)}
                            className="p-4 bg-slate-50/60 hover:bg-amber-50/30 border-b border-slate-100 flex items-center justify-between cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-amber-500 font-bold">📂</span>
                              <div>
                                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">{chapName}</h3>
                                <span className="text-xs text-slate-400 font-medium">{testList.length} Test{testList.length !== 1 ? 's' : ''} in this chapter</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); openAdd(subjGroup.id, chapName); }}
                                className="text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1 mr-2"
                              >
                                <FiPlus size={12}/> + Test
                              </button>
                              <div className="p-1 text-slate-400">{isOpen ? <FiChevronDown size={16}/> : <FiChevronRight size={16}/>}</div>
                            </div>
                          </div>

                          {isOpen && (
                            <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                              {testList.map(exam => (
                                <div key={exam.id} className="bg-slate-50/50 rounded-xl p-4 border border-slate-200/80 hover:border-amber-400 hover:bg-white transition-all flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <h4 className="font-bold text-slate-900 text-sm">{exam.title}</h4>
                                      <span className={`badge text-xs ${exam.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                                        {exam.status}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 my-2 text-center text-xs">
                                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                                        <div className="font-bold text-slate-800">{exam.questionsPerExam} Qs</div>
                                        <div className="text-[10px] text-slate-400">Questions</div>
                                      </div>
                                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                                        <div className="font-bold text-slate-800">{exam.duration}m</div>
                                        <div className="text-[10px] text-slate-400">Duration</div>
                                      </div>
                                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                                        <div className="font-bold text-slate-800">{exam.totalMarks} M</div>
                                        <div className="text-[10px] text-slate-400">Total Marks</div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                                    <span className="text-slate-500">Pass: <strong>{exam.passingMarks}</strong></span>
                                    <div className="flex items-center gap-1">
                                      <button onClick={() => openEdit(exam)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                                        <FiEdit2 size={14}/>
                                      </button>
                                      <button onClick={() => handleDelete(exam.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
                                        <FiTrash2 size={14}/>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="card overflow-hidden bg-white">
          <table className="data-table">
            <thead>
              <tr>
                <th>Test Title</th>
                <th>Subject & Chapter</th>
                <th>Questions</th>
                <th>Duration</th>
                <th>Marks</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map(exam => (
                <tr key={exam.id}>
                  <td>
                    <div className="font-bold text-slate-900 text-sm">{exam.title}</div>
                  </td>
                  <td>
                    <div className="text-xs font-medium text-slate-800">{exam.subject?.name || '—'}</div>
                    <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      📂 {exam.chapter || 'General'}
                    </span>
                  </td>
                  <td>{exam.questionsPerExam} Qs</td>
                  <td>{exam.duration} mins</td>
                  <td>{exam.totalMarks} (Pass: {exam.passingMarks})</td>
                  <td>
                    <span className={`badge text-xs ${exam.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                      {exam.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(exam)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><FiEdit2 size={14}/></button>
                      <button onClick={() => handleDelete(exam.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"><FiTrash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Test Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-6 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-auto overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <FiClipboard className="text-amber-600" />
                {editingExam ? 'Edit Chapter Test' : 'Create New Chapter Test'}
              </h2>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><FiX size={18}/></button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="label font-bold text-slate-800">Test Title *</label>
                <input {...inp('title')} className="input" placeholder="e.g. Partnership Fundamentals Quick Test" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="label font-bold text-slate-800">Select Subject *</label>
                  <select {...inp('subject')} className="input bg-white font-medium">
                    <option value="">-- Choose Subject --</option>
                    {modalSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label font-bold text-slate-800">Course (Optional)</label>
                  <select {...inp('course')} className="input bg-white font-medium">
                    <option value="">-- All / Default Course --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="label font-bold text-slate-800 flex items-center gap-1">
                    <FiFolder className="text-amber-600" /> Chapter Folder Name *
                  </label>
                  <input 
                    {...inp('chapter')} 
                    className="input bg-white" 
                    placeholder="e.g. Chapter 1: Fundamentals of Partnership" 
                  />
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

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="label">Questions / Test</label>
                  <input type="number" {...inp('questionsPerExam')} className="input" min={1} />
                </div>
                <div>
                  <label className="label">Duration (Mins)</label>
                  <input type="number" {...inp('duration')} className="input" min={1} />
                </div>
                <div>
                  <label className="label">Total Marks</label>
                  <input type="number" {...inp('totalMarks')} className="input" min={1} />
                </div>
                <div>
                  <label className="label">Passing Marks</label>
                  <input type="number" {...inp('passingMarks')} className="input" min={0} />
                </div>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input 
                    type="checkbox" 
                    checked={form.negativeMarking} 
                    onChange={e => setForm(p => ({ ...p, negativeMarking: e.target.checked }))}
                    className="rounded text-amber-600" 
                  />
                  <span>Negative Marking</span>
                </label>
                {form.negativeMarking && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-500">Deduct per wrong answer:</span>
                    <input 
                      type="number" 
                      step="0.25" 
                      {...inp('negativeMarks')} 
                      className="input py-1 px-2 text-xs w-20 bg-white" 
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="label">Instructions (Optional)</label>
                <textarea {...inp('instructions')} rows={2} className="input resize-none" placeholder="Special rules or topic coverage..." />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50">
              <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : <><FiSave /> {editingExam ? 'Save Changes' : 'Create Test'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
