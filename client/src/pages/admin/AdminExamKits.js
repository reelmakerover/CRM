import React, { useEffect, useState } from 'react';
import { FiGift, FiPlus, FiEdit2, FiTrash2, FiCheckCircle, FiX, FiSave, FiFileText, FiVideo, FiClock, FiPlusCircle, FiMinusCircle, FiUpload, FiLink } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY_KIT = {
  title: '',
  subtitle: '',
  categoryType: 'CA Intermediate Test Series',
  validity: '1 Year Validity',
  description: '',
  mrpPrice: 4999,
  sellingPrice: 1999,
  thumbnailUrl: '',
  featuresText: '',
  pdfs: [{ title: '', url: '' }],
  videos: [{ title: '', url: '' }],
  status: 'published',
  courseId: ''
};

export default function AdminExamKits() {
  const [kits, setKits] = useState([]);
  const [courses, setCourses] = useState([]);
  const [salesReport, setSalesReport] = useState({ orders: [], stats: { totalRevenue: 0, totalOrders: 0 } });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('kits'); // 'kits' or 'sales'

  const [modal, setModal] = useState(false);
  const [editingKit, setEditingKit] = useState(null);
  const [form, setForm] = useState(EMPTY_KIT);
  const [saving, setSaving] = useState(false);

  // File Uploading states
  const [uploadingPdfIndex, setUploadingPdfIndex] = useState(null);
  const [uploadingVideoIndex, setUploadingVideoIndex] = useState(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const fetchData = async () => {
    try {
      const [kitsRes, coursesRes, ordersRes] = await Promise.all([
        api.get('/exam-kits/admin'),
        api.get('/courses'),
        api.get('/exam-kits/orders')
      ]);
      setKits(kitsRes.data);
      setCourses(coursesRes.data || []);
      setSalesReport(ordersRes.data || { orders: [], stats: { totalRevenue: 0, totalOrders: 0 } });
    } catch (err) {
      toast.error('Failed to load Exam Kits data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAdd = () => {
    setForm(EMPTY_KIT);
    setEditingKit(null);
    setModal(true);
  };

  const openEdit = (k) => {
    let feat = '';
    let pdfList = [];
    let vidList = [];

    try {
      feat = typeof k.features === 'string' ? JSON.parse(k.features).join('\n') : (k.features?.join('\n') || '');
    } catch (e) { feat = k.features || ''; }

    try {
      pdfList = typeof k.includedPdfs === 'string' ? JSON.parse(k.includedPdfs) : (k.includedPdfs || []);
    } catch (e) { pdfList = []; }

    try {
      vidList = typeof k.includedVideos === 'string' ? JSON.parse(k.includedVideos) : (k.includedVideos || []);
    } catch (e) { vidList = []; }

    setForm({
      title: k.title || '',
      subtitle: k.subtitle || '',
      categoryType: k.categoryType || 'Test Series Package',
      validity: k.validity || '1 Year Validity',
      description: k.description || '',
      mrpPrice: k.mrpPrice || 4999,
      sellingPrice: k.sellingPrice || 1999,
      thumbnailUrl: k.thumbnailUrl || '',
      featuresText: feat,
      pdfs: pdfList.length > 0 ? pdfList : [{ title: '', url: '' }],
      videos: vidList.length > 0 ? vidList : [{ title: '', url: '' }],
      status: k.status || 'published',
      courseId: k.courseId || ''
    });
    setEditingKit(k);
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.sellingPrice) return toast.error('Title and Selling Price are required');

    setSaving(true);
    try {
      const features = form.featuresText.split('\n').map(s => s.trim()).filter(Boolean);
      const includedPdfs = form.pdfs.filter(p => p.title.trim() && p.url.trim());
      const includedVideos = form.videos.filter(v => v.title.trim() && v.url.trim());

      const payload = {
        title: form.title,
        subtitle: form.subtitle,
        categoryType: form.categoryType,
        validity: form.validity,
        description: form.description,
        mrpPrice: form.mrpPrice,
        sellingPrice: form.sellingPrice,
        thumbnailUrl: form.thumbnailUrl,
        features,
        includedPdfs,
        includedVideos,
        status: form.status,
        courseId: form.courseId || null
      };

      if (editingKit) {
        await api.put(`/exam-kits/${editingKit.id}`, payload);
        toast.success('Test Series Package updated successfully!');
      } else {
        await api.post('/exam-kits', payload);
        toast.success('New Test Series Package created & published!');
      }

      fetchData();
      setModal(false);
    } catch (err) {
      toast.error('Failed to save package');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this Test Series package?')) return;
    try {
      await api.delete(`/exam-kits/${id}`);
      toast.success('Package deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete package');
    }
  };

  // Dynamic Row Helpers
  const addPdfRow = () => setForm(p => ({ ...p, pdfs: [...p.pdfs, { title: '', url: '' }] }));
  const removePdfRow = (index) => setForm(p => ({ ...p, pdfs: p.pdfs.filter((_, i) => i !== index) }));
  const updatePdfRow = (index, field, value) => {
    const nextPdfs = [...form.pdfs];
    nextPdfs[index][field] = value;
    setForm(p => ({ ...p, pdfs: nextPdfs }));
  };

  const addVideoRow = () => setForm(p => ({ ...p, videos: [...p.videos, { title: '', url: '' }] }));
  const removeVideoRow = (index) => setForm(p => ({ ...p, videos: p.videos.filter((_, i) => i !== index) }));
  const updateVideoRow = (index, field, value) => {
    const nextVideos = [...form.videos];
    nextVideos[index][field] = value;
    setForm(p => ({ ...p, videos: nextVideos }));
  };

  // Direct File Upload Handlers (PDF & Video)
  const handlePdfFileUpload = async (index, file) => {
    if (!file) return;
    setUploadingPdfIndex(index);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/exam-kits/upload-media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const fileUrl = data.url;
      const fileName = data.fileName || file.name;

      const nextPdfs = [...form.pdfs];
      if (!nextPdfs[index].title) nextPdfs[index].title = fileName;
      nextPdfs[index].url = fileUrl;
      setForm(p => ({ ...p, pdfs: nextPdfs }));
      toast.success('PDF file uploaded successfully!');
    } catch (err) {
      toast.error('Failed to upload PDF file');
    } finally {
      setUploadingPdfIndex(null);
    }
  };

  const handleVideoFileUpload = async (index, file) => {
    if (!file) return;
    setUploadingVideoIndex(index);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/exam-kits/upload-media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const fileUrl = data.url;
      const fileName = data.fileName || file.name;

      const nextVideos = [...form.videos];
      if (!nextVideos[index].title) nextVideos[index].title = fileName;
      nextVideos[index].url = fileUrl;
      setForm(p => ({ ...p, videos: nextVideos }));
      toast.success('Video file uploaded successfully!');
    } catch (err) {
      toast.error('Failed to upload Video file');
    } finally {
      setUploadingVideoIndex(null);
    }
  };

  const handleThumbnailUpload = async (file) => {
    if (!file) return;
    setUploadingThumbnail(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/exam-kits/upload-media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm(p => ({ ...p, thumbnailUrl: data.url }));
      toast.success('Thumbnail uploaded successfully!');
    } catch (err) {
      toast.error('Failed to upload thumbnail image');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Test Series & Course Store Manager...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Test Series & Course Package Creator</h1>
          <p className="text-slate-500 text-sm">Upload or paste URLs for multiple PDF Test Papers, Video Solution Classes & Notes.</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={openAdd} className="btn-primary text-sm flex items-center gap-2">
            <FiPlus /> Create New Test Series Package
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white space-y-1">
          <div className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Total Sales Revenue</div>
          <div className="text-3xl font-display font-bold">₹{Number(salesReport.stats.totalRevenue || 0).toLocaleString('en-IN')}</div>
          <div className="text-xs text-emerald-200">From online UPI & instant checkout orders</div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-primary-600 to-indigo-700 text-white space-y-1">
          <div className="text-xs font-bold text-primary-100 uppercase tracking-wider">Total Packages Sold</div>
          <div className="text-3xl font-display font-bold">{salesReport.stats.totalOrders || 0} Sold</div>
          <div className="text-xs text-primary-200">Customer test series purchases logged</div>
        </div>

        <div className="card p-5 bg-slate-900 text-white space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Published Packages</div>
          <div className="text-3xl font-display font-bold text-amber-400">{kits.filter(k => k.status === 'published').length} Live</div>
          <div className="text-xs text-slate-400">Available on store</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b">
        <button
          onClick={() => setActiveTab('kits')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'kits' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          📝 Test Series Packages ({kits.length})
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'sales' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          💰 Customer Sales & Receipts ({salesReport.orders.length})
        </button>
      </div>

      {/* TAB 1: KITS GRID */}
      {activeTab === 'kits' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {kits.map(k => {
            let featList = [];
            let pdfList = [];
            let videoList = [];
            try { featList = typeof k.features === 'string' ? JSON.parse(k.features) : (k.features || []); } catch(e){}
            try { pdfList = typeof k.includedPdfs === 'string' ? JSON.parse(k.includedPdfs) : (k.includedPdfs || []); } catch(e){}
            try { videoList = typeof k.includedVideos === 'string' ? JSON.parse(k.includedVideos) : (k.includedVideos || []); } catch(e){}

            return (
              <div key={k.id} className="card overflow-hidden flex flex-col justify-between border hover:shadow-lg transition-all">
                <div className="space-y-4">
                  {/* Thumbnail / Header Banner */}
                  <div className="relative h-44 bg-slate-900 overflow-hidden">
                    <img
                      src={k.thumbnailUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80'}
                      alt={k.title}
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-5 flex flex-col justify-end">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge bg-amber-500 text-slate-950 font-bold text-xs">
                          {k.categoryType || 'Test Series'}
                        </span>
                        <span className="badge bg-slate-800 text-white font-medium text-[11px] border border-slate-700">
                          {k.validity || '1 Year Validity'}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-lg leading-snug drop-shadow">{k.title}</h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <p className="text-xs text-slate-600 leading-relaxed">{k.description}</p>

                    {/* Price & Material Count Badge */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
                      <div>
                        <div className="text-[11px] text-slate-400 font-semibold">PACKAGE SELLING PRICE</div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-slate-900 font-display">₹{Number(k.sellingPrice).toLocaleString('en-IN')}</span>
                          <span className="text-xs text-slate-400 line-through">₹{Number(k.mrpPrice).toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <span className="badge bg-primary-50 text-primary-700 flex items-center gap-1">
                          <FiFileText size={12}/> {pdfList.length} PDFs
                        </span>
                        <span className="badge bg-rose-50 text-rose-700 flex items-center gap-1">
                          <FiVideo size={12}/> {videoList.length} Videos
                        </span>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Package Contents & Highlights:</div>
                      <ul className="space-y-1">
                        {featList.map((f, i) => (
                          <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                            <FiCheckCircle className="text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 border-t bg-slate-50 flex items-center justify-between">
                  <span className={`badge text-xs font-semibold ${k.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                    {k.status.toUpperCase()}
                  </span>

                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(k)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                      <FiEdit2 /> Edit Package
                    </button>
                    <button onClick={() => handleDelete(k.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: ORDERS & SALES TABLE */}
      {activeTab === 'sales' && (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID & Date</th>
                <th>Test Series / Package</th>
                <th>Student Customer</th>
                <th>Phone & Email</th>
                <th>Amount Paid</th>
                <th>Payment Mode</th>
                <th>Txn Ref</th>
              </tr>
            </thead>
            <tbody>
              {salesReport.orders.map(o => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td>
                    <div className="font-bold text-xs text-primary-700">{o.orderNo}</div>
                    <div className="text-[11px] text-slate-400">{new Date(o.createdAt).toLocaleString('en-IN')}</div>
                  </td>
                  <td>
                    <div className="font-bold text-slate-900 text-xs">{o.examKit?.title || 'Test Series Package'}</div>
                  </td>
                  <td>
                    <div className="font-semibold text-slate-900 text-xs">{o.studentName}</div>
                    <div className="text-[11px] text-slate-400">{o.city || 'N/A'}</div>
                  </td>
                  <td>
                    <div className="text-xs text-slate-800 font-semibold">{o.studentPhone}</div>
                    <div className="text-[11px] text-slate-400">{o.studentEmail}</div>
                  </td>
                  <td>
                    <span className="font-bold text-emerald-700 text-sm">₹{Number(o.amountPaid).toLocaleString('en-IN')}</span>
                  </td>
                  <td>
                    <span className="badge bg-slate-100 text-slate-700 text-xs">{o.paymentMethod}</span>
                  </td>
                  <td>
                    <span className="font-mono text-xs text-slate-500">{o.transactionRef}</span>
                  </td>
                </tr>
              ))}

              {salesReport.orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No package sales logged yet. Sales will appear here as soon as students buy online!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT MULTI-PDF & MULTI-VIDEO TEST SERIES MODAL */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b bg-slate-50">
              <h2 className="font-bold text-slate-900 text-lg">
                {editingKit ? `Edit Package — ${editingKit.title}` : 'Create New Test Series / Course Package'}
              </h2>
              <button onClick={() => setModal(false)} className="p-1.5 hover:bg-slate-200 rounded-lg"><FiX /></button>
            </div>

            <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
              <div>
                <label className="label">Package Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="input w-full"
                  placeholder="e.g. 🎯 CA Intermediate Paper 1 & 2 Test Series 2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Category Type</label>
                  <input
                    type="text"
                    value={form.categoryType}
                    onChange={e => setForm(p => ({ ...p, categoryType: e.target.value }))}
                    className="input w-full"
                    placeholder="CA Intermediate / 12th Board Test Series"
                  />
                </div>

                <div>
                  <label className="label">Package Validity</label>
                  <input
                    type="text"
                    value={form.validity}
                    onChange={e => setForm(p => ({ ...p, validity: e.target.value }))}
                    className="input w-full"
                    placeholder="1 Year Validity / Lifetime Access"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Selling Price (₹) *</label>
                  <input
                    type="number"
                    value={form.sellingPrice}
                    onChange={e => setForm(p => ({ ...p, sellingPrice: e.target.value }))}
                    className="input w-full font-bold text-emerald-700"
                    placeholder="1999"
                  />
                </div>

                <div>
                  <label className="label">Original MRP Price (₹)</label>
                  <input
                    type="number"
                    value={form.mrpPrice}
                    onChange={e => setForm(p => ({ ...p, mrpPrice: e.target.value }))}
                    className="input w-full"
                    placeholder="4999"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Target Course</label>
                  <select
                    value={form.courseId}
                    onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))}
                    className="input w-full"
                  >
                    <option value="">All Courses / Universal Package</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                    className="input w-full"
                  >
                    <option value="published">Published (Live in Store)</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Cover Thumbnail Image</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={form.thumbnailUrl}
                    onChange={e => setForm(p => ({ ...p, thumbnailUrl: e.target.value }))}
                    className="input flex-1 text-xs"
                    placeholder="https://images.unsplash.com/... or upload below"
                  />
                  <label className="btn-secondary py-2 px-3 text-xs font-semibold rounded-lg cursor-pointer hover:bg-slate-200 transition-all flex items-center gap-1.5 shadow-sm shrink-0">
                    <FiUpload size={14} />
                    <span>{uploadingThumbnail ? 'Uploading...' : 'Upload File'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      disabled={uploadingThumbnail}
                      onChange={e => handleThumbnailUpload(e.target.files[0])}
                    />
                  </label>
                </div>
                {form.thumbnailUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-16 h-10 rounded border overflow-hidden bg-slate-50 flex-shrink-0">
                      <img 
                        src={form.thumbnailUrl.startsWith('http') ? form.thumbnailUrl : `${typeof window !== 'undefined' && window.location.port === '3000' ? window.location.protocol + '//' + window.location.hostname + ':5000' : ''}${form.thumbnailUrl}`} 
                        alt="Thumbnail preview" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 truncate">{form.thumbnailUrl}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="label">Package Overview / Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="input w-full h-20 text-xs"
                  placeholder="Detailed explanation of subjects, mock test series, and solution videos..."
                />
              </div>

              {/* DYNAMIC MULTIPLE PDFS BUILDER (URL + DIRECT COMPUTER FILE UPLOAD) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <FiFileText className="text-primary-600"/> Attached PDF Notes & Test Papers ({form.pdfs.length})
                  </div>
                  <button type="button" onClick={addPdfRow} className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1 text-primary-700">
                    <FiPlusCircle /> Add PDF Row
                  </button>
                </div>

                <div className="space-y-3">
                  {form.pdfs.map((pdf, index) => (
                    <div key={index} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          placeholder="PDF Title (e.g. CA Inter Paper 1 Test.pdf)"
                          value={pdf.title}
                          onChange={e => updatePdfRow(index, 'title', e.target.value)}
                          className="input text-xs py-1.5 flex-1 font-semibold"
                        />
                        {form.pdfs.length > 1 && (
                          <button type="button" onClick={() => removePdfRow(index)} className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg">
                            <FiMinusCircle size={16} />
                          </button>
                        )}
                      </div>

                      {/* DUAL MODE: URL or Direct Upload */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <div className="relative flex-1">
                          <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                          <input
                            type="text"
                            placeholder="Paste PDF URL (https://...)"
                            value={pdf.url}
                            onChange={e => updatePdfRow(index, 'url', e.target.value)}
                            className="input text-xs py-1.5 pl-8 w-full"
                          />
                        </div>

                        <label className="btn-secondary text-xs py-1.5 px-3 flex items-center justify-center gap-1 cursor-pointer flex-shrink-0 text-slate-700 bg-slate-100 hover:bg-slate-200">
                          <FiUpload size={13} />
                          {uploadingPdfIndex === index ? 'Uploading...' : '📁 Upload File'}
                          <input
                            type="file"
                            accept=".pdf, .doc, .docx"
                            onChange={e => handlePdfFileUpload(index, e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DYNAMIC MULTIPLE VIDEOS BUILDER (URL + DIRECT COMPUTER FILE UPLOAD) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <FiVideo className="text-rose-600"/> Attached Video Solution Classes ({form.videos.length})
                  </div>
                  <button type="button" onClick={addVideoRow} className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1 text-rose-700">
                    <FiPlusCircle /> Add Video Row
                  </button>
                </div>

                <div className="space-y-3">
                  {form.videos.map((vid, index) => (
                    <div key={index} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          placeholder="Video Title (e.g. Test 1 Video Solution Class)"
                          value={vid.title}
                          onChange={e => updateVideoRow(index, 'title', e.target.value)}
                          className="input text-xs py-1.5 flex-1 font-semibold"
                        />
                        {form.videos.length > 1 && (
                          <button type="button" onClick={() => removeVideoRow(index)} className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg">
                            <FiMinusCircle size={16} />
                          </button>
                        )}
                      </div>

                      {/* DUAL MODE: URL or Direct Upload */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <div className="relative flex-1">
                          <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                          <input
                            type="text"
                            placeholder="Paste Video URL (YouTube / Vimeo / MP4 / GDrive)"
                            value={vid.url}
                            onChange={e => updateVideoRow(index, 'url', e.target.value)}
                            className="input text-xs py-1.5 pl-8 w-full"
                          />
                        </div>

                        <label className="btn-secondary text-xs py-1.5 px-3 flex items-center justify-center gap-1 cursor-pointer flex-shrink-0 text-slate-700 bg-slate-100 hover:bg-slate-200">
                          <FiUpload size={13} />
                          {uploadingVideoIndex === index ? 'Uploading...' : '🎬 Upload File'}
                          <input
                            type="file"
                            accept="video/*"
                            onChange={e => handleVideoFileUpload(index, e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Package Bullet Features (1 per line)</label>
                <textarea
                  value={form.featuresText}
                  onChange={e => setForm(p => ({ ...p, featuresText: e.target.value }))}
                  className="input w-full h-20 text-xs font-mono"
                  placeholder="CA Inter Full Syllabus Test Series&#10;Detailed Solution Key PDFs&#10;Video Solution Classes"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t bg-slate-50">
              <button onClick={() => setModal(false)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                {saving ? 'Saving...' : <><FiSave /> Save & Publish Package</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
