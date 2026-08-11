import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiFolder, FiUsers, FiClock, FiSearch, FiPhone, FiMail, 
  FiChevronDown, FiChevronRight, FiCalendar, FiCheckSquare, FiUser
} from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminRunningBatches() {
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBatchId, setExpandedBatchId] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/batches'),
      api.get('/teachers')
    ])
      .then(([bRes, tRes]) => {
        const bList = bRes.data || [];
        setBatches(bList);
        setTeachers(tRes.data || []);
        if (bList.length > 0) setExpandedBatchId(bList[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredBatches = useMemo(() => {
    if (!searchQuery.trim()) return batches;
    const q = searchQuery.toLowerCase();
    return batches.filter(b => 
      b.name?.toLowerCase().includes(q) ||
      b.course?.name?.toLowerCase().includes(q) ||
      b.students?.some(s => s.name?.toLowerCase().includes(q) || s.enrollmentNo?.toLowerCase().includes(q))
    );
  }, [batches, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <div className="animate-spin h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full"/>
        <span className="text-slate-500 text-sm font-medium">Loading running batch folders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FiFolder className="text-primary-600" /> Running Batches Folder Explorer
          </h1>
          <p className="text-slate-500 text-sm">
            All institute running batches organized in folders with student enrollment and parent contact details
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/teachers" className="btn-secondary py-2 px-4 text-sm flex items-center gap-1.5 shadow-xs">
            <FiUsers size={15}/> Manage Faculty
          </Link>
          <Link to="/admin/batches" className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5 shadow-sm">
            + New Batch
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input 
          type="text" 
          placeholder="Search by batch name, course, or student name..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="input pl-10 py-2.5 text-sm w-full bg-white shadow-xs"
        />
      </div>

      {/* BATCH FOLDERS ACCORDION */}
      <div className="space-y-4">
        {filteredBatches.map(batch => {
          const isOpen = expandedBatchId === batch.id;
          const students = batch.students || [];
          const assignedTeacher = teachers.find(t => 
            Array.isArray(t.assignedBatches) && t.assignedBatches.includes(Number(batch.id))
          );

          return (
            <div 
              key={batch.id} 
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all duration-200"
            >
              {/* Folder Header Bar */}
              <div 
                onClick={() => setExpandedBatchId(isOpen ? null : batch.id)}
                className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none transition-colors ${
                  isOpen ? 'bg-primary-50/40 border-b border-primary-100' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-all ${
                    isOpen ? 'bg-primary-600 text-white shadow-md' : 'bg-primary-100 text-primary-700'
                  }`}>
                    <FiFolder />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 flex-wrap">
                      {batch.name}
                      <span className="badge bg-slate-100 text-slate-700 text-xs font-semibold">
                        {batch.course?.name || 'General Course'}
                      </span>
                      {assignedTeacher && (
                        <span className="badge bg-amber-100 text-amber-900 text-xs font-bold">
                          👨‍🏫 {assignedTeacher.name}
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><FiClock size={12} /> {batch.timing || 'Regular Batch'}</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700">{students.length} Enrolled Students</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="p-2 text-slate-400 hover:text-slate-700 rounded-lg">
                    {isOpen ? <FiChevronDown size={20} /> : <FiChevronRight size={20} />}
                  </div>
                </div>
              </div>

              {/* Enrolled Students inside Batch Folder */}
              {isOpen && (
                <div className="p-5 sm:p-6 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Students in this Batch ({students.length})
                    </div>
                  </div>

                  {students.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm bg-white rounded-xl border border-dashed border-slate-200">
                      No students currently enrolled in this batch.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {students.map(st => (
                        <div 
                          key={st.id} 
                          className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-primary-300 transition-all flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm flex-shrink-0">
                                {st.photo ? (
                                  <img src={st.photo} alt={st.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  st.name?.[0]?.toUpperCase() || <FiUser />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-slate-900 text-sm truncate">{st.name}</h4>
                                <div className="text-[11px] text-slate-500 font-mono">Roll: {st.enrollmentNo || `STU-${st.id}`}</div>
                              </div>
                            </div>

                            <div className="bg-slate-50 p-2.5 rounded-lg text-xs space-y-1 border border-slate-100">
                              <div className="flex items-center justify-between text-slate-600">
                                <span className="text-slate-400">Phone:</span>
                                <span className="font-medium text-slate-800">{st.phone || '—'}</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-600">
                                <span className="text-slate-400">Parent:</span>
                                <span className="font-medium text-slate-800">{st.parentName || 'Parent'}</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-600">
                                <span className="text-slate-400">WhatsApp:</span>
                                <span className="font-semibold text-emerald-700">{st.parentPhone || st.phone || '—'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                            {(st.parentPhone || st.phone) && (
                              <a 
                                href={`https://api.whatsapp.com/send?phone=91${(st.parentPhone || st.phone).replace(/[^0-9]/g, '')}&text=${encodeURIComponent(`Namaste ${st.parentName || 'Parent'}, from D's Education administration regarding ${st.name}`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-200"
                              >
                                💬 WhatsApp
                              </a>
                            )}
                            <Link to={`/admin/students`} className="text-xs text-primary-600 hover:underline">
                              Full Profile →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredBatches.length === 0 && (
          <div className="card p-12 text-center bg-white">
            <div className="text-5xl mb-3">📁</div>
            <h3 className="font-display text-lg font-bold text-slate-800">No Running Batches Found</h3>
            <p className="text-slate-500 text-sm mt-1">No batches match your query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
