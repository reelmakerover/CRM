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

  const isHome = location.pathname === '/';
  const logoUrl = siteConfig.site_logo 
    ? (siteConfig.site_logo.startsWith('http') ? siteConfig.site_logo : `${typeof window !== 'undefined' && window.location.port === '3000' ? window.location.protocol + '//' + window.location.hostname + ':5000' : ''}${siteConfig.site_logo}`) 
    : '';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-white/95 backdrop-blur-md shadow-md py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={siteConfig.site_title || "Logo"} 
              className="h-10 w-auto object-contain max-w-[160px]" 
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-glow transition-all">
              <FiBook className="text-white text-xl" />
            </div>
          )}
          <div>
            <div className="font-display font-bold text-lg leading-tight text-primary-900">
              {siteConfig.site_title || "D's Education"}
            </div>
            <div className="text-xs leading-tight text-primary-500">
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
            <Link to={isAdmin ? '/admin/dashboard' : '/student/dashboard'}
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
              <Link to={isAdmin ? '/admin/dashboard' : '/student/dashboard'} onClick={() => setOpen(false)} className="btn-primary justify-center">
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
