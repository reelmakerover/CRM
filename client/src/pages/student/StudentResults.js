import React, { useEffect, useState } from 'react';
import { FiBarChart2, FiAward, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import api from '../../utils/api';

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/results').then(r => setResults(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const gradeColor = {'A+':'bg-emerald-100 text-emerald-700',A:'bg-teal-100 text-teal-700','B+':'bg-blue-100 text-blue-700',B:'bg-primary-100 text-primary-700',C:'bg-yellow-100 text-yellow-700',F:'bg-rose-100 text-rose-700'};

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full"/></div>;

  if (results.length === 0) return (
    <div className="card p-16 text-center">
      <div className="text-6xl mb-4">📊</div>
      <h2 className="font-display text-2xl font-bold text-slate-700 mb-3">No Results Yet</h2>
      <p className="text-slate-500">You haven't taken any exams. Go to the Exams section to start!</p>
    </div>
  );

  const best = results.reduce((b,r)=>(!b||r.percentage>b.percentage)?r:b,null);
  const avg = results.reduce((s,r)=>s+r.percentage,0)/results.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">My Results</h1>
        <p className="text-slate-500 text-sm mt-1">{results.length} exams completed</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {icon:FiBarChart2,label:'Exams Taken',value:results.length,color:'bg-primary-50 text-primary-600'},
          {icon:FiAward,label:'Best Score',value:`${best?.percentage?.toFixed(0)}%`,color:'bg-gold-50 text-gold-600'},
          {icon:FiBarChart2,label:'Avg Score',value:`${avg.toFixed(0)}%`,color:'bg-emerald-50 text-emerald-600'},
          {icon:FiCheckCircle,label:'Passed',value:results.filter(r=>r.status==='pass').length,color:'bg-teal-50 text-teal-600'},
        ].map(s=>(
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}><s.icon size={18}/></div>
            <div><div className="text-slate-500 text-xs">{s.label}</div><div className="font-bold text-slate-900">{s.value}</div></div>
          </div>
        ))}
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {results.map(result => (
          <div key={result.id} className={`card p-5 cursor-pointer transition-all hover:shadow-card-hover ${selected?.id===result.id?'border-primary-400 border-2':''}`}
            onClick={()=>setSelected(selected?.id===result.id?null:result)}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{result.exam?.title || result.subject?.name || 'Exam'}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 flex-wrap">
                  <span>{result.course?.name}</span>
                  <span>·</span>
                  <span>{new Date(result.submittedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
                  {result.timeTaken && <span className="flex items-center gap-1"><FiClock size={12}/>{Math.floor(result.timeTaken/60)}m {result.timeTaken%60}s</span>}
                </div>
              </div>
              <div className="flex items-center gap-4 ml-4">
                <div className="text-right">
                  <div className="font-display font-bold text-2xl text-primary-700">{result.percentage?.toFixed(0)}%</div>
                  <div className="text-xs text-slate-400">{result.marksObtained}/{result.totalMarks} marks</div>
                </div>
                <div className="text-right">
                  <span className={`badge text-xs ${gradeColor[result.grade]||'bg-slate-100 text-slate-600'}`}>{result.grade}</span>
                  <div className="text-slate-400 text-xs mt-1">Rank #{result.rank}</div>
                </div>
                <span className={`badge ${result.status==='pass'?'bg-emerald-100 text-emerald-700':'bg-rose-100 text-rose-700'}`}>{result.status}</span>
              </div>
            </div>

            {selected?.id===result.id && (
              <div className="mt-5 pt-5 border-t border-slate-100 animate-fade-in">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  {[
                    {icon:FiCheckCircle,label:'Correct',value:result.correctAnswers,color:'text-emerald-600 bg-emerald-50'},
                    {icon:FiXCircle,label:'Wrong',value:result.incorrectAnswers,color:'text-rose-600 bg-rose-50'},
                    {icon:FiBarChart2,label:'Skipped',value:result.skippedQuestions,color:'text-slate-600 bg-slate-50'},
                    {icon:FiAward,label:'Rank',value:`#${result.rank}`,color:'text-primary-600 bg-primary-50'},
                  ].map(s=>(
                    <div key={s.label} className={`p-3 rounded-xl ${s.color} text-center`}>
                      <s.icon size={18} className="mx-auto mb-1"/>
                      <div className="font-bold text-lg">{s.value}</div>
                      <div className="text-xs opacity-70">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="progress-bar h-3">
                  <div className="progress-fill" style={{width:`${result.percentage}%`}}/>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>0%</span><span>Pass: {result.exam?.passingMarks||20}/{result.totalMarks}</span><span>100%</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
