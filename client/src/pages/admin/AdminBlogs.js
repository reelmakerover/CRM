import React, { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiEye, FiImage, FiUpload, FiLink } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY = { title: '', content: '', category: 'Education', author: 'Admin', isPublished: true, tags: '', image: '' };

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const fetchBlogs = () => api.get('/blogs').then(r => setBlogs(r.data));
  useEffect(() => { fetchBlogs(); }, []);

  const openEdit = (b) => {
    setForm({ ...b, tags: Array.isArray(b.tags) ? b.tags.join(', ') : b.tags || '', image: b.image || '' });
    setEditing(b);
    setPreview(b.image ? (b.image.startsWith('http') ? b.image : `${typeof window !== 'undefined' && window.location.port === '3000' ? window.location.protocol + '//' + window.location.hostname + ':5000' : ''}${b.image}`) : null);
    setSelectedFile(null);
    setModal(true);
  };

  const openAdd = () => {
    setForm(EMPTY);
    setEditing(null);
    setPreview(null);
    setSelectedFile(null);
    setModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.content) return toast.error('Title and Content are required');
    setSaving(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key !== 'image' || !selectedFile) {
          formData.append(key, form[key]);
        }
      });
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      if (editing) {
        await api.put(`/blogs/${editing.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/blogs', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success(editing ? 'Article updated successfully!' : 'Article published successfully!');
      fetchBlogs();
      setModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving article');
    } finally {
      setSaving(false);
    }
  };

  const getImgUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${typeof window !== 'undefined' && window.location.port === '3000' ? window.location.protocol + '//' + window.location.hostname + ':5000' : ''}${url}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Blog & Article Management</h1>
          <p className="text-slate-500 text-sm">{blogs.length} published articles with images & insights</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-sm flex items-center gap-2">
          <FiPlus /> New Article
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map(b => (
          <div key={b.id} className="card overflow-hidden group border-slate-100 border flex flex-col justify-between">
            <div>
              <div className="h-44 bg-slate-950 relative overflow-hidden">
                {b.image ? (
                  <img src={getImgUrl(b.image)} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400"><FiImage size={36} /></div>
                )}
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <button onClick={() => openEdit(b)} className="p-2 bg-white/90 backdrop-blur-sm shadow-md rounded-xl text-primary-600 hover:bg-white"><FiEdit2 size={14} /></button>
                  <button onClick={async () => { if (!window.confirm('Delete this article?')) return; await api.delete(`/blogs/${b.id}`); toast.success('Article deleted'); fetchBlogs(); }} className="p-2 bg-white/90 backdrop-blur-sm shadow-md rounded-xl text-rose-500 hover:bg-rose-50"><FiTrash2 size={14} /></button>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="badge bg-primary-100 text-primary-800 text-[10px] uppercase font-bold tracking-wider">{b.category}</span>
                  <span className={`badge text-[10px] font-bold ${b.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {b.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">{b.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{b.excerpt || b.content?.replace(/<[^>]*>?/gm, '').substring(0, 120)}</p>
              </div>
            </div>

            <div className="p-4 border-t bg-slate-50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-[10px]">
                  {b.author?.[0]}
                </div>
                <span className="text-slate-600 font-semibold">{b.author}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400 font-medium">
                <FiEye size={13} /> {b.views || 0} views
              </div>
            </div>
          </div>
        ))}
        {blogs.length === 0 && <div className="col-span-3 card text-center py-20 text-slate-400">No articles found. Click "New Article" to write one!</div>}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-10 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b bg-slate-50">
              <h2 className="font-bold text-slate-900 text-lg">{editing ? 'Edit Article' : 'Write New Article'}</h2>
              <button onClick={() => setModal(false)} className="p-1.5 hover:bg-slate-200 rounded-lg"><FiX /></button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* DUAL IMAGE INPUT (URL + FILE UPLOAD) */}
              <div className="p-4 bg-slate-50 border rounded-2xl space-y-3">
                <label className="label text-xs font-bold text-slate-700 uppercase tracking-wider">Article Cover Image</label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-36 h-24 rounded-xl bg-slate-900 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group flex-shrink-0">
                    {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : <FiImage className="text-slate-500" size={28} />}
                    <label htmlFor="blog-image" className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer text-xs font-bold transition-opacity">
                      <FiUpload size={16} /> Upload
                    </label>
                  </div>

                  <div className="space-y-2 w-full">
                    <label className="btn-secondary text-xs py-2 px-4 flex items-center justify-center gap-2 cursor-pointer w-full text-slate-700 bg-white">
                      <FiUpload size={14} /> Upload Image from Computer
                      <input type="file" id="blog-image" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>

                    <div className="relative">
                      <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                      <input
                        type="text"
                        placeholder="Or paste Image URL (https://...)"
                        value={form.image}
                        onChange={e => {
                          setForm(p => ({ ...p, image: e.target.value }));
                          if (e.target.value) setPreview(e.target.value);
                        }}
                        className="input text-xs py-2 pl-9 w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Article Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input text-xs font-semibold" placeholder="e.g. How to Score 95%+ in Class 12th Board Exams" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input text-xs">
                    <option>Board Exams</option>
                    <option>CA Foundation</option>
                    <option>Exam Tips</option>
                    <option>Career Guidance</option>
                    <option>Success Stories</option>
                    <option>Education</option>
                  </select>
                </div>
                <div>
                  <label className="label">Author Name</label>
                  <input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} className="input text-xs" />
                </div>
              </div>

              <div>
                <label className="label">Short Excerpt / Summary</label>
                <textarea value={form.excerpt || ''} onChange={e => setForm({ ...form, excerpt: e.target.value })} rows={2} className="input text-xs" placeholder="Brief summary of this article..." />
              </div>

              <div>
                <label className="label">Full Article Content (HTML / Markdown / Text) *</label>
                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={9} className="input font-mono text-xs leading-relaxed" placeholder="Write full article here..." required />
              </div>

              <div>
                <label className="label">Tags (comma separated)</label>
                <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="input text-xs" placeholder="e.g. 12th Commerce, Accounts, Exam Strategy" />
              </div>

              <div className="flex items-center gap-2 py-2">
                <input type="checkbox" id="isPublished" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} className="w-4 h-4 text-primary-600 rounded" />
                <label htmlFor="isPublished" className="text-xs text-slate-700 font-semibold">Publish this article immediately on website</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t bg-slate-50">
              <button onClick={() => setModal(false)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                {saving ? 'Saving...' : <><FiSave /> {editing ? 'Update Article' : 'Publish Article'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
