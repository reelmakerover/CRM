import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiHelpCircle, FiAward, FiArrowRight, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import api from '../../utils/api';

export default function StudentExams() {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/exams'), api.get('/results')])
      .then(([examRes, resultRes]) => {
        setExams(examRes.data.filter(e => e.status === 'active'));
        setResults(resultRes.data);
      }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const attemptedIds = new Set(results.map(r => r.exam?.id || r.exam));
  const available = exams.filter(e => !attemptedIds.has(e.id));
  const completed = exams.filter(e => attemptedIds.has(e.id));
  const getResult = (examId) => results.find(r => (r.exam?.id || r.exam) === examId);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full"/></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">My Exams</h1>
        <p className="text-slate-500 text-sm mt-1">{available.length} available · {completed.length} completed</p>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-2xl p-5 flex gap-4 items-start">
        <FiAlertCircle className="text-primary-600 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <div className="font-semibold text-primary-800 mb-1">Before you start an exam:</div>
          <ul className="text-primary-700 text-sm space-y-1">
            <li>• 50 randomly selected questions from the question bank per student</li>
            <li>• Options are shuffled — switching tabs triggers warnings</li>
            <li>• 3 tab-switch warnings = auto-submission</li>
            <li>• Results shown instantly & emailed to parents</li>
            <li>• Each exam can only be attempted <strong>once</strong></li>
          </ul>
        </div>
      </div>

      {available.length > 0 ? (
        <div>
          <h2 className="font-semibold text-slate-800 text-lg mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>Available ({available.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {available.map(exam => (
              <div key={exam.id} className="card p-6 border-l-4 border-primary-500 hover:shadow-card-hover transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display font-bold text-slate-900 text-lg leading-tight">{exam.title}</h3>
                    <p className="text-primary-600 text-sm font-medium mt-1">{exam.course?.name} · {exam.subject?.name}</p>
                  </div>
                  <span className="badge bg-emerald-100 text-emerald-700 flex-shrink-0 ml-3">Live</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[{icon:FiHelpCircle,label:'Questions',value:exam.questionsPerExam},{icon:FiClock,label:'Duration',value:`${exam.duration} min`},{icon:FiAward,label:'Max Marks',value:exam.totalMarks}].map(s=>(
                    <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
                      <s.icon className="text-primary-500 mx-auto mb-1" size={16}/>
                      <div className="font-bold text-slate-900 text-sm">{s.value}</div>
                      <div className="text-slate-400 text-xs">{s.label}</div>
                    </div>
                  ))}
                </div>
                {exam.instructions && <p className="text-slate-500 text-xs mb-4 italic">"{exam.instructions}"</p>}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-400">Pass: {exam.passingMarks}/{exam.totalMarks} marks{exam.negativeMarking&&<span className="ml-2 text-orange-500">• –ve marking</span>}</div>
                  <Link to={`/student/exam/${exam.id}`} className="btn-primary text-sm py-2 px-5">Start Exam <FiArrowRight size={14}/></Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card p-10 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="font-display text-xl font-bold text-slate-700 mb-2">No exams available right now</h3>
          <p className="text-slate-500">Check back later or ask your admin for upcoming exams.</p>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h2 className="font-semibold text-slate-800 text-lg mb-4 flex items-center gap-2">
            <FiCheckCircle className="text-emerald-500" size={18}/>Completed ({completed.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completed.map(exam => {
              const result = getResult(exam.id);
              return (
                <div key={exam.id} className="card p-5 border-l-4 border-emerald-400">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800">{exam.title}</h3>
                      <p className="text-slate-500 text-sm">{exam.course?.name}</p>
                    </div>
                    {result && (
                      <div className="text-right">
                        <div className="font-display font-bold text-xl text-primary-700">{result.percentage?.toFixed(0)}%</div>
                        <div className="text-xs text-slate-400">Rank #{result.rank}</div>
                        <span className={`badge text-xs mt-1 ${result.status==='pass'?'bg-emerald-100 text-emerald-700':'bg-rose-100 text-rose-700'}`}>{result.grade} · {result.status}</span>
                      </div>
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
}
