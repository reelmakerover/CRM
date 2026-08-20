import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiPhone, FiMail, FiMapPin, FiInstagram, FiYoutube, FiFacebook } from 'react-icons/fi';
import api from '../../utils/api';

export default function Footer() {
  const [settings, setSettings] = useState({
    contact_email: "info@dseducation.in",
    contact_phone: "6350149302",
    contact_address: "Jaipur, Rajasthan",
    site_title: "D's EDUCATION",
    site_subtitle: "COMMERCE CLASSES"
  });

  useEffect(() => {
    api.get('/settings/public').then(r => {
      if (r.data && typeof r.data === 'object') setSettings(prev => ({ ...prev, ...r.data }));
    }).catch(() => { });
  }, []);

  return (
    <footer className="bg-[#070c1b] text-slate-300 border-t border-slate-800 font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                <FiBook />
              </div>
              <div>
                <div className="font-display font-black text-white text-xl tracking-tight">
                  {settings.site_title || "D's EDUCATION"}
                </div>
                <div className="text-amber-400 text-xs font-extrabold uppercase tracking-wider">
                  {settings.site_subtitle || "COMMERCE CLASSES"}
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              Premier Commerce Coaching delivering excellence in CA, CMA, CS & Board Examinations. Shaping successful careers with concept clarity & personalized mentorship.
            </p>
            <div className="flex gap-3">
              {[
                { icon: <FiFacebook />, href: '#', label: 'Facebook' },
                { icon: <FiInstagram />, href: '#', label: 'Instagram' },
                { icon: <FiYoutube />, href: '#', label: 'YouTube' },
              ].map(s => (
                <a key={s.label} href={s.href} aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center hover:border-amber-400 hover:text-amber-400 transition-all duration-200">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-extrabold text-sm uppercase tracking-wider mb-5 border-b border-slate-800 pb-2">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'HOME', path: '/' },
                { label: 'COURSES', path: '/courses' },
                { label: 'BATCHES', path: '/batches' },
                { label: 'TEST SERIES', path: '/store' },
                { label: 'FREE LECTURES', path: '/lectures' },
                { label: 'TOP RESULTS', path: '/results' },
                { label: 'CONTACT US', path: '/contact' },
              ].map(l => (
                <li key={l.path}>
                  <Link to={l.path} className="text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4 className="text-white font-extrabold text-sm uppercase tracking-wider mb-5 border-b border-slate-800 pb-2">Target Streams</h4>
            <ul className="space-y-3">
              {['CA Foundation', 'CA Intermediate', 'CMA Foundation', 'CMA Intermediate', 'CS Executive / Foundation', 'Class 11th Commerce', 'Class 12th Commerce'].map(c => (
                <li key={c}>
                  <Link to="/courses" className="text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-extrabold text-sm uppercase tracking-wider mb-5 border-b border-slate-800 pb-2">Contact Info</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-xs text-slate-300">
                <FiMapPin className="text-amber-400 text-sm mt-0.5 flex-shrink-0" />
                <span>{settings.contact_address || settings.address || "Jaipur, Rajasthan"}</span>
              </li>
              <li className="flex items-center gap-3 text-xs text-slate-300">
                <FiPhone className="text-amber-400 text-sm flex-shrink-0" />
                <a href={`tel:${settings.phone || settings.contact_phone || '6350149302'}`} className="hover:text-amber-400 transition-colors font-bold">
                  {settings.phone || settings.contact_phone || "6350149302"}
                </a>
              </li>
              <li className="flex items-center gap-3 text-xs text-slate-300">
                <FiMail className="text-amber-400 text-sm flex-shrink-0" />
                <a href={`mailto:${settings.email || settings.contact_email || 'info@dseducation.in'}`} className="hover:text-amber-400 transition-colors font-semibold">
                  {settings.email || settings.contact_email || "info@dseducation.in"}
                </a>
              </li>
            </ul>
            <div className="mt-6 p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
              <p className="text-amber-400 text-xs font-bold mb-1">WhatsApp Counselling</p>
              <a href={`https://wa.me/91${(settings.phone || '6350149302').replace(/[^0-9]/g, '')}?text=Hello%20Ds%20Education`} target="_blank" rel="noreferrer"
                className="text-xs text-slate-300 hover:text-amber-400 transition-colors font-semibold flex items-center gap-1">
                Chat with Admission Team →
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800/80 py-5 text-center text-xs text-slate-500 bg-[#050814]">
        <div className="max-w-7xl mx-auto px-4">
          © {new Date().getFullYear()} D's Education Commerce Classes. All rights reserved. | Learn Today, Lead Tomorrow.
        </div>
      </div>
    </footer>
  );
}
