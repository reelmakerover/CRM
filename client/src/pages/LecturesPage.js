import React, { useEffect, useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../utils/api';
import { FiSearch, FiPlay, FiClock, FiVideo, FiAlertCircle } from 'react-icons/fi';

export default function LecturesPage() {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  useEffect(() => {
    api.get('/lectures/free')
      .then(res => {
        setLectures(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching free lectures:', err.message);
        setLoading(false);
      });
  }, []);

  const subjects = ['All', ...new Set(lectures.map(l => l.subject?.name).filter(Boolean))];

  const filteredLectures = lectures.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase()) || 
                          (l.description && l.description.toLowerCase().includes(search.toLowerCase()));
    const matchesSubject = selectedSubject === 'All' || l.subject?.name === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-body">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 to-indigo-950 text-white pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.15),transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center space-y-4">
          <span className="badge bg-gold-400/20 text-gold-300 border border-gold-400/30 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-block">
            🎥 Demo Classes & Concepts
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Free Video Lectures
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto">
            Learn accounting, economics, and business studies through conceptual discussions curated by Vikram Rathore Sir.
          </p>
        </div>
      </section>

      {/* Lectures Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
        {/* Search & Filter Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/65">
          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-thin">
            {subjects.map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedSubject === sub
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <FiSearch size={18} />
            </span>
            <input
              type="text"
              placeholder="Search lectures..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm"
            />
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="min-h-[300px] flex items-center justify-center flex-col gap-3">
            <div className="animate-spin h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full" />
            <span className="text-slate-500 text-sm font-medium">Loading lectures...</span>
          </div>
        ) : filteredLectures.length === 0 ? (
          <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-dashed border-slate-200">
            <FiAlertCircle className="text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Lectures Found</h3>
            <p className="text-slate-500 max-w-sm text-sm">
              We couldn't find any lectures matching your criteria. Try adjusting your search query or subject filters.
            </p>
          </div>
        ) : (
          /* Lectures Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredLectures.map(lecture => {
              const thumbnail = `https://img.youtube.com/vi/${lecture.youtubeId}/maxresdefault.jpg`;
              
              return (
                <a 
                  key={lecture.id}
                  href={lecture.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col h-full"
                >
                  {/* Thumbnail Video Graphic */}
                  <div className="relative aspect-[16/9] w-full bg-slate-900 overflow-hidden">
                    <img
                      src={thumbnail}
                      alt={lecture.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-500 opacity-90 group-hover:opacity-100"
                      onError={(e) => {
                        e.target.src = `https://img.youtube.com/vi/${lecture.youtubeId}/hqdefault.jpg`;
                      }}
                    />
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center transition-all group-hover:bg-black/25">
                      <div className="w-14 h-14 rounded-full bg-gold-gradient text-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                        <FiPlay size={22} className="ml-1" />
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="badge bg-slate-950/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider rounded-md border border-white/10">
                        {lecture.course?.name || 'Commerce'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col flex-grow text-left">
                    {lecture.subject && (
                      <span className="text-primary-600 text-xs font-bold uppercase tracking-wider mb-2 inline-block">
                        📚 {lecture.subject.name}
                      </span>
                    )}
                    <h3 className="font-semibold text-slate-800 leading-snug group-hover:text-primary-600 transition-colors text-base line-clamp-2 mb-2">
                      {lecture.title}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-4">
                      {lecture.description || 'Watch this conceptual lecture to master high-yield topics and secure outstanding marks.'}
                    </p>

                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <FiVideo /> Free Lecture
                      </span>
                      <span className="flex items-center gap-1 bg-gold-100 text-gold-800 px-2 py-0.5 rounded font-bold text-[10px] hover:bg-gold-200 transition-colors">
                        Watch on YouTube ↗
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
