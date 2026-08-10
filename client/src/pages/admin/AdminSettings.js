import React, { useEffect, useState } from 'react';
import { FiSave, FiMail, FiServer, FiCheck } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [smtp, setSmtp] = useState({ host: 'smtp.gmail.com', port: 587, email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    api.get('/settings').then(r => { if (r.data.smtp) setSmtp(r.data.smtp); }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/settings', { key: 'smtp', value: smtp });
      toast.success('SMTP settings saved!');
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  const inp = (f) => ({
    value: smtp[f] ?? '',
    onChange: e => setSmtp(p => ({ ...p, [f]: e.target.value }))
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="font-display text-2xl font-bold text-slate-900">System Settings</h1><p className="text-slate-500 text-sm">Configure email and system preferences</p></div>

      {/* SMTP Settings */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center"><FiMail className="text-primary-600" /></div>
          <div>
            <h2 className="font-semibold text-slate-900">SMTP Email Configuration</h2>
            <p className="text-slate-500 text-sm">Used for sending exam results and announcements to parents</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">SMTP Host</label>
              <input {...inp('host')} className="input" placeholder="smtp.gmail.com" />
            </div>
            <div>
              <label className="label">SMTP Port</label>
              <input type="number" {...inp('port')} className="input" placeholder="587" />
            </div>
          </div>
          <div>
            <label className="label">Email Address</label>
            <input type="email" {...inp('email')} className="input" placeholder="your@gmail.com" />
          </div>
          <div>
            <label className="label">App Password</label>
            <input type="password" {...inp('password')} className="input" placeholder="Gmail App Password (not regular password)" />
          </div>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <strong>📌 Gmail Setup:</strong> Go to Google Account → Security → 2-Step Verification → App Passwords → Generate for "Mail"
          </div>
          <div className="pt-2 space-y-3">
            <div>
              <label className="label">Test Email (optional)</label>
              <div className="flex gap-2">
                <input value={testEmail} onChange={e => setTestEmail(e.target.value)} type="email" placeholder="test@example.com" className="input flex-1" />
                <button disabled={testSending || !testEmail} className="btn-secondary py-2 px-4 text-sm"
                  onClick={async () => {
                    setTestSending(true);
                    try {
                      await api.post('/notifications/send', { subject: "Test Email from D's Education", message: '<p>SMTP configuration is working correctly!</p>', recipients: [testEmail] });
                      toast.success('Test email sent!');
                    } catch { toast.error('Test failed — check your SMTP settings'); }
                    finally { setTestSending(false); }
                  }}>
                  {testSending ? 'Sending...' : 'Test'}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : <><FiSave /> Save SMTP Settings</>}
          </button>
        </div>
      </div>

      {/* System Info */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center"><FiServer className="text-slate-600" /></div>
          <div><h2 className="font-semibold text-slate-900">System Information</h2></div>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Platform', value: "D's Education ERP v1.0" },
            { label: 'Stack', value: 'MongoDB · Express.js · React.js · Node.js' },
            { label: 'Exam Engine', value: 'AI-Randomized Question Selection' },
            { label: 'Anti-Cheating', value: 'Question Shuffle + Option Shuffle + Tab Detection' },
            { label: 'Notifications', value: 'SMTP Email (configurable)' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-slate-600 text-sm">{item.label}</span>
              <span className="text-slate-900 text-sm font-medium flex items-center gap-1.5">
                <FiCheck className="text-emerald-500 text-xs" /> {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
