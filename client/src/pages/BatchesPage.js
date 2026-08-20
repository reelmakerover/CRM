import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FiCalendar, FiClock, FiUsers, FiArrowRight, FiMapPin, FiFilter, FiCheckCircle } from 'react-icons/fi';

export default function BatchesPage() {
  const { student } = useAuth();
  const [batches, setBatches] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/batches').then(r => setBatches(Array.isArray(r.data) ? r.data : [])).catch(() => {
      setBatches([]);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? batches : batches.filter(b => b.status === filter);

  const statusColor = { active: 'bg-emerald-100 text-emerald-700', upcoming: 'bg-blue-100 text-blue-700', completed: 'bg-slate-100 text-slate-600' };
  const modeIcon = { offline: '🏫', online: '💻', hybrid: '🔄' };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="bg-hero-gradient pt-32 pb-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Batch Schedule</h1>
          <p className="text-primary-200 text-lg">Live and upcoming batches — seats are limited, enroll early!</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Filter */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <FiFilter className="text-slate-500" />
          <span className="text-slate-600 font-medium">Filter:</span>
          {['all', 'active', 'upcoming'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-all ${filter === f ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300'}`}>
              {f === 'all' ? 'All Batches' : f === 'active' ? '🟢 Live Now' : '📅 Upcoming'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-72 rounded-2xl shimmer" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(batch => {
              const seatsLeft = batch.totalSeats - (batch.students?.length || 0);
              const fillPct = ((batch.students?.length || 0) / batch.totalSeats) * 100;
              return (
                <div key={batch.id} className="card p-6 relative overflow-hidden">
                  {batch.status === 'active' && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />LIVE
                    </div>
                  )}
                  <div className={`absolute top-0 left-0 h-1 transition-all`} style={{ width: `${fillPct}%`, background: fillPct > 80 ? '#ef4444' : '#10b981' }} />

                  <div className="mt-2">
                    <span className={`badge text-xs font-semibold mb-3 ${statusColor[batch.status]}`}>
                      {modeIcon[batch.mode]} {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                    </span>
                    <h3 className="font-display font-bold text-slate-900 text-lg mb-1 mt-2">{batch.name}</h3>
                    <p className="text-primary-600 font-semibold text-sm mb-4">{batch.course?.name}</p>

                    <div className="space-y-2.5 text-sm text-slate-600 mb-5">
                      <div className="flex items-center gap-2.5">
                        <FiCalendar size={14} className="text-primary-500 flex-shrink-0" />
                        {new Date(batch.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2.5">
                        <FiClock size={14} className="text-primary-500 flex-shrink-0" />
                        {batch.timing}
                      </div>
                      <div className="flex items-center gap-2.5">
                        <FiMapPin size={14} className="text-primary-500 flex-shrink-0" />
                        {batch.mode === 'online' ? 'Online (Live Classes)' : batch.mode === 'hybrid' ? 'Hybrid Mode' : 'DS Centre, Jaipur'}
                      </div>
                      <div className="flex items-center gap-2.5">
                        <FiUsers size={14} className="text-primary-500 flex-shrink-0" />
                        <span>By <strong>{batch.instructor || 'Vikram Rathore Sir'}</strong></span>
                      </div>
                    </div>

                    {/* Seat progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-500">{(batch.students?.length || 0)} enrolled</span>
                        <span className={`font-bold ${seatsLeft <= 5 ? 'text-red-600' : seatsLeft <= 10 ? 'text-orange-500' : 'text-emerald-600'}`}>
                          {seatsLeft} seats left
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${fillPct}%`, background: fillPct > 80 ? 'linear-gradient(to right,#f87171,#ef4444)' : undefined }} />
                      </div>
                    </div>

                    {(() => {
                      const isEnrolledInBatch = student && (
                        student.batchId === batch.id || 
                        student.courseId === (batch.courseId || batch.course?.id) ||
                        (student.course?.name && batch.course?.name && student.course.name.toLowerCase().trim() === batch.course.name.toLowerCase().trim())
                      );

                      return (
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <div>
                            <div className="font-bold text-primary-700">₹{batch.fees?.toLocaleString() || '—'}</div>
                            <div className="text-xs text-slate-400">EMI available</div>
                          </div>
                          {isEnrolledInBatch ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-300">
                              <FiCheckCircle className="text-emerald-600" /> Already Enrolled
                            </span>
                          ) : (
                            <Link to="/contact" className="btn-primary text-sm py-2 px-4">
                              {seatsLeft === 0 ? 'Waitlist' : 'Enroll Now'} <FiArrowRight size={14} />
                            </Link>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div className="text-center py-20 text-slate-500">
            <div className="text-5xl mb-4">📅</div>
            <p className="text-xl font-medium">No batches found</p>
            <p className="text-sm mt-2">Check back soon or contact us for the next batch schedule.</p>
          </div>
        )}

        <div className="mt-12 bg-primary-900 rounded-3xl p-8 text-center">
          <h3 className="font-display text-2xl font-bold text-white mb-3">Don't see a suitable batch?</h3>
          <p className="text-primary-300 mb-6">Contact us and we'll let you know when the next batch starts for your course.</p>
          <Link to="/contact" className="btn-gold">Contact Admissions <FiArrowRight /></Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
