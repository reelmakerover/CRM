import React, { useEffect, useState, useMemo } from 'react';
import { 
  FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiToggleLeft, FiToggleRight, 
  FiFolder, FiFolderMinus, FiFolderPlus, FiFileText, FiClock, FiAward, 
  FiChevronDown, FiChevronRight, FiGrid, FiList, FiSearch, FiBookOpen,
  FiPlay, FiShare2, FiCopy, FiExternalLink, FiCheckCircle, FiRefreshCw,
  FiHelpCircle
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

  // Modals state
  const [shareModal, setShareModal] = useState(false);
  const [selectedShareExam, setSelectedShareExam] = useState(null);
  
  const [previewModal, setPreviewModal] = useState(false);
  const [previewExam, setPreviewExam] = useState(null);
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [previewAnswers, setPreviewAnswers] = useState({});
  const [previewIdx, setPreviewIdx] = useState(0);
  const [previewResult, setPreviewResult] = useState(null);
  const [seeding, setSeeding] = useState(false);

  // View state: 'folders' or 'table'
  const [viewMode, setViewMode] = useState('folders');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('');
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [expandedChapters, setExpandedChapters] = useState({});

  const handleShareExam = (exam) => {
    const url = `${window.location.origin}/student/exams?examId=${exam.id}`;
    setSelectedShareExam({ ...exam, shareUrl: url });
    setShareModal(true);
  };

  const copyShareUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('Exam Share URL copied to clipboard! 📋');
  };

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const res = await api.post('/exams/seed-demo-data');
      toast.success(res.data.message || 'Demo data seeded successfully!');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to seed demo data');
    } finally {
      setSeeding(false);
    }
  };

  const handleTryExam = async (exam) => {
    setPreviewResult(null);
    setPreviewAnswers({});
    setPreviewIdx(0);
    try {
      const res = await api.get(`/exams/${exam.id}/start?preview=true`);
      setPreviewExam(res.data.exam);
      setPreviewQuestions(res.data.questions || []);
      setPreviewModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start exam preview');
    }
  };

  const submitPreviewExam = () => {
    let score = 0;
    previewQuestions.forEach(q => {
      if (previewAnswers[q.id] === q.correctAnswer) score += (q.marks || 1);
    });
    setPreviewResult({
      score,
      totalMarks: previewExam?.totalMarks || previewQuestions.length,
      passed: score >= (previewExam?.passingMarks || 1)
    });
  };

  const [allQuestions, setAllQuestions] = useState([]);

  const fetch = async () => {
    try {
      const [e, c, s, q] = await Promise.all([
        api.get('/exams'), 
        api.get('/courses'), 
        api.get('/courses/subjects'),
        api.get('/exams/questions')
      ]);
      setExams(e.data); 
      setCourses(c.data); 
      setSubjects(s.data);
      setAllQuestions(q.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load exams data');
    }
  };

  useEffect(() => { fetch(); }, []);

  useEffect(() => {
    setFilteredSubjects(form.course ? subjects.filter(s => String(s.course?.id || s.courseId || s.course) === String(form.course)) : subjects);
  }, [form.course, subjects]);

  // Dynamic chapters belonging to the currently selected subject in form
  const availableChaptersForSubject = useMemo(() => {
    const set = new Set();
    
    // Standard default chapters for convenience
    const defaults = [
      'Chapter 1: Introduction & Fundamentals',
      'Chapter 2: Theory & Principles',
      'Chapter 3: Practical Accounting & Recording',
      'Chapter 4: Trial Balance & Rectification',
      'Chapter 5: Financial Statements & Final Accounts',
      'General / Comprehensive'
    ];
    defaults.forEach(c => set.add(c));

    if (form.subject) {
      // Check questions created under this subject
      allQuestions.forEach(q => {
        const qSubId = String(q.subjectId || q.subject?.id || q.subject || '');
        if (qSubId === String(form.subject) && q.chapter && q.chapter.trim()) {
          set.add(q.chapter.trim());
        }
      });

      // Check exams created under this subject
      exams.forEach(e => {
        const eSubId = String(e.subjectId || e.subject?.id || e.subject || '');
        if (eSubId === String(form.subject) && e.chapter && e.chapter.trim()) {
          set.add(e.chapter.trim());
        }
      });
    }

    return Array.from(set);
  }, [allQuestions, exams, form.subject]);

  // Questions matching selected subject & chapter
  const matchingQuestions = useMemo(() => {
    if (!form.subject) return [];
    return allQuestions.filter(q => {
      const qSubId = String(q.subjectId || q.subject?.id || q.subject || '');
      const matchSub = qSubId === String(form.subject);
      const matchChap = !form.chapter || String(q.chapter || '').trim().toLowerCase() === String(form.chapter).trim().toLowerCase();
      return matchSub && matchChap;
    });
  }, [allQuestions, form.subject, form.chapter]);

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
      chapter: defaultChapter || '',
      fromQSerial: 1,
      toQSerial: 10
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
    if (!form.subject) return toast.error('Please select a subject');

    const selectedSubObj = subjects.find(s => String(s.id) === String(form.subject));
    const targetCourseId = form.course || (selectedSubObj ? (selectedSubObj.courseId || selectedSubObj.course?.id) : null) || (courses.length > 0 ? courses[0].id : null);

    const payload = {
      ...form,
      course: targetCourseId,
      subject: form.subject,
      chapter: form.chapter && form.chapter.trim() ? form.chapter.trim() : 'General'
    };

    setSaving(true);
    try {
      if (editing) {
        await api.put(`/exams/${editing.id}`, payload);
        toast.success('Exam updated successfully');
      } else {
        await api.post('/exams', payload);
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

          <button 
            onClick={handleSeedData} 
            disabled={seeding}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FiRefreshCw className={seeding ? 'animate-spin' : ''} /> {seeding ? 'Seeding...' : '🌱 Seed Demo Data'}
          </button>

          <button onClick={() => openAdd()} className="btn-primary py-2.5 px-4 shadow-sm text-xs font-black">
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
                                    <div className="flex items-center gap-1.5 self-end sm:self-center flex-wrap">
                                      <button 
                                        onClick={() => handleTryExam(exam)} 
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                                        title="Try Exam Live as Admin"
                                      >
                                        <FiPlay size={13} /> Try Exam
                                      </button>
                                      <button 
                                        onClick={() => handleShareExam(exam)} 
                                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-extrabold text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                                        title="Copy / Share Exam URL"
                                      >
                                        <FiShare2 size={13} /> Share Link
                                      </button>
                                      <button 
                                        onClick={() => toggleStatus(exam)} 
                                        title={exam.status === 'active' ? 'Deactivate' : 'Activate'}
                                        className={`p-1.5 rounded-lg transition-colors ${
                                          exam.status === 'active' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'
                                        }`}
                                      >
                                        {exam.status === 'active' ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                                      </button>
                                      <button 
                                        onClick={() => openEdit(exam)} 
                                        className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
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
                                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
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
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button 
                          onClick={() => handleTryExam(e)} 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-2 py-1 rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
                          title="Try Exam Live"
                        >
                          <FiPlay size={12} /> Try
                        </button>
                        <button 
                          onClick={() => handleShareExam(e)} 
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-extrabold text-xs px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                          title="Share Exam URL"
                        >
                          <FiShare2 size={12} /> Share
                        </button>
                        <button 
                          onClick={() => toggleStatus(e)} 
                          title={e.status === 'active' ? 'Deactivate' : 'Activate'}
                          className={`p-1.5 rounded-lg transition-colors ${e.status === 'active' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}
                        >
                          {e.status === 'active' ? <FiToggleRight size={18}/> : <FiToggleLeft size={18}/>}
                        </button>
                        <button onClick={() => openEdit(e)} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg"><FiEdit2 size={14}/></button>
                        <button onClick={async () => { if(!window.confirm(`Delete "${e.title}"?`))return; await api.delete(`/exams/${e.id}`); toast.success('Deleted'); fetch(); }} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"><FiTrash2 size={14}/></button>
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

              {/* STEP 1: SUBJECT SELECTION */}
              <div className="col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200/90 space-y-2.5">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">1. Select Subject *</label>
                  <select 
                    value={form.subject} 
                    onChange={e => {
                      const subId = e.target.value;
                      const subObj = subjects.find(s => String(s.id) === String(subId));
                      setForm(p => ({
                        ...p,
                        subject: subId,
                        course: subObj ? (subObj.courseId || subObj.course?.id || p.course) : p.course,
                        chapter: '',
                        fromQSerial: 1,
                        toQSerial: 10
                      }));
                    }} 
                    className="input font-bold text-xs bg-white"
                  >
                    <option value="">-- Choose Subject --</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        📚 {s.name} ({s.course?.name || 'General Course'})
                      </option>
                    ))}
                  </select>
                </div>

                {form.subject && (
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <span className="text-slate-500">Auto-Linked Course: <strong className="text-[#0b193c] font-black">{subjects.find(s => String(s.id) === String(form.subject))?.course?.name || 'Commerce'}</strong></span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                      {allQuestions.filter(q => String(q.subjectId || q.subject?.id || q.subject || '') === String(form.subject)).length} Subject Questions Available
                    </span>
                  </div>
                )}
              </div>

              {/* STEP 2: CHAPTER SELECTION DROPDOWN */}
              {form.subject && (
                <div className="col-span-2 bg-amber-50/50 p-4 rounded-xl border border-amber-200/80 space-y-2.5">
                  <label className="block text-xs font-black text-amber-900 flex items-center gap-1.5">
                    <FiFolder className="text-amber-600" /> 2. Select Chapter Folder of "{subjects.find(s => String(s.id) === String(form.subject))?.name}" *
                  </label>
                  
                  <select 
                    value={form.chapter} 
                    onChange={e => {
                      const chap = e.target.value;
                      setForm(p => ({ ...p, chapter: chap }));
                    }} 
                    className="input font-bold text-xs bg-white cursor-pointer"
                  >
                    <option value="">-- Select Chapter Folder --</option>
                    {availableChaptersForSubject.map(c => (
                      <option key={c} value={c}>📂 {c}</option>
                    ))}
                    <option value="CUSTOM_NEW">+ Type Custom Chapter Name...</option>
                  </select>

                  {form.chapter === 'CUSTOM_NEW' && (
                    <input 
                      type="text"
                      onChange={e => setForm(p => ({ ...p, chapter: e.target.value }))}
                      className="input bg-white font-semibold text-xs mt-1" 
                      placeholder="Type custom chapter name..." 
                      autoFocus
                    />
                  )}
                </div>
              )}

              {/* STEP 3: QUESTION SERIAL NO. RANGE ALLOCATION */}
              {form.subject && (
                <div className="col-span-2 bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black text-blue-950 flex items-center gap-1.5">
                      <FiHelpCircle className="text-blue-600" /> 3. Select Question Range (From Serial No. X to Serial No. Y)
                    </label>
                    <span className="bg-blue-200/80 text-blue-900 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                      {matchingQuestions.length} Questions in Folder
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 mb-1">From Question Serial No. *</label>
                      <input 
                        type="number" 
                        min={1}
                        max={matchingQuestions.length || 100}
                        value={form.fromQSerial || 1}
                        onChange={e => {
                          const val = Math.max(1, parseInt(e.target.value) || 1);
                          setForm(p => {
                            const toVal = Math.max(val, p.toQSerial || (val + 9));
                            const qCount = toVal - val + 1;
                            return {
                              ...p,
                              fromQSerial: val,
                              toQSerial: toVal,
                              questionsPerExam: qCount,
                              totalMarks: qCount
                            };
                          });
                        }}
                        className="input bg-white font-bold text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 mb-1">To Question Serial No. *</label>
                      <input 
                        type="number" 
                        min={form.fromQSerial || 1}
                        max={matchingQuestions.length || 1000}
                        value={form.toQSerial || (matchingQuestions.length || 10)}
                        onChange={e => {
                          const val = parseInt(e.target.value) || 1;
                          setForm(p => {
                            const fromVal = p.fromQSerial || 1;
                            const qCount = Math.max(1, val - fromVal + 1);
                            return {
                              ...p,
                              toQSerial: val,
                              questionsPerExam: qCount,
                              totalMarks: qCount
                            };
                          });
                        }}
                        className="input bg-white font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div className="text-xs font-extrabold text-blue-900 bg-white p-2.5 rounded-lg border border-blue-200/80 flex items-center justify-between">
                    <span>Selected Range: Question #{form.fromQSerial || 1} ➔ Question #{form.toQSerial || 10}</span>
                    <span className="bg-blue-600 text-white px-2.5 py-0.5 rounded-md font-black text-xs">
                      {(form.toQSerial || 10) - (form.fromQSerial || 1) + 1} Questions Allocated
                    </span>
                  </div>
                </div>
              )}

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

      {/* SHARE EXAM URL MODAL */}
      {shareModal && selectedShareExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in text-left">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <FiShare2 size={20} />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-[#0b193c]">Share Test Link</h3>
                  <p className="text-xs text-slate-500 font-semibold">{selectedShareExam.title}</p>
                </div>
              </div>
              <button onClick={() => setShareModal(false)} className="p-2 hover:bg-slate-200 rounded-xl text-slate-500"><FiX size={18} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Direct Student Exam URL</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={selectedShareExam.shareUrl} 
                    className="input font-mono text-xs text-slate-700 bg-slate-50 selection:bg-blue-100" 
                  />
                  <button 
                    onClick={() => copyShareUrl(selectedShareExam.shareUrl)}
                    className="bg-[#0b193c] hover:bg-[#162e63] text-white px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-md"
                  >
                    <FiCopy /> Copy
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200/80 text-xs text-blue-900 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <FiCheckCircle className="text-blue-600" /> Share with Students:
                </div>
                <p className="text-slate-600 leading-relaxed font-medium">
                  Students can click this link to open the test directly in their portal.
                </p>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <a 
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Take test "${selectedShareExam.title}" here: ${selectedShareExam.shareUrl}`)}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    💬 Share on WhatsApp
                  </a>
                  <a 
                    href={selectedShareExam.shareUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
                  >
                    <FiExternalLink /> Open Link
                  </a>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
              <button onClick={() => setShareModal(false)} className="btn-secondary py-2 px-4 text-xs font-bold">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* TRY EXAM PREVIEW MODAL */}
      {previewModal && previewExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden text-left max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-[#0b193c] text-white flex items-center justify-between">
              <div>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider border border-emerald-400/30">
                  ▶️ Admin Test Mode
                </span>
                <h3 className="font-extrabold text-base text-white mt-1">{previewExam.title}</h3>
                <p className="text-xs text-slate-300 font-medium">
                  {previewExam.course?.name} · {previewExam.subject?.name} · 📂 {previewExam.chapter}
                </p>
              </div>
              <button onClick={() => setPreviewModal(false)} className="p-2 hover:bg-white/10 rounded-xl text-white"><FiX size={20} /></button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">
              {previewResult ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md text-center space-y-4">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto text-3xl font-black ${
                    previewResult.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {previewResult.passed ? '🎉' : '⚠️'}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">
                    {previewResult.passed ? 'Test Passed!' : 'Test Needs Revision'}
                  </h3>
                  <div className="text-sm font-extrabold text-slate-600">
                    Your Score: <span className="text-xl font-black text-[#0b193c]">{previewResult.score} / {previewResult.totalMarks}</span>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-4">
                    <button 
                      onClick={() => handleTryExam(previewExam)}
                      className="btn-secondary text-xs py-2 px-4 font-bold flex items-center gap-1.5"
                    >
                      <FiRefreshCw /> Retake Test
                    </button>
                    <button 
                      onClick={() => setPreviewModal(false)}
                      className="btn-primary text-xs py-2 px-5 font-bold"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
              ) : previewQuestions.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <p className="text-sm font-bold text-slate-600">No active questions linked to this chapter test yet.</p>
                  <button 
                    onClick={() => { setPreviewModal(false); window.location.href = '/admin/questions'; }}
                    className="btn-primary text-xs py-2 px-4 mx-auto"
                  >
                    + Add Questions to Bank
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Stepper / Progress Bar */}
                  <div className="flex items-center justify-between text-xs font-extrabold text-slate-600">
                    <span>Question {previewIdx + 1} of {previewQuestions.length}</span>
                    <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-md">
                      Marks: {previewQuestions[previewIdx]?.marks || 1}
                    </span>
                  </div>

                  {/* Question Box */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4 text-left">
                    <h4 className="font-bold text-slate-900 text-base leading-relaxed">
                      {previewQuestions[previewIdx]?.question}
                    </h4>

                    {/* Options */}
                    <div className="space-y-2.5 pt-2">
                      {['A', 'B', 'C', 'D'].map(opt => {
                        const optText = previewQuestions[previewIdx]?.[`option${opt}`];
                        const isSelected = previewAnswers[previewQuestions[previewIdx]?.id] === opt;

                        return (
                          <div 
                            key={opt}
                            onClick={() => setPreviewAnswers(p => ({ ...p, [previewQuestions[previewIdx]?.id]: opt }))}
                            className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold shadow-xs' 
                                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800 font-medium'
                            }`}
                          >
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {opt}
                            </span>
                            <span className="text-sm">{optText}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {!previewResult && previewQuestions.length > 0 && (
              <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
                <button 
                  disabled={previewIdx === 0}
                  onClick={() => setPreviewIdx(p => Math.max(0, p - 1))}
                  className="btn-secondary py-2 px-4 text-xs font-bold disabled:opacity-40"
                >
                  Previous Question
                </button>

                <div className="flex items-center gap-2">
                  {previewIdx < previewQuestions.length - 1 ? (
                    <button 
                      onClick={() => setPreviewIdx(p => p + 1)}
                      className="bg-[#0b193c] hover:bg-[#162e63] text-white py-2 px-5 rounded-xl text-xs font-bold shadow-sm"
                    >
                      Next Question ➔
                    </button>
                  ) : (
                    <button 
                      onClick={submitPreviewExam}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-6 rounded-xl text-xs font-black shadow-md"
                    >
                      ✓ Submit & See Score
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
