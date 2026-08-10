// AdminNotifications.js
import React, { useState } from 'react';
import { FiBell, FiSend, FiUsers, FiMail } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export function AdminNotifications() {
  const [form, setForm] = useState({ subject: '', message: '', recipients: 'all' });
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!form.subject || !form.message) { toast.error('Subject and message required'); return; }
    setSending(true);
    try {
      const { data } = await api.post('/notifications/send', form);
      toast.success(data.message);
      setForm({ subject: '', message: '', recipients: 'all' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send'); }
    finally { setSending(false); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl font-bold text-slate-900">Send Notifications</h1><p className="text-slate-500 text-sm">Send announcements to parents and students via email</p></div>
      <div className="max-w-2xl card p-6 space-y-5">
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <FiMail className="text-blue-600 text-xl flex-shrink-0" />
          <div>
            <div className="font-semibold text-blue-900">Email Notifications</div>
            <div className="text-blue-700 text-sm">Emails will be sent via your configured SMTP settings</div>
          </div>
        </div>
        <div>
          <label className="label">Recipients</label>
          <div className="flex gap-3">
            {['all', 'custom'].map(r => (
              <label key={r} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value={r} checked={form.recipients === r} onChange={e => setForm(p=>({...p, recipients: e.target.value}))} />
                <span className="text-sm capitalize text-slate-700 flex items-center gap-1">
                  {r === 'all' ? <><FiUsers size={14}/> All Parents</> : <><FiMail size={14}/> Custom Emails</>}
                </span>
              </label>
            ))}
          </div>
          {form.recipients === 'custom' && (
            <textarea value={typeof form.recipients === 'string' && form.recipients !== 'all' && form.recipients !== 'custom' ? form.recipients : ''}
              onChange={e => setForm(p=>({...p, recipients: e.target.value.split('\n').filter(Boolean)}))}
              placeholder="Enter email addresses, one per line..." rows={3} className="input mt-3 resize-none" />
          )}
        </div>
        <div>
          <label className="label">Subject *</label>
          <input value={form.subject} onChange={e => setForm(p=>({...p, subject: e.target.value}))} className="input" placeholder="e.g. Important Announcement from D's Education" />
        </div>
        <div>
          <label className="label">Message *</label>
          <textarea value={form.message} onChange={e => setForm(p=>({...p, message: e.target.value}))} rows={6} className="input resize-none" placeholder="Write your message here... You can use HTML for formatting." />
          <p className="text-slate-400 text-xs mt-1">HTML is supported for rich formatting</p>
        </div>
        <button onClick={handleSend} disabled={sending} className="btn-primary w-full justify-center">
          {sending ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Sending...</> : <><FiSend/> Send Notification</>}
        </button>
      </div>

      <div className="max-w-2xl">
        <h2 className="font-semibold text-slate-800 mb-4">Quick Templates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: '📝 Exam Ready', subj: `Your child's exam results are available`, msg: `Dear Parent,\n\nWe are pleased to inform you that the exam results for the recent mock test are now available on the D's Education portal.\n\nPlease login to view detailed results and performance analysis.\n\nWarm Regards,\nD's Education Team` },
            { label: '📅 New Batch', subj: `New batch starting soon — Act now!`, msg: `Dear Parent,\n\nA new batch is starting soon at D's Education. Limited seats available!\n\nPlease contact us to secure your admission.\n\nWarm Regards,\nVikram Rathore Sir\nD's Education` },
            { label: '💰 Fee Reminder', subj: `Fee payment reminder — D's Education`, msg: `Dear Parent,\n\nThis is a gentle reminder that your fee installment is due. Please make the payment at the earliest.\n\nFor any queries, please contact us.\n\nWarm Regards,\nD's Education Team` },
            { label: '🏖️ Holiday Notice', subj: `Holiday / Schedule Change Notice`, msg: `Dear Parent,\n\nPlease note that classes will be suspended on the upcoming holiday. The regular schedule will resume thereafter.\n\nWarm Regards,\nD's Education Team` },
          ].map(t => (
            <button key={t.label} onClick={() => setForm(p=>({...p, subject: t.subj, message: t.msg}))}
              className="text-left p-4 card hover:border-primary-300 hover:shadow-card-hover transition-all">
              <div className="font-medium text-slate-800 text-sm">{t.label}</div>
              <div className="text-slate-400 text-xs mt-1 truncate">{t.subj}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminNotifications;
