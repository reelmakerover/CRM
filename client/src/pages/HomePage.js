import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight, FiStar, FiUsers, FiAward, FiTrendingUp, FiCheck,
  FiBook, FiClock, FiShield, FiTarget, FiZap, FiPhone, FiVideo
} from 'react-icons/fi';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../utils/api';

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

/* ─── course cards data ─── */
const COURSES = [];

const WHY_US = [];

const TESTIMONIALS = [];

const FEE_PLANS = [];

export default function HomePage() {
  const [toppers, setToppers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [coursesList, setCoursesList] = useState(COURSES);
  const [whyUs, setWhyUs] = useState(WHY_US);
  const [testimonials, setTestimonials] = useState(TESTIMONIALS);
  const [feePlans, setFeePlans] = useState(FEE_PLANS);
  const [settings, setSettings] = useState({
    hero_title: "",
    hero_subtitle: "",
    stat_students: "0",
    stat_selections: "0",
    stat_experience: "0"
  });
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [welcomeVideo, setWelcomeVideo] = useState(null);

  useEffect(() => {
    // Determine number of slides dynamically
    let count = 0;
    if (settings.home_sliders) {
      try {
        const parsed = typeof settings.home_sliders === 'string' ? JSON.parse(settings.home_sliders) : settings.home_sliders;
        if (Array.isArray(parsed)) count = parsed.filter(s => s.active !== false).length;
      } catch (e) {}
    }
    if (count === 0) {
      ['banner_course_1', 'banner_course_2', 'banner_bottom'].forEach(key => {
        if ((settings[key] || {}).active !== false) count++;
      });
    }

    if (count <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % count);
    }, 5000);
    return () => clearInterval(timer);
  }, [settings.home_sliders, settings.banner_course_1, settings.banner_course_2, settings.banner_bottom]);

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
        setCoursesList(r.data.map(c => {
          let feats = ['Accounts', 'Economics', 'BST'];
          try {
            if (Array.isArray(c.features)) feats = c.features;
            else if (typeof c.features === 'string') feats = JSON.parse(c.features);
          } catch (err) {}

          return {
            image: c.image || null,
            icon: c.icon || '📘',
            title: c.name || 'Course',
            desc: c.description || '',
            badge: c.category || 'School',
            color: c.color || 'from-blue-500 to-blue-700',
            features: feats
          };
        }));
      }
    }).catch(e => console.log('Courses fetch error:', e.message));

    // 4. Settings
    api.get('/settings/public').then(r => {
      if (r.data && typeof r.data === 'object' && Object.keys(r.data).length > 0) {
        // Parse JSON strings back to objects for banner & array keys
        const objectKeys = ['banner_course_1', 'banner_course_2', 'banner_bottom', 'home_sliders', 'why_us', 'testimonials', 'fee_plans'];
        const parsed = { ...r.data };
        objectKeys.forEach(k => {
          if (parsed[k] && typeof parsed[k] === 'string') {
            try { parsed[k] = JSON.parse(parsed[k]); } catch(e) {}
          }
        });
        setSettings(prev => ({ ...prev, ...parsed }));
        
        // Parse why_us safely if present
        if (r.data.why_us) {
          try {
            const parsedWhy = typeof r.data.why_us === 'string' ? JSON.parse(r.data.why_us) : r.data.why_us;
            if (Array.isArray(parsedWhy) && parsedWhy.length > 0) {
              setWhyUs(parsedWhy.map((w, idx) => ({
                icon: WHY_US[idx % WHY_US.length].icon,
                title: w.title || 'Feature',
                desc: w.desc || ''
              })));
            }
          } catch(e) {}
        }

        // Parse testimonials safely
        if (r.data.testimonials) {
          try {
            const parsedTestimonials = typeof r.data.testimonials === 'string' ? JSON.parse(r.data.testimonials) : r.data.testimonials;
            if (Array.isArray(parsedTestimonials) && parsedTestimonials.length > 0) {
              setTestimonials(parsedTestimonials);
            }
          } catch(e) {}
        }

        // Parse fee_plans safely
        if (r.data.fee_plans) {
          try {
            const parsedPlans = typeof r.data.fee_plans === 'string' ? JSON.parse(r.data.fee_plans) : r.data.fee_plans;
            if (Array.isArray(parsedPlans) && parsedPlans.length > 0) {
              setFeePlans(parsedPlans);
            }
          } catch(e) {}
        }
      }
    }).catch(e => console.log('Settings fetch error:', e.message));

    // 5. Blogs
    api.get('/blogs').then(r => {
      if (Array.isArray(r.data) && r.data.length > 0) setLatestBlogs(r.data.slice(0, 3));
    }).catch(e => console.log('Blogs fetch error:', e.message));

    // 6. Free Lectures for welcome preview
    api.get('/lectures/free').then(r => {
      if (Array.isArray(r.data) && r.data.length > 0) setWelcomeVideo(r.data[0]);
    }).catch(e => console.log('Free lectures welcome video error:', e.message));

    // Scroll reveal
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.scroll-reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const getSlides = () => {
    let list = [];
    if (settings.home_sliders) {
      try {
        const parsed = typeof settings.home_sliders === 'string' ? JSON.parse(settings.home_sliders) : settings.home_sliders;
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed.filter(s => s.active !== false);
        }
      } catch (e) {}
    }
    
    // Fallback to active banner settings if no custom sliders are set
    if (list.length === 0) {
      ['banner_course_1', 'banner_course_2', 'banner_bottom'].forEach((key) => {
        const b = settings[key] || {};
        if (b.active !== false && b.image) {
          list.push({
            image: b.image,
            title: b.title || '',
            subtitle: b.subtitle || '',
            badge: b.badge || '',
            link: b.link || '',
            active: true
          });
        }
      });
    }
    return list;
  };

  const slides = getSlides();

  return (
    <div className="min-h-screen font-body">
      <Navbar />

      {/* ═══════════════════════════════════════
          TOP BANNER SLIDER / CAROUSEL
      ═══════════════════════════════════════ */}
      <div className="relative w-full overflow-hidden bg-slate-950 mt-[68px] h-[260px] sm:h-[280px] md:h-[320px] lg:h-[360px] xl:h-[400px]">
        {slides.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500">
            No active banners found.
          </div>
        ) : (
          <div className="relative w-full h-full flex">
            {slides.map((slide, idx) => {
              const bgUrl = getImgSrc(slide.image);
              
              // Slide element
              const SlideCard = (
                <div 
                  key={idx} 
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                  {/* Full image graphic background */}
                  <img 
                    src={bgUrl} 
                    alt={slide.title || `Slide ${idx + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay content ONLY if title or badge exists */}
                  {(slide.title || slide.badge) && (
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent flex flex-col justify-end p-4 sm:p-8 md:p-16">
                      <div className="max-w-4xl mx-auto w-full text-left space-y-2 sm:space-y-3">
                        {slide.badge && (
                          <span className="badge bg-gold-400 text-slate-950 font-extrabold text-[10px] sm:text-xs px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-md uppercase tracking-wider inline-block">
                            {slide.badge}
                          </span>
                        )}
                        {slide.title && (
                          <h2 className="font-display text-xl sm:text-3xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-lg">
                            {slide.title}
                          </h2>
                        )}
                        {slide.subtitle && (
                          <p className="text-slate-200 text-xs sm:text-sm md:text-lg max-w-2xl font-medium drop-shadow-md line-clamp-2 sm:line-clamp-none">
                            {slide.subtitle}
                          </p>
                        )}
                        {slide.link && (
                          <div className="pt-1">
                            <span className="btn-gold text-xs sm:text-sm px-4 py-2 sm:px-6 sm:py-2.5 shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2">
                              Explore Now <FiArrowRight />
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );

              return slide.link ? (
                <Link key={idx} to={slide.link} className="block w-full h-full">
                  {SlideCard}
                </Link>
              ) : SlideCard;
            })}

            {/* Slider Navigation Arrows */}
            {slides.length > 1 && (
              <>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
                  }}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all backdrop-blur-sm border border-white/10"
                >
                  <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentSlide(prev => (prev + 1) % slides.length);
                  }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all backdrop-blur-sm border border-white/10"
                >
                  <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
                </button>
              </>
            )}

            {/* Slider Dots */}
            {slides.length > 1 && (
              <div className="absolute bottom-3 sm:bottom-6 inset-x-0 z-20 flex justify-center gap-2">
                {slides.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentSlide(i);
                    }}
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-gold-400 w-6 sm:w-8' : 'bg-white/40 hover:bg-white/60'}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════
          PLATFORM INTRO SECTION (PW STYLE)
      ═══════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        {/* Background blobs for premium feel */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold-50/40 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Info Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <span className="badge bg-primary-100 text-primary-700 font-bold text-xs px-3 py-1.5 rounded-full inline-block uppercase tracking-wider">
                🎓 India's Premier Commerce Institute
              </span>
              
              <h2 className="font-display text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                {settings.welcome_title || "Bharat's Trusted & Affordable Commerce Platform"}
              </h2>
              
              <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">
                {settings.welcome_subtitle || "Unlock your potential with D's Education. We provide results-driven commerce coaching led by Vikram Rathore Sir with a focus on deep conceptual clarity, board exam mastery, and professional certifications."}
              </p>
              
              {/* Feature Checkmarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                  "Live Interactive Mock Tests & OTP 2FA",
                  "Small Batch Focus & Personal Mentoring",
                  "Structured Notes & Board Formula Sheets",
                  "Anti-Cheating Randomized Mock Exams"
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 text-xs">✓</span>
                    <span className="text-slate-700 text-sm font-semibold">{feat}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to={settings.welcome_btn_link || "/batches"} className="btn-primary text-base px-8 py-3.5 shadow-lg">
                  {settings.welcome_btn_text || "Get Started"} <FiArrowRight />
                </Link>
                <Link to="/courses" className="btn-secondary text-base px-8 py-3.5">
                  View All Courses
                </Link>
              </div>
            </div>
            
            {/* Right Interactive Lecture Video Column */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-[460px] bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-5 space-y-4 hover:shadow-glow transition-all duration-300 relative">
                {/* Background decorative ring */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary-100/30 rounded-full blur-2xl" />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gold-100/30 rounded-full blur-2xl" />

                {/* Simulated Monitor/Frame Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex gap-1.5">
                    {['bg-rose-500', 'bg-yellow-500', 'bg-emerald-500'].map(c => <div key={c} className={`w-2.5 h-2.5 rounded-full ${c}`} />)}
                  </div>
                  <span className="badge bg-gold-400 text-slate-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    🔥 Featured Demo Lecture
                  </span>
                </div>

                {/* Video Player Embed */}
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-150 shadow-md">
                  <iframe
                    src={`https://www.youtube.com/embed/${welcomeVideo ? welcomeVideo.youtubeId : 'd1mXn4L_WvU'}`}
                    title={welcomeVideo ? welcomeVideo.title : 'Featured Lecture'}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>

                {/* Video Description */}
                <div className="text-left space-y-2">
                  <span className="text-primary-600 font-bold text-xs uppercase tracking-wider block">
                    📚 {welcomeVideo?.subject?.name || 'Class 12 Accountancy'}
                  </span>
                  <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-2">
                    {welcomeVideo?.title || 'Partnership Fundamentals | Commerce Strategy by Vikram Sir'}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
                    {welcomeVideo?.description || 'Learn how to secure 95%+ in your board exams with this basic concept lecture covering capital accounts, interest on drawings, and profit appropriation.'}
                  </p>
                </div>

                {/* CTA Link to Free Lectures Page */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <Link to="/lectures" className="flex-1 btn-secondary text-xs justify-center py-2.5 flex items-center gap-2">
                    <FiVideo /> All Lectures
                  </Link>
                  <a 
                    href={welcomeVideo ? welcomeVideo.videoUrl : 'https://www.youtube.com/watch?v=d1mXn4L_WvU'} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex-1 btn-gold text-xs justify-center py-2.5 flex items-center gap-2 shadow-sm"
                  >
                    Watch on YouTube ↗
                  </a>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          EXAM SYSTEM HIGHLIGHT
      ═══════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="scroll-reveal">
              <span className="badge bg-violet-100 text-violet-700 mb-4">Smart Technology</span>
              <h2 className="section-title">India's Smartest Exam Engine</h2>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                Our AI-powered exam system gives every student a unique question paper — preventing cheating and ensuring fair assessment.
              </p>
              <div className="space-y-4">
                {[
                  { icon: <FiZap className="text-violet-500" />, title: 'Give Mock Tests Anytime', desc: 'Access exams 24/7 from any device' },
                  { icon: <FiTrendingUp className="text-primary-500" />, title: 'Instant Results', desc: 'Know your score the moment you submit' },
                  { icon: <FiAward className="text-gold-500" />, title: 'AI-Based Ranking', desc: 'See your rank among all students in your course' },
                  { icon: <FiShield className="text-emerald-500" />, title: 'Anti-Cheating System', desc: 'Randomized questions & option shuffling every attempt' },
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">{f.icon}</div>
                    <div>
                      <div className="font-semibold text-slate-900">{f.title}</div>
                      <div className="text-slate-500 text-sm">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/login" className="btn-primary mt-6 px-8">Start Your Test <FiArrowRight /></Link>
            </div>

            {/* Visual */}
            <div className="scroll-reveal">
              <div className="bg-gradient-to-br from-slate-900 to-primary-900 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1.5">
                    {['bg-rose-500', 'bg-yellow-500', 'bg-green-500'].map(c => <div key={c} className={`w-3 h-3 rounded-full ${c}`} />)}
                  </div>
                  <span className="text-slate-400 text-xs font-mono">DS Exam Engine v2.0</span>
                </div>
                <div className="glass rounded-2xl p-5 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-white font-semibold">Q.23 of 50</span>
                    <div className="flex items-center gap-2 bg-rose-500/20 text-rose-400 px-3 py-1 rounded-full text-sm font-mono">
                      <FiClock /> 32:14
                    </div>
                  </div>
                  <p className="text-white/90 text-sm leading-relaxed mb-4">
                    Which accounting concept states that revenue should be recognized when earned, regardless of when cash is received?
                  </p>
                  {['Accrual Concept', 'Cash Basis', 'Matching Principle', 'Going Concern'].map((opt, i) => (
                    <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg mb-2 cursor-pointer text-sm ${i === 0 ? 'bg-primary-500/30 border border-primary-400/50 text-primary-200' : 'text-white/70 hover:bg-white/5'}`}>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/50'}`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="glass-dark rounded-xl p-3 text-center">
                    <div className="text-emerald-400 font-bold text-lg">22</div>
                    <div className="text-white/40 text-xs">Correct</div>
                  </div>
                  <div className="glass-dark rounded-xl p-3 text-center">
                    <div className="text-rose-400 font-bold text-lg">1</div>
                    <div className="text-white/40 text-xs">Wrong</div>
                  </div>
                  <div className="glass-dark rounded-xl p-3 text-center">
                    <div className="text-slate-400 font-bold text-lg">27</div>
                    <div className="text-white/40 text-xs">Left</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          COURSES SECTION
      ═══════════════════════════════════════ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14 scroll-reveal">
            <span className="badge bg-primary-100 text-primary-700 mb-3">Our Programs</span>
            <h2 className="section-title">Courses Offered</h2>
            <p className="section-subtitle">Comprehensive commerce education from school level to professional certification</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coursesList.map((c, i) => {
              const cImg = getImgSrc(c.image);
              const visibleFeatures = Array.isArray(c.features) ? c.features.slice(0, 3) : [];
              const extraCount = Array.isArray(c.features) && c.features.length > 3 ? c.features.length - 3 : 0;
              
              // Dynamic thematic palette for courses without custom image
              const tit = (c.title || '').toLowerCase();
              const isPro = tit.includes('ca') || tit.includes('cma') || tit.includes('cs') || (c.badge || '').toLowerCase().includes('pro');
              const isSchool = tit.includes('12th') || tit.includes('11th') || tit.includes('10th') || (c.badge || '').toLowerCase().includes('school');
              const isDegree = tit.includes('bcom') || tit.includes('bba') || tit.includes('mcom');

              const gradientClass = isPro 
                ? 'from-amber-600 via-rose-800 to-slate-950' 
                : isSchool 
                ? 'from-blue-600 via-indigo-800 to-slate-950' 
                : isDegree 
                ? 'from-emerald-600 via-teal-800 to-slate-950' 
                : 'from-primary-700 via-indigo-900 to-slate-950';

              const icon = isPro ? '🏆' : isSchool ? '📚' : isDegree ? '🎓' : (c.icon || '📘');

              return (
                <div 
                  key={i} 
                  className="flex flex-col h-full bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_35px_-8px_rgba(30,58,138,0.18)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden group"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {/* Banner Header */}
                  <div className={`h-52 bg-gradient-to-br ${gradientClass} relative overflow-hidden shrink-0 flex items-center justify-center`}>
                    {cImg ? (
                      <img 
                        src={cImg} 
                        alt={c.title} 
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                    ) : (
                      <>
                        {/* Decorative Graphic Background & Watermark */}
                        <div className="absolute inset-0 opacity-15 select-none flex items-center justify-center overflow-hidden">
                          <span className="font-display font-black text-6xl tracking-widest text-white uppercase whitespace-nowrap">
                            {c.title?.split(' ')[0] || 'COMMERCE'}
                          </span>
                        </div>
                        <div className="relative z-10 w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          {icon}
                        </div>
                      </>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    
                    {/* Category Badge */}
                    <span className="absolute top-3.5 right-3.5 badge bg-slate-900/80 backdrop-blur-md text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-white/20 shadow-md">
                      {c.badge || 'Commerce'}
                    </span>

                    {/* Batch Mode Pill */}
                    <span className="absolute bottom-3.5 left-3.5 bg-black/40 backdrop-blur-md text-white/90 text-[11px] font-medium px-2.5 py-0.5 rounded-lg border border-white/10 flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live & Classroom
                    </span>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display font-bold text-slate-900 text-xl group-hover:text-primary-600 transition-colors line-clamp-1">
                        {c.title}
                      </h3>
                      <p className="text-slate-500 text-xs sm:text-sm mt-2 mb-4 line-clamp-2 min-h-[38px] leading-relaxed">
                        {c.desc || 'Comprehensive conceptual coaching with regular test series, doubt sessions & printed study materials.'}
                      </p>

                      {/* Key Features */}
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
                          + {extraCount} more benefits & materials included
                        </p>
                      )}
                    </div>

                    {/* Footer CTA Button */}
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <Link 
                        to="/batches" 
                        className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-700 hover:from-primary-700 hover:to-indigo-800 text-white font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-xl hover:shadow-primary-500/25 group/btn"
                      >
                        <span>Enroll in Course</span>
                        <FiArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-12">
            <Link to="/courses" className="btn-primary px-8 py-3.5 text-sm font-bold shadow-lg">
              View All Courses <FiArrowRight className="ml-1" />
            </Link>
          </div>
        </div>

        {/* ═══════════════════════════════════════
            STUDENT TOPPERS & PROMO BANNERS (2 GRAPHIC IMAGE BANNERS)
        ═══════════════════════════════════════ */}
        <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 scroll-reveal">
            {['banner_course_1', 'banner_course_2'].map((key, idx) => {
              const b = settings[key] || {};
              if (b.active === false || !b.image) return null;
              const bgUrl = getImgSrc(b.image);

              const BannerCard = (
                <div className="relative rounded-3xl overflow-hidden shadow-2xl group border border-slate-200/50 bg-slate-900 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
                  <img 
                    src={bgUrl} 
                    alt={b.title || `Topper Banner ${idx + 1}`} 
                    className="w-full h-auto min-h-[380px] max-h-[600px] object-cover rounded-3xl transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  {/* Render text overlay ONLY if custom title or badge is provided by admin */}
                  {(b.title || b.badge) && (
                    <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent text-white">
                      {b.badge && <span className="badge bg-gold-400 text-slate-950 font-bold text-xs px-3 py-1 rounded-full mb-2 inline-block">{b.badge}</span>}
                      {b.title && <h3 className="font-display text-xl font-bold text-white">{b.title}</h3>}
                    </div>
                  )}
                </div>
              );

              return b.link ? (
                <Link key={key} to={b.link} className="block">
                  {BannerCard}
                </Link>
              ) : (
                <div key={key}>
                  {BannerCard}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          WHY CHOOSE US
      ═══════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14 scroll-reveal">
            <span className="badge bg-gold-100 text-gold-700 mb-3">Why D's Education</span>
            <h2 className="section-title">What Makes Us Different</h2>
            <p className="section-subtitle">More than a coaching institute — we're a complete education ecosystem</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((w, i) => (
              <div key={i} className="card p-6 flex gap-4 scroll-reveal group" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  {w.icon || <FiStar className="text-gold-500 text-2xl" />}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{w.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TOP RESULTS / TOPPERS
      ═══════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-br from-primary-900 to-primary-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14 scroll-reveal">
            <span className="badge bg-gold-500/20 text-gold-400 mb-3">Hall of Fame</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">Our Toppers</h2>
            <p className="text-primary-300 text-lg">Students who made us proud with exceptional results</p>
          </div>
          {toppers.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {toppers.map((t, i) => (
                <div key={t.id || i} className="glass rounded-2xl p-4 text-center scroll-reveal group hover:bg-white/15 transition-all">
                  <div className="w-16 h-16 rounded-full bg-gold-gradient mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
                    {t.photo ? <img src={getImgSrc(t.photo)} alt={t.name} className="w-full h-full rounded-full object-cover" /> : t.name[0]}
                  </div>
                  <div className="text-white font-semibold text-sm">{t.name}</div>
                  <div className="text-primary-300 text-xs mt-0.5">{t.course}</div>
                  <div className="text-gold-400 font-bold text-lg mt-1">{t.marks || t.percentage}</div>
                  {t.rank && <div className="badge bg-gold-500/20 text-gold-400 text-xs mt-1">Rank #{t.rank}</div>}
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/results" className="btn-gold px-8">View All Results <FiArrowRight /></Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          NEW BATCHES
      ═══════════════════════════════════════ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14 scroll-reveal">
            <span className="badge bg-emerald-100 text-emerald-700 mb-3">Upcoming</span>
            <h2 className="section-title">New Batches Starting</h2>
            <p className="section-subtitle">Limited seats available — secure your spot today</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {batches.map((b, i) => {
              const studentsCount = b.students?.length ?? b.enrolledStudents?.length ?? b.enrolledStudents ?? 0;
              const seats = (b.totalSeats || 30) - studentsCount;
              const urgency = seats <= 5 ? 'critical' : seats <= 10 ? 'low' : 'ok';
              return (
                <div key={b.id || i} className="card p-6 scroll-reveal" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className={`badge text-xs mb-2 ${b.mode === 'online' ? 'bg-blue-100 text-blue-700' :
                          b.mode === 'hybrid' ? 'bg-violet-100 text-violet-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                        {b.mode || 'Offline'}
                      </span>
                      <h3 className="font-semibold text-slate-900">{b.name}</h3>
                      <p className="text-primary-600 text-sm">{b.course?.name}</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FiClock className="text-slate-400" />
                      {b.timing || 'Timing TBD'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FiAward className="text-slate-400" />
                      Starts {b.startDate ? new Date(b.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Soon'}
                    </div>
                  </div>
                  {/* Seats bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Seats Available</span>
                      <span className={`font-semibold ${urgency === 'critical' ? 'text-rose-600' : urgency === 'low' ? 'text-orange-500' : 'text-emerald-600'}`}>
                        {seats} left
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className={`h-full rounded-full transition-all ${urgency === 'critical' ? 'bg-rose-500' : urgency === 'low' ? 'bg-orange-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, Math.max(0, (((b.totalSeats || 30) - seats) / (b.totalSeats || 30)) * 100))}%` }} />
                    </div>
                  </div>
                  <a href={`https://wa.me/919876543210?text=I want to enroll in ${b.name}`} target="_blank" rel="noreferrer"
                    className="w-full btn-primary justify-center text-sm py-2.5">
                    Enroll Now
                  </a>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Link to="/batches" className="btn-secondary px-8">View All Batches <FiArrowRight /></Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TRUST STATS
      ═══════════════════════════════════════ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <FiUsers className="text-primary-500" />, value: parseInt(settings.stat_students || 1000), suffix: '+', label: 'Students Trained', color: 'primary' },
              { icon: <FiAward className="text-gold-500" />, value: parseInt(settings.stat_experience || 15), suffix: '+', label: 'Years of Excellence', color: 'gold' },
              { icon: <FiTrendingUp className="text-emerald-500" />, value: 95, suffix: '%', label: 'Pass Rate', color: 'emerald' },
              { icon: <FiStar className="text-violet-500" />, value: parseInt(settings.stat_selections || 500), suffix: '+', label: 'Selections / Top Results', color: 'violet' },
            ].map((stat, i) => (
              <div key={i} className="card p-6 text-center scroll-reveal">
                <div className="text-3xl mb-2 flex justify-center">{stat.icon}</div>
                <div className="font-display text-3xl font-bold text-slate-900">
                  <Counter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-slate-500 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14 scroll-reveal">
            <span className="badge bg-rose-100 text-rose-700 mb-3">Student Stories</span>
            <h2 className="section-title">What Our Students Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="card p-6 scroll-reveal" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex mb-3">
                  {[...Array(t.stars || 5)].map((_, j) => <FiStar key={j} className="text-gold-500 fill-gold-500 text-sm" />)}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-primary-gradient flex items-center justify-center bg-primary-600 text-white font-bold text-sm">
                    {t.avatar || t.name?.[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                    <div className="text-primary-600 text-xs">{t.course}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          LATEST ARTICLES
      ═══════════════════════════════════════ */}
      {latestBlogs.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 scroll-reveal">
              <div>
                <span className="badge bg-primary-100 text-primary-700 mb-3">Knowledge Hub</span>
                <h2 className="section-title mb-0">Latest Articles</h2>
              </div>
              <Link to="/blogs" className="text-primary-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">
                View All Insights <FiArrowRight />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestBlogs.map((blog, i) => (
                <Link key={blog.id} to={`/blog/${blog.slug}`} className="group scroll-reveal" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="rounded-2xl overflow-hidden mb-5 aspect-[16/10] bg-slate-100 shadow-lg">
                    {blog.image ? (
                      <img src={getImgSrc(blog.image)} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100"><FiBook size={40} /></div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-primary-600 uppercase tracking-wider mb-3">
                    {blog.category}
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                    {blog.excerpt || (blog.content || '').replace(/<[^>]*>?/gm, '').substring(0, 100)}
                  </p>
                  <span className="text-slate-900 text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                    Read Article <FiArrowRight className="text-primary-500" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          FEES SECTION
      ═══════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14 scroll-reveal">
            <span className="badge bg-emerald-100 text-emerald-700 mb-3">Transparent Pricing</span>
            <h2 className="section-title">Affordable Fee Structure</h2>
            <p className="section-subtitle">No hidden charges. EMI options available for all courses.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {feePlans.map((plan, i) => (
              <div key={i} className={`card p-8 scroll-reveal relative ${plan.popular ? 'border-2 border-gold-400 shadow-card-hover' : ''}`} style={{ animationDelay: `${i * 0.1}s` }}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge bg-gold-500 text-white px-4">Most Popular</span>
                  </div>
                )}
                <h3 className="font-semibold text-slate-900 mb-3">{plan.title}</h3>
                <div className="flex items-end gap-1 mb-6">
                  <span className="font-display text-4xl font-bold text-primary-700">{plan.price}</span>
                  <span className="text-slate-400 mb-1">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {(plan.features || []).map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <FiCheck className="text-emerald-500 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <a href="https://wa.me/919876543210?text=I want to know more about fee structure" target="_blank" rel="noreferrer"
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all text-sm ${plan.popular ? 'btn-gold' : 'btn-secondary'
                    }`}>
                  Enquire Now <FiArrowRight />
                </a>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-500 text-sm mt-8">
            💳 EMI options available | 🎓 Scholarships for meritorious students | 📞 Call for custom packages
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════ */}
      <section className="py-20 bg-hero-gradient relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-gold-400/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-5">
            Ready to <span className="gradient-text">Transform</span> Your Future?
          </h2>
          <p className="text-primary-200 text-xl mb-10">
            Join D's Education today. Limited seats available in the next batch.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/batches" className="btn-gold px-10 py-4 text-base shadow-xl">
              Join D's Education Today <FiArrowRight />
            </Link>
            <a href="tel:+919876543210" className="glass text-white border border-white/20 px-10 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all flex items-center gap-2 text-base">
              <FiPhone /> Call Now
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          BOTTOM FULL-WIDTH PROMO BANNER
      ═══════════════════════════════════════ */}
      {(() => {
        const b = settings.banner_bottom || {};
        if (b.active === false || !b.image) return null;
        const bgUrl = getImgSrc(b.image);

        const BannerCard = (
          <div className="relative rounded-3xl overflow-hidden shadow-2xl group border border-slate-700/50 bg-slate-900 transition-all duration-300 hover:scale-[1.01]">
            <img 
              src={bgUrl} 
              alt={b.title || "Topper Banner Bottom"} 
              className="w-full h-auto min-h-[380px] max-h-[650px] object-cover rounded-3xl transition-transform duration-500 group-hover:scale-[1.02]"
            />
            {(b.title || b.badge) && (
              <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent text-white">
                {b.badge && <span className="badge bg-rose-600 text-white font-bold text-xs px-3 py-1 rounded-full mb-2 inline-block">{b.badge}</span>}
                {b.title && <h2 className="font-display text-2xl md:text-3xl font-bold text-white">{b.title}</h2>}
              </div>
            )}
          </div>
        );

        return (
          <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
            <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8">
              {b.link ? <Link to={b.link}>{BannerCard}</Link> : BannerCard}
            </div>
          </section>
        );
      })()}

      <Footer />
    </div>
  );
}
