import React, { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiBookOpen, FiImage, FiUploadCloud } from 'react-icons/fi';
import api, { getImgSrc } from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY_COURSE = { name: '', code: '', description: '', duration: '', fees: '', category: 'Commerce', image: '' };
const EMPTY_SUBJECT = { name: '', code: '', course: '', description: '' };

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [tab, setTab] = useState('courses');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_COURSE);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageMeta, setImageMeta] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  const fetch = async () => {
    const [c, s] = await Promise.all([api.get('/courses'), api.get('/courses/subjects')]);
    setCourses(c.data); setSubjects(s.data);
  };
  useEffect(() => { fetch(); }, []);

  const openAdd = () => { 
    setForm(tab === 'courses' ? EMPTY_COURSE : EMPTY_SUBJECT); 
    setSelectedFile(null);
    setPreview(null);
    setImageMeta(null);
    setEditing(null); 
    setModal('form'); 
    setShowCustomCategoryInput(false);
    setCustomCategory('');
  };

  const openEdit = (item) => { 
    setForm({ 
      ...item, 
      course: item.course?.id || item.course || '',
      features: Array.isArray(item.features) ? item.features.join('\n') : (item.features || '')
    }); 
    setEditing(item); 
    setSelectedFile(null);
    setImageMeta(null);
    setPreview(item.image ? (item.image.startsWith('http') || item.image.startsWith('data:') ? item.image : `${typeof window !== 'undefined' && window.location.port === '3000' ? window.location.protocol + '//' + window.location.hostname + ':5000' : ''}${item.image}`) : null);
    setModal('form'); 
    setShowCustomCategoryInput(false);
    setCustomCategory('');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return toast.error('Image size must be less than 5 MB');
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target.result;
        setPreview(base64Url);
        setForm(p => ({ ...p, image: base64Url }));

        const img = new Image();
        img.onload = () => {
          setImageMeta({
            width: img.naturalWidth,
            height: img.naturalHeight,
            size: (file.size / 1024).toFixed(1) + ' KB'
          });
        };
        img.src = base64Url;
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreview(null);
    setImageMeta(null);
    setForm(p => ({ ...p, image: '' }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (tab === 'courses') {
        const payload = {
          ...form,
          features: typeof form.features === 'string' ? form.features.split('\n').filter(Boolean) : form.features
        };

        editing 
          ? await api.put(`/courses/${editing.id}`, payload) 
          : await api.post('/courses', payload);
      } else {
        editing ? await api.put(`/courses/subjects/${editing.id}`, form) : await api.post('/courses/subjects', form);
      }
      toast.success(editing ? 'Course updated successfully!' : 'Course created successfully!');
      fetch(); setModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving course'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      type === 'course' ? await api.delete(`/courses/${id}`) : await api.delete(`/courses/subjects/${id}`);
      toast.success('Deleted'); fetch();
    } catch { toast.error('Delete failed'); }
  };

  const inp = (field) => ({
    value: form[field] ?? '',
    onChange: e => setForm(p => ({ ...p, [field]: e.target.value }))
  });

  const courseFields = [
    { label: 'Course Name *', field: 'name', type: 'text' },
    { label: 'Course Code *', field: 'code', type: 'text' },
    { label: 'Duration', field: 'duration', type: 'text', placeholder: 'e.g. 1 Year' },
    { label: 'Fees (₹)', field: 'fees', type: 'number' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Courses & Subjects</h1>
          <p className="text-slate-500 text-sm">{courses.length} courses · {subjects.length} subjects</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><FiPlus /> Add {tab === 'courses' ? 'Course' : 'Subject'}</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {['courses', 'subjects'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium capitalize border-b-2 transition-all -mb-px ${
              tab === t ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      {tab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(c => {
            const courseImg = getImgSrc(c.image);
            return (
              <div key={c.id} className="card overflow-hidden group">
                {/* Course Header Banner Image */}
                <div className="h-44 bg-gradient-to-br from-primary-600 to-indigo-800 relative overflow-hidden">
                  {courseImg ? (
                    <img 
                      src={courseImg} 
                      alt={c.name} 
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-white/40">
                      📘
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />
                  <span className="absolute top-3 right-3 badge bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 border border-white/20">
                    {c.category || 'Commerce'}
                  </span>
                  <span className="absolute bottom-3 left-3 badge bg-white/20 backdrop-blur-md text-white text-xs font-mono">
                    {c.code}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-slate-900 text-lg mb-1">{c.name}</h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">{c.description || 'No description'}</p>
                  <div className="flex items-center justify-between text-sm pt-3 border-t border-slate-100">
                    <span className="text-slate-500 font-medium">₹{Number(c.fees || 0).toLocaleString('en-IN')} · {c.duration || '1 Year'}</span>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg"><FiEdit2 size={16} /></button>
                      <button onClick={() => handleDelete(c.id, 'course')} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"><FiTrash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {courses.length === 0 && (
            <div className="col-span-3 text-center py-12 text-slate-400 card">No courses yet. Add your first course!</div>
          )}
        </div>
      )}

      {/* Subjects Table */}
      {tab === 'subjects' && (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead><tr><th>Subject</th><th>Code</th><th>Course</th><th>Actions</th></tr></thead>
            <tbody>
              {subjects.map(s => (
                <tr key={s.id}>
                  <td className="font-medium text-slate-900">{s.name}</td>
                  <td><span className="badge bg-slate-100 text-slate-600">{s.code}</span></td>
                  <td>{s.course?.name || '—'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(s)} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg"><FiEdit2 size={14} /></button>
                      <button onClick={() => handleDelete(s.id, 'subject')} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-slate-400">No subjects yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal === 'form' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-semibold text-slate-900">{editing ? 'Edit' : 'Add'} {tab === 'courses' ? 'Course' : 'Subject'}</h2>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-slate-100 rounded-lg"><FiX /></button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {tab === 'courses' ? (
                <>
                  {/* Course Banner Image Upload */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="label mb-0 font-semibold text-slate-800">Course Header Banner Image</label>
                      <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                        💾 Database Storage
                      </span>
                    </div>

                    {/* Resolution & Size Specification Guide Box */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-2 text-xs text-slate-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">📐 Recommended Resolution:</span>
                        <span className="font-mono font-bold text-primary-700 bg-white px-2 py-0.5 rounded border border-slate-200">1200 × 630 px (16:9)</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>📏 Min Resolution: 800 × 450 px</span>
                        <span>📁 Max Size: <strong>5 MB</strong> (JPG, PNG, WEBP)</span>
                      </div>
                    </div>

                    {/* Upload Dropzone */}
                    <div className="relative rounded-2xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-300 hover:border-primary-500 h-44 flex flex-col items-center justify-center cursor-pointer transition-all group">
                      {preview ? (
                        <div className="relative w-full h-full">
                          <img src={preview} alt="Course Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <span className="btn-primary text-xs py-1.5 px-3 shadow">Change Image</span>
                            <button 
                              type="button" 
                              onClick={removeImage}
                              className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow text-xs font-semibold"
                            >
                              Remove
                            </button>
                          </div>
                          {imageMeta && (
                            <div className="absolute bottom-2 left-2 bg-slate-900/85 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-lg font-mono flex items-center gap-1.5 shadow">
                              <span>📐 {imageMeta.width} × {imageMeta.height} px</span>
                              <span>•</span>
                              <span>📦 {imageMeta.size}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center p-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                            <FiUploadCloud size={24} />
                          </div>
                          <span className="text-xs font-bold text-slate-800 block">Click to upload course banner image</span>
                          <p className="text-[11px] text-slate-400 mt-1">Image will be saved directly into the database</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/webp, image/jpg" 
                        onChange={handleFileSelect}
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                      />
                    </div>
                  </div>

                  {courseFields.map(f => (
                    <div key={f.field}>
                      <label className="label">{f.label}</label>
                      <input type={f.type} placeholder={f.placeholder} {...inp(f.field)} className="input" />
                    </div>
                  ))}
                  <div>
                    <label className="label">Category</label>
                    {!showCustomCategoryInput ? (
                      <div className="flex gap-2">
                        <select 
                          value={form.category || ''} 
                          onChange={e => {
                            if (e.target.value === '__add_new__') {
                              setShowCustomCategoryInput(true);
                            } else {
                              setForm(p => ({ ...p, category: e.target.value }));
                            }
                          }} 
                          className="input flex-1"
                        >
                          <option value="">Select Category</option>
                          {Array.from(new Set(['School', 'Commerce', 'Professional', 'Competitive', ...courses.map(c => c.category).filter(Boolean), form.category].filter(Boolean))).map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                          <option value="__add_new__" className="text-primary-600 font-bold font-semibold">+ Create Custom Category</option>
                        </select>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customCategory}
                          onChange={e => setCustomCategory(e.target.value)}
                          placeholder="Type custom category name..."
                          className="input flex-1"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customCategory.trim()) {
                              setForm(p => ({ ...p, category: customCategory.trim() }));
                              setShowCustomCategoryInput(false);
                              setCustomCategory('');
                            } else {
                              toast.error('Category name cannot be empty');
                            }
                          }}
                          className="btn-primary py-2 px-4 rounded-xl text-xs font-semibold shadow shrink-0"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCustomCategoryInput(false);
                            setCustomCategory('');
                          }}
                          className="btn-secondary py-2 px-4 rounded-xl text-xs font-semibold shrink-0"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <textarea {...inp('description')} rows={2} className="input resize-none" />
                  </div>
                  <div>
                    <label className="label">Key Features (1 per line)</label>
                    <textarea {...inp('features')} rows={3} placeholder="Accounts&#10;Economics&#10;Mock Board Exams" className="input resize-none" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="label">Subject Name *</label>
                    <input type="text" {...inp('name')} className="input" />
                  </div>
                  <div>
                    <label className="label">Subject Code *</label>
                    <input type="text" {...inp('code')} className="input" />
                  </div>
                  <div>
                    <label className="label">Course *</label>
                    <select {...inp('course')} className="input">
                      <option value="">Select course</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-slate-50 rounded-b-2xl">
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : <><FiSave /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
