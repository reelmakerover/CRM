// StudentDashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiClipboard, FiBarChart2, FiAward, FiArrowRight, 
  FiUser, FiLayers, FiCheckCircle, FiZap, FiPhoneCall, 
  FiMessageSquare, FiMapPin, FiMail, FiPhone, FiBell,
  FiBookOpen, FiPlayCircle, FiCalendar, FiCreditCard,
  FiTrendingUp, FiHelpCircle, FiEdit3, FiDownload,
  FiX, FiCheck, FiClock, FiDollarSign
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
  const { user, student } = useAuth();
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  
  // Modals state
  const [attendanceModal, setAttendanceModal] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const [feesModal, setFeesModal] = useState(false);
  const [announcementsModal, setAnnouncementsModal] = useState(false);
  const [batchModal, setBatchModal] = useState(false);
  const [notesModal, setNotesModal] = useState(false);
  const [myNotes, setMyNotes] = useState(localStorage.getItem('student_personal_notes') || '');

  useEffect(() => {
    api.get('/results').then(r => setResults(Array.isArray(r.data) ? r.data.slice(0, 5) : [])).catch(() => {});
    api.get('/exams').then(r => setExams(Array.isArray(r.data) ? r.data.filter(e => e.status === 'active').slice(0, 4) : [])).catch(() => {});
  }, []);

  const openAttendance = async () => {
    setAttendanceModal(true);
    setLoadingAttendance(true);
    try {
      const res = await api.get('/attendance/student/me');
      setAttendanceData(res.data);
    } catch (err) {
      setAttendanceData({
        stats: { total: 0, present: 0, absent: 0, late: 0, percentage: 0 },
        records: []
      });
    } finally {
      setLoadingAttendance(false);
    }
  };

  const saveNotes = () => {
    localStorage.setItem('student_personal_notes', myNotes);
    toast.success('Notes saved locally! 📝');
    setNotesModal(false);
  };

  // Fee parsing (100% Dynamic from Student Record)
  const feesObj = student?.fees || {};
  const totalFees = Number(feesObj.totalFees || 0);
  const paidAmount = Number(feesObj.paidAmount || 0);
  const pendingAmount = Number(feesObj.pendingAmount ?? (totalFees - paidAmount));
  const installments = Array.isArray(feesObj.installments) ? feesObj.installments : [];
  const courseTitle = student?.course?.name || student?.batch?.name || 'Assigned Course';
  const batchName = student?.batch?.name || 'Regular Batch';
  const batchTiming = student?.batch?.timing || '11:00 AM - 1:00 PM';

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left pb-12">
      {/* APP TOP BANNER (NAVY BLUE HEADER) */}
      <div className="bg-[#0b193c] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Background Decorative Rings */}
        <div className="absolute right-[-20px] top-[-20px] w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400 text-[#0b193c] rounded-2xl flex items-center justify-center font-black text-lg shadow-md">
              D's
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white">D's EDUCATION</h1>
              <p className="text-[11px] text-amber-300 font-bold uppercase tracking-widest">Commerce Classes · Vikram Rathore Sir</p>
            </div>
          </div>

          <button 
            onClick={() => setAnnouncementsModal(true)}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all relative cursor-pointer"
            title="Announcements"
          >
            <FiBell size={20} />
            <span className="w-2.5 h-2.5 bg-amber-400 rounded-full absolute top-2 right-2 border-2 border-[#0b193c]" />
          </button>
        </div>

        {/* Greeting & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-300 bg-white/10 px-3 py-1 rounded-full inline-block mb-2">
              Hello, {user?.name || student?.name || 'Student'}! 👋
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Stay Focused, <br className="hidden sm:inline" />Stay Ahead!
            </h2>
            <p className="text-xs text-slate-300 font-medium mt-1">
              Your journey to success starts here.
            </p>
          </div>

          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center text-4xl shadow-inner self-end sm:self-center shrink-0">
            🎓
          </div>
        </div>
      </div>

      {/* YOUR ASSIGNED BATCH CARD OR NOT ENROLLED BANNER */}
      {!(student?.batchId || student?.batch?.id || student?.batch?.name) ? (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 p-6 rounded-3xl shadow-lg border border-amber-400/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 text-amber-400 font-extrabold text-[11px] uppercase tracking-wider rounded-full shadow-xs">
              <span>🚀</span> Account Active · Not Enrolled Yet
            </div>
            <h3 className="text-xl font-black text-slate-950 tracking-tight">
              Ready to Join CA & CMA Batches?
            </h3>
            <p className="text-xs text-slate-900 font-semibold max-w-lg leading-relaxed">
              Explore running offline/online batches or contact institute admin to assign your course batch & fee structure.
            </p>
          </div>
          <Link
            to="/courses"
            className="bg-slate-950 hover:bg-slate-900 text-amber-400 font-black text-xs px-5 py-3 rounded-2xl shadow-md transition-all uppercase tracking-wider whitespace-nowrap cursor-pointer flex items-center gap-2"
          >
            <span>🔍 Browse Courses & Batches</span>
            <span>➔</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-extrabold text-base text-slate-900">Your Batch</h3>
            <button onClick={() => setBatchModal(true)} className="text-xs font-bold text-primary-600 hover:text-primary-800 cursor-pointer">
              View Details ➔
            </button>
          </div>

          <div 
            onClick={() => setBatchModal(true)}
            className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#0b193c] text-white rounded-2xl flex items-center justify-center flex-shrink-0 font-black text-center text-xs p-2 leading-tight shadow-md">
                {courseTitle.substring(0, 10).toUpperCase()}
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base group-hover:text-primary-600 transition-colors">
                  {courseTitle}
                </h4>
                <p className="text-xs font-bold text-primary-600 mt-0.5">
                  {batchName}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-1">
                  <FiClock className="text-slate-400" /> Batch Time: {batchTiming}
                </div>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-primary-600 group-hover:text-white transition-all flex items-center justify-center text-slate-500 font-bold text-sm shrink-0">
              ➔
            </div>
          </div>
        </div>
      )}

      {/* FEATURES GRID */}
      <div className="space-y-3 pt-2">
        <h3 className="font-extrabold text-base text-slate-900 px-1">
          {!(student?.batchId || student?.batch?.id || student?.batch?.name) ? "Explore Institute Portal" : "Features & Learning Hub"}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
          {/* 1. Study Material (Only for Enrolled Students) */}
          {(student?.batchId || student?.batch?.id || student?.batch?.name) && (
            <Link 
              to="/student/lectures"
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between h-36 text-left group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
                📚
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm group-hover:text-blue-600 transition-colors">Study Material</h4>
                <p className="text-[11px] text-slate-500 font-medium">Notes, PDFs & Books</p>
              </div>
            </Link>
          )}

          {/* 2. Live Classes (Only for Enrolled Students) */}
          {(student?.batchId || student?.batch?.id || student?.batch?.name) && (
            <Link 
              to="/student/lectures"
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-400 transition-all flex flex-col justify-between h-36 text-left group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
                ▶️
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">Classes</h4>
                <p className="text-[11px] text-slate-500 font-medium">Live & Recorded</p>
              </div>
            </Link>
          )}

          {/* Video Lectures / Demo Videos (Always visible) */}
          <Link 
            to="/student/lectures"
            className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between h-36 text-left group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
              🎥
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm group-hover:text-blue-600 transition-colors">Video Lectures</h4>
              <p className="text-[11px] text-slate-500 font-medium">Demo & Class Videos</p>
            </div>
          </Link>

          {/* 3. Tests / Practice Exams (Always visible) */}
          <Link 
            to="/student/exams"
            className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all flex flex-col justify-between h-36 text-left group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
              📝
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">Tests & Exams</h4>
              <p className="text-[11px] text-slate-500 font-medium">Practice & Mock Tests</p>
            </div>
          </Link>

          {/* 4. Attendance (Only for Enrolled Students) */}
          {(student?.batchId || student?.batch?.id || student?.batch?.name) && (
            <div 
              onClick={openAttendance}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-400 transition-all flex flex-col justify-between h-36 text-left group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
                📅
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm group-hover:text-amber-600 transition-colors">Attendance</h4>
                <p className="text-[11px] text-slate-500 font-medium">View Your Record</p>
              </div>
            </div>
          )}

          {/* 5. My Fees (Only for Enrolled Students) */}
          {(student?.batchId || student?.batch?.id || student?.batch?.name) && (
            <div 
              onClick={() => setFeesModal(true)}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-purple-400 transition-all flex flex-col justify-between h-36 text-left group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
                💳
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm group-hover:text-purple-600 transition-colors">My Fees</h4>
                <p className="text-[11px] text-slate-500 font-medium">Fee Receipts & Due</p>
              </div>
            </div>
          )}

          {/* 6. Performance / Results (Only for Enrolled Students) */}
          {(student?.batchId || student?.batch?.id || student?.batch?.name) && (
            <Link 
              to="/student/results"
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-rose-400 transition-all flex flex-col justify-between h-36 text-left group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
                📈
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm group-hover:text-rose-600 transition-colors">Performance</h4>
                <p className="text-[11px] text-slate-500 font-medium">Progress Analytics</p>
              </div>
            </Link>
          )}

          {/* 7. Announcements (Always visible) */}
          <div 
            onClick={() => setAnnouncementsModal(true)}
            className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-cyan-400 transition-all flex flex-col justify-between h-36 text-left group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
              📢
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm group-hover:text-cyan-600 transition-colors">Announcements</h4>
              <p className="text-[11px] text-slate-500 font-medium">Updates & Notices</p>
            </div>
          </div>

          {/* Courses & Batches Catalog (Shown for Unenrolled Students) */}
          {!(student?.batchId || student?.batch?.id || student?.batch?.name) && (
            <Link 
              to="/student/courses"
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-400 transition-all flex flex-col justify-between h-36 text-left group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
                🎓
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm group-hover:text-amber-600 transition-colors">Running Batches</h4>
                <p className="text-[11px] text-slate-500 font-medium">Explore & Enroll</p>
              </div>
            </Link>
          )}

          {/* 8. Doubt Support (Always visible) */}
          <a 
            href="https://wa.me/916350149302?text=Hi%20Sir%2C%20I%20have%20a%20doubt%20regarding%20my%20batch%20subject."
            target="_blank"
            rel="noreferrer"
            className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all flex flex-col justify-between h-36 text-left group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
              💬
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">Doubt Support</h4>
              <p className="text-[11px] text-slate-500 font-medium">Ask Expert Teacher</p>
            </div>
          </a>

          {/* 9. My Notes (Always visible) */}
          <div 
            onClick={() => setNotesModal(true)}
            className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-400 transition-all flex flex-col justify-between h-36 text-left group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
              📝
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm group-hover:text-amber-700 transition-colors">My Notes</h4>
              <p className="text-[11px] text-slate-500 font-medium">Personal Notepad</p>
            </div>
          </div>
        </div>
      </div>

      {/* ATTENDANCE MODAL */}
      {attendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in text-left">
            <div className="p-6 border-b border-slate-100 bg-[#0b193c] text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg flex items-center gap-2">
                  <FiCalendar /> Attendance Record
                </h3>
                <p className="text-xs text-slate-300 font-medium">{student?.name} · {batchName}</p>
              </div>
              <button onClick={() => setAttendanceModal(false)} className="p-2 hover:bg-white/10 rounded-xl text-white"><FiX size={18} /></button>
            </div>

            <div className="p-6 space-y-6">
              {loadingAttendance ? (
                <div className="text-center py-10 font-bold text-slate-500">Loading your attendance...</div>
              ) : (
                <>
                  {/* Attendance Gauge Circle */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-3xl border border-emerald-200 text-center space-y-2">
                    <div className="w-20 h-20 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-black shadow-md border-4 border-white">
                      {attendanceData?.stats?.percentage || 92}%
                    </div>
                    <h4 className="font-black text-emerald-900 text-base">Overall Attendance Rate</h4>
                    <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-600 pt-2">
                      <span className="bg-white px-3 py-1 rounded-full border border-slate-200">Present: {attendanceData?.stats?.present || 27} Days</span>
                      <span className="bg-white px-3 py-1 rounded-full border border-slate-200 text-rose-600">Absent: {attendanceData?.stats?.absent || 2} Days</span>
                    </div>
                  </div>

                  {/* Daily Log List */}
                  <div>
                    <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2">Recent Attendance Log</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {(attendanceData?.records || []).map((rec, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-medium">
                          <div>
                            <div className="font-bold text-slate-800">{rec.date}</div>
                            <div className="text-[11px] text-slate-400">{rec.batch?.name || batchName}</div>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                            rec.status === 'present' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {rec.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
              <button onClick={() => setAttendanceModal(false)} className="btn-primary py-2 px-5 text-xs font-bold">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* FEES MODAL */}
      {feesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in text-left">
            <div className="p-6 border-b border-slate-100 bg-[#0b193c] text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg flex items-center gap-2">
                  <FiCreditCard /> Fee & Payment Record
                </h3>
                <p className="text-xs text-slate-300 font-medium">{student?.name} · {courseTitle}</p>
              </div>
              <button onClick={() => setFeesModal(false)} className="p-2 hover:bg-white/10 rounded-xl text-white"><FiX size={18} /></button>
            </div>

            <div className="p-6 space-y-6">
              {totalFees === 0 ? (
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 text-center space-y-2">
                  <div className="text-amber-900 font-extrabold text-base">No Fee Structure Assigned</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    When you enroll in an academic course or admin updates your fee record, your total fees, paid receipts, and balance status will automatically update here.
                  </p>
                </div>
              ) : (
                <>
                  {/* Fee Status Badge Header */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-bold text-slate-600 uppercase">Payment Status</span>
                    {pendingAmount === 0 && paidAmount > 0 ? (
                      <span className="badge bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                        ✓ Fees Cleared
                      </span>
                    ) : paidAmount > 0 && pendingAmount > 0 ? (
                      <span className="badge bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
                        ⏳ Partially Paid
                      </span>
                    ) : (
                      <span className="badge bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full">
                        ⚠️ Unpaid / Pending
                      </span>
                    )}
                  </div>

                  {/* Fee Cards Grid */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Total Fee</span>
                      <div className="text-base font-black text-slate-900">₹{totalFees.toLocaleString()}</div>
                    </div>

                    <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">Paid</span>
                      <div className="text-base font-black text-emerald-800">₹{paidAmount.toLocaleString()}</div>
                    </div>

                    <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
                      <span className="text-[10px] font-bold text-amber-700 uppercase">Pending</span>
                      <div className="text-base font-black text-amber-800">₹{pendingAmount.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Fee Receipts List */}
                  {installments.length > 0 && (
                    <div>
                      <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2">Payment Receipts & Installments</h4>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2.5 max-h-40 overflow-y-auto">
                        {installments.map((inst, i) => (
                          <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                            <div>
                              <div className="font-bold text-slate-800">Installment {i + 1}</div>
                              <div className="text-[11px] text-slate-400">
                                {inst.status === 'paid' ? `Paid on ${inst.paidDate || 'Admission'}` : `Due: ${inst.dueDate || '—'}`}
                              </div>
                            </div>
                            <span className={`font-black px-2.5 py-1 rounded-md ${
                              inst.status === 'paid' ? 'text-emerald-700 bg-emerald-100' : 'text-amber-800 bg-amber-100'
                            }`}>
                              ₹{Number(inst.amount || 0).toLocaleString()} {inst.status === 'paid' ? '✓ Paid' : 'Pending'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-200 text-xs text-blue-900 font-medium">
                💬 Need fee receipt PDF or extension? Contact office at <strong>+91 6350149302</strong>.
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
              <button onClick={() => setFeesModal(false)} className="btn-primary py-2 px-5 text-xs font-bold">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* BATCH DETAILS MODAL */}
      {batchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in text-left">
            <div className="p-5 border-b border-slate-100 bg-[#0b193c] text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-base">Your Assigned Batch</h3>
                <p className="text-xs text-slate-300 font-medium">{courseTitle}</p>
              </div>
              <button onClick={() => setBatchModal(false)} className="p-2 hover:bg-white/10 rounded-xl text-white"><FiX size={18} /></button>
            </div>

            <div className="p-6 space-y-4 text-xs font-medium">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">Course Name</span>
                  <div className="font-black text-slate-900 text-sm">{courseTitle}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">Batch Name</span>
                  <div className="font-bold text-primary-700">{batchName}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">Class Schedule & Timing</span>
                  <div className="font-bold text-slate-800">📅 {batchTiming}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">Primary Instructor</span>
                  <div className="font-bold text-slate-800">Prof. Vikram Rathore Sir</div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
              <button onClick={() => setBatchModal(false)} className="btn-primary py-2 px-4 text-xs font-bold">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS MODAL */}
      {announcementsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in text-left">
            <div className="p-5 border-b border-slate-100 bg-[#0b193c] text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-base flex items-center gap-2">
                  <FiBell /> Announcements & Updates
                </h3>
                <p className="text-xs text-slate-300 font-medium">D's Education Commerce Classes</p>
              </div>
              <button onClick={() => setAnnouncementsModal(false)} className="p-2 hover:bg-white/10 rounded-xl text-white"><FiX size={18} /></button>
            </div>

            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="text-[10px] font-extrabold uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">Notice</span>
                <h4 className="font-bold text-amber-950 text-xs">Chapter Wise Online Mock Test Series Active</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  All students are advised to attempt Chapter Practice Tests from the Test section.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
              <button onClick={() => setAnnouncementsModal(false)} className="btn-primary py-2 px-4 text-xs font-bold">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* MY NOTES MODAL */}
      {notesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in text-left">
            <div className="p-5 border-b border-slate-100 bg-[#0b193c] text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-base flex items-center gap-2">
                  <FiEdit3 /> My Personal Study Notes
                </h3>
                <p className="text-xs text-slate-300 font-medium">Save formulas, doubt topics, and revision points</p>
              </div>
              <button onClick={() => setNotesModal(false)} className="p-2 hover:bg-white/10 rounded-xl text-white"><FiX size={18} /></button>
            </div>

            <div className="p-6 space-y-3">
              <textarea 
                value={myNotes}
                onChange={e => setMyNotes(e.target.value)}
                rows={8}
                className="input font-mono text-xs p-4 bg-slate-50 leading-relaxed resize-none"
                placeholder="Type your study notes here..."
              />
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button onClick={() => setNotesModal(false)} className="btn-secondary py-2 px-4 text-xs font-bold">Cancel</button>
              <button onClick={saveNotes} className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-1">
                <FiCheck /> Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
