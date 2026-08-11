import React, { useEffect, useState } from 'react';
import { 
  FiUserPlus, FiUsers, FiEdit2, FiTrash2, FiKey, FiEye, FiEyeOff, 
  FiSave, FiX, FiCheck, FiMail, FiPhone, FiFolder, FiBookOpen 
} from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY_TEACHER = {
  name: '',
  email: '',
  password: '',
  phone: '',
  specialization: 'Faculty / Professor',
  experience: '5+ Years',
  assignedBatches: [],
  assignedSubjects: [],
  assignedCourses: []
};

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [form, setForm] = useState(EMPTY_TEACHER);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState({});

  const fetchAll = async () => {
    try {
      const [tRes, bRes, sRes, cRes] = await Promise.all([
        api.get('/teachers'),
        api.get('/batches'),
        api.get('/courses/subjects'),
        api.get('/courses')
      ]);
      setTeachers(tRes.data || []);
      setBatches(bRes.data || []);
      setSubjects(sRes.data || []);
      setCourses(cRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load teachers data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openAdd = () => {
    setEditingTeacher(null);
    setForm({
      ...EMPTY_TEACHER,
      password: 'Teacher@' + Math.floor(100 + Math.random() * 900)
    });
    setModal(true);
  };

  const openEdit = (t) => {
    setEditingTeacher(t);
    setForm({
      name: t.name || '',
      email: t.email || '',
      password: t.visiblePassword || '',
      phone: t.phone || '',
      specialization: t.specialization || 'Faculty',
      experience: t.experience || '',
      assignedBatches: Array.isArray(t.assignedBatches) ? t.assignedBatches : [],
      assignedSubjects: Array.isArray(t.assignedSubjects) ? t.assignedSubjects : [],
      assignedCourses: Array.isArray(t.assignedCourses) ? t.assignedCourses : []
    });
    setModal(true);
  };

  const handleBatchToggle = (batchId) => {
    const id = Number(batchId);
    setForm(p => {
      const current = Array.isArray(p.assignedBatches) ? p.assignedBatches : [];
      const updated = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
      return { ...p, assignedBatches: updated };
    });
  };

  const handleSubjectToggle = (subjName) => {
    setForm(p => {
      const current = Array.isArray(p.assignedSubjects) ? p.assignedSubjects : [];
      const updated = current.includes(subjName) ? current.filter(x => x !== subjName) : [...current, subjName];
      return { ...p, assignedSubjects: updated };
    });
  };

  const handleSave = async () => {
    if (!form.name || !form.email || (!editingTeacher && !form.password)) {
      return toast.error('Name, email and password are required');
    }

    setSaving(true);
    try {
      if (editingTeacher) {
        const res = await api.put(`/teachers/${editingTeacher.id}`, form);
        const updatedObj = res.data?.teacher;
        if (updatedObj) {
          setTeachers(prev => prev.map(t => t.id === updatedObj.id ? { ...t, ...updatedObj } : t));
        }
        toast.success('Teacher updated successfully!');
      } else {
        const res = await api.post('/teachers', form);
        const newObj = res.data?.teacher;
        if (newObj) {
          setTeachers(prev => [newObj, ...prev.filter(t => t.id !== newObj.id)]);
        }
        toast.success('Teacher account created successfully!');
      }
      fetchAll();
      setModal(false);
      setForm(EMPTY_TEACHER);
      setEditingTeacher(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save teacher');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher account?')) return;
    try {
      await api.delete(`/teachers/${id}`);
      toast.success('Teacher deleted');
      fetchAll();
    } catch (err) {
      toast.error('Failed to delete teacher');
    }
  };

  const togglePasswordVisibility = (id) => {
    setShowPassword(p => ({ ...p, [id]: !p[id] }));
  };

  const inp = (f) => ({ value: form[f] ?? '', onChange: e => setForm(p => ({ ...p, [f]: e.target.value })) });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FiUsers className="text-amber-600" /> Faculty & Teacher Management
          </h1>
          <p className="text-slate-500 text-sm">
            Create teacher logins, assign running batches & subjects, and manage access credentials.
          </p>
        </div>

        <button onClick={openAdd} className="btn-primary py-2.5 px-4 text-sm flex items-center gap-2 shadow-md">
          <FiUserPlus size={16} /> Add New Teacher
        </button>
      </div>

      {/* Teachers Table */}
      <div className="card overflow-hidden bg-white border border-slate-200 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-amber-600 border-t-transparent rounded-full"/>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Teacher Profile</th>
                <th>Login Email & Phone</th>
                <th>Password</th>
                <th>Assigned Batches</th>
                <th>Assigned Subjects</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map(t => {
                const assignedBatchDetails = t.batchDetails || [];

                return (
                  <tr key={t.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-xs">
                          {t.name?.[0]?.toUpperCase() || 'T'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{t.name}</div>
                          <div className="text-slate-400 text-xs">{t.specialization || 'Faculty'} {t.experience ? `• ${t.experience}` : ''}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="text-xs space-y-0.5">
                        <div className="font-medium text-slate-800 flex items-center gap-1">
                          <FiMail size={11} className="text-slate-400"/> {t.email}
                        </div>
                        {t.phone && (
                          <div className="text-slate-500 flex items-center gap-1">
                            <FiPhone size={11} className="text-slate-400"/> {t.phone}
                          </div>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <span className="bg-slate-100 px-2 py-1 rounded text-slate-700 font-bold border border-slate-200">
                          {showPassword[t.id] ? (t.visiblePassword || '—') : '••••••••'}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => togglePasswordVisibility(t.id)} 
                          className="p-1 text-slate-400 hover:text-slate-700"
                        >
                          {showPassword[t.id] ? <FiEyeOff size={14}/> : <FiEye size={14}/>}
                        </button>
                      </div>
                    </td>

                    <td>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {assignedBatchDetails.length > 0 ? (
                          assignedBatchDetails.map(b => (
                            <span key={b.id} className="badge bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                              📁 {b.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">All Batches (General)</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {Array.isArray(t.assignedSubjects) && t.assignedSubjects.length > 0 ? (
                          t.assignedSubjects.map(s => (
                            <span key={s} className="badge bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-semibold">
                              📚 {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">All Subjects</span>
                        )}
                      </div>
                    </td>

                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(t)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <FiEdit2 size={15}/>
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
                          <FiTrash2 size={15}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {teachers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                    No teacher accounts created yet. Click "Add New Teacher" to assign your first faculty member.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE / EDIT TEACHER MODAL */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs overflow-y-auto py-6 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-auto overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <FiUsers className="text-amber-600" />
                {editingTeacher ? 'Edit Teacher Account' : 'Create New Teacher Account'}
              </h2>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><FiX size={18}/></button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label font-bold text-slate-800">Teacher Full Name *</label>
                  <input {...inp('name')} className="input" placeholder="e.g. Prof. Rajesh Sharma" />
                </div>
                <div>
                  <label className="label font-bold text-slate-800">Login Email *</label>
                  <input type="email" {...inp('email')} className="input" placeholder="e.g. rajesh.eco@dseducation.com" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label font-bold text-slate-800">Login Password *</label>
                  <input {...inp('password')} className="input font-mono" placeholder="Password for login" />
                </div>
                <div>
                  <label className="label font-bold text-slate-800">Phone Number</label>
                  <input {...inp('phone')} className="input" placeholder="e.g. 9876543210" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label font-bold text-slate-800">Specialization / Subject</label>
                  <input {...inp('specialization')} className="input" placeholder="e.g. Senior Economics Faculty" />
                </div>
                <div>
                  <label className="label font-bold text-slate-800">Experience</label>
                  <input {...inp('experience')} className="input" placeholder="e.g. 8+ Years" />
                </div>
              </div>

              {/* Assign Batches Checkboxes */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="label font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><FiFolder className="text-amber-600"/> Assign Running Batches:</span>
                  <span className="text-[11px] text-slate-400 font-normal">Select which batches this teacher can manage</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {batches.map(b => {
                    const isChecked = Array.isArray(form.assignedBatches) && form.assignedBatches.includes(Number(b.id));
                    return (
                      <label 
                        key={b.id} 
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                          isChecked 
                            ? 'bg-amber-500 text-white border-amber-600 font-bold shadow-xs' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={() => handleBatchToggle(b.id)}
                          className="hidden" 
                        />
                        <span className="text-sm">📁</span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate">{b.name}</div>
                          <div className={`text-[10px] ${isChecked ? 'text-amber-100' : 'text-slate-400'}`}>
                            {b.course?.name || 'General'}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                  {batches.length === 0 && <div className="text-xs text-slate-400">No batches created yet.</div>}
                </div>
              </div>

              {/* Assign Subjects Checkboxes */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="label font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><FiBookOpen className="text-blue-600"/> Assign Subjects:</span>
                  <span className="text-[11px] text-slate-400 font-normal">Test creation will be filtered by these subjects</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {subjects.map(s => {
                    const isChecked = Array.isArray(form.assignedSubjects) && form.assignedSubjects.includes(s.name);
                    return (
                      <label 
                        key={s.id} 
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                          isChecked 
                            ? 'bg-blue-600 text-white border-blue-700 font-bold shadow-xs' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={() => handleSubjectToggle(s.name)}
                          className="hidden" 
                        />
                        <span className="truncate">{s.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50">
              <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : <><FiSave /> {editingTeacher ? 'Save Changes' : 'Create Teacher'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
