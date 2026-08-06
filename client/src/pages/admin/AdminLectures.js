import React, { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiSearch, FiTv, FiPlay } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY_LECTURE = { 
  title: '', 
  description: '', 
  videoUrl: '', 
  isFree: false, 
  order: 0, 
  courseId: '', 
  subjectId: '' 
};

export default function AdminLectures() {
  const [lectures, setLectures] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // 'form' or null
  const [form, setForm] = useState(EMPTY_LECTURE);
  const [editing, setEditing] = useState(null); // Lecture being edited
  const [saving, setSaving] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [lRes, cRes, sRes] = await Promise.all([
        api.get('/lectures'),
        api.get('/courses'),
        api.get('/courses/subjects')
      ]);
      setLectures(lRes.data);
      setCourses(cRes.data);
      setSubjects(sRes.data);
    } catch (err) {
      toast.error('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const openAdd = () => {
    setForm(EMPTY_LECTURE);
    setEditing(null);
    setModal('form');
  };

  const openEdit = (lecture) => {
    setForm({
      title: lecture.title || '',
      description: lecture.description || '',
      videoUrl: lecture.videoUrl || '',
      isFree: lecture.isFree || false,
      order: lecture.order || 0,
      courseId: lecture.courseId || '',
      subjectId: lecture.subjectId || ''
    });
    setEditing(lecture);
    setModal('form');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.videoUrl.trim()) {
      return toast.error('Title and Video URL are required');
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        courseId: form.courseId || null,
        subjectId: form.subjectId || null
      };

      if (editing) {
        const res = await api.put(`/lectures/${editing.id}`, payload);
        setLectures(prev => prev.map(l => l.id === editing.id ? res.data : l));
        toast.success('Lecture updated successfully');
      } else {
        const res = await api.post('/lectures', payload);
        setLectures(prev => [res.data, ...prev]);
        toast.success('Lecture created successfully');
      }
      setModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save lecture');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lecture?')) return;
    try {
      await api.delete(`/lectures/${id}`);
      setLectures(prev => prev.filter(l => l.id !== id));
      toast.success('Lecture deleted successfully');
    } catch (err) {
      toast.error('Failed to delete lecture');
    }
  };

  const filteredLectures = lectures.filter(l => 
    l.title.toLowerCase().includes(search.toLowerCase()) || 
    (l.course?.name && l.course.name.toLowerCase().includes(search.toLowerCase())) ||
    (l.subject?.name && l.subject.name.toLowerCase().includes(search.toLowerCase()))
  );

  // Filter subjects for the form based on selected course
  const formSubjects = subjects.filter(s => !form.courseId || s.courseId === parseInt(form.courseId));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Video Lectures</h1>
          <p className="text-slate-500 text-sm">Manage educational video playlists and demo lectures</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <FiPlus /> Add Lecture
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200/60">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <FiSearch size={18} />
          </span>
          <input
            type="text"
            placeholder="Search lectures..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
          />
        </div>
        <div className="text-slate-500 text-xs font-semibold">
          Showing {filteredLectures.length} of {lectures.length} lectures
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="min-h-[250px] flex items-center justify-center flex-col gap-2">
          <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
          <span className="text-slate-400 text-xs">Loading lectures...</span>
        </div>
      ) : filteredLectures.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/70 p-12 text-center">
          <FiTv className="mx-auto text-slate-300 mb-3" size={40} />
          <h3 className="font-bold text-slate-800 text-base mb-1">No Lectures Found</h3>
          <p className="text-slate-400 text-xs max-w-xs mx-auto">
            Click "Add Lecture" to publish your first video lecture on the platform.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Video Preview</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Title / Details</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Course / Subject</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredLectures.map(lecture => {
                const thumb = `https://img.youtube.com/vi/${lecture.youtubeId}/default.jpg`;
                
                return (
                  <tr key={lecture.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a href={lecture.videoUrl} target="_blank" rel="noreferrer" className="relative block w-24 aspect-[16/9] bg-slate-900 rounded-lg overflow-hidden border border-slate-100 group">
                        <img src={thumb} alt={lecture.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/35 flex items-center justify-center group-hover:bg-black/20">
                          <FiPlay size={14} className="text-white" />
                        </div>
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-800 line-clamp-2 max-w-xs">{lecture.title}</div>
                      <div className="text-slate-400 text-xs mt-0.5 line-clamp-1 max-w-xs">{lecture.description || 'No description'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-bold text-slate-700">{lecture.course?.name || 'All Courses'}</div>
                      <div className="text-slate-500 text-[10px] font-mono mt-0.5">{lecture.subject?.name || 'All Subjects'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-600">
                      {lecture.order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-[10px] leading-5 font-extrabold rounded-full ${
                        lecture.isFree 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {lecture.isFree ? 'Free Demo' : 'Course Premium'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openEdit(lecture)} 
                          className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg"
                          title="Edit"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(lecture.id)} 
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal === 'form' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <FiTv className="text-primary-600" />
                {editing ? 'Edit Video Lecture' : 'Add New Video Lecture'}
              </h3>
              <button 
                onClick={() => setModal(null)} 
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1.5 rounded-lg transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Lecture Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Introduction to Accrual Accounting"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/25"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">YouTube Video URL *</label>
                <input
                  type="url"
                  required
                  placeholder="e.g. https://www.youtube.com/watch?v=..."
                  value={form.videoUrl}
                  onChange={e => setForm(p => ({ ...p, videoUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/25"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  placeholder="Provide lecture notes or reference descriptions..."
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/25"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Course Mapping</label>
                  <select
                    value={form.courseId}
                    onChange={e => setForm(p => ({ ...p, courseId: e.target.value, subjectId: '' }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/25"
                  >
                    <option value="">All Courses (Public)</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Subject Mapping</label>
                  <select
                    value={form.subjectId}
                    onChange={e => setForm(p => ({ ...p, subjectId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/25"
                  >
                    <option value="">All Subjects</option>
                    {formSubjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.course?.name})</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sorting Order</label>
                  <input
                    type="number"
                    min="0"
                    value={form.order}
                    onChange={e => setForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/25"
                  />
                </div>

                <div className="flex items-center mt-5">
                  <input
                    type="checkbox"
                    id="isFree"
                    checked={form.isFree}
                    onChange={e => setForm(p => ({ ...p, isFree: e.target.checked }))}
                    className="h-4.5 w-4.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                  <label htmlFor="isFree" className="ml-2 text-sm font-semibold text-slate-700 cursor-pointer select-none">
                    Free Demo Lecture
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm"
                >
                  <FiSave />
                  {saving ? 'Saving...' : 'Save Lecture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
