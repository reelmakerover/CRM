import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { FiGift, FiFileText, FiVideo, FiLock, FiAlertCircle, FiX, FiEye, FiPlay } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function StudentExamKits() {
  const { user, student } = useAuth();
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [activePdf, setActivePdf] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  
  // Screen protection states
  const [blurScreen, setBlurScreen] = useState(false);

  useEffect(() => {
    api.get('/exam-kits/my-kits')
      .then(res => {
        setKits(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching student exam kits:', err.message);
        toast.error('Failed to load your Exam Kits');
        setLoading(false);
      });
  }, []);

  // Screenshot/Print Screen Keyboard listener
  useEffect(() => {
    const handleKeyUp = (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        // Clear clipboard & blur screen
        try {
          navigator.clipboard.writeText('Screenshots are disabled on D\'s Education portal.');
        } catch (err) {}
        setBlurScreen(true);
        toast.error('🔒 Screen capture detected! Content has been protected.');
        setTimeout(() => setBlurScreen(false), 5000);
      }
    };

    const handleKeyDown = (e) => {
      // Block Ctrl+P (Print) and Ctrl+S (Save)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        toast.error('🔒 Saving or Printing this study material is disabled.');
      }
    };

    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center flex-col gap-3">
        <div className="animate-spin h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full" />
        <span className="text-slate-500 text-sm font-medium">Loading your Study & Exam Kits...</span>
      </div>
    );
  }

  if (kits.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-slate-200">
        <FiGift className="text-slate-300 mb-4 animate-bounce" size={56} />
        <h3 className="text-xl font-bold text-slate-800 mb-2">No Exam Kits Available</h3>
        <p className="text-slate-500 max-w-md text-sm leading-relaxed">
          You do not have any active Test Series or Exam Kits assigned. 
          Purchase a package from our <a href="/store" className="text-primary-600 hover:underline font-bold">Storefront</a> or contact support to request access.
        </p>
      </div>
    );
  }

  // Resolve base64 or absolute URLs safely
  const getCleanUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    const dataIndex = url.indexOf('data:image/');
    if (dataIndex !== -1) return url.substring(dataIndex);
    
    const dataPdfIndex = url.indexOf('data:application/pdf');
    if (dataPdfIndex !== -1) return url.substring(dataPdfIndex);

    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    
    // Add localhost backend port if running client on 3000
    if (typeof window !== 'undefined' && window.location.port === '3000') {
      return `${window.location.protocol}//${window.location.hostname}:5000${url.startsWith('/') ? url : '/' + url}`;
    }
    return url.startsWith('/') ? url : `/${url}`;
  };

  return (
    <div className={`space-y-6 transition-all duration-350 ${blurScreen ? 'filter blur-xl pointer-events-none select-none' : ''}`}>
      {/* Print protection styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { display: none !important; }
          html { display: none !important; }
        }
      `}} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FiGift className="text-primary-600" /> My Exam Kits & Study Store
        </h1>
        <p className="text-slate-500 text-sm">Access your purchased Test Series, Answer Keys & Solution Videos securely</p>
      </div>

      {/* Kits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {kits.map(kit => {
          let pdfList = [];
          let videoList = [];
          try { pdfList = typeof kit.includedPdfs === 'string' ? JSON.parse(kit.includedPdfs) : (kit.includedPdfs || []); } catch(e){}
          try { videoList = typeof kit.includedVideos === 'string' ? JSON.parse(kit.includedVideos) : (kit.includedVideos || []); } catch(e){}

          return (
            <div key={kit.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                {/* Header Banner */}
                <div className="relative h-44 bg-slate-950 flex items-end">
                  <img 
                    src={getCleanUrl(kit.thumbnailUrl) || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80'} 
                    alt={kit.title} 
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="relative p-5 text-white z-10 space-y-1">
                    <span className="badge bg-amber-400 text-slate-950 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      {kit.categoryType}
                    </span>
                    <h3 className="font-bold text-lg leading-tight">{kit.title}</h3>
                  </div>
                </div>

                {/* Description */}
                <div className="p-5">
                  <p className="text-slate-600 text-xs leading-relaxed mb-4">{kit.description}</p>

                  {/* PDFs List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">📄 Attached PDF Papers ({pdfList.length})</h4>
                    {pdfList.length > 0 ? (
                      <div className="space-y-2">
                        {pdfList.map((pdf, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => setActivePdf(pdf)}
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/50 cursor-pointer group transition-all"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                                <FiFileText size={16} />
                              </span>
                              <span className="text-xs font-semibold text-slate-700 truncate group-hover:text-primary-700">
                                {pdf.title}
                              </span>
                            </div>
                            <span className="badge bg-slate-900 text-white text-[9px] font-bold px-2 py-1 flex items-center gap-1">
                              <FiLock size={9} /> SECURE VIEW
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No PDFs attached to this kit.</p>
                    )}
                  </div>

                  {/* Videos List */}
                  <div className="space-y-3 mt-5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">🎥 Solution Video Classes ({videoList.length})</h4>
                    {videoList.length > 0 ? (
                      <div className="space-y-2">
                        {videoList.map((video, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => setActiveVideo(video)}
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-rose-200 hover:bg-rose-50/40 cursor-pointer group transition-all"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-8 h-8 rounded-lg bg-red-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                                <FiPlay size={16} />
                              </span>
                              <span className="text-xs font-semibold text-slate-700 truncate group-hover:text-rose-700">
                                {video.title}
                              </span>
                            </div>
                            <span className="badge bg-rose-600 text-white text-[9px] font-bold px-2 py-1 flex items-center gap-1">
                              <FiEye size={10} /> PLAY VIDEO
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No video classes attached to this kit.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 border-t bg-slate-50 text-center">
                <span className="text-[11px] font-bold text-slate-400 flex items-center justify-center gap-1.5 uppercase">
                  🛡️ Copy & Screenshot Protection Active
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔐 SECURE PDF VIEWER MODAL */}
      {activePdf && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 select-none"
          onContextMenu={(e) => e.preventDefault()} // Disable Right-Click
        >
          {/* Print protection check styling again just in case */}
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body { display: none !important; }
              html { display: none !important; }
            }
          `}} />

          <div className="bg-slate-950 rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden border border-slate-800 shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900 text-white select-none">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center font-bold">PDF</div>
                <div>
                  <h3 className="font-bold text-sm leading-tight text-slate-100">{activePdf.title}</h3>
                  <p className="text-[10px] text-slate-400">D\'s Education Portal · Secured Document Viewer</p>
                </div>
              </div>
              <button 
                onClick={() => setActivePdf(null)} 
                className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <FiX size={22}/>
              </button>
            </div>

            {/* Viewer Workspace (Iframe + Dynamic Watermark Overlays) */}
            <div className="flex-1 bg-slate-900 relative overflow-hidden select-none">
              
              {/* Dynamic Watermark Layer (Rotated Diagonal Text repeating over the page) */}
              <div className="absolute inset-0 pointer-events-none z-30 select-none overflow-hidden opacity-[0.09] grid grid-cols-2 grid-rows-3 gap-8 p-12">
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i} 
                    className="flex flex-col items-center justify-center text-center font-bold font-mono text-sm sm:text-base text-white tracking-widest uppercase select-none pointer-events-none rotate-[20deg]"
                  >
                    <span>{student?.name || user?.name || "STUDENT"}</span>
                    <span>{student?.enrollmentNo || "D's Education"}</span>
                    <span>{student?.phone || "Confidential"}</span>
                    <span className="text-[10px] lowercase font-normal">Property of D's Education (DO NOT SHARE)</span>
                  </div>
                ))}
              </div>

              {/* Secure Embed Frame */}
              <iframe
                src={`${getCleanUrl(activePdf.url)}#toolbar=0&navpanes=0&scrollbar=0`}
                title={activePdf.title}
                className="w-full h-full border-none select-none pointer-events-auto"
                allow="autoplay"
              />

              {/* Cover click catcher to prevent print commands and right-clicks */}
              <div className="absolute top-0 right-0 w-24 h-12 bg-slate-900/10 pointer-events-none z-40" />
            </div>

            {/* Footer Protection Notification */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 text-center select-none text-[11px] text-slate-500 font-semibold tracking-wide">
              🔒 Copying, downloading, or printing this document is strictly prohibited. Security tracking active.
            </div>
          </div>
        </div>
      )}

      {/* 🎥 SECURE VIDEO MODAL */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md px-4">
          <div className="bg-slate-950 rounded-3xl w-full max-w-4xl overflow-hidden border border-slate-800 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <FiVideo className="text-rose-500" />
                <h3 className="font-bold text-sm leading-tight text-slate-100">{activeVideo.title}</h3>
              </div>
              <button 
                onClick={() => setActiveVideo(null)} 
                className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <FiX size={20}/>
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-[16/9] w-full bg-black">
              {activeVideo.url ? (
                <iframe
                  src={activeVideo.url.includes('youtube.com/embed') 
                    ? activeVideo.url 
                    : activeVideo.url.includes('youtube.com/watch') 
                      ? `https://www.youtube.com/embed/${activeVideo.url.split('v=')[1]?.split('&')[0]}`
                      : `https://www.youtube.com/embed/${activeVideo.url}`}
                  title={activeVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                  Video URL is not available.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
