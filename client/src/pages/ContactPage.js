import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { FiPhone, FiMail, FiMapPin, FiSend, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', course: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [settings, setSettings] = useState({
    contact_email: "info@dseducation.in",
    contact_phone: "+91 98765 43210",
    contact_address: "D's Education Centre, Main Market, Jaipur, Rajasthan 302001"
  });

  useEffect(() => {
    api.get('/settings/public').then(r => {
      if (Object.keys(r.data).length > 0) setSettings(prev => ({ ...prev, ...r.data }));
    }).catch(() => { });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) { toast.error('Please fill required fields'); return; }
    // Simulate submission (connect to backend endpoint as needed)
    toast.success('Message sent! We\'ll contact you within 24 hours.');
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="bg-hero-gradient pt-32 pb-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Get In Touch</h1>
          <p className="text-primary-200 text-lg">Have questions about admissions? We're here to help.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="font-display text-3xl font-bold text-slate-900 mb-6">Contact D's Education</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Visit us at our centre in Jaipur, call us, or send a WhatsApp message for quick responses. Vikram Rathore Sir and our admission team are ready to guide you.
            </p>
            <div className="space-y-5 mb-8">
              {[
                { icon: FiMapPin, label: 'Address', value: settings.contact_address, color: 'bg-blue-100 text-blue-700' },
                { icon: FiPhone, label: 'Phone', value: settings.contact_phone, href: `tel:${settings.contact_phone}`, color: 'bg-emerald-100 text-emerald-700' },
                { icon: FiMail, label: 'Email', value: settings.contact_email, href: `mailto:${settings.contact_email}`, color: 'bg-rose-100 text-rose-700' },
              ].map(item => (
                <div key={item.label} className="flex gap-4 items-start">
                  <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                    <item.icon size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{item.label}</div>
                    {item.href ? (
                      <a href={item.href} className="text-slate-600 hover:text-primary-600 transition-colors">{item.value}</a>
                    ) : (
                      <p className="text-slate-600">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <a href={`https://wa.me/${settings.contact_phone.replace(/\s+/g, '')}?text=Hi%20Vikram%20Sir%2C%20I'm%20interested%20in%20joining%20DS%20Education!`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-4 rounded-2xl transition-all shadow-lg w-full justify-center mb-6">
              <span className="text-2xl">💬</span>
              Chat on WhatsApp — Quick Response!
            </a>

            {/* Hours */}
            <div className="card p-5 mb-6">
              <h4 className="font-semibold text-slate-900 mb-3">Office Hours</h4>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between"><span>Monday – Saturday</span><span className="font-semibold text-slate-900">9:00 AM – 8:00 PM</span></div>
                <div className="flex justify-between"><span>Sunday</span><span className="font-semibold text-slate-900">10:00 AM – 2:00 PM</span></div>
              </div>
            </div>

            {/* Interactive Map */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md h-64 relative">
              <iframe
                title="D's Education Centre Map"
                src="https://maps.google.com/maps?q=Near%20Goras%20Bhandar%2C%20Moolpura%2C%20Jaipur%2C%20Rajasthan%20302039&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Form */}
          <div className="card p-8">
            {submitted ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <FiCheckCircle className="text-emerald-600" size={40} />
                </div>
                <h3 className="font-display text-2xl font-bold text-slate-900 mb-3">Message Sent!</h3>
                <p className="text-slate-600 mb-6">Thank you for reaching out. Our team will contact you within 24 hours.</p>
                <button onClick={() => setSubmitted(false)} className="btn-secondary">Send Another Message</button>
              </div>
            ) : (
              <>
                <h3 className="font-display text-2xl font-bold text-slate-900 mb-6">Admission Inquiry</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Full Name *</label>
                      <input className="input" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">Phone *</label>
                      <input className="input" placeholder="+91 98765..." value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input className="input" type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Course Interested In</label>
                    <select className="input" value={form.course} onChange={e => setForm({ ...form, course: e.target.value })}>
                      <option value="">Select a course...</option>
                      {['10th Commerce', '11th Commerce', '12th Commerce', 'BCom / MCom', 'BBA', 'CA Foundation', 'CA Intermediate', 'CMA / CS'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Message / Questions</label>
                    <textarea className="input" rows={4} placeholder="Tell us about your goals or questions..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                  </div>
                  <button type="submit" className="btn-primary w-full justify-center text-base py-3.5">
                    <FiSend /> Send Inquiry
                  </button>
                  <p className="text-xs text-slate-400 text-center">We'll respond within 24 hours. Or WhatsApp for instant reply.</p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
