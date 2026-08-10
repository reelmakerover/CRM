import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiKey, FiEye, FiEyeOff, FiEdit, FiZap, FiCheck, FiShield, FiUser } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ManageSuperAdmins() {
  const [superadmins, setSuperadmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedSuperadmin, setSelectedSuperadmin] = useState(null);
  const [visiblePasswordsMap, setVisiblePasswordsMap] = useState({});

  // Form state for creation/editing
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '' });
  const [newPasswordForm, setNewPasswordForm] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSuperadmins();
  }, []);

  const fetchSuperadmins = () => {
    api.get('/superproadmin/superadmins')
      .then(r => setSuperadmins(r.data))
      .catch(err => {
        console.error(err);
        toast.error('Failed to load Super Admins');
      })
      .finally(() => setLoading(false));
  };

  const togglePasswordVisibility = (id) => {
    setVisiblePasswordsMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleOpenCreateModal = (superadmin = null) => {
    if (superadmin) {
      setSelectedSuperadmin(superadmin);
      setCreateForm({ name: superadmin.name, email: superadmin.email, password: '' });
    } else {
      setSelectedSuperadmin(null);
      setCreateForm({ name: '', email: '', password: '' });
    }
    setShowCreateModal(true);
  };

  const handleOpenPasswordModal = (superadmin) => {
    setSelectedSuperadmin(superadmin);
    setNewPasswordForm('');
    setShowPasswordModal(true);
  };

  const handleSaveSuperAdmin = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (selectedSuperadmin) {
        await api.put(`/superproadmin/superadmins/${selectedSuperadmin.id}`, {
          name: createForm.name,
          email: createForm.email
        });
        toast.success('Super Admin details updated');
      } else {
        await api.post('/superproadmin/superadmins', createForm);
        toast.success('Super Admin created successfully!');
      }
      setShowCreateModal(false);
      fetchSuperadmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPasswordForm || newPasswordForm.length < 6) {
      return toast.error('Password must be at least 6 characters long');
    }
    setSaving(true);
    try {
      const res = await api.put(`/superproadmin/superadmins/${selectedSuperadmin.id}/password`, {
        newPassword: newPasswordForm
      });
      toast.success(res.data.message || 'Password changed successfully!');
      setShowPasswordModal(false);
      fetchSuperadmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete Super Admin "${name}"?`)) return;
    try {
      await api.delete(`/superproadmin/superadmins/${id}`);
      toast.success('Super Admin removed');
      fetchSuperadmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove Super Admin');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FiZap className="text-amber-500" /> Manage Super Admins
          </h1>
          <p className="text-slate-500 text-sm">
            Control Super Admin accounts, inspect active plain-text passwords, or override passwords instantly.
          </p>
        </div>
        <button
          onClick={() => handleOpenCreateModal()}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all self-start sm:self-auto"
        >
          <FiPlus className="text-lg" /> Add Super Admin
        </button>
      </div>

      {/* Super Admins Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="py-4 px-6 font-bold">Super Admin Name</th>
                <th className="py-4 px-6 font-bold">Email Address</th>
                <th className="py-4 px-6 font-bold">Current Password</th>
                <th className="py-4 px-6 font-bold">Role</th>
                <th className="py-4 px-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {superadmins.map(sa => {
                const isVisible = visiblePasswordsMap[sa.id];
                const displayPass = sa.visiblePassword || 'Password not recorded';
                return (
                  <tr key={sa.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center text-sm shadow-sm">
                          {sa.name[0]}
                        </div>
                        <div>
                          <div className="font-bold">{sa.name}</div>
                          <div className="text-[11px] text-slate-400">ID: #{sa.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-mono text-xs">{sa.email}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono px-3 py-1 rounded-lg text-xs font-semibold ${isVisible ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-500'}`}>
                          {isVisible ? displayPass : '••••••••'}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(sa.id)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title={isVisible ? 'Hide Password' : 'Show Password'}
                        >
                          {isVisible ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-amber-500/10 text-amber-700 border border-amber-400/30 rounded-full text-xs font-extrabold uppercase">
                        Super Admin
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenPasswordModal(sa)}
                          className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors flex items-center gap-1.5"
                        >
                          <FiKey /> Change Password
                        </button>
                        <button
                          onClick={() => handleOpenCreateModal(sa)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Details"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(sa.id, sa.name)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Super Admin"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {superadmins.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 font-medium">
                    No Super Admins registered yet. Click "Add Super Admin" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Create/Edit Super Admin */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              {selectedSuperadmin ? 'Edit Super Admin' : 'Add New Super Admin'}
            </h2>
            <p className="text-slate-500 text-xs mb-6">
              {selectedSuperadmin ? 'Update Super Admin name or email' : 'Create a new Super Admin with full management privileges'}
            </p>

            <form onSubmit={handleSaveSuperAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 transition-all text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="superadmin@dseducation.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 transition-all text-sm font-medium"
                />
              </div>

              {!selectedSuperadmin && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Initial Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={createForm.password}
                    onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 transition-all text-sm font-medium"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : (selectedSuperadmin ? 'Update Details' : 'Create Super Admin')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Change Password */}
      {showPasswordModal && selectedSuperadmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold mb-4">
              <FiKey />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              Change Password
            </h2>
            <p className="text-slate-500 text-xs mb-4">
              Override current password for <strong className="text-slate-900">{selectedSuperadmin.name}</strong> ({selectedSuperadmin.email}).
            </p>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">New Password</label>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={newPasswordForm}
                  onChange={e => setNewPasswordForm(e.target.value)}
                  placeholder="Enter new plain password"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-amber-500 transition-all text-sm font-semibold"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Set New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
