import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../utils/api';
import { FiAward, FiFilter } from 'react-icons/fi';


export default function ResultsPage() {
  const [toppers, setToppers] = useState([]);
  const [yearFilter, setYearFilter] = useState('All');
  const [courseFilter, setCourseFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/toppers').then(r => {
      setToppers(Array.isArray(r.data) ? r.data : []);
    }).catch(() => setToppers([])).finally(() => setLoading(false));
  }, []);

  const years = ['All', ...new Set(toppers.map(t => t.year).filter(Boolean))].sort().reverse();
  const courses = ['All', ...new Set(toppers.map(t => t.course).filter(Boolean))];

  const filtered = toppers.filter(t => {
    return (yearFilter === 'All' || t.year === yearFilter) && (courseFilter === 'All' || t.course === courseFilter);
  });

  const rankColors = ['from-yellow-400 to-yellow-600', 'from-slate-300 to-slate-500', 'from-orange-400 to-orange-600'];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="bg-gradient-to-br from-slate-900 via-primary-900 to-slate-800 pt-32 pb-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 glass text-gold-300 text-sm font-semibold px-4 py-2 rounded-full mb-4">
            <FiAward size={14} /> Hall of Fame
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Top Results</h1>
          <p className="text-primary-300 text-lg">Celebrating the success of our brilliant students year after year.</p>
          {/* Stats */}
          <div className="flex justify-center gap-8 mt-8">
            {[{ val: '500+', label: 'Board Toppers' }, { val: '150+', label: 'CA Selections' }, { val: '98%', label: 'Avg Pass Rate' }].map(s => (
              <div key={s.label} className="text-center">
                <div className="font-display text-3xl font-bold text-gold-400">{s.val}</div>
                <div className="text-primary-300 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Filters */}
        <div className="bg-white rounded-2xl p-5 shadow-card mb-10 flex flex-wrap gap-4 items-center">
          <FiFilter className="text-slate-500" />
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-slate-600 text-sm font-medium">Year:</span>
            {years.map(y => (
              <button key={y} onClick={() => setYearFilter(y)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${yearFilter === y ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-primary-50'}`}>
                {y}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-slate-600 text-sm font-medium">Course:</span>
            {courses.slice(0, 6).map(c => (
              <button key={c} onClick={() => setCourseFilter(c)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${courseFilter === c ? 'bg-gold-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-gold-50'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-52 rounded-2xl shimmer" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((topper, i) => (
              <div key={i} className="card p-6 group hover:shadow-card-hover transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${rankColors[i] || 'from-primary-400 to-primary-600'} flex items-center justify-center text-white font-display font-bold text-2xl shadow-lg group-hover:scale-105 transition-transform`}>
                    {topper.photo ? <img src={topper.photo} alt={topper.name} className="w-full h-full object-cover rounded-2xl" /> : topper.name[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-slate-900 text-lg leading-tight">{topper.name}</h3>
                    <p className="text-primary-600 text-sm font-medium">{topper.course}</p>
                    {topper.year && <p className="text-slate-400 text-xs">{topper.year}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gold-50 border border-gold-200 rounded-xl p-3 text-center">
                    <div className="font-display font-bold text-gold-700 text-xl">{topper.marks || topper.percentage}</div>
                    <div className="text-slate-500 text-xs">Marks / Score</div>
                  </div>
                  <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 text-center">
                    <div className="font-bold text-primary-700 text-sm leading-tight">{topper.rank}</div>
                    <div className="text-slate-500 text-xs mt-0.5">Rank</div>
                  </div>
                </div>
                {topper.testimonial && (
                  <p className="text-slate-500 text-xs italic border-t border-slate-100 pt-3">"{topper.testimonial}"</p>
                )}
                {i < 3 && (
                  <div className="absolute top-4 right-4">
                    <span className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div className="text-center py-20 text-slate-500">
            <div className="text-5xl mb-4">🏆</div>
            <p className="text-xl">No results found for selected filters</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
