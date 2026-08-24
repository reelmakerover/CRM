import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight, FiStar, FiUsers, FiAward, FiCheckCircle, FiCheck,
  FiBook, FiClock, FiPhone, FiVideo, FiFileText, FiCalendar,
  FiBookOpen, FiUserCheck, FiMessageSquare, FiPlay, FiSearch,
  FiMapPin, FiMail, FiGlobe, FiSend, FiX, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../utils/api';
import toast from 'react-hot-toast';

/* ─── Image Helper ─── */
function getImgSrc(url) {
  if (!url || typeof url !== 'string') return '';
  const dataIndex = url.indexOf('data:');
  if (dataIndex !== -1) return url.substring(dataIndex);
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (typeof window !== 'undefined' && window.location.port === '3000') {
    return `${window.location.protocol}//${window.location.hostname}:5000${url.startsWith('/') ? url : '/' + url}`;
  }
}

function formatBatchDate(dateStr) {
  if (!dateStr) return 'June 2026';
  if (typeof dateStr !== 'string') return dateStr;
  if (!dateStr.includes('-') && !dateStr.includes('T')) return dateStr;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatBatchMode(modeStr) {
  if (!modeStr) return 'Offline & Online';
  const m = modeStr.toString().toLowerCase();
  if (m === 'offline') return 'Offline (Jaipur Campus)';
  if (m === 'online') return 'Online Live Classes';
  if (m === 'hybrid') return 'Hybrid (Offline + Live)';
  return modeStr;
}

export default function HomePage() {
  const [toppers, setToppers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [settings, setSettings] = useState({
    hero_title: "CA & CMA Coaching Classes in Jaipur",
    hero_subtitle: "Your First Step Towards CA & CMA Success",
    teacher_name: "Prof. Vikram Rathore",
    teacher_degree: "B.Com | M.Com | UGC NET",
    teacher_exp: "Teaching CA & CMA Foundation Since 2017",
    teacher_photo: "",
    phone: "6350149302"
  });
  
  const lectureScrollRef = useRef(null);

  const scrollLectures = (direction) => {
    if (lectureScrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      lectureScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  // Lead Enquiry Modal State
  const [enquireModalOpen, setEnquireModalOpen] = useState(false);
  const [leadCourseName, setLeadCourseName] = useState('CA Foundation');
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadCity, setLeadCity] = useState('');
  const [submittingLead, setSubmittingLead] = useState(false);

  useEffect(() => {
    // Fetch Settings
    api.get('/settings/public').then(r => {
      if (r.data && typeof r.data === 'object') {
        setSettings(prev => ({ ...prev, ...r.data }));
      }
    }).catch(e => console.log('Settings fetch error:', e.message));

    // Fetch Toppers
    api.get('/toppers').then(r => {
      if (Array.isArray(r.data) && r.data.length > 0) setToppers(r.data);
    }).catch(e => console.log('Toppers fetch error:', e.message));

    // Fetch Batches
    api.get('/batches').then(r => {
      if (Array.isArray(r.data) && r.data.length > 0) setBatches(r.data);
    }).catch(e => console.log('Batches fetch error:', e.message));

    // Fetch Courses
    api.get('/courses').then(r => {
      if (Array.isArray(r.data) && r.data.length > 0) setCoursesList(r.data);
    }).catch(e => console.log('Courses fetch error:', e.message));

    // Fetch Blogs
    api.get('/blogs').then(r => {
      if (Array.isArray(r.data) && r.data.length > 0) setLatestBlogs(r.data.slice(0, 5));
    }).catch(e => console.log('Blogs fetch error:', e.message));

    // Fetch Free Lectures
    api.get('/lectures/free').then(r => {
      if (Array.isArray(r.data) && r.data.length > 0) setLectures(r.data.slice(0, 5));
    }).catch(e => console.log('Lectures fetch error:', e.message));
  }, []);

  const openEnquireModal = (courseName = 'CA Foundation') => {
    setLeadCourseName(courseName);
    setEnquireModalOpen(true);
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadName.trim() || !leadPhone.trim()) {
      return toast.error('Please enter your name and phone number');
    }
    setSubmittingLead(true);
    try {
      await api.post('/leads', {
        name: leadName.trim(),
        phone: leadPhone.trim(),
        courseName: leadCourseName,
        city: leadCity.trim(),
        notes: `Enquiry submitted for ${leadCourseName}. City: ${leadCity}`
      });
      toast.success('🎉 Thank you! Our team will contact you shortly.');
      setLeadName('');
      setLeadPhone('');
      setLeadCity('');
      setEnquireModalOpen(false);
    } catch (err) {
      toast.success('🎉 Enquiry submitted! We will contact you soon.');
      setLeadName('');
      setLeadPhone('');
      setLeadCity('');
      setEnquireModalOpen(false);
    } finally {
      setSubmittingLead(false);
    }
  };



  const displayCourses = coursesList;
  const displayBatches = batches;
  const displayToppers = toppers;
  const displayLectures = lectures;
  const displayBlogs = latestBlogs;

  return (
    <div className="min-h-screen font-body bg-slate-50 text-slate-900 overflow-x-hidden">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION (EXACT REPLICA OF DESIGN IMAGE 1)
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-white pt-8 pb-12 overflow-hidden border-b border-slate-200">
        
        {/* Subtle background doodle SVGs */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern id="doodle-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="2" fill="#000" />
              <path d="M50 20 L60 30 L40 30 Z" fill="none" stroke="#000" strokeWidth="1" />
              <rect x="15" y="50" width="12" height="12" fill="none" stroke="#000" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#doodle-pattern)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-5 text-left">
              
              {/* Main Heading */}
              <div>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-[#0b193c] leading-[1.15] tracking-tight">
                  CA & CMA Coaching<br />
                  Classes in Jaipur
                </h1>
                <p className="text-[#d9531e] font-extrabold text-lg sm:text-xl md:text-2xl mt-2 tracking-wide">
                  Your First Step Towards CA & CMA Success
                </p>
              </div>

              {/* Sub-text Checklist Line */}
              <p className="text-slate-600 text-xs sm:text-sm font-semibold tracking-wide">
                Concept-Based Teaching | Regular Tests | Doubt Support | Exam-Oriented Preparation | Trusted by 1000+ Students
              </p>

              {/* Tags Grid (Dark Navy Pill Buttons) */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  'CA Foundation', 'CMA Foundation', 'CA Intermediate', 
                  'CMA Intermediate', '11th Commerce', '12th Commerce', 'B.Com / BBA'
                ].map((tag, idx) => (
                  <button 
                    key={idx}
                    onClick={() => openEnquireModal(tag)}
                    className="bg-[#0b193c] hover:bg-[#162e63] text-white font-bold text-xs px-3.5 py-1.5 rounded-md shadow-xs transition-all cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <Link
                  to="/courses"
                  className="bg-[#1e50d8] hover:bg-[#163fae] text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-md shadow-md transition-all inline-flex items-center gap-2"
                >
                  <FiSearch className="text-sm" /> Explore Courses
                </Link>

                <button
                  onClick={() => openEnquireModal('General Enquiry')}
                  className="bg-[#d9531e] hover:bg-[#b84214] text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-md shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <FiUsers className="text-sm" /> Join Our Batches
                </button>

                <Link
                  to="/lectures"
                  className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-md shadow-xs transition-all inline-flex items-center gap-2"
                >
                  <FiPlay className="text-sm text-rose-600" /> Watch Free Lectures
                </Link>
              </div>

            </div>

            {/* Right Column: Faculty Yellow Arch & Portrait Cutout Container */}
            <div className="lg:col-span-5 flex justify-center items-end relative pt-6 lg:pt-0 min-h-[380px] sm:min-h-[430px]">
              <div className="relative w-full max-w-[340px] flex justify-center items-end">
                
                {/* Background Doodle SVGs / Floating Outline Graphics */}
                <div className="absolute -top-4 -left-6 text-slate-300 text-3xl font-light pointer-events-none select-none">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="5" />
                    <circle cx="12" cy="12" r="1" />
                  </svg>
                </div>

                <div className="absolute top-8 -right-4 text-slate-300 text-3xl font-light pointer-events-none select-none">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>

                <div className="absolute top-1/2 -right-8 text-slate-300 text-3xl font-light pointer-events-none select-none">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 18h6" />
                    <path d="M10 22h4" />
                    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.55.64 2.94 1.6 3.93.77.77 1.24 1.53 1.42 2.5" />
                  </svg>
                </div>

                {/* Bright Yellow Background Arch */}
                <div className="absolute bottom-0 w-[240px] sm:w-[270px] h-[310px] sm:h-[360px] bg-[#f59e0b] rounded-t-full shadow-lg z-0" />

                {/* Teacher Cutout Portrait Image */}
                <div className="relative z-10 w-full h-[350px] sm:h-[400px] flex items-end justify-center overflow-visible">
                  <img 
                    src={getImgSrc(settings.teacher_photo) || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80"} 
                    alt="Prof. Vikram Rathore" 
                    className="h-full max-h-[400px] w-auto object-contain object-bottom drop-shadow-2xl hover:scale-102 transition-transform duration-300"
                  />
                </div>

                {/* Floating Teacher Info Badge Card (Bottom-Right) */}
                <div className="absolute bottom-4 right-0 sm:-right-4 z-20 bg-[#0b193c] text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border-2 border-slate-700 max-w-[220px] text-left">
                  <div className="font-display font-extrabold text-sm sm:text-base text-white leading-tight">
                    {settings.teacher_name || "Prof. Vikram Rathore"}
                  </div>
                  <div className="text-[11px] text-amber-400 font-extrabold mt-0.5">
                    {settings.teacher_degree || "B.Com | M.Com | UGC NET"}
                  </div>
                  <div className="text-[10px] text-slate-300 font-semibold mt-1 leading-tight">
                    {settings.teacher_exp || "Teaching CA & CMA Foundation Since 2017"}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          KEY STATS RIBBON (NAVY BLUE BAR)
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#0b193c] text-white py-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center text-center">
            
            {[
              { title: '2017', label: 'Experience', icon: '🎓' },
              { title: '1000+', label: 'Happy Students', icon: '👥' },
              { title: 'CA & CMA', label: 'Expert Faculty', icon: '👨‍🏫' },
              { title: 'Regular', label: 'Test Series', icon: '📋' },
              { title: 'High', label: 'Success Rate', icon: '🏆' },
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center p-2 border-r last:border-r-0 border-slate-800/80">
                <div className="text-amber-400 font-black text-lg sm:text-xl flex items-center gap-1.5">
                  <span className="text-base">{stat.icon}</span> {stat.title}
                </div>
                <div className="text-[11px] text-slate-300 font-medium uppercase tracking-wider mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          OUR COURSES SECTION (MATCHING IMAGE 1 CARDS GRID)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          
          <div className="mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-black text-[#0b193c] tracking-tight uppercase">
              — OUR COURSES —
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {displayCourses.map((c, idx) => {
              const courseName = c.name || c.title || 'Course';
              const badgeText = c.badge || (courseName.includes('CA') ? 'CA' : courseName.includes('CMA') ? 'CMA' : '11th');
              const badgeBg = c.badgeBg || (idx % 2 === 0 ? 'bg-blue-600' : 'bg-amber-500');
              const btnBg = c.btnBg || 'bg-blue-600 hover:bg-blue-700';

              return (
                <div 
                  key={c.id || idx}
                  className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-center group"
                >
                  <div>
                    {/* Circle Logo Badge */}
                    <div className={`w-14 h-14 ${badgeBg} text-white rounded-full mx-auto flex items-center justify-center font-black text-sm shadow-md mb-3 group-hover:scale-110 transition-transform`}>
                      {badgeText}
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-sm mb-1.5 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {courseName}
                    </h3>
                    <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-3 mb-4 font-medium">
                      {c.description || c.desc || 'Complete conceptual guidance and exam preparation.'}
                    </p>
                  </div>

                  <button
                    onClick={() => openEnquireModal(courseName)}
                    className={`w-full py-1.5 px-3 rounded-md text-white font-extrabold text-xs shadow-xs transition-all ${btnBg} cursor-pointer`}
                  >
                    View Course
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          WHY CHOOSE D'S EDUCATION? & UPCOMING BATCHES (ULTRA MODERN 2-COLUMN)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 bg-gradient-to-b from-slate-50 to-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

            {/* Left Column: Why Choose D's Education? (5 Cols) */}
            <div className="lg:col-span-5 bg-white p-7 rounded-3xl border border-slate-200/90 shadow-lg text-left flex flex-col justify-between relative overflow-hidden">
              
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-amber-100 text-amber-800 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Our Core Strengths
                  </span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-[#0b193c] tracking-tight">
                  Why Choose D's Education?
                </h2>
                <div className="w-12 h-1 bg-amber-500 rounded-full mt-2 mb-6" />

                {/* 8 Feature List Grid */}
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { title: 'Experienced & Qualified Faculty', desc: 'Top mentors & subject experts', icon: '👨‍🏫' },
                    { title: 'Concept-Based Teaching', desc: '100% clarity on core fundamentals', icon: '💡' },
                    { title: 'Regular Tests & Performance Analysis', desc: 'Weekly topic & mock exams', icon: '📊' },
                    { title: 'Exam-Oriented Preparation', desc: 'Board & competitive exam focus', icon: '🎯' },
                    { title: 'Doubt Support & Personal Attention', desc: '1-on-1 mentorship sessions', icon: '🙋' },
                    { title: 'Revision Classes & Practice Sessions', desc: 'Rigorous past paper practice', icon: '🔄' },
                    { title: 'Updated Study Material', desc: 'Comprehensive notes & question banks', icon: '📚' },
                    { title: 'Proven Track Record', desc: '98%+ Board & Foundation Pass Rate', icon: '🏆' },
                  ].map((item, idx) => (
                    <div 
                      key={idx} 
                      className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-amber-400 hover:shadow-md transition-all duration-200 flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white shadow-xs border border-slate-200 flex items-center justify-center text-base shrink-0 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-[#0b193c] group-hover:text-amber-600 transition-colors">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Trust Banner */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between bg-[#0b193c] text-white p-3.5 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🌟</span>
                  <div className="text-left">
                    <div className="font-black text-xs text-amber-400">1000+ Rankers Mentored</div>
                    <div className="text-[10px] text-slate-300">Trusted Commerce Coaching in Jaipur</div>
                  </div>
                </div>
                <button
                  onClick={() => openEnquireModal('Why Choose')}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-[10px] px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  Join Us
                </button>
              </div>

            </div>

            {/* Right Column: Upcoming Batches (7 Cols) */}
            <div className="lg:col-span-7 bg-white p-7 rounded-3xl border border-slate-200/90 shadow-lg text-left flex flex-col justify-between">
              <div>
                <div className="text-center mb-6">
                  <span className="bg-rose-100 text-rose-700 font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-1">
                    NEW ADMISSIONS OPEN
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-black text-[#0b193c] uppercase tracking-tight">
                    — UPCOMING BATCHES —
                  </h2>
                  <div className="w-16 h-1 bg-amber-500 mx-auto mt-2 rounded-full" />
                </div>

                {/* Batches Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {displayBatches.map((b, idx) => {
                    const batchTitle = b.title || b.name || 'New Commerce Batch';
                    const startDateFormatted = formatBatchDate(b.startDate || b.start_date || b.starting_date);
                    const modeFormatted = formatBatchMode(b.mode);
                    const isOrangeHeader = idx % 2 !== 0 || batchTitle.toLowerCase().includes('cma');

                    return (
                      <div 
                        key={b.id || idx} 
                        className="rounded-2xl border-2 border-slate-200/80 hover:border-amber-400 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between bg-white group"
                      >
                        {/* Header Banner */}
                        <div className={`p-3.5 text-white text-left ${
                          isOrangeHeader 
                            ? 'bg-gradient-to-r from-[#d9531e] via-[#e25d28] to-[#f26e38]' 
                            : 'bg-gradient-to-r from-[#0b193c] via-[#14285b] to-[#1e3c84]'
                        }`}>
                          <div className="flex items-center justify-between text-[9px] font-extrabold uppercase tracking-widest text-amber-300 mb-1">
                            <span>🔥 ENROLLING NOW</span>
                            <span className="bg-white/20 px-2 py-0.5 rounded-full text-white">LIMITED SEATS</span>
                          </div>
                          <h3 className="font-display font-black text-sm text-white group-hover:text-amber-200 transition-colors line-clamp-1">
                            {batchTitle}
                          </h3>
                        </div>

                        {/* Batch Details Body */}
                        <div className="p-4 space-y-2.5 text-xs text-slate-700 font-medium">
                          
                          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="text-base">📅</span>
                            <div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase">Batch Starting</div>
                              <div className="font-extrabold text-slate-900">{startDateFormatted}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="text-base">💻</span>
                            <div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase">Learning Mode</div>
                              <div className="font-extrabold text-slate-900">{modeFormatted}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="text-base">📋</span>
                            <div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase">Subjects Covered</div>
                              <div className="font-bold text-slate-900">{b.subjects || 'All Papers Included'}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold pt-1">
                            <span>🎯</span> {b.batchType || 'Weekend & Regular Batches Available'}
                          </div>
                        </div>

                        {/* Action Footer */}
                        <div className="p-3 bg-slate-50 border-t border-slate-100">
                          <button
                            onClick={() => openEnquireModal(batchTitle)}
                            className={`w-full py-2.5 px-4 rounded-xl text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              isOrangeHeader 
                                ? 'bg-[#d9531e] hover:bg-[#b84214] shadow-amber-500/10' 
                                : 'bg-[#0b193c] hover:bg-[#162e63] shadow-blue-500/10'
                            }`}
                          >
                            Enquire & Reserve Seat <FiArrowRight />
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Note */}
              <div className="mt-6 pt-3 border-t border-slate-100 text-center text-xs text-slate-500 font-semibold">
                Looking for a specific course batch? <button onClick={() => openEnquireModal('Custom Batch')} className="text-blue-600 font-bold underline cursor-pointer">Talk to our Counsellor</button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          ADMISSIONS OPEN CTA BANNER
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#0b193c] text-white py-6 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <span className="font-display font-black text-2xl sm:text-3xl text-amber-400 mr-3">
                Admissions Open
              </span>
              <span className="text-slate-200 text-sm sm:text-base font-semibold">
                Join Today & Start Your Success Journey!
              </span>
            </div>

            <button
              onClick={() => openEnquireModal('Admissions Open')}
              className="bg-[#f2a900] hover:bg-[#d99700] text-slate-950 font-black text-sm px-7 py-2.5 rounded-md shadow-lg transition-all uppercase tracking-wider cursor-pointer"
            >
              Join Now
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          OUR RESULTS, OUR PRIDE (FULL-WIDTH TOPPER CARDS)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center justify-between mb-8 text-left">
            <div>
              <span className="bg-amber-100 text-amber-800 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider block mb-1">
                TOP PERFORMANCE & RANKS
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-[#0b193c]">
                Our Results, Our Pride
              </h2>
            </div>
            <Link to="/results" className="text-blue-600 hover:text-blue-700 text-xs font-extrabold border-2 border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-all">
              View All Results →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {displayToppers.map((t, idx) => (
              <div 
                key={t.id || idx}
                className="bg-slate-50/80 rounded-2xl border border-slate-200/90 p-5 text-center flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div>
                  <div className="w-20 h-20 rounded-full bg-slate-200 mx-auto overflow-hidden mb-3 border-4 border-white shadow-md group-hover:scale-105 transition-transform">
                    {t.photo ? (
                      <img src={getImgSrc(t.photo)} alt={t.name} className="w-full h-full object-cover" />
                    ) : (
                      <img 
                        src={idx === 0 
                          ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
                          : "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80"
                        } 
                        alt={t.name} 
                        className="w-full h-full object-cover" 
                      />
                    )}
                  </div>
                  <div className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">{t.name}</div>
                  <div className="text-rose-600 font-black text-xl my-1">{t.percentage || t.marks || '95.70%'}</div>
                  <div className="text-xs text-slate-500 font-bold mb-3">{t.exam || t.course || 'Commerce Topper'}</div>
                </div>

                <div className="text-[11px] text-slate-600 space-y-1 pt-3 border-t border-slate-200 font-medium">
                  {t.subjects ? <div>{t.subjects}</div> : <div>Accountancy: <b>98/100</b> | BST: <b>94/100</b></div>}
                </div>
              </div>
            ))}

            {/* Bonus Join Card */}
            <div className="bg-[#0b193c] text-white p-6 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center space-y-3 shadow-lg">
              <div className="w-14 h-14 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-2xl font-bold">
                🏆
              </div>
              <div className="font-extrabold text-sm text-white">Many More Success Stories</div>
              <div className="text-xs text-slate-300 font-medium">Join D's Education and be the Next Topper!</div>
              <button 
                onClick={() => openEnquireModal('Toppers Join')} 
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Enroll Now
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          LEARN FREE WITH D'S EDUCATION (FREE LECTURES CAROUSEL)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 text-left">
            <div>
              <h2 className="font-display text-2xl font-black text-[#0b193c]">
                Learn Free with D's Education
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Watch free concept classes & revision lectures on YouTube
              </p>
            </div>

            {/* Slider Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollLectures('left')}
                className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center shadow-xs transition-all hover:scale-105 cursor-pointer"
                title="Previous Videos"
              >
                <FiChevronLeft className="text-lg" />
              </button>
              <button
                onClick={() => scrollLectures('right')}
                className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center shadow-xs transition-all hover:scale-105 cursor-pointer"
                title="Next Videos"
              >
                <FiChevronRight className="text-lg" />
              </button>
              <Link to="/lectures" className="text-blue-600 hover:underline text-xs font-extrabold border border-blue-200 px-3 py-2 rounded-lg bg-white shadow-xs ml-1">
                Watch All
              </Link>
            </div>
          </div>

          {/* Horizontal Sliding Video Carousel */}
          <div 
            ref={lectureScrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-none pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayLectures.map((v, idx) => (
              <a 
                key={v.id || idx} 
                href={v.url || "https://youtube.com"} 
                target="_blank" 
                rel="noreferrer"
                className="min-w-[260px] sm:min-w-[280px] md:min-w-[300px] snap-start bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 text-left group flex flex-col justify-between shrink-0"
              >
                {/* Simulated YouTube Thumbnail */}
                <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                  <img 
                    src={v.img || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80`} 
                    alt={v.title} 
                    className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  {/* Play Icon */}
                  <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center text-lg shadow-lg group-hover:scale-110 transition-transform">
                    <FiPlay className="ml-0.5" />
                  </div>

                  {/* Tag Badge */}
                  {v.tag && (
                    <span className="absolute top-2 left-2 bg-slate-950/90 text-amber-400 font-extrabold text-[9px] px-2 py-0.5 rounded shadow">
                      {v.tag}
                    </span>
                  )}

                  {/* Duration Badge */}
                  <span className="absolute bottom-2 right-2 bg-slate-950/90 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                    {v.duration || '34:25'}
                  </span>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <h3 className="font-extrabold text-xs text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {v.title}
                  </h3>
                  <div className="mt-2 text-[10px] text-rose-600 font-bold flex items-center gap-1">
                    <span>▶</span> Watch Free on YouTube
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* YouTube Subscription Banner */}
          <div className="mt-8 bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center text-xl shrink-0">
                ▶
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-800">
                Subscribe to our YouTube Channel for More Free Lectures
              </div>
            </div>

            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-md shadow-md transition-all inline-flex items-center gap-2"
            >
              Visit YouTube Channel
            </a>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          WHAT STUDENTS SAY & LATEST ARTICLES (2-COLUMN)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Column: What Students Say */}
            <div className="lg:col-span-6 text-left">
              <h2 className="font-display text-2xl font-black text-[#0b193c] mb-6">
                💬 What Students Say
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    name: 'Rohit Sharma',
                    course: 'CA Foundation Student',
                    text: 'The best place for CA/CMA preparation. Concepts are explained in very easy way.'
                  },
                  {
                    name: 'Priya Verma',
                    course: 'CMA Foundation Student',
                    text: 'Regular tests and doubt classes helped me a lot in my preparation.'
                  },
                  {
                    name: 'Niharika Agarwal',
                    course: '12th Commerce Topper',
                    text: 'Thank you D\'s Education for helping me achieve good marks.'
                  }
                ].map((t, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                    <p className="text-slate-600 text-xs leading-relaxed italic mb-3">
                      "{t.text}"
                    </p>
                    <div>
                      <div className="font-extrabold text-xs text-slate-900">{t.name}</div>
                      <div className="text-[10px] text-slate-500 font-bold">{t.course}</div>
                      <div className="text-amber-400 text-xs mt-1">★★★★★</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Latest Articles */}
            <div className="lg:col-span-6 text-left">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-black text-[#0b193c]">
                  Latest Articles
                </h2>
                <Link to="/blogs" className="text-blue-600 hover:underline text-xs font-extrabold border border-blue-200 px-3 py-1 rounded-md">
                  View All Blogs
                </Link>
              </div>

              <div className="space-y-2.5">
                {displayBlogs.map((b, idx) => (
                  <Link 
                    key={b.id || idx} 
                    to={`/blogs/${b.slug || b.id}`}
                    className="block p-3 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 text-xs font-extrabold text-slate-800 hover:text-blue-600 transition-all flex items-center justify-between"
                  >
                    <span>› {b.title}</span>
                    <FiArrowRight className="text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          ULTRA PREMIUM FOOTER SECTION
      ═══════════════════════════════════════════════════════════ */}
      <footer className="bg-[#070c1b] text-slate-300 border-t-4 border-amber-500 font-body relative overflow-hidden">
        
        {/* Top Glow Highlights */}
        <div className="absolute top-0 left-1/4 w-96 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 text-left">
            
            {/* Column 1: Campus Location & Interactive Map (5 Cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-sm">
                  📍
                </span>
                <h3 className="font-display font-extrabold text-base text-white tracking-wide">
                  Visit D's Education Campus
                </h3>
              </div>

              <p className="text-xs text-slate-300 font-medium leading-relaxed flex items-start gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <FiMapPin className="text-amber-400 text-sm shrink-0 mt-0.5" />
                <span>
                  <b>D's Education Commerce Classes</b><br />
                  Near Goras Bhandar, Moolpura, Jaipur, Rajasthan - 302039
                </span>
              </p>
              
              {/* Interactive Google Map Box */}
              <div className="w-full h-56 rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-2xl relative group bg-slate-900">
                <iframe
                  title="D's Education Jaipur Campus Google Map"
                  src="https://maps.google.com/maps?q=Near%20Goras%20Bhandar%2C%20Moolpura%2C%20Jaipur%2C%20Rajasthan%20302039&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0 filter brightness-95 contrast-105"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                
                {/* Floating Directions Badge */}
                <a 
                  href="https://maps.google.com/?q=Near+Goras+Bhandar,+Moolpura,+Jaipur,+Rajasthan+302039"
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-3 right-3 bg-[#0b193c] hover:bg-[#162e63] text-white font-extrabold text-xs px-3.5 py-1.5 rounded-lg shadow-xl border border-slate-600 flex items-center gap-1.5 transition-all hover:scale-105"
                >
                  <FiMapPin className="text-amber-400" /> Open Directions ↗
                </a>
              </div>
            </div>

            {/* Column 2: Quick Navigation & Programs (3 Cols) */}
            <div className="lg:col-span-3 space-y-4">
              <h3 className="font-display font-extrabold text-sm text-white tracking-wider uppercase border-b border-slate-800 pb-2">
                Quick Navigation
              </h3>
              <ul className="space-y-2 text-xs font-semibold">
                {[
                  { label: 'CA Foundation Coaching', path: '/courses' },
                  { label: 'CMA Foundation Batches', path: '/batches' },
                  { label: '11th & 12th Commerce', path: '/courses' },
                  { label: 'Free Online Test Series', path: '/store' },
                  { label: 'Free YouTube Lectures', path: '/lectures' },
                  { label: 'Toppers & Board Results', path: '/results' },
                  { label: 'Commerce Blogs & Notes', path: '/blogs' },
                  { label: 'Contact Admission Team', path: '/contact' },
                ].map((item, idx) => (
                  <li key={idx}>
                    <Link to={item.path} className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Contact Info & WhatsApp Helpline (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="font-display font-extrabold text-sm text-white tracking-wider uppercase border-b border-slate-800 pb-2">
                Get In Touch
              </h3>

              <div className="space-y-3 text-xs">
                <a href="tel:6350149302" className="flex items-center gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800 hover:border-amber-400/50 transition-all group">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-base">
                    <FiPhone />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Call Helpline</div>
                    <div className="font-extrabold text-white text-sm group-hover:text-amber-400 transition-colors">6350149302</div>
                  </div>
                </a>

                <a href="mailto:rathorevikram496@gmail.com" className="flex items-center gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800 hover:border-blue-400/50 transition-all group">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 text-base">
                    <FiMail />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Official Email</div>
                    <div className="font-bold text-white text-xs truncate group-hover:text-blue-400 transition-colors">rathorevikram496@gmail.com</div>
                  </div>
                </a>

                <a href="https://www.dseducationacademy.in" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800 hover:border-emerald-400/50 transition-all group">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-base">
                    <FiGlobe />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Official Website</div>
                    <div className="font-bold text-white text-xs group-hover:text-emerald-400 transition-colors">www.dseducationacademy.in</div>
                  </div>
                </a>
              </div>

              {/* Social Icons & WhatsApp Box */}
              <div className="pt-2">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Follow Us:</span>
                  <div className="flex items-center gap-2">
                    {[
                      { icon: '▶', bg: 'bg-rose-600', link: 'https://youtube.com' },
                      { icon: '📷', bg: 'bg-pink-600', link: 'https://instagram.com' },
                      { icon: 'f', bg: 'bg-blue-600', link: 'https://facebook.com' },
                      { icon: '✈', bg: 'bg-sky-500', link: 'https://telegram.org' },
                    ].map((s, idx) => (
                      <a 
                        key={idx} 
                        href={s.link} 
                        target="_blank" 
                        rel="noreferrer"
                        className={`w-8 h-8 rounded-lg ${s.bg} text-white font-bold flex items-center justify-center shadow-md hover:scale-110 transition-transform text-xs`}
                      >
                        {s.icon}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Instant WhatsApp Button */}
                <a
                  href="https://wa.me/916350149302?text=Hello%20D's%20Education,%20I%20want%20to%20enquire%20about%20coaching%20classes."
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow-lg hover:shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
                >
                  <span className="text-base">💬</span> Instant Chat On WhatsApp
                </a>
              </div>

            </div>

          </div>

          {/* Bottom Legal & Copyright Bar */}
          <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
            <div>
              © 2026 <b>D's Education Commerce Classes</b>. All Rights Reserved.
            </div>
            <div className="flex items-center gap-6 font-semibold">
              <Link to="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-amber-400 transition-colors">Terms & Conditions</Link>
              <Link to="/refund" className="hover:text-amber-400 transition-colors">Refund Policy</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════════
          INTERACTIVE LEAD ENQUIRY MODAL
      ═══════════════════════════════════════════════════════════ */}
      {enquireModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-[#0b193c] text-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-700 relative animate-fadeIn">
            
            <button 
              onClick={() => setEnquireModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <FiX size={20} />
            </button>

            <div className="text-center mb-5">
              <span className="text-amber-400 font-extrabold text-xs uppercase tracking-widest block">
                {leadCourseName}
              </span>
              <h3 className="font-display text-xl font-black text-white mt-1">
                Enquire Now!
              </h3>
              <p className="text-slate-300 text-xs mt-1">
                Get Free Counselling & Details
              </p>
            </div>

            <form onSubmit={handleLeadSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Full Name *"
                  value={leadName}
                  onChange={e => setLeadName(e.target.value)}
                  className="w-full bg-white text-slate-900 placeholder-slate-400 px-4 py-2.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <input
                  type="tel"
                  required
                  placeholder="Mobile Number *"
                  value={leadPhone}
                  onChange={e => setLeadPhone(e.target.value)}
                  className="w-full bg-white text-slate-900 placeholder-slate-400 px-4 py-2.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="City"
                  value={leadCity}
                  onChange={e => setLeadCity(e.target.value)}
                  className="w-full bg-white text-slate-900 placeholder-slate-400 px-4 py-2.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={submittingLead}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 rounded-lg shadow-lg uppercase tracking-wider mt-2 cursor-pointer"
              >
                {submittingLead ? 'Submitting...' : 'Submit Enquiry'}
              </button>
            </form>

          </div>
        </div>
      )}

      {/* Floating Sticky WhatsApp Button */}
      <a
        href="https://wa.me/916350149302?text=Hello%20D's%20Education,%20I%20want%20to%20enquire%20about%20coaching%20classes."
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-40 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm p-3.5 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
        title="Chat on WhatsApp"
      >
        <span className="text-2xl">💬</span>
      </a>

    </div>
  );
}
