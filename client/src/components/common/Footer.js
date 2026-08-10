import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiPhone, FiMail, FiMapPin, FiInstagram, FiYoutube, FiFacebook } from 'react-icons/fi';
import api from '../../utils/api';

export default function Footer() {
  const [settings, setSettings] = useState({
    contact_email: "info@dseducation.in",
    contact_phone: "+91 98765 43210",
    contact_address: "123, Commerce Nagar, Near City Mall, Jaipur, Rajasthan - 302001"
  });

  useEffect(() => {
    api.get('/settings/public').then(r => {
      if (Object.keys(r.data).length > 0) setSettings(prev => ({ ...prev, ...r.data }));
    }).catch(() => { });
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <FiBook className="text-white text-xl" />
              </div>
              <div>
                <div className="font-display font-bold text-white text-lg">D's Education</div>
                <div className="text-primary-400 text-xs">By Vikram Rathore Sir</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-5">
              Result-driven Commerce Coaching delivering excellence in education since 2010. Shaping futures with personalized attention and proven methodology.
            </p>
            <div className="flex gap-3">
              {[
                { icon: <FiFacebook />, href: '#', label: 'Facebook' },
                { icon: <FiInstagram />, href: '#', label: 'Instagram' },
                { icon: <FiYoutube />, href: '#', label: 'YouTube' },
              ].map(s => (
                <a key={s.label} href={s.href} aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all duration-200">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'Home', path: '/' },
                { label: 'All Courses', path: '/courses' },
                { label: 'New Batches', path: '/batches' },
                { label: 'Top Results', path: '/results' },
                { label: 'Contact Us', path: '/contact' },
                { label: 'Student Login', path: '/login' },
              ].map(l => (
                <li key={l.path}>
                  <Link to={l.path} className="text-sm hover:text-primary-400 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h4 className="text-white font-semibold mb-5">Our Courses</h4>
            <ul className="space-y-3">
              {['10th Commerce', '11th Commerce', '12th Commerce', 'BCom / MCom', 'BBA', 'CA Foundation', 'CA Intermediate', 'CMA / CS'].map(c => (
                <li key={c}>
                  <Link to="/courses" className="text-sm hover:text-primary-400 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500 flex-shrink-0" />
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-5">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm">
                <FiMapPin className="text-primary-400 mt-0.5 flex-shrink-0" />
                <span>{settings.contact_address}</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <FiPhone className="text-primary-400 flex-shrink-0" />
                <a href={`tel:${settings.contact_phone}`} className="hover:text-primary-400 transition-colors">{settings.contact_phone}</a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <FiMail className="text-primary-400 flex-shrink-0" />
                <a href={`mailto:${settings.contact_email}`} className="hover:text-primary-400 transition-colors">{settings.contact_email}</a>
              </li>
            </ul>
            <div className="mt-6 p-4 bg-green-900/30 border border-green-700/30 rounded-xl">
              <p className="text-green-400 text-sm font-medium mb-1">WhatsApp Enquiry</p>
              <a href={`https://wa.me/${settings.contact_phone.replace(/\s+/g, '')}?text=Hello%20DS%20Education`} target="_blank" rel="noreferrer"
                className="text-xs text-green-300 hover:text-green-200 transition-colors">
                Chat with us on WhatsApp →
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          © {new Date().getFullYear()} D's Education by Vikram Rathore Sir. All rights reserved. |{' '}
          <span className="text-slate-600">Powered by passion for excellence.</span>
        </div>
      </div>
    </footer>
  );
}
