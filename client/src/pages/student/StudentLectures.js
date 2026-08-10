import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { FiPlay, FiBookOpen, FiClock, FiVideo, FiAlertCircle } from 'react-icons/fi';

export default function StudentLectures() {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [activeLecture, setActiveLecture] = useState(null);

  useEffect(() => {
    api.get('/lectures')
      .then(res => {
        setLectures(res.data);
        if (res.data.length > 0) {
          setActiveLecture(res.data[0]); // Set the first lecture as active
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching lectures:', err.message);
        setLoading(false);
      });
  }, []);

  const subjects = ['All', ...new Set(lectures.map(l => l.subject?.name).filter(Boolean))];

  const filteredLectures = lectures.filter(l => 
    selectedSubject === 'All' || l.subject?.name === selectedSubject
  );

  // If activeLecture is not in the filtered list, select the first one of the filtered list
  useEffect(() => {
    if (filteredLectures.length > 0 && (!activeLecture || !filteredLectures.some(l => l.id === activeLecture.id))) {
      setActiveLecture(filteredLectures[0]);
    }
  }, [selectedSubject, filteredLectures]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center flex-col gap-3">
        <div className="animate-spin h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full" />
        <span className="text-slate-500 text-sm font-medium">Loading your video lectures...</span>
      </div>
    );
  }

  if (lectures.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-slate-200">
        <FiAlertCircle className="text-slate-300 mb-4" size={56} />
        <h3 className="text-xl font-bold text-slate-800 mb-2">No Lectures Available</h3>
        <p className="text-slate-500 max-w-md text-sm leading-relaxed">
          There are currently no video lectures assigned to your course. Please contact administration or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Video Lectures</h1>
          <p className="text-slate-500 text-sm">Access and learn from your curriculum video materials</p>
        </div>

        {/* Subject Filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-thin">
          {subjects.map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSubject === sub
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Main Video Portal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Player (Lg size: 8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {activeLecture ? (
            <>
              {/* Premium Cinematic Video Wrapper */}
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/80 shadow-lg">
                <iframe
                  src={`https://www.youtube.com/embed/${activeLecture.youtubeId}`}
                  title={activeLecture.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>

              {/* Title & Description Info */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    {activeLecture.subject && (
                      <span className="inline-block bg-primary-50 text-primary-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-1">
                        {activeLecture.subject.name}
                      </span>
                    )}
                    <h2 className="text-lg font-bold text-slate-800 leading-snug">{activeLecture.title}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <a 
                      href={activeLecture.videoUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="bg-gold-400 hover:bg-gold-500 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1 transition-all"
                    >
                      Watch on YouTube ↗
                    </a>
                    {activeLecture.isFree && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-2 rounded-full uppercase">
                        Demo Video
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Lecture Description</h4>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                    {activeLecture.description || 'No description provided for this video. Watch the video to cover this topic.'}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="aspect-[16/9] rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center p-8">
              <FiPlay className="text-slate-700 animate-pulse mb-3" size={48} />
              <span className="text-slate-500 font-semibold text-sm">Select a video from the playlist to play</span>
            </div>
          )}
        </div>

        {/* Right Column: Playlist Sidebar (Lg size: 4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/85 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[500px]">
          {/* Sidebar Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
            <FiBookOpen className="text-primary-600" />
            <span className="font-semibold text-slate-700 text-sm">Playlist</span>
            <span className="ml-auto bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {filteredLectures.length} Lectures
            </span>
          </div>

          {/* Playlist Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
            {filteredLectures.map((lecture, idx) => {
              const isActive = activeLecture?.id === lecture.id;
              const thumb = `https://img.youtube.com/vi/${lecture.youtubeId}/default.jpg`;
              
              return (
                <div
                  key={lecture.id}
                  onClick={() => setActiveLecture(lecture)}
                  className={`p-3.5 flex gap-3 cursor-pointer items-start transition-colors ${
                    isActive 
                      ? 'bg-primary-50/70 border-l-4 border-primary-600' 
                      : 'hover:bg-slate-50 border-l-4 border-transparent'
                  }`}
                >
                  {/* Small video thumb */}
                  <div className="relative w-20 aspect-[16/9] bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                    <img src={thumb} alt={lecture.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <FiPlay size={12} className="text-white" />
                    </div>
                  </div>

                  {/* Title and details */}
                  <div className="min-w-0">
                    <h3 className={`text-xs font-semibold leading-snug line-clamp-2 ${isActive ? 'text-primary-700 font-bold' : 'text-slate-700'}`}>
                      {lecture.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400">
                      <span className="truncate">{lecture.subject?.name || 'Curriculum'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
