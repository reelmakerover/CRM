import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiAward, FiArrowRight, FiCheckCircle, FiShield, FiZap, FiFilter, FiBookOpen } from 'react-icons/fi';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../utils/api';

export default function PublicTestPage() {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/exams/public'),
      api.get('/courses')
    ])
      .then(([examRes, courseRes]) => {
        setExams(Array.isArray(examRes.data) ? examRes.data : []);
        setCourses(Array.isArray(courseRes.data) ? courseRes.data : []);
      })
      .catch(err => {
        console.error('Error fetching public exams:', err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredExams = selectedCourse === 'all' 
    ? exams 
    : exams.filter(e => String(e.courseId || e.course?.id) === String(selectedCourse));

  return (
    <div className="min-h-screen font-body bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="relative rounded-3xl bg-gradient-to-br from-primary-950 via-primary-900 to-indigo-950 text-white p-8 md:p-14 overflow-hidden shadow-2xl border border-primary-800/40">
            {/* Background glowing decorations */}
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-gold-400/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 bg-gold-400/20 text-gold-300 border border-gold-400/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <FiZap /> Free Mock Exam & Assessment
              </div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-white">
                Test Your Commerce Knowledge <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-amber-200 to-yellow-400">— Instant Result Report</span>
              </h1>
              <p className="text-slate-200 text-base md:text-lg leading-relaxed font-normal">
                Take a real board & competitive pattern mock exam prepared by <strong>Vikram Rathore Sir's faculty</strong>. No registration required to start — get your comprehensive score card and performance report emailed directly to you!
              </p>

              {/* Highlights pills */}
              <div className="flex flex-wrap gap-3 pt-2 text-xs sm:text-sm text-slate-300">
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                  <FiCheckCircle className="text-emerald-400" /> Real Exam Timer
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                  <FiShield className="text-primary-300" /> Randomized Questions
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                  <FiAward className="text-gold-300" /> Score Card Sent To Email
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Course Filters & Exams Listing */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">Available Demo Tests</h2>
              <p className="text-slate-500 text-sm">Select a test from the list below to begin immediately</p>
            </div>

            {/* Course Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              <button 
                onClick={() => setSelectedCourse('all')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  selectedCourse === 'all' 
                    ? 'bg-primary-600 text-white shadow-md' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                All Courses ({exams.length})
              </button>
              {courses.map(c => {
                const count = exams.filter(e => String(e.courseId || e.course?.id) === String(c.id)).length;
                if (count === 0) return null;
                return (
                  <button 
                    key={c.id}
                    onClick={() => setSelectedCourse(c.id)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                      String(selectedCourse) === String(c.id)
                        ? 'bg-primary-600 text-white shadow-md' 
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {c.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-slate-500 text-sm">Loading available mock tests...</p>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto">
              <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
                <FiBookOpen />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-800 mb-2">No Public Demo Tests Found</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Our faculty regularly updates the demo test series. Please check back soon or browse our full courses & batch schedules.
              </p>
              <Link to="/courses" className="btn-primary px-6 py-2.5 text-sm">
                Explore Full Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map(exam => (
                <div 
                  key={exam.id} 
                  className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-primary-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Course & Subject Tag */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="badge bg-primary-100 text-primary-800 font-bold text-xs px-3 py-1 rounded-full">
                        {exam.course?.name || 'Commerce'}
                      </span>
                      <span className="badge bg-emerald-100 text-emerald-700 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Free Demo
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display text-xl font-bold text-slate-900 group-hover:text-primary-700 transition-colors line-clamp-2">
                        {exam.title}
                      </h3>
                      {exam.subject && (
                        <div className="text-xs text-slate-500 font-medium mt-1">
                          📚 Subject: {exam.subject.name}
                        </div>
                      )}
                    </div>

                    {/* Exam Meta Info */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center text-xs">
                      <div>
                        <div className="text-slate-400 font-medium">Questions</div>
                        <div className="font-bold text-slate-800 text-sm mt-0.5">{exam.questionsPerExam || 50} Qs</div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-medium">Duration</div>
                        <div className="font-bold text-slate-800 text-sm mt-0.5">{exam.duration || 60} Min</div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-medium">Total Marks</div>
                        <div className="font-bold text-slate-800 text-sm mt-0.5">{exam.totalMarks || 50}</div>
                      </div>
                    </div>

                    {exam.instructions && (
                      <p className="text-xs text-slate-500 italic line-clamp-2 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/60">
                        "{exam.instructions}"
                      </p>
                    )}
                  </div>

                  <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">
                      Passing: <strong className="text-slate-800">{exam.passingMarks || 20}</strong> marks
                      {exam.negativeMarking && <span className="text-rose-600 block sm:inline sm:ml-1 font-medium">• Negative marking</span>}
                    </div>

                    <Link 
                      to={`/try-test/${exam.id}`}
                      className="btn-primary py-2.5 px-5 text-xs sm:text-sm flex items-center gap-1.5 shadow-md group-hover:shadow-glow transition-all"
                    >
                      Start Test <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
