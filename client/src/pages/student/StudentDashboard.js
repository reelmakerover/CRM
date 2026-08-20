// StudentDashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiClipboard, FiBarChart2, FiAward, FiArrowRight, 
  FiUser, FiLayers, FiCheckCircle, FiZap, FiPhoneCall, 
  FiMessageSquare, FiMapPin, FiMail, FiPhone 
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function StudentDashboard() {
  const { user, student } = useAuth();
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);

  useEffect(() => {
    api.get('/results').then(r => setResults(Array.isArray(r.data) ? r.data.slice(0, 5) : [])).catch(() => {});
    api.get('/exams').then(r => setExams(Array.isArray(r.data) ? r.data.filter(e => e.status === 'active').slice(0, 4) : [])).catch(() => {});
  }, []);

  const bestResult = results.reduce((best, r) => (!best || r.percentage > best.percentage) ? r : best, null);
  const isEnrolledInBatch = Boolean(student?.batch?.name || student?.batchId);

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-700 via-primary-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
                <FiZap className="inline mr-1" /> {isEnrolledInBatch ? 'Enrolled Student' : 'Free Mock Test Account'}
              </span>
              <span className="text-primary-300 text-xs font-mono">ID: {student?.enrollmentNo || 'Free Plan'}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Welcome, {user?.name}!</h1>
            <p className="text-primary-200 text-sm mt-1">
              Target Course: <strong className="text-white">{student?.course?.name || 'Commerce'}</strong> {student?.address ? `· 📍 ${student.address}` : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link 
              to="/student/exams" 
              className="btn-gold py-2.5 px-5 text-sm font-bold shadow-md inline-flex items-center gap-2"
            >
              <FiClipboard /> Start Your Test
            </Link>
            {isEnrolledInBatch ? (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-sm font-bold border border-emerald-400/40">
                <FiCheckCircle className="text-emerald-400" /> Enrolled: {student?.course?.name || student?.batch?.name || 'Active'}
              </div>
            ) : (
              <Link 
                to="/student/courses" 
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all border border-white/20"
              >
                <FiLayers /> View Courses
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Start Your Test Hero Card */}
      <div className="card p-6 border-2 border-primary-500/30 bg-gradient-to-r from-primary-50/70 to-indigo-50/50 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-700 bg-primary-100 px-2.5 py-0.5 rounded-full mb-2">
              <FiCheckCircle /> Free Feature Active
            </div>
            <h2 className="font-display text-xl font-bold text-slate-900">Start Your Practice Mock Test</h2>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl">
              Give full exam-style online tests with automatic timer, instant score calculation, percentage evaluation, and All-India percentile rank.
            </p>
          </div>
          <Link 
            to="/student/exams" 
            className="btn-primary py-3 px-6 text-sm font-bold flex-shrink-0 shadow-md inline-flex items-center gap-2"
          >
            Start Test Now <FiArrowRight />
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <FiClipboard className="text-primary-600" />, label: 'Exams Taken', value: results.length, color: 'bg-primary-50' },
          { icon: <FiBarChart2 className="text-emerald-600" />, label: 'Best Score', value: bestResult ? `${bestResult.percentage?.toFixed(0)}%` : '—', color: 'bg-emerald-50' },
          { icon: <FiAward className="text-gold-600" />, label: 'Best Rank', value: bestResult?.rank ? `#${bestResult.rank}` : '—', color: 'bg-yellow-50' },
          { icon: <FiLayers className="text-indigo-600" />, label: 'Target Stream', value: student?.course?.name || 'Commerce', color: 'bg-indigo-50' },
        ].map((s, i) => (
          <div key={i} className="card p-5 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>{s.icon}</div>
            <div>
              <div className="text-slate-500 text-xs">{s.label}</div>
              <div className="font-bold text-slate-900 text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Course Enrollment Banner (Want to join full batch?) */}
      <div className="card p-6 border-2 border-gold-400/80 bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <span className="badge bg-gold-400 text-slate-950 font-bold text-xs uppercase tracking-wide">
              🎓 Admission Open
            </span>
            <h2 className="font-display text-lg font-bold text-slate-900 mt-2">
              Join Full Academic Batches by Vikram Rathore Sir
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl">
              Get complete live + offline classes, printed books, 1-on-1 doubt clearing, and full syllabus mastery for <strong>Class 11th, 12th Commerce, CA Foundation, BCom & BBA</strong>.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link 
              to="/student/courses" 
              className="btn-gold py-2.5 px-5 text-sm font-bold shadow-sm"
            >
              Explore & Enroll in Courses <FiArrowRight />
            </Link>
            <a 
              href="https://wa.me/919876543210?text=Hi%20Vikram%20Sir%2C%20I%20want%20admission%20details%20for%20batches."
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
              title="Chat on WhatsApp"
            >
              <FiMessageSquare size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* Two Column Section: Available Exams & Student Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Available Exams */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Available Practice Exams</h2>
            <Link to="/student/exams" className="text-primary-600 text-xs hover:underline flex items-center gap-1">View all <FiArrowRight size={12}/></Link>
          </div>
          {exams.length > 0 ? (
            <div className="space-y-3">
              {exams.map(e => (
                <Link key={e.id} to={`/student/exam/${e.id}`} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-primary-300 hover:bg-primary-50 transition-all group">
                  <div>
                    <div className="font-medium text-slate-900 text-sm">{e.title}</div>
                    <div className="text-slate-400 text-xs">{e.questionsPerExam} questions · {e.duration} min · {e.course?.name || 'Commerce'}</div>
                  </div>
                  <span className="text-primary-600 group-hover:translate-x-1 transition-transform font-semibold text-xs flex items-center gap-1">
                    Start <FiArrowRight size={14}/>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">No active exams at the moment</div>
          )}
        </div>

        {/* Student Profile Snapshot */}
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 flex items-center gap-1.5">
                <FiUser className="text-primary-600" /> My Profile
              </h2>
              <Link to="/student/profile" className="text-primary-600 text-xs hover:underline flex items-center gap-1">
                Edit Profile <FiArrowRight size={12}/>
              </Link>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
                <FiUser className="text-slate-400 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-slate-400">Student Name</div>
                  <div className="font-medium text-slate-800 truncate">{user?.name || student?.name}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
                <FiMail className="text-slate-400 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-slate-400">Email Address</div>
                  <div className="font-medium text-slate-800 truncate">{user?.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
                <FiPhone className="text-slate-400 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-slate-400">Phone / WhatsApp</div>
                  <div className="font-medium text-slate-800 truncate">{student?.phone || 'Not set'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
                <FiMapPin className="text-slate-400 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-slate-400">City / Location</div>
                  <div className="font-medium text-slate-800 truncate">{student?.address || 'Not specified'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center">
            <span className="text-xs text-slate-400">Enrollment: <strong>{student?.enrollmentNo || 'Free'}</strong></span>
            <Link to="/student/profile" className="btn-secondary text-xs py-1.5 px-3">
              Full Profile Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
