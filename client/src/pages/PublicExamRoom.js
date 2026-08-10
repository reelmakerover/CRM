import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiClock, FiAlertTriangle, FiChevronLeft, FiChevronRight, 
  FiSend, FiCheck, FiX, FiMail, FiUser, FiMapPin, FiPhone, 
  FiAward, FiShield, FiArrowRight, FiMessageCircle 
} from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function PublicExamRoom() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completedInfo, setCompletedInfo] = useState(null);

  // Lead capture form
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    city: '',
    phone: ''
  });

  const startTime = useRef(null);
  const timerRef = useRef(null);

  // Load public exam
  useEffect(() => {
    api.get(`/exams/public/${examId}/start`)
      .then(({ data }) => {
        setExam(data.exam);
        setQuestions(data.questions || []);
        setTimeLeft((data.exam?.duration || 60) * 60);
      })
      .catch(err => {
        toast.error(err.response?.data?.message || 'Failed to load demo test');
        navigate('/try-test');
      })
      .finally(() => setLoading(false));
  }, [examId, navigate]);

  // Timer countdown
  useEffect(() => {
    if (!started || completedInfo) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleTimeExpired();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, completedInfo]);

  const handleTimeExpired = () => {
    toast('⏱ Time is up! Please enter your details to receive your evaluated test score report.', { icon: '⏳', duration: 6000 });
    setShowSubmitModal(true);
  };

  const startExam = () => {
    startTime.current = Date.now();
    setStarted(true);
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const isWarning = timeLeft <= 120;
  const answeredCount = Object.values(answers).filter(Boolean).length;

  const handleFinalSubmission = async (e) => {
    if (e) e.preventDefault();

    if (!leadForm.name.trim()) {
      return toast.error('Please enter your Full Name (नाम)');
    }
    if (!leadForm.email.trim() || !leadForm.email.includes('@')) {
      return toast.error('Please enter a valid Email Address (ईमेल)');
    }
    if (!leadForm.city.trim()) {
      return toast.error('Please enter your City / Location (शहर)');
    }

    setSubmitting(true);
    clearInterval(timerRef.current);
    const timeTaken = startTime.current ? Math.floor((Date.now() - startTime.current) / 1000) : (exam?.duration || 60) * 60;

    try {
      const answerArray = questions.map(q => ({
        questionId: q.id,
        selectedAnswer: answers[q.id] || '',
      }));

      const { data } = await api.post(`/exams/public/${examId}/submit`, {
        name: leadForm.name.trim(),
        email: leadForm.email.trim().toLowerCase(),
        city: leadForm.city.trim(),
        phone: leadForm.phone.trim(),
        answers: answerArray,
        timeTaken,
        questionData: questions,
      });

      setCompletedInfo(data);
      setShowSubmitModal(false);
      toast.success('🎉 Test evaluated & result sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-400 text-sm">Preparing your mock test environment...</p>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════
  // 1. COMPLETION CONFIRMATION SCREEN
  // ═════════════════════════════════════════════
  if (completedInfo) {
    const waText = encodeURIComponent(`Hi Vikram Sir, I just gave the free demo test "${completedInfo.examTitle}" from ${completedInfo.city} and received my result on email. I want to know about upcoming batch admissions.`);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-primary-950 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-8 sm:p-10 text-center border border-slate-100 relative overflow-hidden">
          {/* Top festive banner */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary-100/50 rounded-full blur-2xl" />

          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-md">
            🎉
          </div>

          <span className="badge bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
            Test Successfully Submitted
          </span>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Great Job, {completedInfo.studentName}!
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
            Your performance in <strong>"{completedInfo.examTitle}"</strong> has been recorded and evaluated by our smart exam engine.
          </p>

          {/* Email Notice Box */}
          <div className="bg-blue-50/80 border-2 border-blue-200 rounded-2xl p-5 text-left mb-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xl shadow-sm">
                <FiMail />
              </div>
              <div>
                <div className="text-xs text-blue-800 font-bold uppercase tracking-wider">Detailed Score Report Sent To:</div>
                <div className="font-semibold text-slate-900 text-sm sm:text-base break-all">{completedInfo.email}</div>
              </div>
            </div>
            <p className="text-xs text-blue-700 leading-relaxed pt-2 border-t border-blue-200/60">
              📬 Please check your <strong>Inbox</strong> (and Promotions / Spam folder) for your full marks card, percentage, and <strong>10% Admission Scholarship Code: <code className="font-bold bg-white px-1.5 py-0.5 rounded text-blue-900">DSE-SCHOLAR-10</code></strong>.
            </p>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <a 
              href={`https://wa.me/919876543210?text=${waText}`}
              target="_blank" 
              rel="noreferrer"
              className="w-full btn-gold py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <FiMessageCircle size={18} /> Chat on WhatsApp with Vikram Sir's Team
            </a>

            <div className="grid grid-cols-2 gap-3">
              <Link to="/courses" className="btn-secondary py-3 text-xs sm:text-sm font-semibold justify-center">
                Explore Courses
              </Link>
              <Link to="/try-test" className="btn-primary py-3 text-xs sm:text-sm font-semibold justify-center">
                Take Another Test
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════
  // 2. PRE-EXAM INSTRUCTIONS & START SCREEN
  // ═════════════════════════════════════════════
  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-primary-950 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 sm:p-10 border border-slate-200">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <span className="badge bg-gold-100 text-gold-800 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                Free Demo Mock Test
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-2">{exam?.title}</h1>
              <p className="text-primary-600 text-sm font-medium">{exam?.course?.name} · {exam?.subject?.name}</p>
            </div>
            <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
              📝
            </div>
          </div>

          {/* Test Meta Grid */}
          <div className="grid grid-cols-3 gap-3 my-6 text-center">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-slate-400 text-xs font-medium">Questions</div>
              <div className="font-display text-xl font-bold text-slate-800 mt-0.5">{questions.length} Qs</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-slate-400 text-xs font-medium">Duration</div>
              <div className="font-display text-xl font-bold text-slate-800 mt-0.5">{exam?.duration || 60} Min</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-slate-400 text-xs font-medium">Total Marks</div>
              <div className="font-display text-xl font-bold text-slate-800 mt-0.5">{exam?.totalMarks || 50}</div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="space-y-3 mb-8 bg-blue-50/60 p-5 rounded-2xl border border-blue-100 text-sm text-slate-700">
            <div className="font-bold text-blue-950 flex items-center gap-2">
              <FiShield className="text-blue-600" /> Instructions Before Starting:
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 list-disc list-inside">
              <li>Each question has 4 options with only 1 correct answer.</li>
              <li>{exam?.negativeMarking ? `Negative marking is ACTIVE: -${exam.negativeMarks} marks for incorrect answers.` : 'No negative marking for wrong answers.'}</li>
              <li>Timer will start immediately when you click <strong>"Start Mock Test"</strong>.</li>
              <li>At the end of test, enter your name, email & city to receive your verified score card and answer sheet.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => navigate('/try-test')} className="btn-secondary flex-1 justify-center py-3.5 text-sm">
              <FiChevronLeft /> Back to Demo Tests
            </button>
            <button onClick={startExam} className="btn-primary flex-1 justify-center py-3.5 text-sm font-bold shadow-lg">
              Start Mock Test <FiArrowRight />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════
  // 3. ACTIVE TEST ROOM INTERFACE
  // ═════════════════════════════════════════════
  const q = questions[current];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between font-body select-none">
      {/* Top Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <Link to="/try-test" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
            <FiChevronLeft /> Exit Test
          </Link>
          <div className="hidden sm:block">
            <h2 className="font-bold text-sm text-slate-100 truncate max-w-xs">{exam?.title}</h2>
            <div className="text-[11px] text-slate-400">{exam?.course?.name}</div>
          </div>
        </div>

        {/* Center: Live Timer */}
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-mono text-base font-bold transition-all shadow-inner ${
          isWarning ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse' : 'bg-slate-800 text-gold-400 border border-slate-700'
        }`}>
          <FiClock size={16} /> {formatTime(timeLeft)}
        </div>

        {/* Right: Submit Button */}
        <button 
          onClick={() => setShowSubmitModal(true)}
          className="btn-gold py-1.5 px-4 text-xs font-bold shadow-md flex items-center gap-1.5"
        >
          <FiSend size={13} /> Submit Test
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Question Box */}
        <div className="lg:col-span-8 bg-slate-950/80 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-sm">
          {/* Question Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <span className="badge bg-primary-500/20 text-primary-400 border border-primary-500/30 text-xs px-3 py-1 rounded-full font-bold">
              Question {current + 1} of {questions.length}
            </span>
            <span className="text-xs text-slate-400">
              Marks: <strong className="text-slate-200">+{q?.marks || 1}</strong>
              {exam?.negativeMarking && <span className="text-rose-400 ml-1.5">(-{exam.negativeMarks})</span>}
            </span>
          </div>

          {/* Question Text */}
          <div className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed min-h-[80px]">
            {q?.question}
          </div>

          {/* Options (A, B, C, D) */}
          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map(optKey => {
              const optVal = q ? q[`option${optKey}`] : '';
              const isSelected = answers[q?.id] === optKey;

              return (
                <button
                  key={optKey}
                  onClick={() => setAnswers(prev => ({ ...prev, [q.id]: optKey }))}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center gap-3.5 group ${
                    isSelected 
                      ? 'bg-primary-600/30 border-primary-500 text-white shadow-lg ring-1 ring-primary-500' 
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected ? 'bg-primary-500 text-white shadow-md' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                  }`}>
                    {optKey}
                  </div>
                  <span className="text-sm sm:text-base leading-snug">{optVal}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800/80">
            <button
              onClick={() => setCurrent(p => Math.max(0, p - 1))}
              disabled={current === 0}
              className="btn-secondary py-2.5 px-4 text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none"
            >
              <FiChevronLeft /> Previous
            </button>

            {answers[q?.id] && (
              <button 
                onClick={() => setAnswers(prev => {
                  const updated = { ...prev };
                  delete updated[q.id];
                  return updated;
                })}
                className="text-xs text-rose-400 hover:text-rose-300 underline"
              >
                Clear Choice
              </button>
            )}

            {current < questions.length - 1 ? (
              <button
                onClick={() => setCurrent(p => Math.min(questions.length - 1, p + 1))}
                className="btn-primary py-2.5 px-5 text-xs font-bold"
              >
                Next <FiChevronRight />
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="btn-gold py-2.5 px-5 text-xs font-bold shadow-md"
              >
                Finish Test <FiCheck />
              </button>
            )}
          </div>
        </div>

        {/* Right: Question Navigation Palette */}
        <div className="lg:col-span-4 bg-slate-950/80 rounded-3xl border border-slate-800 p-6 space-y-5 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-200 text-sm">Question Palette</h3>
            <span className="text-xs text-slate-400">{answeredCount} / {questions.length} Answered</span>
          </div>

          {/* Palette Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-[320px] overflow-y-auto p-1">
            {questions.map((item, idx) => {
              const isAnswered = Boolean(answers[item.id]);
              const isCurrent = idx === current;

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrent(idx)}
                  className={`h-10 rounded-xl font-bold text-xs transition-all flex items-center justify-center border ${
                    isCurrent 
                      ? 'border-gold-400 text-gold-400 bg-gold-500/10 ring-2 ring-gold-400/50' 
                      : isAnswered 
                        ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-400 hover:bg-emerald-600/40' 
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500"></span> Answered
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700"></span> Unanswered
            </div>
          </div>
        </div>
      </main>

      {/* ═════════════════════════════════════════════
          4. LEAD CAPTURE & RESULT SUBMISSION MODAL
      ═════════════════════════════════════════════ */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 text-slate-900 animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="badge bg-primary-100 text-primary-800 font-bold text-[11px] px-3 py-0.5 rounded-full uppercase tracking-wider">
                  Complete Test Submission
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  Enter Your Details
                </h2>
              </div>
              <button 
                onClick={() => setShowSubmitModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5">
              Your test will be evaluated instantly. Enter your details below to receive your <strong>detailed score card, answer analysis & 10% merit scholarship voucher</strong> directly in your email!
            </p>

            <form onSubmit={handleFinalSubmission} className="space-y-4">
              {/* Name */}
              <div>
                <label className="label text-slate-700 font-bold text-xs">
                  Full Name (आपका पूरा नाम) *
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={leadForm.name}
                    onChange={e => setLeadForm(p => ({ ...p, name: e.target.value }))}
                    className="input pl-10 text-sm"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="label text-slate-700 font-bold text-xs">
                  Email Address (ईमेल - जहाँ रिजल्ट आएगा) *
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul.sharma@gmail.com"
                    value={leadForm.email}
                    onChange={e => setLeadForm(p => ({ ...p, email: e.target.value }))}
                    className="input pl-10 text-sm"
                  />
                </div>
              </div>

              {/* City & Phone in 2 cols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label text-slate-700 font-bold text-xs">
                    City (शहर) *
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Indore / Bhopal"
                      value={leadForm.city}
                      onChange={e => setLeadForm(p => ({ ...p, city: e.target.value }))}
                      className="input pl-10 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="label text-slate-700 font-bold text-xs">
                    WhatsApp No. (वैकल्पिक)
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={leadForm.phone}
                      onChange={e => setLeadForm(p => ({ ...p, phone: e.target.value }))}
                      className="input pl-10 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-800 leading-snug">
                🔒 Your score report, percentage & solution sheet will be emailed to your inbox.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="btn-secondary flex-1 justify-center py-3 text-xs"
                >
                  Review Questions
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1 justify-center py-3 text-xs sm:text-sm font-bold shadow-lg"
                >
                  {submitting ? 'Evaluating & Submitting...' : 'Submit & Get Result Email'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
