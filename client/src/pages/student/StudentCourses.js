import React, { useEffect, useState } from 'react';
import { 
  FiBook, FiCheckCircle, FiStar, FiArrowRight, FiPhoneCall, 
  FiMessageSquare, FiClock, FiCalendar, FiDollarSign, FiAward, FiShield 
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function StudentCourses() {
  const { user, student } = useAuth();
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enquiring, setEnquiring] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/courses').catch(() => ({ data: [] })),
      api.get('/batches').catch(() => ({ data: [] }))
    ]).then(([courseRes, batchRes]) => {
      const courseList = Array.isArray(courseRes.data) ? courseRes.data : [];
      setCourses(courseList);
      setBatches(Array.isArray(batchRes.data) ? batchRes.data : []);
      if (courseList.length > 0) {
        setSelectedCourse(courseList[0]);
      }
      setLoading(false);
    });
  }, []);

  const handleEnrollInquiry = async (course) => {
    setEnquiring(true);
    try {
      // Send lead/inquiry to backend CRM
      await api.post('/leads', {
        name: user?.name || student?.name || 'Registered Student',
        email: user?.email || student?.email || '',
        phone: student?.phone || 'Not Provided',
        courseName: course.name,
        city: student?.address || '',
        status: 'New Lead',
        source: 'Student Portal Course Enrollment Request',
        notes: `Student (Enrollment ID: ${student?.enrollmentNo || 'N/A'}) requested enrollment for ${course.name} from the student portal.`
      }).catch(() => {});

      toast.success(`Enrollment request for ${course.name} submitted! Our admission team will contact you shortly.`);
      
      // Also open WhatsApp support for instant chat
      const text = encodeURIComponent(`Hello Vikram Sir & D's Education Team, I am ${user?.name} (ID: ${student?.enrollmentNo || 'Free User'}). I want to enroll in the ${course.name} batch. Please share the admission procedure and fee details.`);
      window.open(`https://wa.me/919876543210?text=${text}`, '_blank');
    } catch (err) {
      toast.error('Failed to submit enrollment request');
    } finally {
      setEnquiring(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const currentCourseName = student?.course?.name || 'Free Mock Test Plan';

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-900 via-primary-800 to-indigo-900 p-7 sm:p-9 text-white shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/20 text-gold-300 text-xs font-bold uppercase tracking-wider mb-3">
            <FiStar /> Premium Batches & Live Classes
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
            Unlock Full Academic Courses & Live Coaching
          </h1>
          <p className="text-primary-200 text-sm sm:text-base mt-2 leading-relaxed">
            You currently have active <strong>Free Mock Test & Profile Access</strong>. Upgrade to full batch enrollment to access daily live lectures, printed notes, masterclasses, and 1-on-1 mentorship by <strong>Vikram Rathore Sir</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-6">
            <a 
              href="https://wa.me/919876543210?text=Hi%20Vikram%20Sir%2C%20I%20want%20admission%20counseling%20for%20Commerce%20courses." 
              target="_blank" 
              rel="noreferrer"
              className="btn-gold py-2.5 px-5 text-sm font-bold shadow-lg inline-flex items-center gap-2"
            >
              <FiMessageSquare size={16} /> Instant WhatsApp Admission
            </a>
            <a 
              href="tel:+919876543210"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all border border-white/20"
            >
              <FiPhoneCall size={16} /> Helpline: +91 98765 43210
            </a>
          </div>
        </div>
      </div>

      {/* Current Plan vs Full Batch Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Free Plan Card */}
        <div className="card p-6 border-2 border-slate-200 bg-white relative">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-slate-800 text-lg">Your Current Plan</h3>
            <span className="badge bg-emerald-100 text-emerald-700 text-xs font-bold">Active Free Access</span>
          </div>
          <p className="text-slate-500 text-sm mb-4">You have free access to self-practice features:</p>
          <ul className="space-y-2.5 text-sm text-slate-700">
            <li className="flex items-center gap-2 text-emerald-700 font-medium">
              <FiCheckCircle size={16} className="text-emerald-500" /> Start Your Test (Full Mock Exam Engine)
            </li>
            <li className="flex items-center gap-2 text-emerald-700 font-medium">
              <FiCheckCircle size={16} className="text-emerald-500" /> Instant Exam Results & Score Breakdown
            </li>
            <li className="flex items-center gap-2 text-emerald-700 font-medium">
              <FiCheckCircle size={16} className="text-emerald-500" /> Personal Student Profile & ID
            </li>
            <li className="flex items-center gap-2 text-slate-400">
              <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 text-center leading-4 text-xs font-bold">✕</span> Live / Offline Classroom Lectures (Locked)
            </li>
            <li className="flex items-center gap-2 text-slate-400">
              <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 text-center leading-4 text-xs font-bold">✕</span> Printed Study Books & Exam Kits (Locked)
            </li>
          </ul>
        </div>

        {/* Full Enrollment Card */}
        <div className="card p-6 border-2 border-gold-400 bg-gradient-to-br from-amber-50/60 to-orange-50/40 relative">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-slate-900 text-lg">Full Batch Admission</h3>
            <span className="badge bg-gold-400 text-slate-950 font-bold text-xs">Recommended</span>
          </div>
          <p className="text-slate-600 text-sm mb-4">Complete classroom preparation package:</p>
          <ul className="space-y-2.5 text-sm text-slate-800">
            <li className="flex items-center gap-2 font-semibold text-primary-900">
              <FiCheckCircle size={16} className="text-primary-600" /> Daily Classes by Vikram Rathore Sir
            </li>
            <li className="flex items-center gap-2 font-semibold text-primary-900">
              <FiCheckCircle size={16} className="text-primary-600" /> Complete Printed Books & Formula Sheets Delivered
            </li>
            <li className="flex items-center gap-2 font-semibold text-primary-900">
              <FiCheckCircle size={16} className="text-primary-600" /> 100% Chapter-wise Video Archive
            </li>
            <li className="flex items-center gap-2 font-semibold text-primary-900">
              <FiCheckCircle size={16} className="text-primary-600" /> Weekly Offline & Online Doubt Clearing Sessions
            </li>
            <li className="flex items-center gap-2 font-semibold text-primary-900">
              <FiCheckCircle size={16} className="text-primary-600" /> Comprehensive Board / CA Exam Kits
            </li>
          </ul>
        </div>
      </div>

      {/* Available Courses & Batches */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">Available Courses & Batches</h2>
            <p className="text-slate-500 text-sm">Select a course to view details and request enrollment</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(c => {
            const courseBatches = batches.filter(b => (b.course?.id || b.courseId || b.course) === c.id);
            const isStudentCourse = student?.courseId === c.id || student?.course?.name === c.name;

            return (
              <div 
                key={c.id} 
                className={`card p-6 flex flex-col justify-between transition-all hover:shadow-card-hover ${
                  isStudentCourse ? 'border-2 border-primary-500 ring-4 ring-primary-50' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-display font-bold text-slate-900 text-lg leading-snug">{c.name}</h3>
                      <p className="text-primary-600 text-xs font-semibold mt-0.5">{c.duration || 'Full Academic Session'}</p>
                    </div>
                    {isStudentCourse && (
                      <span className="badge bg-primary-100 text-primary-700 text-xs font-bold flex-shrink-0">
                        Selected Course
                      </span>
                    )}
                  </div>

                  <p className="text-slate-600 text-sm line-clamp-2 mb-4">
                    {c.description || 'Comprehensive commerce preparation with concept-clearing lectures, practice questions, and board exam strategies.'}
                  </p>

                  {/* Highlights */}
                  <div className="space-y-2 py-3 border-t border-b border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Mode:</span>
                      <span className="font-semibold text-slate-700">Offline & Online Hybrid</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Instructor:</span>
                      <span className="font-semibold text-slate-700">Vikram Rathore Sir</span>
                    </div>
                    {courseBatches.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Batches Active:</span>
                        <span className="font-semibold text-emerald-600">{courseBatches.length} Batches</span>
                      </div>
                    )}
                    {c.fee && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-400">Course Fee:</span>
                        <span className="font-bold text-slate-900 text-sm">₹{c.fee}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {isStudentCourse ? (
                    <div className="w-full py-2.5 bg-emerald-100 text-emerald-800 font-extrabold text-sm rounded-xl text-center flex items-center justify-center gap-2 border border-emerald-300 shadow-xs">
                      <FiCheckCircle className="text-emerald-600 text-lg" /> Currently Enrolled
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEnrollInquiry(c)}
                      disabled={enquiring}
                      className="w-full btn-primary py-2.5 justify-center text-sm font-bold shadow-sm"
                    >
                      Request Admission & Enroll <FiArrowRight />
                    </button>
                  )}
                  <a
                    href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi Vikram Sir, I am interested in enrolling for ${c.name}. Please share batch timings and admission form.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                  >
                    <FiMessageSquare size={13} /> Chat on WhatsApp
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
