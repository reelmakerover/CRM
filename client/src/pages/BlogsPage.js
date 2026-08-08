import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../utils/api';
import { FiCalendar, FiUser, FiArrowRight, FiSearch, FiTag } from 'react-icons/fi';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/blogs').then(r => setBlogs(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = (blogs || []).filter(b => 
    (b?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (b?.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getImgUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${typeof window !== 'undefined' && window.location.port === '3000' ? window.location.protocol + '//' + window.location.hostname + ':5000' : ''}${url}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="bg-hero-gradient pt-32 pb-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Insights & News</h1>
          <p className="text-primary-200 text-lg">Stay updated with the latest in commerce education and career tips.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Search */}
        <div className="max-w-xl mx-auto mb-12 relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search articles by title or category..." 
            className="input pl-12 py-4 shadow-lg border-none text-base"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-96 rounded-2xl shimmer" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(blog => (
              <Link key={blog.id} to={`/blog/${blog.slug}`} className="card overflow-hidden group hover:shadow-2xl transition-all border border-slate-100 flex flex-col">
                <div className="h-56 overflow-hidden relative">
                  {blog.image ? (
                    <img src={getImgUrl(blog.image)} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">No Image</div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">{blog.category}</span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-4 font-medium">
                    <div className="flex items-center gap-1"><FiCalendar size={12}/> {new Date(blog.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    <div className="flex items-center gap-1"><FiUser size={12}/> {blog.author}</div>
                  </div>
                  <h2 className="font-display text-xl font-bold text-slate-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">{blog.title}</h2>
                  <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {blog.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                  </p>
                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-primary-600 text-sm font-bold flex items-center gap-1">Read More <FiArrowRight /></span>
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <FiTag size={10} /> {Array.isArray(blog.tags) ? blog.tags[0] : blog.tags.split(',')[0]}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div className="text-center py-20 text-slate-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-xl">No articles found matching your search.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
