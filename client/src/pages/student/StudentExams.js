import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiClock, FiHelpCircle, FiAward, FiArrowRight, FiAlertCircle, 
  FiCheckCircle, FiFolder, FiFolderMinus, FiFolderPlus, FiFileText, 
  FiSearch, FiBookOpen, FiLayers, FiCheckSquare, FiTrendingUp, FiChevronRight, FiChevronDown
} from 'react-icons/fi';
import api from '../../utils/api';

export default function StudentExams() {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubjectId, setSelectedSubjectId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedChapters, setExpandedChapters] = useState({});

  useEffect(() => {
    Promise.all([api.get('/exams'), api.get('/results')])
      .then(([examRes, resultRes]) => {
        setExams(examRes.data.filter(e => e.status === 'active'));
        setResults(resultRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const attemptedMap = useMemo(() => {
    const map = {};
    results.forEach(r => {
      const eId = r.exam?.id || r.examId || r.exam;
      if (eId) map[eId] = r;
    });
    return map;
  }, [results]);

  // Extract all distinct subjects from available active exams
  const subjectList = useMemo(() => {
    const map = {};
    exams.forEach(e => {
      const sId = e.subject?.id ? String(e.subject.id) : (e.subject?.name || 'general');
      const sName = e.subject?.name || 'General';
      const cName = e.course?.name || '';
      if (!map[sId]) {
        map[sId] = {
          id: sId,
          name: sName,
          courseName: cName,
          totalTests: 0,
          completedTests: 0,
          chapters: new Set()
        };
      }
      map[sId].totalTests++;
      if (attemptedMap[e.id]) map[sId].completedTests++;
      if (e.chapter) map[sId].chapters.add(e.chapter.trim());
    });
    return Object.values(map);
  }, [exams, attemptedMap]);

  // Group exams by Subject -> Chapter
  const hierarchy = useMemo(() => {
    let filtered = exams;
    if (selectedSubjectId !== 'ALL') {
      filtered = filtered.filter(e => {
        const sId = e.subject?.id ? String(e.subject.id) : (e.subject?.name || 'general');
        return sId === selectedSubjectId;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.title?.toLowerCase().includes(q) ||
        e.chapter?.toLowerCase().includes(q) ||
        e.subject?.name?.toLowerCase().includes(q)
      );
    }

    const grouped = {};
    filtered.forEach(e => {
      const sId = e.subject?.id ? String(e.subject.id) : (e.subject?.name || 'general');
      const sName = e.subject?.name || 'General';
      const cName = e.course?.name || '';
      const chapName = e.chapter?.trim() || 'General / Comprehensive';

      if (!grouped[sId]) {
        grouped[sId] = {
          id: sId,
          subjectName: sName,
          courseName: cName,
          chapters: {}
        };
      }

      if (!grouped[sId].chapters[chapName]) {
        grouped[sId].chapters[chapName] = [];
      }
      grouped[sId].chapters[chapName].push(e);
    });

    return Object.values(grouped);
  }, [exams, selectedSubjectId, searchQuery, attemptedMap]);

  const toggleChapter = (key) => {
    setExpandedChapters(p => ({ ...p, [key]: p[key] === undefined ? false : !p[key] }));
  };

  const totalAvailable = exams.filter(e => !attemptedMap[e.id]).length;
  const totalCompleted = exams.filter(e => attemptedMap[e.id]).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <div className="animate-spin h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full"/>
        <span className="text-slate-500 text-sm font-medium">Loading your test folders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">


      {/* Subject Folders Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
            <FiFolder className="text-primary-600" /> Select Subject Folder
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Showing {selectedSubjectId === 'ALL' ? 'All Subjects' : 'Selected Subject'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* "All Subjects" Tab Card */}
          <div 
            onClick={() => setSelectedSubjectId('ALL')}
            className={`p-4 rounded-2xl border cursor-pointer select-none transition-all ${
              selectedSubjectId === 'ALL'
                ? 'bg-primary-600 text-white border-primary-700 shadow-md ring-2 ring-primary-500/30'
                : 'bg-white text-slate-700 border-slate-200 hover:border-primary-300 hover:bg-slate-50 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <FiLayers size={20} className={selectedSubjectId === 'ALL' ? 'text-amber-300' : 'text-primary-600'} />
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                selectedSubjectId === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {exams.length} Tests
              </span>
            </div>
            <div className="font-bold text-sm truncate">All Subjects</div>
            <div className={`text-xs mt-0.5 ${selectedSubjectId === 'ALL' ? 'text-primary-100' : 'text-slate-400'}`}>
              Browse all folders
            </div>
          </div>

          {/* Subject Cards */}
          {subjectList.map(subj => {
            const isSelected = selectedSubjectId === subj.id;
            return (
              <div 
                key={subj.id}
                onClick={() => setSelectedSubjectId(subj.id)}
                className={`p-4 rounded-2xl border cursor-pointer select-none transition-all ${
                  isSelected
                    ? 'bg-primary-600 text-white border-primary-700 shadow-md ring-2 ring-primary-500/30'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-primary-300 hover:bg-slate-50 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <FiFolder size={20} className={isSelected ? 'text-amber-300' : 'text-amber-500'} />
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {subj.totalTests} Tests
                  </span>
                </div>
                <div className="font-bold text-sm truncate" title={subj.name}>
                  {subj.name}
                </div>
                <div className={`text-xs mt-0.5 truncate ${isSelected ? 'text-primary-100' : 'text-slate-400'}`}>
                  {subj.chapters.size} Chapter{subj.chapters.size !== 1 ? 's' : ''} {subj.courseName ? `· ${subj.courseName}` : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input 
          type="text" 
          placeholder="Search by chapter name or test title..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="input pl-10 py-2.5 text-sm w-full bg-white shadow-xs"
        />
      </div>

      {/* CHAPTER-WISE HIERARCHY ACCORDION */}
      <div className="space-y-6">
        {hierarchy.length === 0 ? (
          <div className="card p-12 text-center bg-white">
            <div className="text-5xl mb-3">📁</div>
            <h3 className="font-display text-lg font-bold text-slate-800">No Tests Found in this Folder</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
              There are currently no active tests in this subject folder. Please check other subjects or contact your mentor.
            </p>
          </div>
        ) : (
          hierarchy.map(subjGroup => {
            const chapKeys = Object.keys(subjGroup.chapters);

            return (
              <div key={subjGroup.id} className="space-y-4">
                {/* Subject Header Divider */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                    <FiFolder size={18} />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-slate-900 text-lg">
                      {subjGroup.subjectName}
                    </h2>
                    <span className="text-xs text-slate-500 font-medium">
                      {subjGroup.courseName} · {chapKeys.length} Chapter Folders
                    </span>
                  </div>
                </div>

                {/* Chapter Folders inside this Subject */}
                <div className="space-y-4 pl-0 sm:pl-2">
                  {chapKeys.map((chapName, cIdx) => {
                    const chapKey = `${subjGroup.id}_chap_${cIdx}`;
                    const isOpen = expandedChapters[chapKey] !== false; // default expanded
                    const testList = subjGroup.chapters[chapName];
                    const completedInChap = testList.filter(t => attemptedMap[t.id]).length;
                    const availableInChap = testList.length - completedInChap;

                    return (
                      <div key={chapKey} className="card overflow-hidden border border-slate-200 shadow-sm transition-all bg-white">
                        {/* Chapter Folder Bar */}
                        <div 
                          onClick={() => toggleChapter(chapKey)}
                          className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 via-white to-slate-50/50 hover:from-primary-50/30 hover:to-white border-b border-slate-100 flex items-center justify-between cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-amber-500 font-bold">
                              {isOpen ? <FiFolderMinus size={22} /> : <FiFolderPlus size={22} />}
                            </span>
                            <div>
                              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 flex-wrap">
                                📂 {chapName}
                              </h3>
                              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                <span>{testList.length} Total Test{testList.length !== 1 ? 's' : ''}</span>
                                {availableInChap > 0 && (
                                  <span className="text-emerald-600 font-semibold">• {availableInChap} Available to attempt</span>
                                )}
                                {completedInChap > 0 && (
                                  <span className="text-primary-600 font-semibold">• {completedInChap} Completed</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hidden sm:inline-block">
                              {isOpen ? 'Click to collapse' : 'Click to expand'}
                            </span>
                            <div className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                              {isOpen ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                            </div>
                          </div>
                        </div>

                        {/* Test Cards inside Chapter */}
                        {isOpen && (
                          <div className="p-4 sm:p-6 bg-slate-50/40">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                              {testList.map(exam => {
                                const result = attemptedMap[exam.id];
                                const isCompleted = !!result;

                                return (
                                  <div 
                                    key={exam.id} 
                                    className={`bg-white rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                                      isCompleted 
                                        ? 'border-emerald-200 hover:border-emerald-300 shadow-xs' 
                                        : 'border-slate-200/90 hover:border-primary-400 hover:shadow-md'
                                    }`}
                                  >
                                    <div>
                                      {/* Card Top: Title & Status Badge */}
                                      <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="space-y-1">
                                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 inline-block">
                                            📂 {exam.chapter || 'Chapter Test'}
                                          </span>
                                          <h4 className="font-display font-bold text-slate-900 text-base leading-snug">
                                            {exam.title}
                                          </h4>
                                        </div>

                                        {isCompleted ? (
                                          <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex-shrink-0 flex items-center gap-1">
                                            <FiCheckCircle size={12} /> Attempted
                                          </span>
                                        ) : (
                                          <span className="badge bg-emerald-100 text-emerald-800 text-xs font-bold flex-shrink-0 flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live
                                          </span>
                                        )}
                                      </div>

                                      {/* Info Pill Matrix */}
                                      <div className="grid grid-cols-3 gap-2 my-4">
                                        <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                                          <FiHelpCircle className="text-primary-500 mx-auto mb-0.5" size={15}/>
                                          <div className="font-bold text-slate-900 text-xs">{exam.questionsPerExam} Qs</div>
                                          <div className="text-slate-400 text-[10px]">Questions</div>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                                          <FiClock className="text-primary-500 mx-auto mb-0.5" size={15}/>
                                          <div className="font-bold text-slate-900 text-xs">{exam.duration} mins</div>
                                          <div className="text-slate-400 text-[10px]">Time Limit</div>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                                          <FiAward className="text-primary-500 mx-auto mb-0.5" size={15}/>
                                          <div className="font-bold text-slate-900 text-xs">{exam.totalMarks} M</div>
                                          <div className="text-slate-400 text-[10px]">Max Marks</div>
                                        </div>
                                      </div>

                                      {exam.instructions && (
                                        <p className="text-slate-500 text-xs italic line-clamp-2 mb-3 bg-slate-50 p-2 rounded-lg">
                                          "{exam.instructions}"
                                        </p>
                                      )}
                                    </div>

                                    {/* Card Footer: Action or Result */}
                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                                      <div className="text-xs text-slate-500">
                                        Pass: <span className="font-semibold text-slate-700">{exam.passingMarks}</span> / {exam.totalMarks}
                                        {exam.negativeMarking && <span className="ml-1.5 text-amber-600 font-medium">• −{exam.negativeMarks} −ve</span>}
                                      </div>

                                      {isCompleted ? (
                                        <div className="flex items-center gap-3">
                                          <div className="text-right">
                                            <div className="font-bold text-primary-700 text-sm">
                                              Score: {result.marksObtained}/{result.totalMarks} ({result.percentage?.toFixed(0)}%)
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                              result.status === 'pass' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                            }`}>
                                              {result.status === 'pass' ? 'Passed' : 'Failed'}
                                            </span>
                                          </div>
                                          <Link 
                                            to="/student/results" 
                                            className="btn-secondary text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 hover:bg-primary-50 hover:text-primary-700"
                                          >
                                            Analysis
                                          </Link>
                                        </div>
                                      ) : (
                                        <Link 
                                          to={`/student/exam/${exam.id}`} 
                                          className="btn-primary text-xs py-2 px-4 shadow-sm flex items-center gap-1.5"
                                        >
                                          Start Test <FiArrowRight size={13}/>
                                        </Link>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
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
    </div>
  );
}
