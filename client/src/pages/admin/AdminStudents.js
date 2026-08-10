import React, { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiSave, FiDollarSign, FiFilter } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY = {
  name: '', email: '', phone: '', address: '', password: '',
  course: '', batch: '',
  fees: { totalFees: 0, paidAmount: 0, installments: [] }
};

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'fees'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (filterCourse) params.course = filterCourse;
      const { data } = await api.get('/students', { params });
      setStudents(data);
    } catch { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  }, [search, filterCourse]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);
  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data));
    api.get('/batches').then(r => setBatches(r.data));
  }, []);

  const openAdd = () => { setForm(EMPTY); setSelected(null); setModal('add'); };
  const openEdit = (s) => { setForm({ ...s, course: s.course?.id || '', batch: s.batch?.id || '', password: '' }); setSelected(s); setModal('edit'); };
  const openFees = (s) => { setSelected(s); setModal('fees'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'add') {
        const { data } = await api.post('/students', form);
        toast.success(`Student added! Credentials & password sent to ${data.student?.email || form.email}`);
      } else {
        await api.put(`/students/${selected.id}`, form);
        toast.success('Student updated');
      }
      fetchStudents();
      setModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving student');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student? This will also remove their login account.')) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deleted');
      fetchStudents();
    } catch { toast.error('Failed to delete'); }
  };

  const handleFeeUpdate = async (e) => {
    e.preventDefault();
    const amt = parseFloat(e.target.amount.value);
    if (!amt) return;
    try {
      await api.patch(`/students/${selected.id}/fees`, { amount: amt });
      toast.success('Fee payment recorded');
      fetchStudents();
      setModal(null);
    } catch { toast.error('Fee update failed'); }
  };

  const inp = (field) => ({
    value: field.split('.').reduce((o, k) => o?.[k], form) ?? '',
    onChange: (e) => {
      const val = e.target.value;
      setForm(prev => {
        if (!field.includes('.')) return { ...prev, [field]: val };
        const [parent, child] = field.split('.');
        return { ...prev, [parent]: { ...prev[parent], [child]: val } };
      });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Student Management</h1>
          <p className="text-slate-500 text-sm">{students.length} students enrolled</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <FiPlus /> Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input placeholder="Search by name, email, ID..." value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-9 py-2.5" />
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-sm"><FiFilter /></div>
        <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)} className="input py-2.5 w-auto min-w-40">
          <option value="">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {(search || filterCourse) && (
          <button onClick={() => { setSearch(''); setFilterCourse(''); }} className="text-rose-500 text-sm hover:underline flex items-center gap-1">
            <FiX /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course / Batch</th>
                  <th>Parent Contact</th>
                  <th>Fee Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-400">No students found</td></tr>
                ) : students.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold flex-shrink-0">{s.name[0]}</div>
                        <div>
                          <div className="font-medium text-slate-900">{s.name}</div>
                          <div className="text-xs text-slate-400">{s.enrollmentNo} · {s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">{s.course?.name || '—'}</div>
                      <div className="text-xs text-slate-400">{s.batch?.name || 'No batch'}</div>
                    </td>
                    <td>
                      <div className="text-sm">{s.parentName || '—'}</div>
                      <div className="text-xs text-slate-400">{s.parentPhone || ''}</div>
                    </td>
                    <td>
                      <div>
                        <span className={`badge text-xs ${s.fees?.pendingAmount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {s.fees?.pendingAmount > 0 ? `₹${s.fees.pendingAmount} pending` : 'Fully Paid'}
                        </span>
                        <div className="text-xs text-slate-400 mt-0.5">Paid: ₹{s.fees?.paidAmount || 0} / ₹{s.fees?.totalFees || 0}</div>
                      </div>
                    </td>
                    <td className="text-xs text-slate-500">{new Date(s.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openFees(s)} title="Manage Fees" className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><FiDollarSign /></button>
                        <button onClick={() => openEdit(s)} title="Edit" className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><FiEdit2 /></button>
                        <button onClick={() => handleDelete(s.id)} title="Delete" className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-6 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-display text-xl font-bold text-slate-900">
                {modal === 'add' ? 'Add New Student' : 'Edit Student'}
              </h2>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-slate-100 rounded-lg"><FiX /></button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto">
              {[
                { label: 'Full Name *', field: 'name', type: 'text' },
                { label: 'Email (Optional)', field: 'email', type: 'text' },
                { label: 'Phone', field: 'phone', type: 'tel' },
                { label: modal === 'add' ? 'Password (auto if empty)' : 'New Password (leave blank to keep)', field: 'password', type: 'password' },
                { label: 'Address', field: 'address', type: 'text' },
              ].map(f => (
                <div key={f.field} className={f.field === 'address' ? 'sm:col-span-2' : ''}>
                  <label className="label">{f.label}</label>
                  <input type={f.type} {...inp(f.field)} className="input" />
                </div>
              ))}
              <div>
                <label className="label">Course</label>
                <select {...inp('course')} className="input">
                  <option value="">Select course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Batch</label>
                <select {...inp('batch')} className="input">
                  <option value="">Select batch</option>
                  {batches.filter(b => {
                    if (!form.course) return true;
                    const selCourseId = String(form.course);
                    const bCourseId = String(b.course?.id || b.courseId || b.course || '');
                    return !bCourseId || bCourseId === selCourseId;
                  }).map(b => (
                    <option key={b.id} value={b.id}>{b.name} {b.course?.name ? `(${b.course.name})` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Total Fees (₹)</label>
                <input type="number" {...inp('fees.totalFees')} className="input" />
              </div>
              <div>
                <label className="label">Paid Amount (₹)</label>
                <input type="number" {...inp('fees.paidAmount')} className="input" />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-slate-100">
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : <><FiSave /> Save Student</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fees Modal */}
      {modal === 'fees' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-semibold text-slate-900">Manage Fees — {selected.name}</h2>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-slate-100 rounded-lg"><FiX /></button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <div className="text-slate-500 text-xs">Total</div>
                  <div className="font-bold text-slate-900">₹{selected.fees?.totalFees || 0}</div>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-xl">
                  <div className="text-emerald-600 text-xs">Paid</div>
                  <div className="font-bold text-emerald-700">₹{selected.fees?.paidAmount || 0}</div>
                </div>
                <div className="text-center p-3 bg-rose-50 rounded-xl">
                  <div className="text-rose-600 text-xs">Pending</div>
                  <div className="font-bold text-rose-700">₹{selected.fees?.pendingAmount || 0}</div>
                </div>
              </div>
              <form onSubmit={handleFeeUpdate} className="space-y-4">
                <div>
                  <label className="label">Record Payment (₹)</label>
                  <input name="amount" type="number" min="1" max={selected.fees?.pendingAmount} placeholder="Enter amount received" className="input" required />
                </div>
                <button type="submit" className="btn-primary w-full justify-center">
                  <FiDollarSign /> Record Payment
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
