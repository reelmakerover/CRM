// AdminBatches.js
import React, { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiUsers, FiCalendar } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY = { name: '', course: '', startDate: '', endDate: '', timing: '', totalSeats: 30, instructor: '', status: 'upcoming', mode: 'offline', description: '' };

export default function AdminBatches() {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    const [b, c] = await Promise.all([api.get('/batches'), api.get('/courses')]);
    setBatches(b.data); setCourses(c.data);
  };
  useEffect(() => { fetch(); }, []);

  const openEdit = (b) => { setForm({ ...b, course: b.course?.id || b.course, startDate: b.startDate?.split('T')[0] || '', endDate: b.endDate?.split('T')[0] || '' }); setEditing(b); setModal(true); };
  const openAdd = () => { setForm(EMPTY); setEditing(null); setModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      editing ? await api.put(`/batches/${editing.id}`, form) : await api.post('/batches', form);
      toast.success(editing ? 'Batch updated' : 'Batch created');
      fetch(); setModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const inp = (f) => ({ value: form[f] ?? '', onChange: e => setForm(p => ({ ...p, [f]: e.target.value })) });
  const statusColor = { active: 'bg-emerald-100 text-emerald-700', upcoming: 'bg-blue-100 text-blue-700', completed: 'bg-slate-100 text-slate-600' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold text-slate-900">Batch Management</h1><p className="text-slate-500 text-sm">{batches.length} batches</p></div>
        <button onClick={openAdd} className="btn-primary"><FiPlus /> Add Batch</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {batches.map(b => {
          const seats = b.totalSeats - (b.students?.length || 0);
          return (
            <div key={b.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <span className={`badge text-xs ${statusColor[b.status]}`}>{b.status}</span>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(b)} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg"><FiEdit2 size={14}/></button>
                  <button onClick={async () => { if(!window.confirm('Delete?'))return; await api.delete(`/batches/${b.id}`); toast.success('Deleted'); fetch(); }} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"><FiTrash2 size={14}/></button>
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{b.name}</h3>
              <p className="text-primary-600 text-sm mb-3">{b.course?.name}</p>
              <div className="space-y-2 text-sm text-slate-500">
                <div className="flex items-center gap-2"><FiCalendar size={13}/> {b.startDate ? new Date(b.startDate).toLocaleDateString('en-IN') : 'TBD'}</div>
                <div className="flex items-center gap-2"><FiUsers size={13}/> {seats} seats left of {b.totalSeats}</div>
              </div>
              <div className="progress-bar mt-3">
                <div className="progress-fill" style={{ width: `${((b.totalSeats - seats) / b.totalSeats) * 100}%` }} />
              </div>
            </div>
          );
        })}
        {batches.length === 0 && <div className="col-span-3 card text-center py-12 text-slate-400">No batches yet</div>}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-semibold text-slate-900">{editing ? 'Edit' : 'Add'} Batch</h2>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><FiX /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div><label className="label">Batch Name *</label><input {...inp('name')} className="input" /></div>
              <div><label className="label">Course *</label>
                <select {...inp('course')} className="input">
                  <option value="">Select course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Start Date</label><input type="date" {...inp('startDate')} className="input" /></div>
                <div><label className="label">End Date</label><input type="date" {...inp('endDate')} className="input" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Timing</label><input {...inp('timing')} placeholder="e.g. 7:00 AM – 9:00 AM" className="input" /></div>
                <div><label className="label">Total Seats</label><input type="number" {...inp('totalSeats')} className="input" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Status</label>
                  <select {...inp('status')} className="input">
                    {['upcoming','active','completed'].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div><label className="label">Mode</label>
                  <select {...inp('mode')} className="input">
                    {['offline','online','hybrid'].map(m=><option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="label">Instructor</label><input {...inp('instructor')} className="input" /></div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : <><FiSave /> Save Batch</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
