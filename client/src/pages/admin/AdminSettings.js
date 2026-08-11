import React, { useEffect, useState } from 'react';
import { 
  FiSave, FiMail, FiMessageCircle, FiSend, FiCheckCircle, 
  FiAlertCircle, FiSettings, FiCheck, FiSliders, FiGlobe, FiPhone, 
  FiLock, FiShield
} from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('whatsapp'); // whatsapp | smtp | general

  // WhatsApp Gateway State
  const [whatsapp, setWhatsapp] = useState({
    enabled: true,
    provider: 'ultramsg', // 'ultramsg' | 'cloud_api' | 'wati' | 'twilio' | 'custom'
    instanceId: 'instance101',
    token: 'test_token_abc123',
    apiUrl: '',
    senderPhone: '919810012345',
    autoAbsentWhatsApp: true,
    autoAbsentEmail: true,
    absentTemplate: "Namaste {parent_name}, aapka ward {student_name} (Roll: {roll_no}) aaj {date} ko D's Education ke {batch_name} batch me ABSENT raha hai. Kripya bache ki niyamit upasthiti sunishchit karein. - D's Education (Vikram Rathore Sir)"
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
    site_title: "D's Education",
    site_subtitle: "By Vikram Rathore Sir",
    contact_phone: "+91 98100 12345",
    contact_email: "support@dseducation.com",
    address: "Commerce Hub, Central Avenue, Jaipur, Rajasthan"
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
    }).catch(() => {});
  }, []);

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

  const insertTag = (tag) => {
    setWhatsapp(p => ({ ...p, absentTemplate: p.absentTemplate + ' ' + tag }));
  };

  const previewMessage = (whatsapp.absentTemplate || '')
    .replace(/{parent_name}/g, 'Mr. Sunil Sharma')
    .replace(/{student_name}/g, 'Aarav Sharma')
    .replace(/{roll_no}/g, 'DS-2026-001')
    .replace(/{date}/g, new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }))
    .replace(/{batch_name}/g, '12th Accounts Morning Batch');

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Title */}
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FiSettings className="text-emerald-600" /> Automation & System Settings
        </h1>
        <p className="text-slate-500 text-sm">
          Configure WhatsApp automation gateway, SMTP email notifications, and institute branding.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'whatsapp' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FiMessageCircle size={16} className="text-emerald-600" /> WhatsApp Gateway & Alerts
        </button>

        <button
          onClick={() => setActiveTab('smtp')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'smtp' 
              ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FiMail size={16} className="text-blue-600" /> SMTP Email Server
        </button>

        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'general' 
              ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-xs' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FiGlobe size={16} className="text-amber-600" /> Institute Info
        </button>
      </div>

      {/* 1. WHATSAPP AUTOMATION TAB */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-6">
          {/* Main WhatsApp Card */}
          <div className="card p-6 bg-white border border-slate-200 space-y-6 shadow-sm">
            {/* Master Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-md">
                  <FiMessageCircle />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    Automated Backend WhatsApp Dispatch Engine
                    <span className={`badge text-xs ${whatsapp.enabled ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-200 text-slate-700'}`}>
                      {whatsapp.enabled ? '● ACTIVE & AUTOMATED' : '○ SIMULATION / OFF'}
                    </span>
                  </h2>
                  <p className="text-slate-600 text-xs mt-0.5">
                    When enabled, backend will automatically send WhatsApp messages to parents directly upon attendance marking, exam results & admissions.
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

            {/* Provider Details */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
                <FiSliders className="text-emerald-600" /> WhatsApp Gateway Credentials
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label font-bold text-slate-800">WhatsApp Provider</label>
                  <select 
                    value={whatsapp.provider === 'qr_device' ? 'ultramsg' : whatsapp.provider} 
                    onChange={e => setWhatsapp(p => ({ ...p, provider: e.target.value }))}
                    className="input font-medium bg-slate-50 border-slate-200"
                  >
                    <option value="ultramsg">UltraMsg API Gateway (Recommended)</option>
                    <option value="cloud_api">Meta Official WhatsApp Cloud API</option>
                    <option value="wati">WATI API Gateway</option>
                    <option value="twilio">Twilio WhatsApp API</option>
                    <option value="custom">Custom Webhook / Self-Hosted Gateway Server</option>
                  </select>
                </div>

                <div>
                  <label className="label font-bold text-slate-800">Sender / Helpline Mobile Number</label>
                  <input 
                    type="text" 
                    value={whatsapp.senderPhone} 
                    onChange={e => setWhatsapp(p => ({ ...p, senderPhone: e.target.value }))}
                    className="input font-mono bg-slate-50" 
                    placeholder="e.g. 919810012345" 
                  />
                </div>

                <div>
                  <label className="label font-bold text-slate-800">
                    {whatsapp.provider === 'cloud_api' ? 'Phone Number ID' : (whatsapp.provider === 'twilio' ? 'Account SID' : 'Instance ID')}
                  </label>
                  <input 
                    type="text" 
                    value={whatsapp.instanceId} 
                    onChange={e => setWhatsapp(p => ({ ...p, instanceId: e.target.value }))}
                    className="input font-mono" 
                    placeholder="e.g. instance101" 
                  />
                </div>

                <div>
                  <label className="label font-bold text-slate-800">
                    {whatsapp.provider === 'twilio' ? 'Auth Token' : 'API Token / Secret Key'}
                  </label>
                  <input 
                    type="password" 
                    value={whatsapp.token} 
                    onChange={e => setWhatsapp(p => ({ ...p, token: e.target.value }))}
                    className="input font-mono" 
                    placeholder="••••••••••••••••" 
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label font-bold text-slate-800">Custom API Endpoint URL (Optional)</label>
                  <input 
                    type="text" 
                    value={whatsapp.apiUrl} 
                    onChange={e => setWhatsapp(p => ({ ...p, apiUrl: e.target.value }))}
                    className="input font-mono text-xs" 
                    placeholder="Leave empty for provider default endpoint" 
                  />
                </div>
              </div>
            </div>

            {/* Automation Event Triggers */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Automated Event Triggers</h3>
              
              <div className="space-y-2.5">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={whatsapp.autoAbsentWhatsApp !== false} 
                    onChange={e => setWhatsapp(p => ({ ...p, autoAbsentWhatsApp: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4" 
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    Auto-send WhatsApp alert to parents immediately when teacher marks student as ABSENT
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={whatsapp.autoAbsentEmail !== false} 
                    onChange={e => setWhatsapp(p => ({ ...p, autoAbsentEmail: e.target.checked }))}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4" 
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    Auto-send Email notification to parents upon student ABSENT marking
                  </span>
                </label>
              </div>
            </div>

            {/* Absent Template Customizer */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="label font-bold text-slate-800">
                  Daily Absent WhatsApp Message Template
                </label>
                <div className="flex flex-wrap gap-1">
                  {['{student_name}', '{parent_name}', '{roll_no}', '{batch_name}', '{date}'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => insertTag(tag)}
                      className="text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100 transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              <textarea 
                rows={3} 
                value={whatsapp.absentTemplate} 
                onChange={e => setWhatsapp(p => ({ ...p, absentTemplate: e.target.value }))}
                className="input text-sm leading-relaxed" 
                placeholder="Enter custom template message..."
              />

              {/* Live Preview Card */}
              <div className="bg-[#e5ddd5] p-3.5 rounded-2xl border border-slate-300">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  💬 Live Message Preview (How Parent sees it):
                </div>
                <div className="bg-white p-3 rounded-xl shadow-xs text-xs text-slate-900 whitespace-pre-wrap max-w-lg rounded-tl-none border-l-4 border-emerald-500">
                  {previewMessage}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button 
                onClick={saveWhatsAppSettings} 
                disabled={saving} 
                className="btn-primary py-2.5 px-6 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-bold"
              >
                {saving ? 'Saving...' : <><FiSave /> Save WhatsApp Settings</>}
              </button>
            </div>
          </div>

          {/* Test WhatsApp Dispatch Card */}
          <div className="card p-6 bg-white border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FiSend className="text-emerald-600" /> Send Test WhatsApp Message
            </h3>
            <p className="text-xs text-slate-500">
              Verify your WhatsApp gateway credentials by sending a real-time test notification to any mobile number.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                placeholder="Enter 10-digit mobile number (e.g. 9876543210)" 
                value={testWaPhone}
                onChange={e => setTestWaPhone(e.target.value)}
                className="input flex-1 font-mono text-sm"
              />
              <button 
                onClick={handleTestWhatsApp} 
                disabled={testSendingWa || !testWaPhone.trim()} 
                className="btn-secondary py-2.5 px-5 text-sm flex items-center justify-center gap-2 bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 font-bold"
              >
                {testSendingWa ? 'Sending...' : <><FiSend /> Send Test WhatsApp</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. SMTP EMAIL TAB */}
      {activeTab === 'smtp' && (
        <div className="space-y-6">
          <div className="card p-6 bg-white border border-slate-200 space-y-5">
            <div className="flex items-center gap-3.5 mb-2">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-xs">
                <FiMail />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">SMTP Email Server Configuration</h2>
                <p className="text-slate-500 text-xs">Used for sending 2FA codes, password reset OTPs, exam results and absent notices.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label font-bold text-slate-800">SMTP Host</label>
                <input 
                  value={smtp.host} 
                  onChange={e => setSmtp(p => ({ ...p, host: e.target.value }))}
                  className="input font-mono" 
                  placeholder="smtp.gmail.com" 
                />
              </div>
              <div>
                <label className="label font-bold text-slate-800">SMTP Port</label>
                <input 
                  type="number" 
                  value={smtp.port} 
                  onChange={e => setSmtp(p => ({ ...p, port: e.target.value }))}
                  className="input font-mono" 
                  placeholder="587" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label font-bold text-slate-800">Sender Email Address</label>
                <input 
                  type="email" 
                  value={smtp.email} 
                  onChange={e => setSmtp(p => ({ ...p, email: e.target.value }))}
                  className="input" 
                  placeholder="e.g. notifications@dseducation.com" 
                />
              </div>
              <div>
                <label className="label font-bold text-slate-800">App Password / Auth Secret</label>
                <input 
                  type="password" 
                  value={smtp.password} 
                  onChange={e => setSmtp(p => ({ ...p, password: e.target.value }))}
                  className="input font-mono" 
                  placeholder="16-character App Password" 
                />
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-1">
              <div className="font-bold">📌 Gmail Setup Guide:</div>
              <div>Go to Google Account → Security → 2-Step Verification → App Passwords → Generate a password for "Mail".</div>
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

          {/* Test Email Dispatch Card */}
          <div className="card p-6 bg-white border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FiSend className="text-blue-600" /> Send Test Email
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Enter test email address..." 
                value={testEmail}
                onChange={e => setTestEmail(e.target.value)}
                className="input flex-1 text-sm"
              />
              <button 
                onClick={handleTestEmail} 
                disabled={testSendingEmail || !testEmail.trim()} 
                className="btn-secondary py-2.5 px-5 text-sm flex items-center justify-center gap-2 font-bold"
              >
                {testSendingEmail ? 'Sending...' : <><FiSend /> Send Test Email</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. INSTITUTE BRANDING TAB */}
      {activeTab === 'general' && (
        <div className="card p-6 bg-white border border-slate-200 space-y-4">
          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center text-xl shadow-xs">
              <FiGlobe />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Institute Branding & Contact Info</h2>
              <p className="text-slate-500 text-xs">Shown across website header, footer, and notifications</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label font-bold text-slate-800">Helpline Phone</label>
              <input 
                value={general.contact_phone} 
                onChange={e => setGeneral(p => ({ ...p, contact_phone: e.target.value }))}
                className="input" 
              />
            </div>
            <div>
              <label className="label font-bold text-slate-800">Support Email</label>
              <input 
                value={general.contact_email} 
                onChange={e => setGeneral(p => ({ ...p, contact_email: e.target.value }))}
                className="input" 
              />
            </div>
          </div>

          <div>
            <label className="label font-bold text-slate-800">Campus Address</label>
            <input 
              value={general.address} 
              onChange={e => setGeneral(p => ({ ...p, address: e.target.value }))}
              className="input" 
            />
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
