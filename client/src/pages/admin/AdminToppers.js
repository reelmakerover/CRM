import React, { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY = { name: '', course: '', marks: '', percentage: '', rank: '', year: new Date().getFullYear().toString(), photo: '', testimonial: '' };

export default function AdminToppers() {
  const [toppers, setToppers] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const fetch = () => api.get('/toppers').then(r => setToppers(r.data));
  useEffect(() => { fetch(); }, []);

  const openEdit = (t) => { 
    setForm(t); 
    setEditing(t); 
    setPreview(t.photo ? (t.photo.startsWith('http') ? t.photo : t.photo) : null);
    setSelectedFile(null);
    setModal(true); 
  };
  const openAdd = () => { setForm(EMPTY); setEditing(null); setPreview(null); setSelectedFile(null); setModal(true); };
  const inp = (f) => ({ value: form[f] ?? '', onChange: e => setForm(p => ({...p, [f]: e.target.value})) });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key !== 'photo') formData.append(key, form[key]);
      });
      if (selectedFile) {
        formData.append('photo', selectedFile);
      }

      if (editing) {
        await api.put(`/toppers/${editing.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/toppers', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success(editing ? 'Updated' : 'Topper added');
      fetch(); setModal(false);
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Error saving topper'); 
    } finally { setSaving(false); }
  };

  const getImgUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${typeof window !== 'undefined' && window.location.port === '3000' ? window.location.protocol + '//' + window.location.hostname + ':5000' : ''}${url}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold text-slate-900">Hall of Fame – Toppers</h1><p className="text-slate-500 text-sm">{toppers.length} toppers</p></div>
        <button onClick={openAdd} className="btn-primary"><FiPlus /> Add Topper</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {toppers.map(t => (
          <div key={t.id} className="card p-5 text-center relative group">
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button onClick={() => openEdit(t)} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg bg-white shadow-sm"><FiEdit2 size={12}/></button>
              <button onClick={async () => { if(!window.confirm('Delete?'))return; await api.delete(`/toppers/${t.id}`); toast.success('Deleted'); fetch(); }} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg bg-white shadow-sm"><FiTrash2 size={12}/></button>
            </div>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white overflow-hidden shadow-md">
              {t.photo ? <img src={getImgUrl(t.photo)} alt={t.name} className="w-full h-full object-cover"/> : t.name[0]}
            </div>
            <div className="font-semibold text-slate-900">{t.name}</div>
            <div className="text-primary-600 text-sm">{t.course}</div>
            <div className="text-gold-600 font-bold text-xl mt-1">{t.marks || t.percentage}</div>
            {t.rank && <div className="badge bg-gold-100 text-gold-700 mx-auto mt-1">Rank #{t.rank}</div>}
            <div className="text-slate-400 text-xs mt-1">{t.year}</div>
          </div>
        ))}
        {toppers.length === 0 && <div className="col-span-4 card text-center py-12 text-slate-400">No toppers added yet</div>}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-semibold text-slate-900">{editing ? 'Edit' : 'Add'} Topper</h2>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><FiX /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              <div className="flex flex-col items-center mb-4">
                <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden mb-2 relative group">
                  {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover"/> : <span className="text-slate-400 text-xs text-center p-2">No Photo</span>}
                  <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-[10px] font-bold">CHANGE</label>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} id="topper-photo" />
                </div>
                <label htmlFor="topper-photo" className="text-primary-600 text-xs font-semibold cursor-pointer hover:underline">Upload Photo</label>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Recommended: <span className="font-semibold text-slate-700">500 × 500 px</span> (1:1 Square)</p>
                <p className="text-[10px] text-slate-400">Min: 200 × 200 px • JPG, PNG, WEBP (Max 2MB)</p>
              </div>

              {[{f:'name',l:'Full Name *'},{f:'course',l:'Course *'},{f:'marks',l:'Marks (e.g. 97%)'},{f:'percentage',l:'Percentage'},{f:'rank',l:'Rank (e.g. AIR 1)'},{f:'year',l:'Year'}].map(({f,l})=>(
                <div key={f}><label className="label">{l}</label><input {...inp(f)} className="input" /></div>
              ))}
              <div><label className="label">Testimonial</label><textarea {...inp('testimonial')} rows={2} className="input resize-none" /></div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">{saving?'Saving...':<><FiSave/> Save</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
