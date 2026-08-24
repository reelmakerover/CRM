import React, { useEffect, useState, useMemo } from 'react';
import { 
  FiPlus, FiTrash2, FiX, FiSave, FiUpload, FiDownload, 
  FiFilter, FiEdit2, FiFolder, FiBookOpen, FiLayers, FiCheckCircle, 
  FiArrowLeft, FiChevronRight, FiGrid, FiList, FiHelpCircle, FiFileText, FiFolderPlus,
  FiRefreshCw
} from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY_QUESTION = { 
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

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  // View Mode: 'hierarchy' (Subject->Chapter) or 'master' (All Database Questions)
  const [viewMode, setViewMode] = useState('hierarchy');
  const [searchQuery, setSearchQuery] = useState('');

  // Hierarchy Selection State
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');

  // Modals
  const [subjectModal, setSubjectModal] = useState(false);
  const [newSubjectForm, setNewSubjectForm] = useState({ name: '', code: '', course: '', description: '' });
  
  const [chapterModal, setChapterModal] = useState(false);
  const [newChapterName, setNewChapterName] = useState('');

  const [questionModal, setQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionForm, setQuestionForm] = useState(EMPTY_QUESTION);

  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Fetch all data
  const fetchData = async () => {
    try {
      const [qRes, cRes, sRes] = await Promise.all([
        api.get('/exams/questions'),
        api.get('/courses'),
        api.get('/courses/subjects')
      ]);
      setQuestions(qRes.data || []);
      setCourses(cRes.data || []);
      setSubjects(sRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load Question Bank data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Subjects by selected Course
  const availableSubjects = useMemo(() => {
    if (!selectedCourseId) return subjects;
    return subjects.filter(s => String(s.course?.id || s.courseId || s.course) === String(selectedCourseId));
  }, [subjects, selectedCourseId]);

  // Active Subject Object
  const activeSubject = useMemo(() => {
    return subjects.find(s => String(s.id) === String(selectedSubjectId)) || null;
  }, [subjects, selectedSubjectId]);

  // Extract Chapters for selected Subject
  const availableChapters = useMemo(() => {
    if (!selectedSubjectId) return [];
    const set = new Set();
    questions.forEach(q => {
      const qSubId = String(q.subjectId || q.subject?.id || q.subject || '');
      if (qSubId === String(selectedSubjectId) && q.chapter && q.chapter.trim()) {
        set.add(q.chapter.trim());
      }
    });
    return Array.from(set);
  }, [questions, selectedSubjectId]);

  // Filtered Questions by Subject and Chapter
  const displayQuestions = useMemo(() => {
    return questions.filter(q => {
      const qCourseId = String(q.courseId || q.course?.id || '');
      const qSubId = String(q.subjectId || q.subject?.id || q.subject || '');
      const matchCourse = !selectedCourseId || !qCourseId || qCourseId === String(selectedCourseId);
      const matchSubject = !selectedSubjectId || !qSubId || qSubId === String(selectedSubjectId);
      const matchChapter = !selectedChapter || String(q.chapter || '').trim().toLowerCase() === String(selectedChapter).trim().toLowerCase();
      return matchCourse && matchSubject && matchChapter;
    });
  }, [questions, selectedCourseId, selectedSubjectId, selectedChapter]);

  // Handle Save New Subject
  const handleSaveSubject = async () => {
    if (!newSubjectForm.name.trim()) return toast.error('Subject Name is required');
    if (!newSubjectForm.course) return toast.error('Please select a Course for this Subject');
    
    setSaving(true);
    try {
      const res = await api.post('/courses/subjects', newSubjectForm);
      toast.success('New Subject created successfully!');
      setSubjects(prev => [...prev, res.data]);
      setSelectedSubjectId(res.data.id);
      setSubjectModal(false);
      setNewSubjectForm({ name: '', code: '', course: '', description: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create Subject');
    } finally {
      setSaving(false);
    }
  };

  // Handle Save New Chapter
  const handleSaveChapter = async () => {
    if (!newChapterName.trim()) return toast.error('Chapter Name is required');
    setSelectedChapter(newChapterName.trim());
    toast.success(`Chapter "${newChapterName.trim()}" created! Now add questions under this chapter.`);
    setChapterModal(false);
    setNewChapterName('');
  };

  // Handle Open Add Question
  const openAddQuestion = () => {
    setEditingQuestion(null);
    const targetSubId = selectedSubjectId || (subjects.length > 0 ? subjects[0].id : '');
    const targetSubObj = subjects.find(s => String(s.id) === String(targetSubId));
    const targetCourseId = targetSubObj ? (targetSubObj.courseId || targetSubObj.course?.id || '') : selectedCourseId;

    setQuestionForm({
      ...EMPTY_QUESTION,
      course: targetCourseId,
      subject: targetSubId,
      chapter: selectedChapter || 'General'
    });
    setQuestionModal(true);
  };

  // Handle Open Edit Question
  const openEditQuestion = (q) => {
    setEditingQuestion(q);
    setQuestionForm({
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
    setQuestionModal(true);
  };

  // Handle Save Question
  const handleSaveQuestion = async () => {
    if (!questionForm.question || !questionForm.optionA || !questionForm.optionB || !questionForm.optionC || !questionForm.optionD) {
      return toast.error('Question text and all 4 options are required');
    }

    const targetSubId = questionForm.subject || selectedSubjectId;
    if (!targetSubId) {
      return toast.error('Please select a Subject');
    }

    const targetSubObj = subjects.find(s => String(s.id) === String(targetSubId));

    const payload = {
      ...questionForm,
      subject: targetSubId,
      course: questionForm.course || (targetSubObj ? (targetSubObj.courseId || targetSubObj.course?.id || '') : selectedCourseId),
      chapter: questionForm.chapter || selectedChapter || 'General'
    };

    setSaving(true);
    try {
      if (editingQuestion) {
        await api.put(`/exams/questions/${editingQuestion.id}`, payload);
        toast.success('Question updated successfully!');
      } else {
        await api.post('/exams/questions', payload);
        toast.success('Question added to Question Bank!');
      }
      fetchData();
      setQuestionModal(false);
      setQuestionForm(EMPTY_QUESTION);
      setEditingQuestion(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete All Questions
  const handleDeleteAll = async () => {
    let confirmMsg = 'Are you sure you want to delete ALL questions in the Question Bank? This action cannot be undone.';
    const payload = {};

    if (viewMode === 'hierarchy' && selectedSubjectId && selectedChapter) {
      confirmMsg = `Are you sure you want to delete all questions in chapter "${selectedChapter}"?`;
      payload.subjectId = selectedSubjectId;
      payload.chapter = selectedChapter;
    } else if (viewMode === 'hierarchy' && selectedSubjectId) {
      confirmMsg = `Are you sure you want to delete all questions under subject "${activeSubject?.name}"?`;
      payload.subjectId = selectedSubjectId;
    }

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await api.post('/exams/questions/delete-all', payload);
      toast.success(res.data.message || 'Questions deleted successfully!');
      fetchData();
    } catch (err) {
      console.error('Delete all questions error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete questions');
    }
  };

  // Handle Delete Question
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.delete(`/exams/questions/${id}`);
      toast.success('Question deleted');
      fetchData();
    } catch (err) {
      console.error('Delete question error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete question');
    }
  };

  // Handle Excel Import
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    const fd = new FormData();
    fd.append('file', file);
    if (selectedSubjectId) fd.append('subjectId', selectedSubjectId);
    if (selectedChapter) fd.append('chapter', selectedChapter);

    try {
      const { data } = await api.post('/exams/questions/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImportResult(data);
      if (data.imported > 0) {
        toast.success(data.message || `Successfully imported ${data.imported} questions!`);
        await fetchData();
        if (!selectedChapter) {
          setViewMode('master');
        }
      } else {
        toast.error(data.message || 'No questions were imported.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed. Check file format.');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  // Download Sample Template
  const downloadTemplate = async () => {
    try {
      const res = await api.get('/exams/questions/template', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
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
      toast.success('Excel Template downloaded!');
    } catch (err) {
      toast.error('Failed to download template');
    }
  };

  const [seeding, setSeeding] = useState(false);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const res = await api.post('/exams/seed-demo-data');
      toast.success(res.data.message || 'Demo data seeded successfully!');
      fetchData();
    } catch (err) {
      toast.error('Failed to seed demo data');
    } finally {
      setSeeding(false);
    }
  };

  const inp = (f) => ({ value: questionForm[f] ?? '', onChange: e => setQuestionForm(p => ({ ...p, [f]: e.target.value })) });
  const diffColor = { easy: 'bg-emerald-100 text-emerald-700', medium: 'bg-yellow-100 text-yellow-700', hard: 'bg-rose-100 text-rose-700' };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-100 text-amber-800 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Systematic Question Bank
            </span>
          </div>
          <h1 className="font-display text-2xl font-black text-[#0b193c]">
            Subject & Chapter Wise Question Bank
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Create Subjects → Add Chapters → Create Questions systematically
          </p>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <button 
            onClick={handleSeedData} 
            disabled={seeding}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FiRefreshCw className={seeding ? 'animate-spin' : ''} /> {seeding ? 'Seeding...' : '🌱 Seed Demo Data'}
          </button>

          <button 
            onClick={() => setSubjectModal(true)} 
            className="bg-[#0b193c] hover:bg-[#162e63] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FiPlus /> + Add Subject
          </button>
          
          {selectedSubjectId && (
            <button 
              onClick={() => setChapterModal(true)} 
              className="bg-[#d9531e] hover:bg-[#b84214] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FiFolderPlus /> + Add Chapter
            </button>
          )}

          <button 
            onClick={openAddQuestion} 
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FiPlus /> Add Question
          </button>

          {questions.length > 0 && (
            <button 
              onClick={handleDeleteAll} 
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Delete questions"
            >
              <FiTrash2 /> Delete All Questions
            </button>
          )}
        </div>
      </div>

      {/* View Mode Toggle Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 gap-2 text-xs font-bold">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setViewMode('hierarchy')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'hierarchy' 
                ? 'bg-[#0b193c] text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <FiFolder /> 📂 Systematic Folders View
          </button>
          <button 
            onClick={() => setViewMode('master')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'master' 
                ? 'bg-[#0b193c] text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <FiList /> 📋 Master Question Bank ({questions.length} Total Questions)
          </button>
        </div>

        {viewMode === 'master' && (
          <div className="flex items-center gap-2 px-2">
            <input 
              type="text" 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              placeholder="Search questions by text or chapter..." 
              className="bg-white px-3 py-1.5 rounded-xl border border-slate-300 text-xs w-64 focus:outline-none shadow-xs"
            />
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════
          MASTER VIEW: ALL DATABASE QUESTIONS TABLE
      ═════════════════════════════════════════════════════════ */}
      {viewMode === 'master' && (
        <div className="space-y-4">
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex items-center justify-between text-xs">
            <div>
              <div className="font-extrabold text-[#0b193c] text-sm">
                📋 All Questions Master Database ({questions.length} Questions)
              </div>
              <p className="text-amber-800 text-[11px] font-medium mt-0.5">
                Imported questions appear here automatically. You can edit any question to assign or move it to a specific Subject or Chapter!
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={downloadTemplate} className="bg-white text-slate-800 border border-slate-300 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-100">
                <FiDownload className="inline mr-1" /> Template
              </button>
              <label className="bg-[#0b193c] text-white px-3 py-1.5 rounded-lg font-bold hover:bg-[#162e63] cursor-pointer">
                <FiUpload className="inline mr-1" /> Bulk Import
                <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} className="hidden" disabled={importing} />
              </label>
            </div>
          </div>

          <div className="card overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Question</th>
                  <th>Options</th>
                  <th>Answer</th>
                  <th>Course / Subject</th>
                  <th>Chapter Folder</th>
                  <th>Difficulty</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions
                  .filter(q => !searchQuery || q.question.toLowerCase().includes(searchQuery.toLowerCase()) || (q.chapter && q.chapter.toLowerCase().includes(searchQuery.toLowerCase())))
                  .map((q, i) => (
                    <tr key={q.id}>
                      <td className="text-slate-400 text-xs font-bold">{i + 1}</td>
                      <td className="max-w-xs">
                        <div className="text-sm font-bold text-slate-900 leading-snug">{q.question}</div>
                        {q.explanation && <div className="text-[10px] text-slate-400 italic mt-0.5">Sol: {q.explanation}</div>}
                      </td>
                      <td className="text-xs text-slate-600 max-w-xs space-y-0.5 font-medium">
                        <div>A: {q.optionA}</div>
                        <div>B: {q.optionB}</div>
                        <div>C: {q.optionC}</div>
                        <div>D: {q.optionD}</div>
                      </td>
                      <td>
                        <span className="bg-emerald-100 text-emerald-800 font-black text-xs px-2.5 py-1 rounded-full">
                          {q.correctAnswer}
                        </span>
                      </td>
                      <td className="text-xs">
                        <div className="font-extrabold text-[#0b193c]">{q.subject?.name || 'General Subject'}</div>
                        <div className="text-slate-400 text-[10px]">{q.course?.name || 'Commerce'}</div>
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200 font-extrabold">
                          📂 {q.chapter || 'General'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge text-[10px] font-extrabold uppercase ${diffColor[q.difficulty]}`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEditQuestion(q)} title="Edit Question" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <FiEdit2 size={15}/>
                          </button>
                          <button onClick={() => handleDeleteQuestion(q.id)} title="Delete Question" className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                            <FiTrash2 size={15}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                {questions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-400 font-semibold">
                      No questions found in Question Bank database. Click "+ Add Question" or "Bulk Import" to add questions!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          SYSTEMATIC HIERARCHY BREADCRUMB / STEPPER NAVIGATION
      ═════════════════════════════════════════════════════════ */}
      {viewMode === 'hierarchy' && (
        <>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto text-xs font-bold">
            <button 
              onClick={() => { setSelectedSubjectId(''); setSelectedChapter(''); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                !selectedSubjectId 
                  ? 'bg-[#0b193c] text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FiBookOpen /> 1. All Subjects ({subjects.length})
            </button>

            <FiChevronRight className="text-slate-400 shrink-0" />

            <button 
              disabled={!selectedSubjectId}
              onClick={() => setSelectedChapter('')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                selectedSubjectId && !selectedChapter 
                  ? 'bg-[#0b193c] text-white shadow-xs' 
                  : selectedSubjectId 
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                    : 'bg-slate-50 text-slate-400 cursor-not-allowed'
              }`}
            >
              <FiFolder /> 2. {activeSubject ? activeSubject.name : 'Select Subject'} {selectedSubjectId ? `(${availableChapters.length} Chapters)` : ''}
            </button>

            <FiChevronRight className="text-slate-400 shrink-0" />

            <div 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                selectedChapter 
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs' 
                  : 'bg-slate-50 text-slate-400'
              }`}
            >
              <FiHelpCircle /> 3. {selectedChapter ? selectedChapter : 'Select Chapter'} ({displayQuestions.length} Questions)
            </div>
          </div>

      {/* STEP 1: SUBJECT SELECTION CARDS GRID */}
      {!selectedSubjectId && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-black text-[#0b193c]">
              Step 1: Choose a Subject to Manage Chapters & Questions
            </h2>
            <select 
              value={selectedCourseId} 
              onChange={e => setSelectedCourseId(e.target.value)} 
              className="input py-2 px-3 text-xs w-auto font-bold bg-white"
            >
              <option value="">All Courses Filter</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {availableSubjects.map(s => {
              const qCount = questions.filter(q => String(q.subjectId || q.subject?.id || '') === String(s.id)).length;
              return (
                <div 
                  key={s.id}
                  onClick={() => { setSelectedSubjectId(s.id); setSelectedChapter(''); }}
                  className="bg-white p-5 rounded-2xl border-2 border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform">
                        📚
                      </div>
                      <span className="bg-slate-100 text-slate-700 font-extrabold text-[10px] px-2.5 py-1 rounded-full">
                        {qCount} Questions
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-[#0b193c] group-hover:text-amber-600 transition-colors">
                      {s.name}
                    </h3>
                    <p className="text-slate-500 text-xs font-semibold mt-1">
                      {s.course?.name || 'General Commerce'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-blue-600 group-hover:text-amber-600">
                    <span>Open Chapters & Questions</span>
                    <FiChevronRight />
                  </div>
                </div>
              );
            })}

            {/* Create New Subject Card */}
            <div 
              onClick={() => setSubjectModal(true)}
              className="bg-slate-50 border-2 border-dashed border-slate-300 hover:border-amber-500 p-5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 cursor-pointer hover:bg-white transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg group-hover:scale-110 transition-transform">
                +
              </div>
              <div className="font-extrabold text-xs text-[#0b193c]">Create New Subject</div>
              <div className="text-[10px] text-slate-400 font-semibold">Add a new subject module</div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: CHAPTER SELECTION UNDER SUBJECT */}
      {selectedSubjectId && !selectedChapter && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-amber-50 p-4 rounded-2xl border border-amber-200">
            <div>
              <div className="text-[10px] text-amber-800 font-extrabold uppercase">Step 2: Selected Subject</div>
              <h2 className="font-display text-xl font-black text-[#0b193c]">
                {activeSubject ? activeSubject.name : 'Subject Chapters'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setChapterModal(true)} 
                className="bg-[#d9531e] hover:bg-[#b84214] text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1 cursor-pointer"
              >
                <FiFolderPlus /> + Add New Chapter
              </button>
              <button 
                onClick={() => setSelectedSubjectId('')}
                className="bg-white text-slate-700 font-bold text-xs px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100"
              >
                Change Subject
              </button>
            </div>
          </div>

          {availableChapters.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="text-4xl">📂</div>
              <div className="font-extrabold text-slate-800">No Chapters created under this Subject yet!</div>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">Create your first chapter folder to systematically organize questions for this subject.</p>
              <button 
                onClick={() => setChapterModal(true)} 
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-md inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FiFolderPlus /> Create First Chapter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {availableChapters.map((ch, idx) => {
                const chQCount = questions.filter(q => 
                  String(q.subjectId || q.subject?.id || '') === String(selectedSubjectId) && 
                  String(q.chapter || '').trim() === ch
                ).length;

                return (
                  <div 
                    key={idx}
                    onClick={() => setSelectedChapter(ch)}
                    className="bg-white p-5 rounded-2xl border-2 border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-base group-hover:scale-110 transition-transform">
                          📂
                        </div>
                        <span className="bg-slate-100 text-slate-700 font-extrabold text-[10px] px-2.5 py-1 rounded-full">
                          {chQCount} Questions
                        </span>
                      </div>

                      <h3 className="font-extrabold text-sm text-[#0b193c] group-hover:text-amber-600 transition-colors">
                        {ch}
                      </h3>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-blue-600 group-hover:text-amber-600">
                      <span>View & Add Questions</span>
                      <FiChevronRight />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STEP 3: QUESTION BANK FOR SELECTED CHAPTER & SUBJECT */}
      {selectedSubjectId && selectedChapter && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 gap-3">
            <div>
              <div className="text-[10px] text-amber-800 font-extrabold uppercase">Step 3: Chapter Question Bank</div>
              <h2 className="font-display text-lg font-black text-[#0b193c] flex items-center gap-2">
                <span>📂 {selectedChapter}</span>
                <span className="text-xs font-normal text-slate-500">({activeSubject?.name})</span>
              </h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button 
                onClick={openAddQuestion} 
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <FiPlus /> Add Question to this Chapter
              </button>

              <button 
                onClick={() => setSelectedChapter('')}
                className="bg-slate-100 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-200"
              >
                Back to Chapters
              </button>
            </div>
          </div>

          {/* Excel Tools Bar */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="font-extrabold text-slate-700">
              Showing {displayQuestions.length} Questions under "{selectedChapter}"
            </div>

            <div className="flex items-center gap-2">
              <button onClick={downloadTemplate} className="bg-white text-slate-800 border border-slate-300 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-100">
                <FiDownload className="inline mr-1" /> Excel Template
              </button>
              
              <label className="bg-white text-slate-800 border border-slate-300 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-100 cursor-pointer">
                <FiUpload className="inline mr-1" /> {importing ? 'Importing...' : 'Bulk Excel Import'}
                <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} className="hidden" disabled={importing} />
              </label>
            </div>
          </div>

          {/* Questions Table */}
          <div className="card overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Question</th>
                  <th>Options</th>
                  <th>Answer</th>
                  <th>Difficulty</th>
                  <th>Marks</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayQuestions.map((q, i) => (
                  <tr key={q.id}>
                    <td className="text-slate-400 text-xs font-bold">{i + 1}</td>
                    <td className="max-w-xs">
                      <div className="text-sm font-bold text-slate-900 leading-snug">{q.question}</div>
                      {q.explanation && <div className="text-[10px] text-slate-400 italic mt-0.5">Sol: {q.explanation}</div>}
                    </td>
                    <td className="text-xs text-slate-600 max-w-xs space-y-0.5 font-medium">
                      <div>A: {q.optionA}</div>
                      <div>B: {q.optionB}</div>
                      <div>C: {q.optionC}</div>
                      <div>D: {q.optionD}</div>
                    </td>
                    <td>
                      <span className="bg-emerald-100 text-emerald-800 font-black text-xs px-2.5 py-1 rounded-full">
                        {q.correctAnswer}
                      </span>
                    </td>
                    <td>
                      <span className={`badge text-[10px] font-extrabold uppercase ${diffColor[q.difficulty]}`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="font-extrabold text-xs text-slate-800">{q.marks} Mark</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEditQuestion(q)} title="Edit Question" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <FiEdit2 size={15}/>
                        </button>
                        <button onClick={() => handleDeleteQuestion(q.id)} title="Delete Question" className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                          <FiTrash2 size={15}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {displayQuestions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-500 font-medium space-y-3">
                      <div className="text-sm font-bold text-slate-700">No questions assigned directly to "{selectedChapter}" yet.</div>
                      <div className="flex items-center justify-center gap-3 mt-3">
                        <button 
                          onClick={openAddQuestion} 
                          className="bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-black shadow-xs hover:bg-amber-500"
                        >
                          + Add Question to "{selectedChapter}"
                        </button>
                        <button 
                          onClick={() => setViewMode('master')} 
                          className="bg-[#0b193c] text-white px-4 py-2 rounded-xl text-xs font-black shadow-xs hover:bg-[#162e63]"
                        >
                          📋 View All Database Questions ({questions.length})
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </>
      )}

      {/* ═════════════════════════════════════════════════════════
          MODAL 1: CREATE NEW SUBJECT
      ═════════════════════════════════════════════════════════ */}
      {subjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-display font-black text-lg text-[#0b193c]">Create New Subject Module</h2>
              <button onClick={() => setSubjectModal(false)} className="p-1 hover:bg-slate-100 rounded-lg"><FiX /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Course *</label>
                <select 
                  value={newSubjectForm.course} 
                  onChange={e => setNewSubjectForm(p => ({ ...p, course: e.target.value }))}
                  className="input w-full font-semibold"
                >
                  <option value="">-- Select Course --</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject Name *</label>
                <input 
                  type="text" 
                  value={newSubjectForm.name} 
                  onChange={e => setNewSubjectForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Accountancy / Business Studies" 
                  className="input w-full font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject Code (Optional)</label>
                <input 
                  type="text" 
                  value={newSubjectForm.code} 
                  onChange={e => setNewSubjectForm(p => ({ ...p, code: e.target.value }))}
                  placeholder="e.g. ACC101" 
                  className="input w-full font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button onClick={() => setSubjectModal(false)} className="btn-secondary py-2 px-4 text-xs">Cancel</button>
              <button onClick={handleSaveSubject} disabled={saving} className="btn-primary py-2 px-5 text-xs">
                {saving ? 'Creating...' : 'Create Subject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          MODAL 2: CREATE NEW CHAPTER
      ═════════════════════════════════════════════════════════ */}
      {chapterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-display font-black text-lg text-[#0b193c]">Create New Chapter Folder</h2>
              <button onClick={() => setChapterModal(false)} className="p-1 hover:bg-slate-100 rounded-lg"><FiX /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Active Subject</label>
                <div className="font-extrabold text-sm text-[#0b193c] bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  📚 {activeSubject ? activeSubject.name : 'Selected Subject'}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chapter / Topic Title *</label>
                <input 
                  type="text" 
                  value={newChapterName} 
                  onChange={e => setNewChapterName(e.target.value)}
                  placeholder="e.g. Chapter 1: Introduction to Accounting" 
                  className="input w-full font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button onClick={() => setChapterModal(false)} className="btn-secondary py-2 px-4 text-xs">Cancel</button>
              <button onClick={handleSaveChapter} className="btn-primary py-2 px-5 text-xs">
                Create Chapter & Open
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          MODAL 3: ADD / EDIT QUESTION
      ═════════════════════════════════════════════════════════ */}
      {questionModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-6 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-auto text-left">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-display font-black text-lg text-[#0b193c]">
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </h2>
              <button onClick={() => setQuestionModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><FiX /></button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Question Text */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">Question Statement *</label>
                <textarea {...inp('question')} rows={3} className="input resize-none text-sm font-semibold" placeholder="Type question here..." />
              </div>

              {/* 4 Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['A','B','C','D'].map(opt => (
                  <div key={opt}>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Option {opt} *</label>
                    <input {...inp(`option${opt}`)} className="input text-xs font-semibold" placeholder={`Option ${opt}`} />
                  </div>
                ))}
              </div>

              {/* Correct Answer & Difficulty */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Correct Option *</label>
                  <select {...inp('correctAnswer')} className="input text-xs font-extrabold">
                    {['A','B','C','D'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Difficulty</label>
                  <select {...inp('difficulty')} className="input text-xs font-semibold">
                    {['easy','medium','hard'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Marks</label>
                  <input type="number" {...inp('marks')} className="input text-xs font-semibold" />
                </div>
              </div>

              {/* Auto-Assigned Location Banner or Selectors */}
              {selectedSubjectId ? (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-200/90 text-xs">
                  <span className="text-[10px] text-amber-800 font-extrabold uppercase tracking-wider block mb-1">
                    📍 Target Location (Auto-Assigned to Active Folder)
                  </span>
                  <div className="flex flex-wrap items-center gap-2 font-black text-[#0b193c] text-sm">
                    <span>📚 Subject: {activeSubject?.name || 'Selected Subject'}</span>
                    {selectedChapter && (
                      <>
                        <span className="text-amber-500">➔</span>
                        <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-lg text-xs font-black">
                          📂 Chapter: {selectedChapter}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Subject *</label>
                    <select 
                      value={questionForm.subject} 
                      onChange={e => setQuestionForm(p => ({ ...p, subject: e.target.value }))}
                      className="input w-full font-bold text-xs"
                    >
                      <option value="">-- Choose Subject --</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.course?.name || 'General'})</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Chapter Folder Name</label>
                    <input 
                      {...inp('chapter')} 
                      className="input bg-white w-full text-xs font-semibold" 
                      placeholder="e.g. Chapter 1: Introduction" 
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Solution / Explanation (Optional)</label>
                <textarea {...inp('explanation')} rows={2} className="input resize-none text-xs" placeholder="Step by step solution explanation..." />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setQuestionModal(false)} className="btn-secondary py-2 px-4 text-xs">Cancel</button>
              <button onClick={handleSaveQuestion} disabled={saving} className="btn-primary py-2 px-5 text-xs">
                {saving ? 'Saving...' : editingQuestion ? 'Save Changes' : 'Add Question'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
