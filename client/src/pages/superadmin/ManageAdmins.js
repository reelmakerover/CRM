import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiShield } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const PERMISSIONS = [
  { id: 'students', label: 'Students' },
  { id: 'courses', label: 'Courses' },
  { id: 'batches', label: 'Batches' },
  { id: 'exams', label: 'Exams' },
  { id: 'questions', label: 'Questions' },
  { id: 'results', label: 'Results' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'settings', label: 'Settings' },
];

export default function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', permissions: [] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = () => {
    api.get('/superadmin/admins')
      .then(r => setAdmins(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleOpenModal = (admin = null) => {
    if (admin) {
      setEditingAdmin(admin);
      setForm({ name: admin.name, email: admin.email, password: '', permissions: admin.permissions || [] });
    } else {
      setEditingAdmin(null);
      setForm({ name: '', email: '', password: '', permissions: [] });
    }
    setShowModal(true);
  };

  const togglePermission = (id) => {
    setForm(prev => {
      const perms = prev.permissions.includes(id)
        ? prev.permissions.filter(p => p !== id)
        : [...prev.permissions, id];
      return { ...prev, permissions: perms };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingAdmin) {
        await api.put(`/superadmin/admins/${editingAdmin.id}`, form);
        toast.success('Admin updated successfully');
      } else {
        await api.post('/superadmin/admins', form);
        toast.success('Admin created successfully');
      }
      setShowModal(false);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to revoke access for this admin?')) return;
    try {
      await api.delete(`/superadmin/admins/${id}`);
      toast.success('Admin removed');
      fetchAdmins();
    } catch (err) {
      toast.error('Failed to remove admin');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Manage Admins</h1>
          <p className="text-slate-500">Add or remove system administrators and control their permissions.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <FiPlus /> Add Admin
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="py-4 px-6 font-medium">Name</th>
                <th className="py-4 px-6 font-medium">Email</th>
                <th className="py-4 px-6 font-medium">Permissions</th>
                <th className="py-4 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admins.map(admin => (
                <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                        {admin.name[0]}
                      </div>
                      <span className="font-medium text-slate-900">{admin.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600 text-sm">{admin.email}</td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {admin.permissions?.length > 0 ? (
                        admin.permissions.map(p => (
                          <span key={p} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] uppercase font-bold">
                            {p}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-xs italic">No permissions</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenModal(admin)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(admin.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr><td colSpan="4" className="py-8 text-center text-slate-500">No administrators found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-4">{editingAdmin ? 'Edit Admin' : 'Add New Admin'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input w-full" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input w-full" placeholder="admin@dseducation.in" />
                </div>
              </div>
              {!editingAdmin && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input type="password" required minLength={6} value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input w-full" placeholder="••••••••" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Access Permissions</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PERMISSIONS.map(p => (
                    <button 
                      key={p.id}
                      type="button"
                      onClick={() => togglePermission(p.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-center ${
                        form.permissions.includes(p.id)
                          ? 'bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/20'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-primary-400'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving ? 'Saving...' : (editingAdmin ? 'Update Admin' : 'Add Admin')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
