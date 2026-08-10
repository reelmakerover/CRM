import React, { useState, useEffect } from 'react';
import { 
  FiUser, FiMail, FiPhone, FiBook, FiCalendar, FiDollarSign, 
  FiCheckCircle, FiAlertCircle, FiEdit2, FiSave, FiX, FiMapPin 
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function StudentProfile() {
  const { user, student, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    parentName: '',
    parentPhone: '',
    address: ''
  });

  useEffect(() => {
    if (user || student) {
      setFormData({
        name: user?.name || student?.name || '',
        email: user?.email || student?.email || '',
        phone: student?.phone || '',
        parentName: student?.parentName || '',
        parentPhone: student?.parentPhone || '',
        address: student?.address || ''
      });
    }
  }, [user, student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      return toast.error('Name and Email are required');
    }

    setSaving(true);
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const fees = student?.fees;
  const totalFees = fees?.totalFees || 0;
  const paidAmount = fees?.paidAmount || 0;
  const pendingAmount = fees?.pendingAmount || 0;
  const fillPct = totalFees > 0 ? (paidAmount / totalFees) * 100 : 0;

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-500 text-sm">View and manage your student profile information</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="btn-primary py-2 px-4 text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm"
          >
            <FiEdit2 size={16} /> Edit Profile
          </button>
        )}
      </div>

      {/* Main Profile Card Header */}
      <div className="card overflow-hidden border border-slate-200/80 shadow-md">
        {/* Banner with white text */}
        <div className="bg-gradient-to-r from-primary-700 via-primary-800 to-primary-900 p-6 text-white relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
            <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white/20 shadow-xl flex items-center justify-center text-4xl font-extrabold text-primary-700 flex-shrink-0">
              {(user?.name || student?.name)?.[0]?.toUpperCase()}
            </div>
            <div className="text-center sm:text-left space-y-1 pb-1">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white tracking-wide">
                {user?.name || student?.name}
              </h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-primary-200 text-sm">
                <span className="bg-white/10 border border-white/20 px-3 py-0.5 rounded-full font-mono text-xs font-semibold">
                  {student?.enrollmentNo || 'DSE-STUDENT'}
                </span>
                <span>•</span>
                <span>{student?.course?.name || 'Commerce Stream'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Info Details / Edit Form */}
        <div className="p-6">
          {isEditing ? (
            /* EDIT FORM MODE */
            <form onSubmit={handleSave} className="space-y-6">
              <div className="border-b pb-3 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <FiEdit2 className="text-primary-600" /> Edit Profile Details
                </h3>
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm flex items-center gap-1 font-semibold"
                >
                  <FiX /> Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input w-full text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Email Address *</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input w-full text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    className="input w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Parent Name</label>
                  <input 
                    type="text" 
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    placeholder="Father / Guardian Name"
                    className="input w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Parent Phone</label>
                  <input 
                    type="text" 
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    placeholder="Parent Contact No."
                    className="input w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Residential Address</label>
                  <input 
                    type="text" 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="City, State, Pincode"
                    className="input w-full text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 justify-end pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary py-2 px-5 text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="btn-primary py-2 px-6 text-sm font-bold flex items-center gap-2"
                >
                  <FiSave /> {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          ) : (
            /* VIEW MODE */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: FiMail, label: 'Email Address', value: user?.email || student?.email },
                { icon: FiPhone, label: 'Phone Number', value: student?.phone || 'Not provided' },
                { icon: FiBook, label: 'Enrolled Course', value: student?.course?.name || '—' },
                { icon: FiCalendar, label: 'Assigned Batch', value: student?.batch?.name || 'No batch assigned' },
                { icon: FiUser, label: 'Parent / Guardian Name', value: student?.parentName || 'Not provided' },
                { icon: FiPhone, label: 'Parent Phone Number', value: student?.parentPhone || 'Not provided' },
                { icon: FiMapPin, label: 'Address', value: student?.address || 'Not provided' },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon size={18} />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-slate-400 text-xs font-medium">{item.label}</div>
                    <div className="text-slate-900 font-semibold text-sm truncate">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fee Status Card */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <FiDollarSign className="text-emerald-600" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Fee Status</h3>
            <p className="text-slate-500 text-sm">Academic year payment tracking</p>
          </div>
          <div className="ml-auto">
            {pendingAmount === 0 ? (
              <span className="badge bg-emerald-100 text-emerald-700 flex items-center gap-1 font-semibold">
                <FiCheckCircle size={13} /> Fully Paid
              </span>
            ) : (
              <span className="badge bg-rose-100 text-rose-700 flex items-center gap-1 font-semibold">
                <FiAlertCircle size={13} /> Dues Pending
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: 'Total Fees', value: `₹${totalFees.toLocaleString()}`, color: 'text-slate-900' },
            { label: 'Paid Amount', value: `₹${paidAmount.toLocaleString()}`, color: 'text-emerald-700' },
            { label: 'Pending', value: `₹${pendingAmount.toLocaleString()}`, color: pendingAmount > 0 ? 'text-rose-700' : 'text-slate-500' },
          ].map(s => (
            <div key={s.label} className="text-center p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className={`font-display font-bold text-xl ${s.color}`}>{s.value}</div>
              <div className="text-slate-400 text-xs font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="progress-bar h-3 mb-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="progress-fill bg-emerald-500 h-full transition-all duration-500" style={{ width: `${fillPct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-slate-400 font-medium">
          <span>0%</span>
          <span className="font-semibold text-slate-700">{fillPct.toFixed(0)}% paid</span>
          <span>100%</span>
        </div>

        {fees?.installments?.length > 0 && (
          <div className="mt-5 pt-5 border-t border-slate-100">
            <h4 className="font-semibold text-slate-800 text-sm mb-3">Installment Schedule</h4>
            <div className="space-y-2">
              {fees.installments.map((inst, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${inst.status === 'paid' ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200'}`}>
                  <div className="flex items-center gap-2">
                    {inst.status === 'paid' ? <FiCheckCircle className="text-emerald-600" size={16} /> : <FiAlertCircle className="text-rose-600" size={16} />}
                    <div>
                      <div className="font-semibold text-sm text-slate-900">Installment {i + 1}: ₹{inst.amount?.toLocaleString()}</div>
                      <div className="text-xs text-slate-500">
                        {inst.status === 'paid' ? `Paid on ${new Date(inst.paidDate).toLocaleDateString('en-IN')}` : `Due: ${inst.dueDate ? new Date(inst.dueDate).toLocaleDateString('en-IN') : '—'}`}
                      </div>
                    </div>
                  </div>
                  <span className={`badge text-xs ${inst.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{inst.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {pendingAmount > 0 && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <strong>💳 Payment Options:</strong> Contact admin for payment. UPI, NEFT, or cash payment accepted. EMI available on request.
          </div>
        )}
      </div>
    </div>
  );
}
