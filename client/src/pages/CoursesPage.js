import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api, { getImgSrc } from '../utils/api';
import { FiBook, FiArrowRight, FiCheckCircle, FiUsers, FiClock, FiZap } from 'react-icons/fi';



export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [active, setActive] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', ...Array.from(new Set(courses.map(c => c.category).filter(Boolean)))];

  useEffect(() => {
    api.get('/courses').then(r => {
      setCourses((r.data || []).map(c => {
        let feats = [];
        if (Array.isArray(c.features)) {
          feats = c.features;
        } else if (typeof c.features === 'string') {
          try {
            feats = JSON.parse(c.features);
            if (!Array.isArray(feats)) feats = [c.features];
          } catch (e) {
            feats = c.features.split(',').map(s => s.trim()).filter(Boolean);
          }
        }
        return { ...c, features: feats };
      }));
    }).catch(() => setCourses([])).finally(() => setLoading(false));
  }, []);

  const filtered = active === 'All' ? courses : courses.filter(c => c.category === active);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      {/* Hero Banner */}
      <div className="bg-hero-gradient pt-32 pb-16 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <div className="inline-flex items-center gap-2 glass text-primary-200 text-sm font-semibold px-4 py-2 rounded-full">
            <FiBook size={14} /> Regular Coaching Programs
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white">Our Course Programs</h1>
          <p className="text-primary-200 text-lg max-w-2xl mx-auto">
            From school level to professional certifications — expert coaching for every stage of your commerce journey.
          </p>

          {/* Separate Navigation Tab Bar */}
          <div className="pt-4 flex justify-center gap-3">
            <span className="bg-primary-600 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1.5">
              📚 Coaching Courses
            </span>
            <Link to="/store" className="glass text-amber-300 hover:text-amber-200 px-6 py-2.5 rounded-full text-sm font-semibold border border-white/20 transition-all flex items-center gap-1.5">
              <FiZap /> 📝 Test Series & Store
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Filter */}
        <div className="flex justify-center gap-2 flex-wrap mb-12">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActive(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${active === cat ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300 hover:text-primary-600'}`}>
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-72 rounded-2xl shimmer" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(course => {
              const cImg = getImgSrc(course.image);
              const visibleFeatures = Array.isArray(course.features) ? course.features.slice(0, 3) : [];
              const extraCount = Array.isArray(course.features) && course.features.length > 3 ? course.features.length - 3 : 0;

              const tit = (course.name || '').toLowerCase();
              const isPro = tit.includes('ca') || tit.includes('cma') || tit.includes('cs') || (course.category || '').toLowerCase().includes('pro');
              const isSchool = tit.includes('12th') || tit.includes('11th') || tit.includes('10th') || (course.category || '').toLowerCase().includes('school');
              const isDegree = tit.includes('bcom') || tit.includes('bba') || tit.includes('mcom');

              const gradientClass = isPro 
                ? 'from-amber-600 via-rose-800 to-slate-950' 
                : isSchool 
                ? 'from-blue-600 via-indigo-800 to-slate-950' 
                : isDegree 
                ? 'from-emerald-600 via-teal-800 to-slate-950' 
                : 'from-primary-700 via-indigo-900 to-slate-950';

              const icon = isPro ? '🏆' : isSchool ? '📚' : isDegree ? '🎓' : (course.icon || '📘');

              return (
                <div key={course.id || course.code} className="flex flex-col h-full bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_35px_-8px_rgba(30,58,138,0.18)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden group">
                  <div className={`h-52 bg-gradient-to-br ${gradientClass} relative overflow-hidden shrink-0 flex items-center justify-center`}>
                    {cImg ? (
                      <img 
                        src={cImg} 
                        alt={course.name} 
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 opacity-15 select-none flex items-center justify-center overflow-hidden">
                          <span className="font-display font-black text-6xl tracking-widest text-white uppercase whitespace-nowrap">
                            {course.name?.split(' ')[0] || 'COMMERCE'}
                          </span>
                        </div>
                        <div className="relative z-10 w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          {icon}
                        </div>
                      </>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    <span className="absolute top-3.5 right-3.5 badge bg-slate-900/80 backdrop-blur-md text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-white/20 shadow-md">
                      {course.category || 'Commerce'}
                    </span>
                    <span className="absolute bottom-3.5 left-3.5 bg-black/40 backdrop-blur-md text-white/90 text-[11px] font-medium px-2.5 py-0.5 rounded-lg border border-white/10 flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live & Offline Batches
                    </span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display font-bold text-slate-900 text-xl group-hover:text-primary-600 transition-colors line-clamp-1 mb-1">
                        {course.name}
                      </h3>
                      <p className="text-slate-500 text-xs sm:text-sm mb-4 leading-relaxed line-clamp-2 min-h-[38px]">
                        {course.description || 'Comprehensive coaching with expert faculties, regular mock exams, and personalized mentorship.'}
                      </p>

                      <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-4 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-1.5"><FiClock size={14} className="text-primary-600" />{course.duration || '1 Year'}</div>
                        <div className="flex items-center gap-1.5"><FiUsers size={14} className="text-primary-600" />Small Batches</div>
                      </div>

                      <ul className="space-y-2.5">
                        {visibleFeatures.map((f, idx) => (
                          <li key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-600">
                            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                            <span className="line-clamp-1 font-medium">{f}</span>
                          </li>
                        ))}
                      </ul>
                      {extraCount > 0 && (
                        <p className="text-[11px] font-semibold text-primary-600 mt-2.5 ml-6">
                          + {extraCount} more topics & benefits
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-5 mt-6 border-t border-slate-100">
                      <div>
                        <div className="font-bold text-primary-700 text-xl">₹{Number(course.fees || 0).toLocaleString('en-IN')}</div>
                        <div className="text-[11px] text-slate-400">per session • EMI option</div>
                      </div>
                      <Link to="/contact" className="btn-primary text-sm py-2.5 px-5 rounded-xl shadow-md hover:shadow-xl hover:shadow-primary-500/25">
                        Enroll <FiArrowRight size={14} className="ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-hero-gradient rounded-3xl p-10 text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-4">Can't decide? Let us help!</h2>
          <p className="text-primary-200 mb-6">Talk to Vikram Rathore Sir directly about which course is right for you.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/contact" className="btn-gold">Contact Us <FiArrowRight /></Link>
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer"
              className="glass border border-white/20 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-all">
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
