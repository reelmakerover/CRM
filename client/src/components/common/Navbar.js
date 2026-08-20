import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiBook, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Courses', path: '/courses' },
  { label: 'Free Lectures', path: '/lectures' },
  { label: 'Test Series', path: '/store' },
  { label: 'Batches', path: '/batches' },
  { label: 'Results', path: '/results' },
  { label: 'Blogs', path: '/blogs' },
  { label: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [siteConfig, setSiteConfig] = useState({
    site_title: "D's Education",
    site_subtitle: "By Vikram Rathore Sir",
    site_logo: ""
  });
  const { user, isAdmin } = useAuth();
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
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white shadow-xs'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          {siteConfig.site_logo ? (
            <img src={siteConfig.site_logo} alt="Logo" className="w-9 h-9 object-contain rounded-lg" />
          ) : (
            <div className="w-9 h-9 bg-primary-700 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm">
              <FiBook />
            </div>
          )}
          <div>
            <div className="font-display font-black text-lg text-primary-900 leading-tight">
              {siteConfig.site_title || "D's Education"}
            </div>
            <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
              {siteConfig.site_subtitle || "By Vikram Rathore Sir"}
            </div>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                location.pathname === link.path
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-700 hover:bg-primary-50 hover:text-primary-700'
              }`}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-2.5">
          {user ? (
            <Link to={getDashboardPath()}
              className="btn-primary text-sm py-2 px-5">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="flex items-center gap-1.5 font-medium text-sm px-3.5 py-2 rounded-lg transition-all text-slate-700 hover:text-primary-700">
                <FiLogIn /> Login
              </Link>
              <Link to="/login?mode=register" className="btn-gold text-sm py-2 px-4 shadow-sm">
                Create Account
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-slate-700">
          {open ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-xl py-4 px-4">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} onClick={() => setOpen(false)}
              className="block px-4 py-3 rounded-lg text-slate-700 hover:bg-primary-50 hover:text-primary-700 font-medium">
              {link.label}
            </Link>
          ))}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <Link to={getDashboardPath()} onClick={() => setOpen(false)} className="btn-primary justify-center">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary justify-center">Login</Link>
                <Link to="/login?mode=register" onClick={() => setOpen(false)} className="btn-gold justify-center">Create Free Account</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
