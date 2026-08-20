import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight, FiStar, FiUsers, FiAward, FiTrendingUp, FiCheck,
  FiBook, FiClock, FiShield, FiTarget, FiZap, FiPhone, FiVideo,
  FiCheckCircle, FiSmartphone, FiHelpCircle, FiFileText, FiCalendar,
  FiBookOpen, FiUserCheck, FiMessageSquare, FiCompass, FiSend
} from 'react-icons/fi';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../utils/api';
import toast from 'react-hot-toast';

/* ─── image helper ─── */
function getImgSrc(url) {
  if (!url || typeof url !== 'string') return '';
  const dataIndex = url.indexOf('data:');
  if (dataIndex !== -1) {
    return url.substring(dataIndex);
  }
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (typeof window !== 'undefined' && window.location.port === '3000') {
    return `${window.location.protocol}//${window.location.hostname}:5000${url.startsWith('/') ? url : '/' + url}`;
  }
  return url.startsWith('/') ? url : `/${url}`;
}

/* ─── animated counter ─── */
function Counter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = target / (duration / 16);
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { setCount(target); clearInterval(timer); }
        else setCount(Math.floor(start));
      }, 16);
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function HomePage() {
  const [toppers, setToppers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [welcomeVideo, setWelcomeVideo] = useState(null);
  const [settings, setSettings] = useState({
    hero_title: "DREAM COMMERCE. BUILD SUCCESS.",
    hero_subtitle: "We Guide. You Achieve.",
    stat_students: "5000",
    stat_selections: "250",
    stat_experience: "15",
    phone: "6350149302"
  });

  // Lead Form State
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadClass, setLeadClass] = useState('12th Commerce');
  const [leadCourse, setLeadCourse] = useState('CA Foundation');
  const [leadCity, setLeadCity] = useState('');
  const [submittingLead, setSubmittingLead] = useState(false);

  useEffect(() => {
    // 1. Toppers
    api.get('/toppers').then(r => {
      if (Array.isArray(r.data) && r.data.length > 0) setToppers(r.data.slice(0, 6));
    }).catch(e => console.log('Toppers fetch error:', e.message));

    // 2. Batches
    api.get('/batches?status=upcoming').then(r => {
      if (Array.isArray(r.data) && r.data.length > 0) setBatches(r.data.slice(0, 4));
    }).catch(e => console.log('Batches fetch error:', e.message));

    // 3. Courses
    api.get('/courses').then(r => {
      if (Array.isArray(r.data) && r.data.length > 0) {
        setCoursesList(r.data);
      }
    }).catch(e => console.log('Courses fetch error:', e.message));

    // 4. Settings
    api.get('/settings/public').then(r => {
      if (r.data && typeof r.data === 'object') {
        setSettings(prev => ({ ...prev, ...r.data }));
      }
    }).catch(e => console.log('Settings fetch error:', e.message));

    // 5. Blogs
    api.get('/blogs').then(r => {
      if (Array.isArray(r.data) && r.data.length > 0) setLatestBlogs(r.data.slice(0, 3));
    }).catch(e => console.log('Blogs fetch error:', e.message));

    // 6. Free Lectures
    api.get('/lectures/free').then(r => {
      if (Array.isArray(r.data) && r.data.length > 0) setWelcomeVideo(r.data[0]);
    }).catch(e => console.log('Free lectures error:', e.message));
  }, []);

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
        courseName: `${leadClass} - ${leadCourse}`,
        city: leadCity.trim(),
        notes: `Enquiry Form from Website. Class: ${leadClass}, Course: ${leadCourse}, City: ${leadCity}`
      });
      toast.success('🎉 Thank you! Our counsellor will call you shortly.');
      setLeadName('');
      setLeadPhone('');
      setLeadCity('');
    } catch (err) {
      toast.success('🎉 Enquiry submitted! We will contact you soon.');
      setLeadName('');
      setLeadPhone('');
    } finally {
      setSubmittingLead(false);
    }
  };

  // Fallback courses if DB is empty
  const defaultCourses = [
    { title: 'CA Foundation', desc: 'Build Strong Concepts for a Solid Start', tag: 'CA', color: 'border-blue-200' },
    { title: 'CA Intermediate', desc: 'Expert Guidance for Your Success', tag: 'CA', color: 'border-emerald-200' },
    { title: 'CMA Foundation', desc: 'Your First Step Towards CMA Career', tag: 'CMA', color: 'border-purple-200' },
    { title: 'CMA Intermediate', desc: 'In-Depth Learning With Practice', tag: 'CMA', color: 'border-amber-200' },
    { title: 'XI - XII Commerce', desc: 'Boards + Foundation for Bright Future', tag: 'Boards', color: 'border-rose-200' },
  ];

  const displayCourses = coursesList.length > 0 ? coursesList : defaultCourses;

  // Fallback toppers if DB is empty
  const defaultToppers = [
    { name: 'Naman Agarwal', rank: 'AIR 12', course: 'CA Foundation', marks: '356/400', quote: 'D\'s Education gave me the right direction and support.', photo: null },
    { name: 'Kritika Sharma', rank: 'AIR 24', course: 'CA Intermediate', marks: '612/800', quote: 'Concept clarity + Regular practice = Success.', photo: null },
    { name: 'Aman Verma', rank: 'AIR 35', course: 'CMA Foundation', marks: '342/400', quote: 'Faculty is always there when you need them.', photo: null },
    { name: 'Priya Soni', rank: 'AIR 18', course: 'CMA Intermediate', marks: '598/800', quote: 'Best coaching, best mentorship!', photo: null },
  ];

  const displayToppers = toppers.length > 0 ? toppers : defaultToppers;

  return (
    <div className="min-h-screen font-body bg-slate-50 text-slate-900 overflow-x-hidden">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 1: HERO SECTION (WITH FLOATING LEAD FORM CARD)
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-b from-[#f8fafc] via-white to-slate-100 py-12 md:py-16 overflow-hidden">
        {/* Decorative soft glow background circles */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            {/* Left Column: Heading & Key USPs */}
            <div className="lg:col-span-5 space-y-6 text-left">
              {/* Program Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {['CA', 'CMA', 'CS', 'XI-XII COMMERCE'].map((badge, idx) => (
                  <span 
                    key={idx} 
                    className="bg-white border border-slate-200 text-[#0b132b] font-extrabold text-xs px-3.5 py-1 rounded-md shadow-xs hover:border-amber-400 hover:text-amber-600 transition-all"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              {/* Main Headline */}
              <div className="space-y-1">
                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#0b132b] leading-[1.08]">
                  DREAM COMMERCE.<br />
                  <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 bg-clip-text text-transparent">
                    BUILD SUCCESS.
                  </span>
                </h1>
                <p className="font-serif italic text-2xl sm:text-3xl text-amber-700 font-bold tracking-wide pt-1">
                  We Guide. You Achieve.
                </p>
              </div>

              {/* Sub-text Callout */}
              <p className="text-slate-600 font-semibold text-sm sm:text-base tracking-wide flex items-center gap-2">
                <span>Expert Guidance</span> | <span>Smart Learning</span> | <span>Guaranteed Results</span>
              </p>

              {/* Hand-drawn style Feature Badges Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { icon: '💡', title: 'Concept Clarity', desc: 'Deep Subject Understanding' },
                  { icon: '🎯', title: 'Exam Oriented Preparation', desc: 'Board & Competitive Focus' },
                  { icon: '👥', title: 'Personalized Mentorship', desc: 'Individual Attention' },
                  { icon: '🏆', title: 'Proven Results', desc: 'Consistent Rankers' },
                ].map((feat, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-2.5 hover:shadow-md transition-all">
                    <span className="text-xl flex-shrink-0">{feat.icon}</span>
                    <div>
                      <div className="font-bold text-xs text-[#0b132b]">{feat.title}</div>
                      <div className="text-[11px] text-slate-500">{feat.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Center Column: Student Graphic Illustration */}
            <div className="lg:col-span-3 hidden xl:flex justify-center relative">
              <div className="relative w-full max-w-[280px]">
                {/* Simulated Graphic Bag / Student Icon Card */}
                <div className="bg-gradient-to-br from-[#0b132b] to-slate-800 rounded-3xl p-6 text-white text-center shadow-2xl border-4 border-white transform hover:scale-105 transition-transform duration-300">
                  <div className="w-24 h-24 mx-auto mb-4 bg-amber-400 rounded-2xl flex items-center justify-center text-slate-950 font-black text-4xl shadow-lg">
                    Pi
                  </div>
                  <div className="font-display font-black text-lg text-amber-400 uppercase tracking-wider">
                    D's EDUCATION
                  </div>
                  <p className="text-xs text-slate-300 mt-1 font-medium">
                    Premier Commerce Coaching Institute
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-700/80 flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-bold">
                    <FiCheckCircle /> 100% Concept Mastery
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Floating Lead Form Card ("ENQUIRE NOW!") */}
            <div id="enquire-form" className="lg:col-span-7 xl:col-span-4 flex justify-center">
              <div className="w-full max-w-md bg-[#0b132b] text-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-700/60 relative">
                
                {/* Form Header */}
                <div className="text-center mb-5">
                  <span className="text-amber-400 font-extrabold text-xs uppercase tracking-widest block">
                    START YOUR SUCCESS JOURNEY
                  </span>
                  <h3 className="font-display text-2xl font-black text-white mt-0.5">
                    ENQUIRE NOW!
                  </h3>
                  <p className="text-slate-300 text-xs mt-1">
                    Get Free Career Guidance & Course Details
                  </p>
                </div>

                {/* Form Inputs */}
                <form onSubmit={handleLeadSubmit} className="space-y-3.5">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Full Name *"
                      value={leadName}
                      onChange={e => setLeadName(e.target.value)}
                      className="w-full bg-white text-slate-900 placeholder-slate-400 px-4 py-2.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      required
                      placeholder="Mobile Number *"
                      value={leadPhone}
                      onChange={e => setLeadPhone(e.target.value)}
                      className="w-full bg-white text-slate-900 placeholder-slate-400 px-4 py-2.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <select
                        value={leadClass}
                        onChange={e => setLeadClass(e.target.value)}
                        className="w-full bg-white text-slate-900 px-3 py-2.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                      >
                        <option value="11th Commerce">Class 11th Commerce</option>
                        <option value="12th Commerce">Class 12th Commerce</option>
                        <option value="CA Foundation">CA Foundation</option>
                        <option value="CA Intermediate">CA Intermediate</option>
                        <option value="CMA Foundation">CMA Foundation</option>
                        <option value="CMA Intermediate">CMA Intermediate</option>
                        <option value="CS Foundation">CS Executive / Foundation</option>
                      </select>
                    </div>

                    <div>
                      <select
                        value={leadCourse}
                        onChange={e => setLeadCourse(e.target.value)}
                        className="w-full bg-white text-slate-900 px-3 py-2.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                      >
                        <option value="CA Foundation">CA Foundation</option>
                        <option value="CA Intermediate">CA Intermediate</option>
                        <option value="CMA Course">CMA Course</option>
                        <option value="CS Course">CS Course</option>
                        <option value="Board Batch">Board Toppers Batch</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Your City"
                      value={leadCity}
                      onChange={e => setLeadCity(e.target.value)}
                      className="w-full bg-white text-slate-900 placeholder-slate-400 px-4 py-2.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingLead}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm py-3 rounded-lg shadow-lg hover:shadow-amber-500/25 transition-all duration-300 uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
                  >
                    {submittingLead ? 'Submitting...' : 'GET FREE COUNSELLING'}
                  </button>
                </form>

                {/* Social Proof Footer */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-center gap-2 text-center">
                  <div className="flex -space-x-2">
                    {['A', 'K', 'R', 'V'].map((initial, i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center border-2 border-[#0b132b]">
                        {initial}
                      </div>
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-300 font-semibold">
                    5000+ Students Trust D's Education
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2: QUICK ACTION FEATURE STRIP (NAVY DARK BAR)
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#070e20] text-white py-6 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
            
            {[
              { icon: <FiFileText className="text-amber-400 text-2xl" />, title: 'FREE STUDY MATERIAL', sub: 'Notes, PDFs, E-books & More', link: '/store' },
              { icon: <FiVideo className="text-amber-400 text-2xl" />, title: 'FREE DEMO CLASS', sub: 'Experience Our Teaching', link: '/lectures' },
              { icon: <FiCheckCircle className="text-amber-400 text-2xl" />, title: 'REGULAR TESTS', sub: 'Mock Tests & Analysis', link: '/store' },
              { icon: <FiMessageSquare className="text-amber-400 text-2xl" />, title: 'DOUBT SUPPORT', sub: 'Get Doubts Resolved Anytime', link: '/contact' },
            ].map((item, idx) => (
              <Link 
                key={idx} 
                to={item.link} 
                className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-400/50 hover:bg-slate-900 transition-all group"
              >
                <div className="shrink-0">{item.icon}</div>
                <div className="text-left">
                  <div className="font-extrabold text-xs text-white group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{item.sub}</div>
                </div>
              </Link>
            ))}

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3: WHY STUDENTS CHOOSE D'S EDUCATION?
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-black text-[#0b132b] tracking-tight uppercase">
              — WHY STUDENTS CHOOSE D'S EDUCATION? —
            </h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto mt-2 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { 
                bg: 'bg-emerald-500', 
                icon: <FiUsers className="text-white text-2xl" />, 
                title: 'EXPERT FACULTY', 
                desc: 'Experienced & Qualified Teachers from Top Colleges.' 
              },
              { 
                bg: 'bg-purple-600', 
                icon: <FiBookOpen className="text-white text-2xl" />, 
                title: 'SMART LEARNING', 
                desc: 'Concept Based Teaching with Practical Approach.' 
              },
              { 
                bg: 'bg-amber-500', 
                icon: <FiCheckCircle className="text-white text-2xl" />, 
                title: 'REGULAR PRACTICE', 
                desc: 'Chapter Tests, Mock Tests & Detailed Analysis.' 
              },
              { 
                bg: 'bg-rose-500', 
                icon: <FiTrendingUp className="text-white text-2xl" />, 
                title: 'PERSONAL ATTENTION', 
                desc: 'Small Batch Sizes for Better Doubt Solving & Mentorship.' 
              },
              { 
                bg: 'bg-teal-500', 
                icon: <FiAward className="text-white text-2xl" />, 
                title: 'PROVEN RESULTS', 
                desc: 'Consistent Track Record of All India Rankers & High Pass %.' 
              },
            ].map((card, idx) => (
              <div 
                key={idx} 
                className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center"
              >
                <div className={`w-16 h-16 ${card.bg} rounded-full flex items-center justify-center shadow-md mb-4`}>
                  {card.icon}
                </div>
                <h3 className="font-extrabold text-sm text-[#0b132b] mb-2 uppercase tracking-wide">
                  {card.title}
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 4: OUR COURSES
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-black text-[#0b132b] tracking-tight uppercase">
              — OUR COURSES —
            </h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto mt-2 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {displayCourses.map((c, idx) => {
              const tag = c.badge || c.tag || 'Commerce';
              return (
                <div 
                  key={c.id || idx} 
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-left group"
                >
                  <div>
                    {/* Course Tag Icon Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-display font-black text-2xl text-blue-700">
                        {tag}
                      </span>
                      <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                        📘
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base mb-2 group-hover:text-amber-600 transition-colors line-clamp-1">
                      {c.title || c.name}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-4">
                      {c.desc || c.description || 'Build strong concepts and excel in exams with comprehensive conceptual coaching.'}
                    </p>
                  </div>

                  <Link 
                    to="/batches" 
                    className="w-full py-2.5 px-4 rounded-lg border border-slate-300 hover:border-amber-500 text-slate-800 hover:text-amber-600 font-bold text-xs flex items-center justify-center gap-1 transition-all"
                  >
                    EXPLORE <FiArrowRight />
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="mt-10">
            <Link 
              to="/courses" 
              className="bg-[#0b132b] hover:bg-[#15234d] text-white font-extrabold text-xs px-8 py-3 rounded-lg shadow-md transition-all inline-flex items-center gap-2 uppercase tracking-wider"
            >
              VIEW ALL COURSES <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 5: PROVEN RESULTS STATS BANNER
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#0b132b] text-white py-12 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Header */}
            <div className="lg:col-span-4 text-left border-b lg:border-b-0 lg:border-r border-slate-800 pb-6 lg:pb-0 lg:pr-8">
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white uppercase leading-tight">
                PROVEN RESULTS THAT<br />
                <span className="text-amber-400">MAKE US DIFFERENT!</span>
              </h3>
            </div>

            {/* Right Stats Grid */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {[
                { icon: <FiUsers className="text-amber-400 text-3xl mx-auto" />, count: 5000, suffix: '+', label: 'Happy Students' },
                { icon: <FiAward className="text-amber-400 text-3xl mx-auto" />, count: 250, suffix: '+', label: 'All India Rankers' },
                { icon: <FiCheckCircle className="text-amber-400 text-3xl mx-auto" />, count: 15, suffix: '+', label: 'Years of Excellence' },
                { icon: <FiStar className="text-amber-400 text-3xl mx-auto" />, count: 98, suffix: '%', label: 'Success Rate' },
              ].map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  {stat.icon}
                  <div className="font-display text-3xl font-black text-white mt-1">
                    <Counter target={stat.count} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs text-slate-300 font-semibold">{stat.label}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 6: OUR TOPPERS, OUR PRIDE
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-black text-[#0b132b] tracking-tight uppercase">
              — OUR TOPPERS, OUR PRIDE —
            </h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto mt-2 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayToppers.map((t, idx) => (
              <div 
                key={t.id || idx} 
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-xl transition-all duration-300 text-left flex flex-col justify-between"
              >
                <div>
                  {/* AIR Rank Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-amber-100 text-amber-800 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                      {t.rank || 'Top Rank'}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {t.course || 'Commerce'}
                    </span>
                  </div>

                  {/* Photo & Name */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                      {t.photo ? (
                        <img src={getImgSrc(t.photo)} alt={t.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#0b132b] text-amber-400 font-bold flex items-center justify-center text-lg">
                          {t.name[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                      <div className="text-xs text-amber-600 font-extrabold">{t.marks || t.percentage}</div>
                    </div>
                  </div>

                  {/* Quote */}
                  <p className="text-slate-600 text-xs italic leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    "{t.quote || 'D\'s Education provided exceptional conceptual coaching and personalized mentorship.'}"
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link 
              to="/results" 
              className="bg-[#0b132b] hover:bg-[#15234d] text-white font-extrabold text-xs px-8 py-3 rounded-lg shadow-md transition-all inline-flex items-center gap-2 uppercase tracking-wider"
            >
              VIEW MORE RESULTS <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 7: INDIA'S SMARTEST EXAM ENGINE (IMAGE 2 MOCKUP)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <span className="badge bg-purple-100 text-purple-700 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                Smart Technology
              </span>

              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-[#0b132b] leading-tight">
                India's Smartest Exam Engine
              </h2>

              <p className="text-slate-600 text-base leading-relaxed max-w-xl font-medium">
                Our AI-powered exam system gives every student a unique question paper — preventing cheating and ensuring fair assessment.
              </p>

              {/* 4 Feature Items */}
              <div className="space-y-4 pt-2">
                {[
                  { icon: <FiZap className="text-purple-600" />, title: 'Give Mock Tests Anytime', desc: 'Access exams 24/7 from any device' },
                  { icon: <FiTrendingUp className="text-blue-600" />, title: 'Instant Results', desc: 'Know your score the moment you submit' },
                  { icon: <FiAward className="text-amber-500" />, title: 'AI-Based Ranking', desc: 'See your rank among all students in your course' },
                  { icon: <FiShield className="text-emerald-600" />, title: 'Anti-Cheating System', desc: 'Randomized questions & option shuffling every attempt' },
                ].map((f, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
                      {f.icon}
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-[#0b132b]">{f.title}</div>
                      <div className="text-xs text-slate-500 font-medium">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link 
                  to="/login" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-lg hover:shadow-blue-600/25 transition-all inline-flex items-center gap-2"
                >
                  Start Your Test <FiArrowRight />
                </Link>
              </div>
            </div>

            {/* Right Graphic Mockup: DS Exam Engine v2.0 (Exact Image 2 replica) */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-lg bg-[#0b132b] rounded-3xl p-6 shadow-2xl border border-slate-800 text-white relative">
                
                {/* Window Control Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-slate-400 font-mono text-xs">DS Exam Engine v2.0</span>
                </div>

                {/* Question Frame Card */}
                <div className="bg-[#131f42] rounded-2xl p-5 mb-5 border border-slate-700/60">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-extrabold text-sm text-white">Q.23 of 50</span>
                    <div className="bg-rose-500/20 text-rose-400 text-xs font-mono font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                      <FiClock /> 32:14
                    </div>
                  </div>

                  <p className="text-slate-200 text-xs sm:text-sm font-medium leading-relaxed mb-4">
                    Which accounting concept states that revenue should be recognized when earned, regardless of when cash is received?
                  </p>

                  {/* Options List */}
                  <div className="space-y-2">
                    {[
                      { code: 'A', text: 'Accrual Concept', active: true },
                      { code: 'B', text: 'Cash Basis', active: false },
                      { code: 'C', text: 'Matching Principle', active: false },
                      { code: 'D', text: 'Going Concern', active: false },
                    ].map((opt, i) => (
                      <div 
                        key={i} 
                        className={`flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold transition-all ${
                          opt.active 
                            ? 'bg-blue-600 text-white shadow-md border border-blue-400' 
                            : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-slate-700/50'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                          opt.active ? 'bg-white text-blue-600' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {opt.code}
                        </span>
                        {opt.text}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Live Stats Bar */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-900 p-3 rounded-xl text-center border border-slate-800">
                    <div className="text-emerald-400 font-black text-lg">22</div>
                    <div className="text-slate-400 text-[11px] font-semibold">Correct</div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl text-center border border-slate-800">
                    <div className="text-rose-400 font-black text-lg">1</div>
                    <div className="text-slate-400 text-[11px] font-semibold">Wrong</div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl text-center border border-slate-800">
                    <div className="text-blue-400 font-black text-lg">27</div>
                    <div className="text-slate-400 text-[11px] font-semibold">Left</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 8: BOTTOM CALL-TO-ACTION BANNER
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#070c1b] text-white py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-8">
          
          <div className="space-y-2">
            <h2 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight uppercase">
              YOUR FUTURE STARTS WITH THE<br />
              <span className="text-amber-400">RIGHT DECISION TODAY!</span>
            </h2>
            <p className="text-slate-300 text-sm font-semibold">
              Talk to Our Experts — Get Free Counselling Now!
            </p>
          </div>

          {/* Big Phone Action Button */}
          <div className="inline-block">
            <a 
              href={`tel:${settings.phone || '6350149302'}`}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-2xl sm:text-3xl px-8 py-4 rounded-2xl shadow-xl hover:shadow-amber-500/25 transition-all inline-flex items-center gap-3 group"
            >
              <FiPhone className="group-hover:rotate-12 transition-transform" />
              {settings.phone || "6350149302"}
            </a>
            <div className="text-amber-400 text-xs font-bold mt-2 uppercase tracking-wider">
              Limited Seats — Enroll Now!
            </div>
          </div>

          {/* Bottom 6 Icon Features Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-6 border-t border-slate-800/80">
            {[
              { icon: '👨‍🏫', label: 'Experienced Faculty' },
              { icon: '🤝', label: 'Personalized Mentorship' },
              { icon: '📚', label: 'Updated Study Material' },
              { icon: '📝', label: 'Regular Tests & Feedback' },
              { icon: '❓', label: 'Doubt Clearing Sessions' },
              { icon: '🎓', label: 'Career Guidance & Support' },
            ].map((f, i) => (
              <div key={i} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center space-y-1">
                <div className="text-2xl">{f.icon}</div>
                <div className="text-[11px] font-bold text-slate-300">{f.label}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
