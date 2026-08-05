import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiClock, FiAlertTriangle, FiChevronLeft, FiChevronRight, FiSend } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ExamRoom() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [warnings, setWarnings] = useState(0);
  const [started, setStarted] = useState(false);
  const startTime = useRef(null);
  const timerRef = useRef(null);

  // Load exam
  useEffect(() => {
    api.get(`/exams/${examId}/start`)
      .then(({ data }) => {
        setExam(data.exam);
        setQuestions(data.questions);
        setTimeLeft(data.exam.duration * 60);
      })
      .catch(err => {
        toast.error(err.response?.data?.message || 'Failed to load exam');
        navigate('/student/exams');
      })
      .finally(() => setLoading(false));
  }, [examId, navigate]);

  // Timer
  useEffect(() => {
    if (!started || result) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, result]);

  // Tab switch detection
  useEffect(() => {
    if (!started || result) return;
    const handleVisibility = () => {
      if (document.hidden) {
        setWarnings(w => {
          const newW = w + 1;
          if (newW >= 3) {
            toast.error('⚠️ Multiple tab switches detected! Exam will be submitted.');
            handleSubmit(false);
          } else {
            toast.error(`⚠️ Warning ${newW}/3: Do not switch tabs during exam!`, { duration: 5000 });
          }
          return newW;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [started, result]);

  const handleSubmit = useCallback(async (auto = false) => {
    if (submitting) return;
    if (!auto && !window.confirm('Are you sure you want to submit the exam?')) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    const timeTaken = startTime.current ? Math.floor((Date.now() - startTime.current) / 1000) : exam?.duration * 60;
    try {
      const answerArray = questions.map(q => ({
        questionId: q.id,
        selectedAnswer: answers[q.id] || '',
      }));
      const { data } = await api.post(`/exams/${examId}/submit`, {
        answers: answerArray,
        timeTaken,
        questionData: questions,
      });
      setResult(data);
      toast.success('Exam submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
      setSubmitting(false);
    }
  }, [answers, exam, examId, questions, submitting]);

  const startExam = () => {
    startTime.current = Date.now();
    setStarted(true);
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const isWarning = timeLeft <= 120;
  const answered = Object.values(answers).filter(Boolean).length;

  // RESULT SCREEN
  if (result) {
    const r = result.result;
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-8 text-center">
          <div className="text-6xl mb-4">{r.status === 'pass' ? '🎉' : '📚'}</div>
          <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
            {r.status === 'pass' ? 'Congratulations!' : 'Keep Practicing!'}
          </h1>
          <p className="text-slate-500 mb-8">Your exam has been submitted and evaluated.</p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { label: 'Score', value: `${r.marksObtained} / ${r.totalMarks}`, color: 'primary' },
              { label: 'Percentage', value: `${r.percentage?.toFixed(1)}%`, color: r.percentage >= 50 ? 'emerald' : 'rose' },
              { label: 'Grade', value: r.grade, color: 'gold' },
              { label: 'Your Rank', value: `#${result.rank || r.rank}`, color: 'violet' },
            ].map((s, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-2xl">
                <div className="text-slate-500 text-sm">{s.label}</div>
                <div className="font-display text-2xl font-bold text-primary-700">{s.value}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 justify-center mb-6">
            <div className="text-center">
              <div className="text-emerald-600 font-bold text-xl">{r.correctAnswers}</div>
              <div className="text-slate-500 text-xs">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-rose-600 font-bold text-xl">{r.incorrectAnswers}</div>
              <div className="text-slate-500 text-xs">Wrong</div>
            </div>
            <div className="text-center">
              <div className="text-slate-400 font-bold text-xl">{r.skippedQuestions}</div>
              <div className="text-slate-500 text-xs">Skipped</div>
            </div>
          </div>
          <span className={`badge text-sm px-4 py-1.5 ${r.status === 'pass' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {r.status === 'pass' ? '✅ PASSED' : '❌ FAILED'}
          </span>
          <p className="text-slate-400 text-xs mt-4">📧 Results sent to parent's email</p>
          <button onClick={() => navigate('/student/results')} className="btn-primary mt-6 w-full justify-center">
            View All Results
          </button>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-primary-200">Loading your exam...</p>
      </div>
    </div>
  );

  // START SCREEN
  if (!started) return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
      <div className="glass rounded-3xl p-8 w-full max-w-lg text-white text-center shadow-glass">
        <div className="text-5xl mb-4">📝</div>
        <h1 className="font-display text-2xl font-bold mb-2">{exam?.title}</h1>
        <p className="text-primary-300 mb-6">{exam?.course?.name} · {exam?.subject?.name}</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: 'Questions', value: exam?.questionsPerExam },
            { label: 'Duration', value: `${exam?.duration} min` },
            { label: 'Total Marks', value: exam?.totalMarks },
            { label: 'Passing Marks', value: exam?.passingMarks },
          ].map((s, i) => (
            <div key={i} className="glass-dark rounded-xl p-3">
              <div className="text-white/50 text-xs">{s.label}</div>
              <div className="text-white font-bold text-lg">{s.value}</div>
            </div>
          ))}
        </div>
        {exam?.instructions && (
          <div className="glass-dark rounded-xl p-4 mb-6 text-left">
            <p className="text-primary-300 text-xs font-semibold mb-1">📌 Instructions</p>
            <p className="text-white/80 text-sm">{exam.instructions}</p>
          </div>
        )}
        <div className="glass-dark rounded-xl p-4 mb-6 text-left space-y-2">
          <p className="text-primary-300 text-xs font-semibold">⚠️ Anti-Cheating Rules</p>
          <p className="text-white/70 text-xs">• Questions are randomly selected and shuffled for each student</p>
          <p className="text-white/70 text-xs">• Tab switching will generate warnings. 3 warnings = auto-submit</p>
          <p className="text-white/70 text-xs">• Timer starts when you click Start Exam</p>
        </div>
        <button onClick={startExam} className="btn-gold w-full justify-center text-base py-4">
          🚀 Start Exam Now
        </button>
      </div>
    </div>
  );

  // EXAM SCREEN
  const q = questions[current];
  const options = ['A', 'B', 'C', 'D'];
  const optValues = { A: q?.optionA, B: q?.optionB, C: q?.optionC, D: q?.optionD };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <div className={`sticky top-0 z-30 px-4 py-3 flex items-center justify-between shadow-md ${isWarning ? 'bg-rose-600' : 'bg-primary-800'}`}>
        <div className="text-white">
          <div className="font-semibold text-sm">{exam?.title}</div>
          <div className="text-primary-200 text-xs">Q {current + 1} of {questions.length}</div>
        </div>
        <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-1.5 rounded-xl ${isWarning ? 'bg-white text-rose-600 timer-warning' : 'bg-white/10 text-white'}`}>
          <FiClock size={18} /> {formatTime(timeLeft)}
        </div>
        <div className="text-right">
          <div className="text-white text-sm font-semibold">{answered} / {questions.length}</div>
          <div className="text-primary-300 text-xs">answered</div>
        </div>
      </div>

      {/* Warnings */}
      {warnings > 0 && (
        <div className="bg-rose-500 text-white text-center text-sm py-2 flex items-center justify-center gap-2">
          <FiAlertTriangle /> Tab switch warning {warnings}/3
        </div>
      )}

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Question */}
        <div className="flex-1 space-y-4">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">{current + 1}</span>
              <span className="text-slate-500 text-sm">{q?.marks} mark{q?.marks > 1 ? 's' : ''}</span>
            </div>
            <p className="text-slate-900 text-base font-medium leading-relaxed">{q?.question}</p>
          </div>
          <div className="space-y-3">
            {options.map(opt => {
              const selected = answers[q?.id] === opt;
              return (
                <button key={opt} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left font-medium ${
                    selected ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-slate-200 bg-white text-slate-700 hover:border-primary-300 hover:bg-primary-50/50'
                  }`}>
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm ${selected ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {opt}
                  </span>
                  {optValues[opt]}
                </button>
              );
            })}
          </div>
          <div className="flex gap-3">
            <button disabled={current === 0} onClick={() => setCurrent(c => c - 1)} className="btn-secondary flex-1 justify-center py-3 disabled:opacity-40">
              <FiChevronLeft /> Previous
            </button>
            {current < questions.length - 1 ? (
              <button onClick={() => setCurrent(c => c + 1)} className="btn-primary flex-1 justify-center py-3">
                Next <FiChevronRight />
              </button>
            ) : (
              <button onClick={() => handleSubmit(false)} disabled={submitting} className="btn-gold flex-1 justify-center py-3">
                {submitting ? 'Submitting...' : <><FiSend /> Submit Exam</>}
              </button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <div className="lg:w-64 card p-4 h-fit sticky top-24">
          <h3 className="font-semibold text-slate-700 text-sm mb-3">Question Navigator</h3>
          <div className="grid grid-cols-6 gap-1.5 mb-4">
            {questions.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                  i === current ? 'bg-primary-600 text-white shadow-md' :
                  answers[questions[i]?.id] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}>
                {i + 1}
              </button>
            ))}
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-primary-600"/><span className="text-slate-500">Current</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-300"/><span className="text-slate-500">Answered ({answered})</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-slate-100 border border-slate-200"/><span className="text-slate-500">Unanswered ({questions.length - answered})</span></div>
          </div>
          <button onClick={() => handleSubmit(false)} disabled={submitting} className="btn-primary w-full justify-center mt-4 py-2.5 text-sm">
            {submitting ? 'Submitting...' : <><FiSend size={14}/> Submit</>}
          </button>
        </div>
      </div>
    </div>
  );
}
