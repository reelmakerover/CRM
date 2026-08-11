import React, { useEffect, useState, useMemo } from 'react';
import { 
  FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiToggleLeft, FiToggleRight, 
  FiFolder, FiFolderMinus, FiFolderPlus, FiFileText, FiClock, FiAward, 
  FiChevronDown, FiChevronRight, FiGrid, FiList, FiSearch, FiBookOpen 
} from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY = { 
  title: '', 
  course: '', 
  subject: '', 
  chapter: '', 
  totalQuestions: 50, 
  questionsPerExam: 50, 
  duration: 60, 
  totalMarks: 50, 
  passingMarks: 20, 
  status: 'draft', 
  instructions: '', 
  shuffleQuestions: true, 
  shuffleOptions: true, 
  negativeMarking: false, 
  negativeMarks: 0.25 
};

export default function AdminExams() {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  // View state: 'folders' or 'table'
  const [viewMode, setViewMode] = useState('folders');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('');
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [expandedChapters, setExpandedChapters] = useState({});

  const fetch = async () => {
    try {
      const [e, c, s] = await Promise.all([api.get('/exams'), api.get('/courses'), api.get('/courses/subjects')]);
      setExams(e.data); setCourses(c.data); setSubjects(s.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load exams data');
    }
  };

  useEffect(() => { fetch(); }, []);

  useEffect(() => {
    setFilteredSubjects(form.course ? subjects.filter(s => String(s.course?.id || s.courseId || s.course) === String(form.course)) : subjects);
  }, [form.course, subjects]);

  // Extract existing chapters for quick autocomplete/suggestions
  const existingChapters = useMemo(() => {
    const set = new Set();
    exams.forEach(e => {
      if (e.chapter && e.chapter.trim() && e.chapter !== 'General') set.add(e.chapter.trim());
    });
    return Array.from(set);
  }, [exams]);

  const openAdd = (defaultSubject = '', defaultChapter = '', defaultCourse = '') => { 
    setForm({
      ...EMPTY,
      course: defaultCourse || (courses.length > 0 ? courses[0].id : ''),
      subject: defaultSubject || '',
      chapter: defaultChapter || 'Chapter 1: '
    }); 
    setEditing(null); 
    setModal(true); 
  };

  const openEdit = (e) => { 
    setForm({ 
      ...e, 
      course: e.course?.id || e.course || '', 
      subject: e.subject?.id || e.subject || '',
      chapter: e.chapter || 'General'
    }); 
    setEditing(e); 
    setModal(true); 
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Exam title is required');
    if (!form.course) return toast.error('Please select a course');
    if (!form.subject) return toast.error('Please select a subject');

    setSaving(true);
    try {
      if (editing) {
        await api.put(`/exams/${editing.id}`, form);
        toast.success('Exam updated successfully');
      } else {
        await api.post('/exams', form);
        toast.success('Exam created successfully in Chapter Folder');
      }
      fetch(); 
      setModal(false);
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Error saving exam'); 
    } finally { 
      setSaving(false); 
    }
  };

  const toggleStatus = async (exam) => {
    const newStatus = exam.status === 'active' ? 'draft' : 'active';
    try {
      await api.put(`/exams/${exam.id}`, { status: newStatus });
      toast.success(`Exam ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      fetch();
    } catch (err) {
      toast.error('Failed to change status');
    }
  };

  const inp = (f, type = 'text') => ({
    value: form[f] ?? '',
    onChange: e => setForm(p => ({ ...p, [f]: type === 'number' ? Number(e.target.value) : e.target.value }))
  });

  const statusBadge = { 
    draft: 'bg-slate-100 text-slate-600 border border-slate-200', 
    active: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold', 
    completed: 'bg-blue-50 text-blue-700 border border-blue-200' 
  };

  // Group exams by Course -> Subject -> Chapter for the Folder View
  const groupedExams = useMemo(() => {
    let filtered = exams;
    if (selectedCourseFilter) {
      filtered = filtered.filter(e => String(e.course?.id || e.courseId) === String(selectedCourseFilter));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.title?.toLowerCase().includes(q) || 
        e.chapter?.toLowerCase().includes(q) || 
        e.subject?.name?.toLowerCase().includes(q) ||
        e.course?.name?.toLowerCase().includes(q)
      );
    }

    // Map: Subject Name -> { subjectObj, courseObj, chapters: { chapterName: [exams] } }
    const subjectMap = {};

    filtered.forEach(e => {
      const subjKey = e.subject?.id ? `subj_${e.subject.id}` : `subj_name_${e.subject?.name || 'General'}`;
      const subjName = e.subject?.name || 'General Subject';
      const courseName = e.course?.name || 'All Courses';
      const chapterName = e.chapter?.trim() || 'General / Comprehensive';

      if (!subjectMap[subjKey]) {
        subjectMap[subjKey] = {
          id: subjKey,
          subjectId: e.subject?.id,
          subjectName: subjName,
          courseName: courseName,
          courseId: e.course?.id,
          totalExams: 0,
          activeExams: 0,
          chapters: {}
        };
      }

      subjectMap[subjKey].totalExams++;
      if (e.status === 'active') subjectMap[subjKey].activeExams++;

      if (!subjectMap[subjKey].chapters[chapterName]) {
        subjectMap[subjKey].chapters[chapterName] = [];
      }
      subjectMap[subjKey].chapters[chapterName].push(e);
    });

    return Object.values(subjectMap);
  }, [exams, selectedCourseFilter, searchQuery]);

  const toggleSubjectExpand = (subKey) => {
    setExpandedSubjects(p => ({ ...p, [subKey]: p[subKey] === undefined ? false : !p[subKey] }));
  };

  const toggleChapterExpand = (chapKey) => {
    setExpandedChapters(p => ({ ...p, [chapKey]: p[chapKey] === undefined ? false : !p[chapKey] }));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <FiBookOpen className="text-primary-600" />
            Chapter-wise Exam Management
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Organize tests inside Subject folders and Chapter modules ({exams.length} total tests)
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* View Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button 
              onClick={() => setViewMode('folders')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'folders' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FiFolder size={14} /> Folder View
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FiList size={14} /> Table View
            </button>
          </div>

          <button onClick={() => openAdd()} className="btn-primary py-2 px-4 shadow-sm text-sm">
            <FiPlus /> Create Chapter Test
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search test, subject, or chapter..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input pl-10 py-2 text-sm w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <FiX size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={selectedCourseFilter}
            onChange={e => setSelectedCourseFilter(e.target.value)}
            className="input py-2 text-sm w-full md:w-56"
          >
            <option value="">All Courses ({courses.length})</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* FOLDER VIEW */}
      {viewMode === 'folders' && (
        <div className="space-y-4">
          {groupedExams.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-primary-500">
                <FiFolder size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Chapter Tests Found</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
                {searchQuery || selectedCourseFilter ? 'No tests match your current search or filter.' : 'Create your first subject & chapter-wise test using the button above.'}
              </p>
              <button onClick={() => openAdd()} className="btn-primary text-xs py-2 px-4 mx-auto mt-4">
                <FiPlus /> Add New Test
              </button>
            </div>
          ) : (
            groupedExams.map(subj => {
              const isSubjOpen = expandedSubjects[subj.id] !== false; // default open
              const chapterKeys = Object.keys(subj.chapters);

              return (
                <div key={subj.id} className="card overflow-hidden border border-slate-200/80 shadow-sm transition-all">
                  {/* Subject Header Folder Bar */}
                  <div 
                    onClick={() => toggleSubjectExpand(subj.id)}
                    className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-white hover:from-primary-50/40 hover:to-white border-b border-slate-100 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold shadow-xs">
                        <FiFolder size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-bold text-slate-900 text-base">{subj.subjectName}</h2>
                          <span className="badge bg-slate-200 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded-md">
                            {subj.courseName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {chapterKeys.length} Chapter{chapterKeys.length !== 1 ? 's' : ''} · {subj.totalExams} Total Tests ({subj.activeExams} Active)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => openAdd(subj.subjectId, '', subj.courseId)}
                        className="btn-secondary text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 hover:bg-primary-50 hover:text-primary-700"
                        title="Add test to this subject"
                      >
                        <FiPlus size={13} /> Add Test
                      </button>
                      <button 
                        onClick={() => toggleSubjectExpand(subj.id)}
                        className="p-2 text-slate-400 hover:text-slate-700 rounded-lg"
                      >
                        {isSubjOpen ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Chapter Subfolders */}
                  {isSubjOpen && (
                    <div className="p-4 sm:p-5 space-y-4 bg-slate-50/40">
                      {chapterKeys.map((chapName, chapIdx) => {
                        const chapId = `${subj.id}_chap_${chapIdx}`;
                        const isChapOpen = expandedChapters[chapId] !== false; // default open
                        const testsList = subj.chapters[chapName];

                        return (
                          <div key={chapId} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                            {/* Chapter Header */}
                            <div 
                              onClick={() => toggleChapterExpand(chapId)}
                              className="px-4 py-3 bg-slate-50/90 hover:bg-slate-100/70 border-b border-slate-100 flex items-center justify-between cursor-pointer select-none"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-amber-500 font-bold">
                                  {isChapOpen ? <FiFolderMinus size={17} /> : <FiFolderPlus size={17} />}
                                </span>
                                <span className="font-semibold text-slate-800 text-sm">
                                  📂 {chapName}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">
                                  ({testsList.length} test{testsList.length !== 1 ? 's' : ''})
                                </span>
                              </div>

                              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                <button 
                                  onClick={() => openAdd(subj.subjectId, chapName, subj.courseId)}
                                  className="text-xs text-primary-600 hover:text-primary-700 font-semibold px-2.5 py-1 hover:bg-primary-50 rounded-md transition-colors flex items-center gap-1"
                                >
                                  <FiPlus size={12} /> Add to Chapter
                                </button>
                                <span className="text-slate-300">|</span>
                                <button onClick={() => toggleChapterExpand(chapId)} className="p-1 text-slate-400 hover:text-slate-600">
                                  {isChapOpen ? <FiChevronDown size={15} /> : <FiChevronRight size={15} />}
                                </button>
                              </div>
                            </div>

                            {/* Tests in Chapter */}
                            {isChapOpen && (
                              <div className="divide-y divide-slate-100">
                                {testsList.map(exam => (
                                  <div key={exam.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                                          <FiFileText className="text-primary-500" size={15} />
                                          {exam.title}
                                        </span>
                                        <span className={`badge text-xs px-2 py-0.5 rounded-md ${statusBadge[exam.status]}`}>
                                          {exam.status === 'active' ? '● Active' : exam.status}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                                        <span className="flex items-center gap-1">
                                          <FiClock size={12} className="text-slate-400" /> {exam.duration} mins
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <FiAward size={12} className="text-slate-400" /> {exam.questionsPerExam} Qs / {exam.totalMarks} Marks
                                        </span>
                                        <span>Pass: {exam.passingMarks}</span>
                                        {exam.negativeMarking ? (
                                          <span className="text-amber-600 font-medium">−{exam.negativeMarks} −ve marking</span>
                                        ) : (
                                          <span className="text-slate-400">No −ve</span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                                      <button 
                                        onClick={() => toggleStatus(exam)} 
                                        title={exam.status === 'active' ? 'Deactivate' : 'Activate'}
                                        className={`p-2 rounded-lg transition-colors ${
                                          exam.status === 'active' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'
                                        }`}
                                      >
                                        {exam.status === 'active' ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                                      </button>
                                      <button 
                                        onClick={() => openEdit(exam)} 
                                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                        title="Edit Exam"
                                      >
                                        <FiEdit2 size={15} />
                                      </button>
                                      <button 
                                        onClick={async () => { 
                                          if (!window.confirm(`Delete "${exam.title}"?`)) return; 
                                          await api.delete(`/exams/${exam.id}`); 
                                          toast.success('Exam deleted'); 
                                          fetch(); 
                                        }} 
                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                        title="Delete Exam"
                                      >
                                        <FiTrash2 size={15} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Test Title</th>
                <th>Course / Subject</th>
                <th>Chapter Folder</th>
                <th>Questions / Marks</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams
                .filter(e => {
                  if (selectedCourseFilter && String(e.course?.id || e.courseId) !== String(selectedCourseFilter)) return false;
                  if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase();
                    return e.title?.toLowerCase().includes(q) || 
                           e.chapter?.toLowerCase().includes(q) || 
                           e.subject?.name?.toLowerCase().includes(q);
                  }
                  return true;
                })
                .map(e => (
                  <tr key={e.id}>
                    <td>
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <FiFileText className="text-primary-600 flex-shrink-0" size={15} />
                        {e.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {e.negativeMarking ? `−${e.negativeMarks} negative` : 'No negative'} · Shuffle: {e.shuffleQuestions ? 'On' : 'Off'}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm font-medium text-slate-800">{e.course?.name || '—'}</div>
                      <div className="text-xs text-slate-500">{e.subject?.name || '—'}</div>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-md border border-amber-200">
                        📂 {e.chapter || 'General'}
                      </span>
                    </td>
                    <td>
                      <div className="text-sm font-medium">{e.questionsPerExam} Qs ({e.totalMarks} marks)</div>
                      <div className="text-xs text-slate-400">Pass: {e.passingMarks}</div>
                    </td>
                    <td className="text-sm font-medium">{e.duration} min</td>
                    <td>
                      <span className={`badge text-xs ${statusBadge[e.status]}`}>{e.status}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => toggleStatus(e)} 
                          title={e.status === 'active' ? 'Deactivate' : 'Activate'}
                          className={`p-2 rounded-lg transition-colors ${e.status === 'active' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}
                        >
                          {e.status === 'active' ? <FiToggleRight size={18}/> : <FiToggleLeft size={18}/>}
                        </button>
                        <button onClick={() => openEdit(e)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"><FiEdit2 size={14}/></button>
                        <button onClick={async () => { if(!window.confirm(`Delete "${e.title}"?`))return; await api.delete(`/exams/${e.id}`); toast.success('Deleted'); fetch(); }} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><FiTrash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              {exams.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-slate-400">No exams found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 overflow-y-auto py-6 px-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/80">
              <div>
                <h2 className="font-bold text-slate-900 text-lg">{editing ? 'Edit' : 'Create'} Chapter Test</h2>
                <p className="text-xs text-slate-500 mt-0.5">Define chapter folder, duration, and question allocation</p>
              </div>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500"><FiX size={18} /></button>
            </div>

            <div className="p-6 grid grid-cols-2 gap-4 max-h-[72vh] overflow-y-auto">
              <div className="col-span-2">
                <label className="label">Exam / Test Title *</label>
                <input {...inp('title')} className="input" placeholder="e.g. Chapter 1 Practice Test 1" />
              </div>

              <div>
                <label className="label">Course *</label>
                <select value={form.course} onChange={e => setForm(p => ({...p, course: e.target.value, subject: ''}))} className="input">
                  <option value="">Select course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Subject *</label>
                <select {...inp('subject')} className="input">
                  <option value="">Select subject</option>
                  {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {/* CHAPTER FOLDER INPUT WITH SUGGESTIONS */}
              <div className="col-span-2 bg-amber-50/50 p-4 rounded-xl border border-amber-200/80 space-y-2">
                <label className="label text-amber-900 font-semibold flex items-center gap-1.5">
                  <FiFolder className="text-amber-600" /> Chapter Folder Name *
                </label>
                <input 
                  {...inp('chapter')} 
                  className="input bg-white" 
                  placeholder="e.g. Chapter 1: Fundamentals of Partnership" 
                />
                {existingChapters.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-slate-500">Quick suggestions from existing chapters:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {existingChapters.map(chap => (
                        <button
                          key={chap}
                          type="button"
                          onClick={() => setForm(p => ({ ...p, chapter: chap }))}
                          className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                            form.chapter === chap 
                              ? 'bg-amber-500 text-white border-amber-600 font-semibold' 
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {chap}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="label">Questions Per Student</label>
                <input type="number" {...inp('questionsPerExam','number')} className="input" />
              </div>
              <div>
                <label className="label">Duration (Minutes)</label>
                <input type="number" {...inp('duration','number')} className="input" />
              </div>
              <div>
                <label className="label">Total Marks</label>
                <input type="number" {...inp('totalMarks','number')} className="input" />
              </div>
              <div>
                <label className="label">Passing Marks</label>
                <input type="number" {...inp('passingMarks','number')} className="input" />
              </div>

              <div>
                <label className="label">Initial Status</label>
                <select {...inp('status')} className="input">
                  <option value="draft">Draft (Hidden from students)</option>
                  <option value="active">Active (Live in student portal)</option>
                  <option value="completed">Completed / Archived</option>
                </select>
              </div>

              <div>
                <label className="label">Question Pool Size</label>
                <input type="number" {...inp('totalQuestions','number')} className="input" />
              </div>

              {/* Toggles */}
              <div className="col-span-2 space-y-3 pt-2">
                {[
                  { field: 'shuffleQuestions', label: 'Shuffle Questions per Student' },
                  { field: 'shuffleOptions', label: 'Shuffle Options (A, B, C, D)' },
                  { field: 'negativeMarking', label: 'Enable Negative Marking (−0.25)' },
                ].map(opt => (
                  <label key={opt.field} className="flex items-center gap-3 cursor-pointer select-none">
                    <div 
                      onClick={() => setForm(p => ({...p, [opt.field]: !p[opt.field]}))}
                      className={`w-11 h-6 rounded-full transition-all ${form[opt.field] ? 'bg-primary-600' : 'bg-slate-200'} flex items-center px-0.5`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-all ${form[opt.field] ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                  </label>
                ))}
              </div>

              <div className="col-span-2">
                <label className="label">Instructions for Students</label>
                <textarea {...inp('instructions')} rows={2} className="input resize-none" placeholder="Enter test guidelines, chapter topics covered, etc." />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-slate-100 bg-slate-50/50">
              <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : <><FiSave /> Save Chapter Test</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
