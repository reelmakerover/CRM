import React, { useEffect, useState } from 'react';
import { 
  FiSave, FiMail, FiMessageCircle, FiSend, FiCheckCircle, 
  FiAlertCircle, FiSettings, FiCheck, FiSliders, FiGlobe, FiPhone, 
  FiLock, FiShield, FiLayout, FiImage, FiFileText, FiAward
} from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('homepage'); // homepage | whatsapp | smtp | general

  // WhatsApp Gateway State
  const [whatsapp, setWhatsapp] = useState({
    enabled: true,
    provider: 'ultramsg',
    instanceId: 'instance101',
    token: 'test_token_abc123',
    apiUrl: '',
    senderPhone: '919810012345',
    autoAbsentWhatsApp: true,
    autoAbsentEmail: true,
    absentTemplate: "Namaste {parent_name}, aapka ward {student_name} (Roll: {roll_no}) aaj {date} ko D's Education ke {batch_name} batch me ABSENT raha hai. Kripya bache ki niyamit upasthiti sunishchit karein. - D's Education"
  });

  // SMTP Email State
  const [smtp, setSmtp] = useState({ 
    host: 'smtp.gmail.com', 
    port: 587, 
    email: '', 
    password: '' 
  });

  // General Branding State
  const [general, setGeneral] = useState({
    site_title: "D's EDUCATION",
    site_subtitle: "COMMERCE CLASSES",
    contact_phone: "6350149302",
    contact_email: "info@dseducation.in",
    address: "Jaipur, Rajasthan"
  });

  // Homepage Content & Text State
  const [homepage, setHomepage] = useState({
    site_title: "D's EDUCATION",
    site_subtitle: "COMMERCE CLASSES",
    phone: "6350149302",
    email: "info@dseducation.in",
    location: "Jaipur, Rajasthan",
    hero_title: "DREAM COMMERCE. BUILD SUCCESS.",
    hero_subtitle: "We Guide. You Achieve.",
    hero_tagline: "Expert Guidance | Smart Learning | Guaranteed Results",
    stat_students: "5000",
    stat_selections: "250",
    stat_experience: "15",
    stat_success: "98",
    exam_engine_title: "India's Smartest Exam Engine",
    exam_engine_desc: "Our AI-powered exam system gives every student a unique question paper — preventing cheating and ensuring fair assessment.",
    cta_title: "YOUR FUTURE STARTS WITH THE RIGHT DECISION TODAY!",
    cta_subtitle: "Talk to Our Experts — Get Free Counselling Now!"
  });

  const [saving, setSaving] = useState(false);
  const [testSendingWa, setTestSendingWa] = useState(false);
  const [testWaPhone, setTestWaPhone] = useState('');
  const [testSendingEmail, setTestSendingEmail] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  // Load Settings from API
  useEffect(() => {
    api.get('/settings').then(r => {
      if (r.data.whatsapp) setWhatsapp(p => ({ ...p, ...r.data.whatsapp }));
      if (r.data.smtp) setSmtp(p => ({ ...p, ...r.data.smtp }));
      if (r.data.general) setGeneral(p => ({ ...p, ...r.data.general }));
      if (r.data.homepage) setHomepage(p => ({ ...p, ...r.data.homepage }));
    }).catch(() => {});
  }, []);

  const saveHomepageSettings = async () => {
    setSaving(true);
    try {
      await api.post('/settings', { key: 'homepage', value: homepage });
      // Also update general for consistency
      await api.post('/settings', { key: 'general', value: { ...general, ...homepage } });
      toast.success('🎉 Homepage Content & Branding saved to database successfully!');
    } catch {
      toast.error('Failed to save homepage content');
    } finally {
      setSaving(false);
    }
  };

  const saveWhatsAppSettings = async () => {
    setSaving(true);
    try {
      await api.post('/settings', { key: 'whatsapp', value: whatsapp });
      toast.success('WhatsApp Automation settings saved successfully!');
    } catch {
      toast.error('Failed to save WhatsApp settings');
    } finally {
      setSaving(false);
    }
  };

  const saveSmtpSettings = async () => {
    setSaving(true);
    try {
      await api.post('/settings', { key: 'smtp', value: smtp });
      toast.success('SMTP Email settings saved successfully!');
    } catch {
      toast.error('Failed to save SMTP settings');
    } finally {
      setSaving(false);
    }
  };

  const saveGeneralSettings = async () => {
    setSaving(true);
    try {
      await api.post('/settings', { key: 'general', value: general });
      toast.success('General Institute settings saved successfully!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestWhatsApp = async () => {
    if (!testWaPhone.trim()) {
      return toast.error('Please enter mobile number to receive test message');
    }
    setTestSendingWa(true);
    try {
      const res = await api.post('/settings/test-whatsapp', { 
        phone: testWaPhone.trim(),
        message: "🚀 Namaste! This is a live test notification from D's Education Automated WhatsApp Engine. Connection is active & ready!" 
      });
      toast.success(res.data.message || 'WhatsApp message dispatched successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'WhatsApp dispatch test failed.');
    } finally {
      setTestSendingWa(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail.trim()) {
      return toast.error('Please enter email address for testing');
    }
    setTestSendingEmail(true);
    try {
      const res = await api.post('/settings/test-email', { email: testEmail.trim() });
      toast.success(res.data.message || 'Test email dispatched successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email dispatch test failed.');
    } finally {
      setTestSendingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FiSettings className="text-emerald-600" /> System & Content Settings
        </h1>
        <p className="text-slate-500 text-sm">
          Manage homepage content, headlines, contact numbers, stats, WhatsApp gateway, and SMTP server.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('homepage')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shrink-0 ${
            activeTab === 'homepage' 
              ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-xs' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FiLayout size={16} className="text-amber-600" /> Homepage Content & Text
        </button>

        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shrink-0 ${
            activeTab === 'whatsapp' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FiMessageCircle size={16} className="text-emerald-600" /> WhatsApp Gateway
        </button>

        <button
          onClick={() => setActiveTab('smtp')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shrink-0 ${
            activeTab === 'smtp' 
              ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FiMail size={16} className="text-blue-600" /> SMTP Email Server
        </button>

        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shrink-0 ${
            activeTab === 'general' 
              ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-xs' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FiGlobe size={16} className="text-purple-600" /> Institute Info
        </button>
      </div>

      {/* 1. HOMEPAGE CONTENT & TEXT TAB */}
      {activeTab === 'homepage' && (
        <div className="space-y-6">
          <div className="card p-6 bg-white border border-slate-200 space-y-6 shadow-sm">
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 bg-amber-500 text-slate-950 font-black rounded-2xl flex items-center justify-center text-xl shadow-sm">
                <FiFileText />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">Homepage Dynamic Text & Headline Settings</h2>
                <p className="text-slate-500 text-xs">All changes update live on the homepage without hardcoded code</p>
              </div>
            </div>

            {/* Section A: Header & Main Branding */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 border-b border-slate-100 pb-1">
                1. Header Branding & Contact Bar
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="label font-bold text-slate-800">Institute Main Title</label>
                  <input 
                    value={homepage.site_title} 
                    onChange={e => setHomepage(p => ({ ...p, site_title: e.target.value }))}
                    className="input" 
                    placeholder="D's EDUCATION"
                  />
                </div>

                <div>
                  <label className="label font-bold text-slate-800">Tagline / Subtitle</label>
                  <input 
                    value={homepage.site_subtitle} 
                    onChange={e => setHomepage(p => ({ ...p, site_subtitle: e.target.value }))}
                    className="input" 
                    placeholder="COMMERCE CLASSES"
                  />
                </div>

                <div>
                  <label className="label font-bold text-slate-800">Contact Phone Number</label>
                  <input 
                    value={homepage.phone} 
                    onChange={e => setHomepage(p => ({ ...p, phone: e.target.value }))}
                    className="input" 
                    placeholder="6350149302"
                  />
                </div>

                <div>
                  <label className="label font-bold text-slate-800">Contact Email</label>
                  <input 
                    value={homepage.email} 
                    onChange={e => setHomepage(p => ({ ...p, email: e.target.value }))}
                    className="input" 
                    placeholder="info@dseducation.in"
                  />
                </div>

                <div>
                  <label className="label font-bold text-slate-800">Location / City</label>
                  <input 
                    value={homepage.location} 
                    onChange={e => setHomepage(p => ({ ...p, location: e.target.value }))}
                    className="input" 
                    placeholder="Jaipur, Rajasthan"
                  />
                </div>
              </div>
            </div>

            {/* Section B: Hero Section Headlines */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 border-b border-slate-100 pb-1">
                2. Hero Section Headlines
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label font-bold text-slate-800">Main Hero Headline</label>
                  <input 
                    value={homepage.hero_title} 
                    onChange={e => setHomepage(p => ({ ...p, hero_title: e.target.value }))}
                    className="input" 
                    placeholder="DREAM COMMERCE. BUILD SUCCESS."
                  />
                </div>

                <div>
                  <label className="label font-bold text-slate-800">Italic Sub-headline</label>
                  <input 
                    value={homepage.hero_subtitle} 
                    onChange={e => setHomepage(p => ({ ...p, hero_subtitle: e.target.value }))}
                    className="input" 
                    placeholder="We Guide. You Achieve."
                  />
                </div>
              </div>
            </div>

            {/* Section C: Live Statistics */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 border-b border-slate-100 pb-1">
                3. Live Statistics Banner Numbers
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="label font-bold text-slate-800">Happy Students Count</label>
                  <input 
                    value={homepage.stat_students} 
                    onChange={e => setHomepage(p => ({ ...p, stat_students: e.target.value }))}
                    className="input" 
                    placeholder="5000"
                  />
                </div>

                <div>
                  <label className="label font-bold text-slate-800">Rankers Count</label>
                  <input 
                    value={homepage.stat_selections} 
                    onChange={e => setHomepage(p => ({ ...p, stat_selections: e.target.value }))}
                    className="input" 
                    placeholder="250"
                  />
                </div>

                <div>
                  <label className="label font-bold text-slate-800">Years Experience</label>
                  <input 
                    value={homepage.stat_experience} 
                    onChange={e => setHomepage(p => ({ ...p, stat_experience: e.target.value }))}
                    className="input" 
                    placeholder="15"
                  />
                </div>

                <div>
                  <label className="label font-bold text-slate-800">Success Rate %</label>
                  <input 
                    value={homepage.stat_success} 
                    onChange={e => setHomepage(p => ({ ...p, stat_success: e.target.value }))}
                    className="input" 
                    placeholder="98"
                  />
                </div>
              </div>
            </div>

            {/* Section D: Smart Exam Engine Showcase & CTA Banner */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 border-b border-slate-100 pb-1">
                4. Smart Exam Engine & Bottom Call-To-Action Banner
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label font-bold text-slate-800">Exam Engine Section Title</label>
                  <input 
                    value={homepage.exam_engine_title} 
                    onChange={e => setHomepage(p => ({ ...p, exam_engine_title: e.target.value }))}
                    className="input" 
                    placeholder="India's Smartest Exam Engine"
                  />
                </div>

                <div>
                  <label className="label font-bold text-slate-800">Bottom CTA Banner Title</label>
                  <input 
                    value={homepage.cta_title} 
                    onChange={e => setHomepage(p => ({ ...p, cta_title: e.target.value }))}
                    className="input" 
                    placeholder="YOUR FUTURE STARTS WITH THE RIGHT DECISION TODAY!"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button 
                onClick={saveHomepageSettings} 
                disabled={saving} 
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 px-8 rounded-xl shadow-md flex items-center gap-2 uppercase tracking-wider text-sm transition-all"
              >
                {saving ? 'Saving...' : <><FiSave /> SAVE HOMEPAGE CONTENT</>}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. WHATSAPP AUTOMATION TAB */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-6">
          <div className="card p-6 bg-white border border-slate-200 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-md">
                  <FiMessageCircle />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    Automated Backend WhatsApp Dispatch Engine
                    <span className={`badge text-xs ${whatsapp.enabled ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-200 text-slate-700'}`}>
                      {whatsapp.enabled ? '● ACTIVE & AUTOMATED' : '○ OFF'}
                    </span>
                  </h2>
                  <p className="text-slate-600 text-xs mt-0.5">
                    Backend sends automatic WhatsApp messages for attendance, test scores, and enrollment.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={whatsapp.enabled} 
                  onChange={e => setWhatsapp(p => ({ ...p, enabled: e.target.checked }))}
                  className="sr-only peer" 
                />
                <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={saveWhatsAppSettings} 
                disabled={saving} 
                className="btn-primary py-2.5 px-6 flex items-center gap-2 font-bold"
              >
                {saving ? 'Saving...' : <><FiSave /> Save WhatsApp Settings</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. SMTP EMAIL TAB */}
      {activeTab === 'smtp' && (
        <div className="card p-6 bg-white border border-slate-200 space-y-6 shadow-sm">
          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center text-xl shadow-xs">
              <FiMail />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">SMTP Mail Server Config</h2>
              <p className="text-slate-500 text-xs">Used for sending welcome credentials and passwords to students</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label font-bold text-slate-800">SMTP Host</label>
              <input 
                value={smtp.host} 
                onChange={e => setSmtp(p => ({ ...p, host: e.target.value }))}
                className="input" 
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <label className="label font-bold text-slate-800">SMTP Port</label>
              <input 
                type="number"
                value={smtp.port} 
                onChange={e => setSmtp(p => ({ ...p, port: e.target.value }))}
                className="input" 
                placeholder="587"
              />
            </div>
            <div>
              <label className="label font-bold text-slate-800">SMTP Email</label>
              <input 
                value={smtp.email} 
                onChange={e => setSmtp(p => ({ ...p, email: e.target.value }))}
                className="input" 
                placeholder="admin@dseducation.in"
              />
            </div>
            <div>
              <label className="label font-bold text-slate-800">App Password</label>
              <input 
                type="password"
                value={smtp.password} 
                onChange={e => setSmtp(p => ({ ...p, password: e.target.value }))}
                className="input" 
                placeholder="••••••••••••••••"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              onClick={saveSmtpSettings} 
              disabled={saving} 
              className="btn-primary py-2.5 px-6 flex items-center gap-2 font-bold"
            >
              {saving ? 'Saving...' : <><FiSave /> Save SMTP Settings</>}
            </button>
          </div>
        </div>
      )}

      {/* 4. INSTITUTE BRANDING TAB */}
      {activeTab === 'general' && (
        <div className="card p-6 bg-white border border-slate-200 space-y-4">
          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center text-xl shadow-xs">
              <FiGlobe />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Institute Branding & Address</h2>
              <p className="text-slate-500 text-xs">Shown across website header and footer</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label font-bold text-slate-800">Institute Name</label>
              <input 
                value={general.site_title} 
                onChange={e => setGeneral(p => ({ ...p, site_title: e.target.value }))}
                className="input" 
              />
            </div>
            <div>
              <label className="label font-bold text-slate-800">Tagline / Subtitle</label>
              <input 
                value={general.site_subtitle} 
                onChange={e => setGeneral(p => ({ ...p, site_subtitle: e.target.value }))}
                className="input" 
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              onClick={saveGeneralSettings} 
              disabled={saving} 
              className="btn-primary py-2.5 px-6 flex items-center gap-2 font-bold"
            >
              {saving ? 'Saving...' : <><FiSave /> Save Branding</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
