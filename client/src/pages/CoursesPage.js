import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../utils/api';
import { FiBook, FiArrowRight, FiCheckCircle, FiUsers, FiClock, FiZap } from 'react-icons/fi';

const defaultCourses = [
  { _id: '1', name: '10th Commerce', code: 'C10', category: 'School', fees: 8000, duration: '1 Year', description: 'Build a strong foundation in commerce subjects — Accounts, Economics, Business Studies & Maths.', features: ['Expert faculty', 'Weekly tests', 'Study material', 'Doubt sessions', 'Parent updates'], icon: '📚', color: 'from-blue-500 to-blue-700' },
  { _id: '2', name: '11th Commerce', code: 'C11', category: 'School', fees: 12000, duration: '1 Year', description: 'Master the transition to senior commerce with deep dives into Accountancy, Economics & BST.', features: ['Expert faculty', 'Weekly tests', 'Study material', 'Doubt sessions', 'Mock board exams'], icon: '📖', color: 'from-violet-500 to-violet-700' },
  { _id: '3', name: '12th Commerce', code: 'C12', category: 'School', fees: 15000, duration: '1 Year', description: 'Board exam mastery with intensive test series, revision sheets and one-on-one doubt clearance.', features: ['Board pattern tests', 'Last 10 yrs papers', 'Study material', 'Personal mentoring', 'Parent updates'], icon: '🏆', color: 'from-rose-500 to-rose-700' },
  { _id: '4', name: 'BCom / MCom', code: 'BCOM', category: 'Commerce', fees: 18000, duration: '1 Year', description: 'Advanced commerce and management concepts with university-aligned curriculum and practice tests.', features: ['University aligned', 'Online test series', 'Study material', 'Personal mentoring', 'Career guidance'], icon: '🎓', color: 'from-emerald-500 to-emerald-700' },
  { _id: '5', name: 'BBA', code: 'BBA', category: 'Commerce', fees: 16000, duration: '1 Year', description: 'Business Administration fundamentals — Management, Marketing, Finance and Entrepreneurship.', features: ['Industry examples', 'Case studies', 'Study material', 'Group discussions', 'Mock interviews'], icon: '💼', color: 'from-orange-500 to-orange-700' },
  { _id: '6', name: 'CA Foundation', code: 'CAF', category: 'Professional', fees: 20000, duration: '6 Months', description: 'ICAI-aligned preparation for CA Foundation with subject specialists and rigorous mock tests.', features: ['ICAI pattern', 'Mock tests', 'Study material', 'Personal mentoring', 'Success guarantee'], icon: '⚡', color: 'from-amber-500 to-amber-700' },
  { _id: '7', name: 'CA Intermediate', code: 'CAI', category: 'Professional', fees: 25000, duration: '1 Year', description: 'Comprehensive CA Intermediate coaching across both groups with past paper analysis.', features: ['Both groups', 'Topic tests', 'Study material', 'Personal mentoring', 'Parent updates'], icon: '📊', color: 'from-cyan-500 to-cyan-700' },
  { _id: '8', name: 'CMA / CS', code: 'CMACS', category: 'Professional', fees: 22000, duration: '1 Year', description: 'Cost & Management Accounting and Company Secretary foundation with expert guidance.', features: ['Expert faculty', 'Mock exams', 'Study material', 'Personal mentoring', 'Placement support'], icon: '🌟', color: 'from-pink-500 to-pink-700' },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [active, setActive] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', ...Array.from(new Set(courses.map(c => c.category).filter(Boolean)))];

  useEffect(() => {
    api.get('/courses').then(r => {
      if (r.data.length > 0) {
        setCourses(r.data.map(c => {
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
      } else {
        setCourses(defaultCourses);
      }
    }).catch(() => setCourses(defaultCourses)).finally(() => setLoading(false));
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(course => {
              const cImg = course.image ? (course.image.startsWith('http') ? course.image : `${typeof window !== 'undefined' && window.location.port === '3000' ? window.location.protocol + '//' + window.location.hostname + ':5000' : ''}${course.image}`) : null;

              return (
                <div key={course.id || course.code} className="card group overflow-hidden">
                  <div className="h-44 bg-gradient-to-br from-primary-600 to-indigo-800 relative overflow-hidden">
                    {cImg ? (
                      <img 
                        src={cImg} 
                        alt={course.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-white/80">
                        {course.icon || '📚'}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />
                    <span className="absolute top-3 right-3 badge bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 border border-white/20">
                      {course.category}
                    </span>
                  </div>
                  <div className="p-6">
                  <h3 className="font-display font-bold text-slate-900 text-xl mb-2">{course.name}</h3>
                  <p className="text-slate-500 text-sm mb-4 leading-relaxed">{course.description}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <div className="flex items-center gap-1"><FiClock size={14} className="text-primary-500" />{course.duration}</div>
                    <div className="flex items-center gap-1"><FiUsers size={14} className="text-primary-500" />Small batches</div>
                  </div>
                  {course.features && (
                    <ul className="space-y-1.5 mb-5">
                      {course.features.slice(0, 4).map(f => (
                        <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                          <FiCheckCircle size={12} className="text-emerald-500 flex-shrink-0" />{f}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <div className="font-bold text-primary-700 text-xl">₹{course.fees?.toLocaleString()}</div>
                      <div className="text-xs text-slate-400">per year • EMI available</div>
                    </div>
                    <Link to="/contact" className="btn-primary text-sm py-2 px-4">Enroll <FiArrowRight size={14} /></Link>
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
