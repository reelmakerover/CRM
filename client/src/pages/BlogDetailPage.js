import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../utils/api';
import { FiCalendar, FiUser, FiArrowLeft, FiShare2, FiClock, FiTag } from 'react-icons/fi';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    setLoading(true);
    api.get(`/blogs/${slug}`).then(r => {
      setBlog(r.data);
      // Fetch recent blogs for sidebar
      api.get('/blogs').then(res => setRecent(res.data.filter(b => b.slug !== slug).slice(0, 3)));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  const getImgUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${typeof window !== 'undefined' && window.location.port === '3000' ? window.location.protocol + '//' + window.location.hostname + ':5000' : ''}${url}`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  if (!blog) return <div className="min-h-screen flex items-center justify-center text-slate-500">Blog not found</div>;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero */}
      <div className="pt-24 pb-12 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          <Link to="/blogs" className="inline-flex items-center gap-2 text-primary-600 text-sm font-semibold mb-8 hover:gap-3 transition-all">
            <FiArrowLeft /> Back to Blogs
          </Link>
          <div className="mb-6">
            <span className="bg-primary-100 text-primary-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">{blog.category}</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">{blog.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 border-b border-slate-200 pb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">{blog.author[0]}</div>
              <span className="font-semibold text-slate-900">{blog.author}</span>
            </div>
            <div className="flex items-center gap-2"><FiCalendar /> {new Date(blog.createdAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            <div className="flex items-center gap-2"><FiClock /> 5 min read</div>
            <button className="ml-auto p-2 hover:bg-slate-200 rounded-full transition-colors"><FiShare2 /></button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {blog.image && (
              <div className="rounded-3xl overflow-hidden mb-10 shadow-xl">
                <img src={getImgUrl(blog.image)} alt={blog.title} className="w-full h-auto" />
              </div>
            )}
            <div 
              className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br/>') }}
            />
            
            {/* Tags */}
            {blog.tags && (
              <div className="mt-12 pt-8 border-t border-slate-100">
                <div className="flex flex-wrap gap-2">
                  <FiTag className="text-slate-400 mt-1" />
                  {(Array.isArray(blog.tags) ? blog.tags : blog.tags.split(',')).map(tag => (
                    <span key={tag} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-medium">#{tag.trim()}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-8">
              {/* Recent Articles */}
              <div className="bg-slate-50 rounded-3xl p-6">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                  Recent Articles
                </h3>
                <div className="space-y-6">
                  {recent.map(r => (
                    <Link key={r.id} to={`/blog/${r.slug}`} className="group block">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200">
                          {r.image && <img src={getImgUrl(r.image)} alt={r.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />}
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-primary-600 uppercase mb-1">{r.category}</div>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-2">{r.title}</h4>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="bg-primary-900 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-4">Start Your Journey Today</h3>
                  <p className="text-primary-200 text-sm mb-6">Join India's most trusted commerce institute and shape your future.</p>
                  <Link to="/batches" className="btn-gold w-full justify-center">View Batches</Link>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
