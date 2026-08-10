import React, { useState, useEffect } from 'react';
import { FiSave, FiLayout, FiInfo, FiPhone, FiMapPin, FiMail, FiGlobe, FiPlus, FiTrash2, FiStar, FiDollarSign, FiCheck, FiImage, FiUploadCloud, FiExternalLink, FiUsers } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function WebsiteContentManager() {
  const [settings, setSettings] = useState({
    site_title: "D's Education",
    site_subtitle: "By Vikram Rathore Sir",
    site_logo: "",
    hero_title: "Shape Your Future with India's Best Commerce Coaching",
    hero_subtitle: "D's Education provides results-driven coaching for 11th, 12th, BCom, BBA, CA, CMA, and CS with a focus on conceptual clarity and success.",
    contact_email: "info@dseducation.in",
    contact_phone: "+91 98765 43210",
    contact_address: "D's Education Centre, Main Market, Jaipur, Rajasthan 302001",
    stat_students: "5000",
    stat_selections: "1500",
    stat_experience: "15",
    why_us: [],
    testimonials: [],
    fee_plans: [],
    // Banners
    banner_course_1: {
      title: "12th Board Victory Batch 2026",
      subtitle: "Complete CBSE & State Board Test Series, Formulas & Video Solution Key",
      badge: "🔥 NEW ADMISSION OPEN",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
      link: "/batches",
      active: true
    },
    banner_course_2: {
      title: "CA Foundation Nov 2026 Master Series",
      subtitle: "ICAI Pattern Mock Tests, Doubts Sessions & Paper Solution Classes",
      badge: "🎯 STARTS MAY 15",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80",
      link: "/courses",
      active: true
    },
    banner_bottom: {
      title: "⭐ Special Commerce Merit Scholarship Test 2026",
      subtitle: "Get up to 100% Fee Waiver & Personal Career Counseling with Vikram Rathore Sir",
      badge: "⚡ LIMITED SEATS AVAILABLE",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&auto=format&fit=crop&q=80",
      link: "/login",
      active: true
    },
    home_sliders: [],
    welcome_title: "Bharat's Trusted & Affordable Commerce Coaching Platform",
    welcome_subtitle: "Unlock your potential with D's Education. We provide results-driven commerce coaching led by Vikram Rathore Sir with a focus on deep conceptual clarity, board exam mastery, and professional certifications.",
    welcome_btn_text: "Get Started",
    welcome_btn_link: "/batches",
    welcome_dir_speech: "D's Education is where commerce students learn with focus and grow into board toppers!",
    welcome_dir_avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80",
    welcome_stu_speech: "Vikram Sir, how can I secure 95%+ in commerce boards?",
    welcome_stu_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState(null);

  useEffect(() => {
    api.get('/settings').then(r => {
      if (Object.keys(r.data).length > 0) {
        // Parse JSON strings back to objects/arrays for banner & array keys
        const objectKeys = ['banner_course_1', 'banner_course_2', 'banner_bottom', 'home_sliders', 'why_us', 'testimonials', 'fee_plans'];
        const parsed = { ...r.data };
        objectKeys.forEach(k => {
          if (parsed[k] && typeof parsed[k] === 'string') {
            try { parsed[k] = JSON.parse(parsed[k]); } catch(e) {}
          }
        });
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleBannerChange = (bannerKey, field, value) => {
    setSettings(prev => ({
      ...prev,
      [bannerKey]: {
        ...(prev[bannerKey] || {}),
        [field]: value
      }
    }));
  };

  // Upload Banner Image file
  const handleBannerFileUpload = async (bannerKey, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('banner', file);
    setUploadingSlot(bannerKey);

    try {
      const { data } = await api.post('/settings/upload-banner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      handleBannerChange(bannerKey, 'image', data.url);
      toast.success('Banner image uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const promises = Object.entries(settings).map(([key, value]) => 
        api.post('/settings', { key, value })
      );
      await Promise.all(promises);
      toast.success('All website content & banners saved successfully!');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Why Us array handlers
  const handleWhyUsChange = (index, field, value) => {
    const updated = [...(settings.why_us || [])];
    updated[index] = { ...updated[index], [field]: value };
    setSettings(p => ({ ...p, why_us: updated }));
  };
  const addWhyUs = () => {
    setSettings(p => ({
      ...p,
      why_us: [...(p.why_us || []), { icon: '⭐', title: 'New Feature', desc: 'Feature description...' }]
    }));
  };
  const removeWhyUs = (index) => {
    setSettings(p => ({
      ...p,
      why_us: (p.why_us || []).filter((_, i) => i !== index)
    }));
  };

  // Testimonials handlers
  const handleTestimonialChange = (index, field, value) => {
    const updated = [...(settings.testimonials || [])];
    updated[index] = { ...updated[index], [field]: value };
    setSettings(p => ({ ...p, testimonials: updated }));
  };
  const addTestimonial = () => {
    setSettings(p => ({
      ...p,
      testimonials: [...(p.testimonials || []), { name: 'Student Name', course: '12th Commerce', text: 'Great coaching!', stars: 5, avatar: 'SN' }]
    }));
  };
  const removeTestimonial = (index) => {
    setSettings(p => ({
      ...p,
      testimonials: (p.testimonials || []).filter((_, i) => i !== index)
    }));
  };

  // Fee Plans handlers
  const handleFeePlanChange = (index, field, value) => {
    const updated = [...(settings.fee_plans || [])];
    if (field === 'features') {
      value = typeof value === 'string' ? value.split('\n') : value;
    }
    updated[index] = { ...updated[index], [field]: value };
    setSettings(p => ({ ...p, fee_plans: updated }));
  };
  const addFeePlan = () => {
    setSettings(p => ({
      ...p,
      fee_plans: [...(p.fee_plans || []), { title: 'New Plan', price: '15000', period: '/year', features: ['Feature 1', 'Feature 2'] }]
    }));
  };
  const removeFeePlan = (index) => {
    setSettings(p => ({
      ...p,
      fee_plans: (p.fee_plans || []).filter((_, i) => i !== index)
    }));
  };

  const getSlidersArray = () => {
    if (!settings.home_sliders) return [];
    if (Array.isArray(settings.home_sliders)) return settings.home_sliders;
    try {
      return typeof settings.home_sliders === 'string' ? JSON.parse(settings.home_sliders) : [];
    } catch(e) {
      return [];
    }
  };

  const handleSliderChange = (index, field, value) => {
    const sliders = [...getSlidersArray()];
    sliders[index] = { ...sliders[index], [field]: value };
    setSettings(prev => ({ ...prev, home_sliders: sliders }));
  };

  const addSlider = () => {
    const sliders = [...getSlidersArray()];
    sliders.push({
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop&q=80',
      title: '12th Board Victory Batch 2026',
      subtitle: 'Complete Mock Tests & Formulas Sheets',
      badge: '🔥 ADMISSIONS OPEN',
      link: '/batches',
      active: true
    });
    setSettings(prev => ({ ...prev, home_sliders: sliders }));
  };

  const removeSlider = (index) => {
    const sliders = getSlidersArray().filter((_, i) => i !== index);
    setSettings(prev => ({ ...prev, home_sliders: sliders }));
  };

  const handleSliderFileUpload = async (index, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('banner', file);
    setUploadingSlot(`slider_${index}`);

    try {
      const { data } = await api.post('/settings/upload-banner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      handleSliderChange(index, 'image', data.url);
      toast.success('Slide image uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleAvatarFileUpload = async (settingKey, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('banner', file);
    setUploadingSlot(settingKey);

    try {
      const { data } = await api.post('/settings/upload-banner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSettings(prev => ({ ...prev, [settingKey]: data.url }));
      toast.success('Avatar image uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setUploadingSlot(null);
    }
  };

  const getImgSrc = (url) => {
    if (!url || typeof url !== 'string') return '';
    const dataIndex = url.indexOf('data:image/');
    if (dataIndex !== -1) {
      return url.substring(dataIndex);
    }
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (typeof window !== 'undefined' && window.location.port === '3000') {
      return `${typeof window !== 'undefined' && window.location.port === '3000' ? window.location.protocol + '//' + window.location.hostname + ':5000' : ''}${url}`;
    }
    return url.startsWith('/') ? url : `/${url}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Website Content & Banner Manager</h1>
          <p className="text-slate-500 text-sm">Manage Hero Text, Banners (with Dimensions), Why Us, Testimonials & Contacts</p>
        </div>
        <button onClick={handleSaveAll} disabled={saving} className="btn-primary py-2.5 px-6 flex items-center gap-2">
          <FiSave /> {saving ? 'Saving All...' : 'Save All Changes'}
        </button>
      </div>

      {/* Website Brand Name & Header Logo Settings */}
      <div className="card p-6 space-y-4 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-3">
          <FiGlobe className="text-primary-600" /> Website Brand Name & Header Logo Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Brand / Institute Name</label>
            <input 
              type="text" name="site_title" 
              value={settings.site_title || ''} 
              onChange={handleChange}
              placeholder="e.g. Pairfect / D's Education"
              className="input w-full" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tagline / Subtitle</label>
            <input 
              type="text" name="site_subtitle" 
              value={settings.site_subtitle || ''} 
              onChange={handleChange}
              placeholder="e.g. Two Soul One Style"
              className="input w-full" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Header Navbar Logo</label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center p-1">
                {settings.site_logo ? (
                  <img src={getImgSrc(settings.site_logo)} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs text-slate-400 font-bold">No Logo</span>
                )}
              </div>
              <label className="btn-secondary py-2 px-3 text-xs font-semibold rounded-xl cursor-pointer hover:bg-slate-200 transition-all flex items-center gap-1 shadow-sm">
                <FiUploadCloud /> {uploadingSlot === 'site_logo' ? 'Uploading...' : 'Upload Header Logo'}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  disabled={uploadingSlot === 'site_logo'}
                  onChange={e => handleAvatarFileUpload('site_logo', e.target.files[0])}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section Settings */}
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-3">
          <FiLayout className="text-primary-500" /> Hero Section Settings
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hero Main Title</label>
            <input 
              type="text" name="hero_title" 
              value={settings.hero_title || ''} 
              onChange={handleChange}
              className="input w-full" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hero Subtitle</label>
            <textarea 
              name="hero_subtitle" rows={3}
              value={settings.hero_subtitle || ''} 
              onChange={handleChange}
              className="input w-full resize-none" 
            />
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════
          HOMEPAGE TOP SLIDER CAROUSEL MANAGER
      ═════════════════════════════════════════════════════════ */}
      <div className="card p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FiLayout className="text-primary-500" /> Homepage Top Slides Carousel Slider
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Add and manage high-quality wide slide banners displayed at the top of the homepage.
            </p>
          </div>
          <button 
            type="button"
            onClick={addSlider} 
            className="btn-primary py-2 px-4 text-xs font-semibold rounded-xl flex items-center gap-1 self-start md:self-auto"
          >
            <FiPlus /> Add Slide
          </button>
        </div>

        <div className="space-y-6">
          {getSlidersArray().length === 0 ? (
            <p className="text-slate-400 text-sm italic text-center py-4">No custom slides added yet. Top carousel will automatically fall back to homepage promotional banners below.</p>
          ) : (
            getSlidersArray().map((slide, idx) => {
              const isUploading = uploadingSlot === `slider_${idx}`;
              return (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 relative">
                  <button 
                    type="button"
                    onClick={() => removeSlider(idx)} 
                    className="absolute top-4 right-4 text-rose-500 hover:text-rose-700 p-1 flex items-center gap-1 text-xs font-bold"
                  >
                    <FiTrash2 size={14} /> Remove Slide
                  </button>

                  <div className="flex items-center gap-2 border-b pb-2">
                    <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">#{idx + 1}</span>
                    <span className="font-semibold text-slate-800 text-sm">Slide Config</span>
                    <label className="ml-auto flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={slide.active !== false}
                        onChange={e => handleSliderChange(idx, 'active', e.target.checked)}
                        className="rounded border-slate-300 text-primary-600 focus:ring-0"
                      /> Active
                    </label>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Image Preview & Upload (Left) */}
                    <div className="lg:col-span-1 space-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase">Slide Image</label>
                      <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 h-40 flex items-center justify-center group">
                        {slide.image ? (
                          <img 
                            src={getImgSrc(slide.image)} 
                            alt="Slide Preview" 
                            className="w-full h-full object-cover group-hover:opacity-60 transition-opacity" 
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="text-center text-slate-500 p-4">
                            <FiImage className="mx-auto text-3xl mb-1 opacity-50" />
                            <span className="text-xs">No image uploaded</span>
                          </div>
                        )}
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white text-xs font-medium gap-1">
                          <FiUploadCloud size={24} className="text-gold-400" />
                          <span>{isUploading ? 'Uploading...' : 'Click to Upload'}</span>
                          <span className="text-[10px] text-slate-300">(Req: 1920×380 px)</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            disabled={isUploading}
                            onChange={e => handleSliderFileUpload(idx, e.target.files[0])}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Slide Information Forms (Right) */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Badge (e.g. SPECIAL OFFER)</label>
                        <input 
                          type="text" 
                          value={slide.badge || ''} 
                          onChange={e => handleSliderChange(idx, 'badge', e.target.value)}
                          placeholder="e.g. 🔥 NEW BATCH"
                          className="input w-full text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Redirect Link</label>
                        <input 
                          type="text" 
                          value={slide.link || ''} 
                          onChange={e => handleSliderChange(idx, 'link', e.target.value)}
                          placeholder="e.g. /batches or /courses"
                          className="input w-full text-xs"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Slide Main Title</label>
                        <input 
                          type="text" 
                          value={slide.title || ''} 
                          onChange={e => handleSliderChange(idx, 'title', e.target.value)}
                          placeholder="e.g. NEET Batches for Class 11th, 12th & Droppers"
                          className="input w-full text-xs"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Subtitle / Description Overlay</label>
                        <input 
                          type="text" 
                          value={slide.subtitle || ''} 
                          onChange={e => handleSliderChange(idx, 'subtitle', e.target.value)}
                          placeholder="e.g. Unlock your potential by signing up with our premier course modules"
                          className="input w-full text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════
          PLATFORM INTRODUCTION SECTION (PW STYLE)
      ═════════════════════════════════════════════════════════ */}
      <div className="card p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b pb-3">
            <FiUsers className="text-primary-500" /> Platform Welcome Introduction (Physics Wallah style)
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Redesign the interactive section showing Vikram Sir and a student avatar with customizable speech bubbles.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Section Title</label>
              <input 
                type="text" 
                value={settings.welcome_title || ''} 
                onChange={e => setSettings(prev => ({ ...prev, welcome_title: e.target.value }))}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CTA Button Text</label>
              <input 
                type="text" 
                value={settings.welcome_btn_text || ''} 
                onChange={e => setSettings(prev => ({ ...prev, welcome_btn_text: e.target.value }))}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CTA Button Link</label>
              <input 
                type="text" 
                value={settings.welcome_btn_link || ''} 
                onChange={e => setSettings(prev => ({ ...prev, welcome_btn_link: e.target.value }))}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Section Description/Subtitle</label>
              <textarea 
                rows={2}
                value={settings.welcome_subtitle || ''} 
                onChange={e => setSettings(prev => ({ ...prev, welcome_subtitle: e.target.value }))}
                className="input w-full resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            {/* Director Section */}
            <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50 space-y-4">
              <span className="font-bold text-sm text-primary-700 flex items-center gap-1">👨‍🏫 Director Avatar Config</span>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Vikram Sir's Speech Text</label>
                <textarea 
                  rows={2}
                  value={settings.welcome_dir_speech || ''} 
                  onChange={e => setSettings(prev => ({ ...prev, welcome_dir_speech: e.target.value }))}
                  className="input w-full text-xs resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Director Image / Avatar</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full border border-slate-300 bg-white overflow-hidden flex-shrink-0 shadow-inner">
                    <img 
                      src={getImgSrc(settings.welcome_dir_avatar)} 
                      alt="Director Avatar" 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <label className="btn-secondary py-1.5 px-3 text-xs font-semibold rounded-lg cursor-pointer hover:bg-slate-200 transition-all flex items-center gap-1 shadow-sm">
                    <FiUploadCloud /> {uploadingSlot === 'welcome_dir_avatar' ? 'Uploading...' : 'Change Avatar'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      disabled={uploadingSlot === 'welcome_dir_avatar'}
                      onChange={e => handleAvatarFileUpload('welcome_dir_avatar', e.target.files[0])}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Student Section */}
            <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50 space-y-4">
              <span className="font-bold text-sm text-gold-600 flex items-center gap-1">🎓 Student Avatar Config</span>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Student's Speech Text</label>
                <textarea 
                  rows={2}
                  value={settings.welcome_stu_speech || ''} 
                  onChange={e => setSettings(prev => ({ ...prev, welcome_stu_speech: e.target.value }))}
                  className="input w-full text-xs resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Student Image / Avatar</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full border border-slate-300 bg-white overflow-hidden flex-shrink-0 shadow-inner">
                    <img 
                      src={getImgSrc(settings.welcome_stu_avatar)} 
                      alt="Student Avatar" 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <label className="btn-secondary py-1.5 px-3 text-xs font-semibold rounded-lg cursor-pointer hover:bg-slate-200 transition-all flex items-center gap-1 shadow-sm">
                    <FiUploadCloud /> {uploadingSlot === 'welcome_stu_avatar' ? 'Uploading...' : 'Change Avatar'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      disabled={uploadingSlot === 'welcome_stu_avatar'}
                      onChange={e => handleAvatarFileUpload('welcome_stu_avatar', e.target.files[0])}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════
          HOMEPAGE BANNERS MANAGER (WITH REQUIRED DIMENSIONS)
      ═════════════════════════════════════════════════════════ */}
      <div className="card p-6 space-y-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl border border-slate-700 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-700 pb-4 gap-2">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FiImage className="text-gold-400" /> Homepage Promotional Banners Manager
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Upload custom banners for "Courses Offered" section (2 side-by-side) and Bottom Section (1 Full-width)
            </p>
          </div>
          <span className="badge bg-gold-400/20 text-gold-300 border border-gold-400/30 text-xs px-3 py-1">
            📐 Explicit Width × Height Specifications Included
          </span>
        </div>

        {/* 1. Courses Section Banners (2 Banners Side-by-Side) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gold-400 text-sm tracking-wide uppercase flex items-center gap-2">
              1. Courses Section Banners (2 Side-by-Side Banners Below Courses)
            </h3>
            <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              Ideal Layout: 2 Columns
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Banner 1 (Left) */}
            {['banner_course_1', 'banner_course_2'].map((key, idx) => {
              const bData = settings[key] || {};
              const titleLabel = idx === 0 ? "Course Banner 1 (Left Slot)" : "Course Banner 2 (Right Slot)";
              const isUploading = uploadingSlot === key;

              return (
                <div key={key} className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-4 relative">
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                    <span className="font-semibold text-white text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center justify-center">#{idx + 1}</span>
                      {titleLabel}
                    </span>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={bData.active !== false}
                        onChange={e => handleBannerChange(key, 'active', e.target.checked)}
                        className="rounded border-slate-600 bg-slate-900 text-rose-500 focus:ring-0"
                      /> Active on Homepage
                    </label>
                  </div>

                  {/* REQUIRED DIMENSION SPECIFICATION BADGE */}
                  <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-center justify-between text-xs text-rose-200 font-mono">
                    <span className="font-bold text-rose-400">📏 Recommended Dimensions:</span>
                    <span className="bg-rose-500/20 px-2.5 py-1 rounded-md font-bold text-white">
                      Width: 1920px | Height: 800px (16:9 / HD Banner)
                    </span>
                  </div>

                  {/* Image Preview & Upload Button */}
                  <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-700 h-36 flex items-center justify-center group">
                    {bData.image ? (
                      <img 
                        src={getImgSrc(bData.image)} 
                        alt="Banner Preview" 
                        className="w-full h-full object-cover group-hover:opacity-60 transition-opacity" 
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="text-center text-slate-500 p-4">
                        <FiImage className="mx-auto text-3xl mb-1 opacity-50" />
                        <span className="text-xs">No image uploaded</span>
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white text-xs font-medium gap-1">
                      <FiUploadCloud size={24} className="text-gold-400" />
                      <span>{isUploading ? 'Uploading...' : 'Click to Upload Banner Image'}</span>
                      <span className="text-[10px] text-slate-300">(Req: 1000×500 px)</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        disabled={isUploading}
                        onChange={e => handleBannerFileUpload(key, e.target.files[0])}
                      />
                    </label>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-slate-400">Banner Title</label>
                      <input 
                        type="text" 
                        value={bData.title || ''} 
                        onChange={e => handleBannerChange(key, 'title', e.target.value)}
                        placeholder="e.g. 12th Commerce Board Victory Batch"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-400">Subtitle / Description</label>
                      <input 
                        type="text" 
                        value={bData.subtitle || ''} 
                        onChange={e => handleBannerChange(key, 'subtitle', e.target.value)}
                        placeholder="e.g. Full test series & formula sheets package"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-slate-400">Badge Text</label>
                        <input 
                          type="text" 
                          value={bData.badge || ''} 
                          onChange={e => handleBannerChange(key, 'badge', e.target.value)}
                          placeholder="e.g. 🔥 NEW ADMISSION OPEN"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-400">Redirect Link</label>
                        <input 
                          type="text" 
                          value={bData.link || ''} 
                          onChange={e => handleBannerChange(key, 'link', e.target.value)}
                          placeholder="e.g. /batches or /courses"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Bottom Full-Width Banner Section */}
        <div className="space-y-4 pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gold-400 text-sm tracking-wide uppercase flex items-center gap-2">
              2. Bottom Full-Width Banner (Below Toppers / Above Footer)
            </h3>
            <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              Ideal Layout: 1 Full-Width Row
            </span>
          </div>

          {(() => {
            const key = 'banner_bottom';
            const bData = settings[key] || {};
            const isUploading = uploadingSlot === key;

            return (
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                  <span className="font-semibold text-white text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 text-xs font-bold flex items-center justify-center">★</span>
                    Bottom Full-Width Promotional Banner
                  </span>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={bData.active !== false}
                      onChange={e => handleBannerChange(key, 'active', e.target.checked)}
                      className="rounded border-slate-600 bg-slate-900 text-gold-500 focus:ring-0"
                    /> Active on Homepage
                  </label>
                </div>

                {/* REQUIRED DIMENSION SPECIFICATION BADGE */}
                <div className="bg-gold-500/10 border border-gold-500/30 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between text-xs text-gold-200 font-mono gap-2">
                  <span className="font-bold text-gold-400">📏 Recommended Dimensions:</span>
                  <span className="bg-gold-500/20 px-3 py-1 rounded-md font-bold text-white">
                    Width: 1920px | Height: 800px (16:9 / HD Banner)
                  </span>
                </div>

                {/* Wide Image Preview & Upload */}
                <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-700 h-44 flex items-center justify-center group">
                  {bData.image ? (
                    <img 
                      src={getImgSrc(bData.image)} 
                      alt="Bottom Banner Preview" 
                      className="w-full h-full object-cover group-hover:opacity-60 transition-opacity" 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="text-center text-slate-500 p-4">
                      <FiImage className="mx-auto text-3xl mb-1 opacity-50" />
                      <span className="text-xs">No image uploaded</span>
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white text-xs font-medium gap-1">
                    <FiUploadCloud size={28} className="text-gold-400" />
                    <span>{isUploading ? 'Uploading...' : 'Click to Upload Bottom Banner'}</span>
                    <span className="text-[10px] text-slate-300">(Req: 1000×500 px)</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      disabled={isUploading}
                      onChange={e => handleBannerFileUpload(key, e.target.files[0])}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-400">Banner Title</label>
                    <input 
                      type="text" 
                      value={bData.title || ''} 
                      onChange={e => handleBannerChange(key, 'title', e.target.value)}
                      placeholder="e.g. Special Commerce Merit Scholarship Test 2026"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400">Subtitle / Description</label>
                    <input 
                      type="text" 
                      value={bData.subtitle || ''} 
                      onChange={e => handleBannerChange(key, 'subtitle', e.target.value)}
                      placeholder="e.g. Get up to 100% Fee Waiver & Personal Counseling"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400">Badge Text</label>
                    <input 
                      type="text" 
                      value={bData.badge || ''} 
                      onChange={e => handleBannerChange(key, 'badge', e.target.value)}
                      placeholder="e.g. ⭐ SCHOLARSHIP ALERT"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400">Redirect Link</label>
                    <input 
                      type="text" 
                      value={bData.link || ''} 
                      onChange={e => handleBannerChange(key, 'link', e.target.value)}
                      placeholder="e.g. /login or /batches"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Why Us Features */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FiInfo className="text-gold-500" /> "Why Choose Us" Features
          </h2>
          <button onClick={addWhyUs} className="btn-secondary text-xs flex items-center gap-1"><FiPlus /> Add Feature</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(settings.why_us || []).map((w, idx) => (
            <div key={idx} className="p-4 border rounded-xl bg-slate-50 relative space-y-2">
              <button onClick={() => removeWhyUs(idx)} className="absolute top-3 right-3 text-rose-500 hover:text-rose-700 p-1"><FiTrash2 size={14}/></button>
              <div className="flex gap-2">
                <input type="text" value={w.icon || ''} onChange={e => handleWhyUsChange(idx, 'icon', e.target.value)} placeholder="Emoji/Icon" className="input w-20 text-center" />
                <input type="text" value={w.title || ''} onChange={e => handleWhyUsChange(idx, 'title', e.target.value)} placeholder="Title" className="input flex-1 font-semibold" />
              </div>
              <textarea rows={2} value={w.desc || ''} onChange={e => handleWhyUsChange(idx, 'desc', e.target.value)} placeholder="Description" className="input w-full text-xs resize-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FiStar className="text-amber-500" /> Student Testimonials
          </h2>
          <button onClick={addTestimonial} className="btn-secondary text-xs flex items-center gap-1"><FiPlus /> Add Testimonial</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(settings.testimonials || []).map((t, idx) => (
            <div key={idx} className="p-4 border rounded-xl bg-slate-50 relative space-y-2">
              <button onClick={() => removeTestimonial(idx)} className="absolute top-3 right-3 text-rose-500 hover:text-rose-700 p-1"><FiTrash2 size={14}/></button>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={t.name || ''} onChange={e => handleTestimonialChange(idx, 'name', e.target.value)} placeholder="Student Name" className="input font-semibold" />
                <input type="text" value={t.course || ''} onChange={e => handleTestimonialChange(idx, 'course', e.target.value)} placeholder="Course (e.g. 12th)" className="input" />
              </div>
              <textarea rows={2} value={t.text || ''} onChange={e => handleTestimonialChange(idx, 'text', e.target.value)} placeholder="Testimonial text..." className="input w-full text-xs resize-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Pricing / Fee Plans */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FiDollarSign className="text-violet-500" /> Course Fee Structure Plans
          </h2>
          <button onClick={addFeePlan} className="btn-secondary text-xs flex items-center gap-1"><FiPlus /> Add Plan</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(settings.fee_plans || []).map((p, idx) => (
            <div key={idx} className="p-4 border rounded-xl bg-slate-50 relative space-y-3">
              <button onClick={() => removeFeePlan(idx)} className="absolute top-3 right-3 text-rose-500 hover:text-rose-700 p-1"><FiTrash2 size={14}/></button>
              <div>
                <label className="text-xs font-semibold text-slate-500">Plan Title</label>
                <input type="text" value={p.title || ''} onChange={e => handleFeePlanChange(idx, 'title', e.target.value)} className="input" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Price (₹)</label>
                  <input type="text" value={p.price || ''} onChange={e => handleFeePlanChange(idx, 'price', e.target.value)} className="input" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Period</label>
                  <input type="text" value={p.period || '/year'} onChange={e => handleFeePlanChange(idx, 'period', e.target.value)} className="input" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Features (1 per line)</label>
                <textarea 
                  rows={4} 
                  value={Array.isArray(p.features) ? p.features.join('\n') : (p.features || '')} 
                  onChange={e => handleFeePlanChange(idx, 'features', e.target.value)} 
                  className="input text-xs resize-none" 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Details */}
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-3">
          <FiGlobe className="text-emerald-500" /> Contact Details
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <FiMail className="text-slate-400" /> Email Address
              </label>
              <input 
                type="email" name="contact_email" 
                value={settings.contact_email || ''} 
                onChange={handleChange}
                className="input w-full" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <FiPhone className="text-slate-400" /> Phone Number
              </label>
              <input 
                type="text" name="contact_phone" 
                value={settings.contact_phone || ''} 
                onChange={handleChange}
                className="input w-full" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
              <FiMapPin className="text-slate-400" /> Office Address
            </label>
            <input 
              type="text" name="contact_address" 
              value={settings.contact_address || ''} 
              onChange={handleChange}
              className="input w-full" 
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSaveAll} disabled={saving} className="btn-primary py-3 px-8 text-base flex items-center gap-2">
          <FiSave /> {saving ? 'Saving All...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}
