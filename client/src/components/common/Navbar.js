import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiMenu, FiX, FiBook, FiLogIn, FiPhone, FiMail, 
  FiMapPin, FiDownload, FiUser 
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const navLinks = [
  { label: 'HOME', path: '/' },
  { label: 'COURSES', path: '/courses' },
  { label: 'BATCHES', path: '/batches' },
  { label: 'TEST SERIES', path: '/store' },
  { label: 'FREE LECTURES', path: '/lectures' },
  { label: 'RESULTS', path: '/results' },
  { label: 'BLOGS', path: '/blogs' },
  { label: 'CONTACT US', path: '/contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [siteConfig, setSiteConfig] = useState({
    site_title: "D's EDUCATION",
    site_subtitle: "COMMERCE CLASSES",
    site_logo: "",
    phone: "6350149302",
    email: "info@dseducation.in",
    location: "Jaipur, Rajasthan"
  });
  const { user } = useAuth();
  const location = useLocation();

  const getDashboardPath = () => {
    if (!user) return '/login';
    const r = (user.role || '').toString().trim().toLowerCase();
    if (r === 'superproadmin') return '/superproadmin/dashboard';
    if (r === 'superadmin') return '/superadmin/dashboard';
    if (r === 'admin') return '/admin/dashboard';
    if (['teacher', 'faculty'].includes(r)) return '/teacher/dashboard';
    return '/student/dashboard';
  };

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    api.get('/settings/public').then(r => {
      if (r.data && typeof r.data === 'object') {
        setSiteConfig(prev => ({ ...prev, ...r.data }));
      }
    }).catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full shadow-md font-body">
      {/* ─── TOP ANNOUNCEMENT & CONTACT BAR (NAVY/BLACK) ─── */}
      <div className="bg-[#070c1b] text-slate-200 text-xs py-2 px-4 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Left Info Details */}
          <div className="flex flex-wrap items-center gap-4 text-[11px] sm:text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
              <FiMapPin className="text-amber-400 text-xs" />
              {siteConfig.location || "Jaipur, Rajasthan"}
            </span>
            <a href={`tel:${siteConfig.phone || '6350149302'}`} className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
              <FiPhone className="text-amber-400 text-xs" />
              {siteConfig.phone || "6350149302"}
            </a>
            <a href={`mailto:${siteConfig.email || 'info@dseducation.in'}`} className="flex items-center gap-1.5 hover:text-amber-400 transition-colors hidden md:inline-flex">
              <FiMail className="text-amber-400 text-xs" />
              {siteConfig.email || "info@dseducation.in"}
            </a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <Link 
                to={getDashboardPath()}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[11px] px-3 py-1 rounded-md transition-all shadow-sm flex items-center gap-1"
              >
                <FiUser /> Dashboard ({user.name?.split(' ')[0]})
              </Link>
            ) : (
              <>
                <Link 
                  to="/login"
                  className="bg-slate-800/90 hover:bg-slate-700 text-white font-semibold text-[11px] px-3 py-1 rounded-md border border-slate-700 transition-all flex items-center gap-1"
                >
                  <FiLogIn /> Student Login
                </Link>
                <Link 
                  to="/login?mode=register"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[11px] px-3 py-1 rounded-md transition-all shadow-sm flex items-center gap-1"
                >
                  <FiUser /> Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── MAIN NAVIGATION BAR (WHITE) ─── */}
      <nav className={`transition-all duration-300 ${
        scrolled ? 'bg-white/98 backdrop-blur-md shadow-lg py-2' : 'bg-white py-3'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            {siteConfig.site_logo ? (
              <img src={siteConfig.site_logo} alt="Logo" className="w-11 h-11 object-contain rounded-xl" />
            ) : (
              <div className="w-11 h-11 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
                <FiBook />
              </div>
            )}
            <div>
              <div className="font-display font-black text-xl text-[#0b132b] leading-none tracking-tight">
                {siteConfig.site_title || "D's EDUCATION"}
              </div>
              <div className="text-[11px] font-extrabold text-amber-600 uppercase tracking-wider mt-0.5">
                {siteConfig.site_subtitle || "COMMERCE CLASSES"}
              </div>
              <div className="text-[9px] text-slate-400 font-medium">Learn Today, Lead Tomorrow</div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => {
              const active = location.pathname === link.path;
              return (
                <Link 
                  key={link.path} 
                  to={link.path}
                  className={`px-3 py-2 text-xs font-bold transition-all rounded-lg ${
                    active
                      ? 'text-amber-600 bg-amber-50 font-extrabold'
                      : 'text-slate-800 hover:text-amber-600 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Action Button (ENQUIRE NOW) */}
          <div className="hidden lg:flex items-center gap-3">
            <a 
              href="#enquire-form"
              className="bg-[#0b132b] hover:bg-[#132047] text-white font-extrabold text-xs px-5 py-2.5 rounded-lg shadow-md transition-all hover:scale-105 uppercase tracking-wider"
            >
              ENQUIRE NOW
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setOpen(!open)} 
            className="lg:hidden p-2 rounded-lg text-slate-800 hover:bg-slate-100"
          >
            {open ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {open && (
          <div className="lg:hidden bg-white border-t border-slate-100 shadow-2xl py-4 px-4 space-y-1">
            {navLinks.map(link => (
              <Link 
                key={link.path} 
                to={link.path} 
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-slate-800 hover:bg-amber-50 hover:text-amber-600 font-bold text-sm"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <a 
                href="#enquire-form" 
                onClick={() => setOpen(false)}
                className="w-full bg-[#0b132b] text-white font-bold text-center py-2.5 rounded-lg text-sm"
              >
                ENQUIRE NOW
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
