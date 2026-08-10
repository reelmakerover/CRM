import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../utils/api';
import { FiBook, FiZap, FiCheck, FiX, FiCreditCard, FiSend, FiFileText, FiVideo, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function TestSeriesPage() {
  const [examKits, setExamKits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Buy Now Checkout Modal State
  const [selectedKit, setSelectedKit] = useState(null);
  const [checkoutForm, setCheckoutForm] = useState({
    studentName: '',
    studentPhone: '',
    studentEmail: '',
    city: '',
    paymentMethod: 'UPI QR Code'
  });
  const [purchasing, setPurchasing] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);

  useEffect(() => {
    api.get('/exam-kits')
      .then(r => setExamKits(r.data || []))
      .catch(() => setExamKits([]))
      .finally(() => setLoading(false));
  }, []);

  const openCheckout = (kit) => {
    setSelectedKit(kit);
    setOrderConfirmed(null);
    setCheckoutForm({ studentName: '', studentPhone: '', studentEmail: '', city: '', paymentMethod: 'UPI QR Code' });
  };

  const handleConfirmPurchase = async (e) => {
    e.preventDefault();
    if (!checkoutForm.studentName || !checkoutForm.studentPhone || !checkoutForm.studentEmail) {
      return toast.error('Please enter name, phone, and email address');
    }

    setPurchasing(true);
    try {
      const { data } = await api.post('/exam-kits/order', {
        examKitId: selectedKit.id,
        studentName: checkoutForm.studentName,
        studentPhone: checkoutForm.studentPhone,
        studentEmail: checkoutForm.studentEmail,
        city: checkoutForm.city,
        paymentMethod: checkoutForm.paymentMethod,
        transactionRef: `UPI-TXN-${Math.floor(100000 + Math.random() * 900000)}`
      });

      toast.success('🎉 Purchase Successful! Receipt emailed to you.');
      setOrderConfirmed(data.order);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete order');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      {/* Hero Banner */}
      <div className="bg-hero-gradient pt-32 pb-16 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <div className="inline-flex items-center gap-2 glass text-amber-300 text-sm font-semibold px-4 py-2 rounded-full">
            <FiZap size={15} /> D's Education Official Test Series & Store
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white">Test Series & Exam Victory Kits</h1>
          <p className="text-primary-200 text-lg max-w-2xl mx-auto">
            Buy CA Intermediate, CA Foundation & 12th Board Test Series with attached PDF Test Papers, Answer Keys & Video Solution Classes.
          </p>

          {/* Separate Navigation Tab Bar */}
          <div className="pt-4 flex justify-center gap-3">
            <Link to="/courses" className="glass text-white/80 hover:text-white px-6 py-2.5 rounded-full text-sm font-semibold border border-white/20 transition-all">
              📚 Coaching Courses
            </Link>
            <span className="bg-amber-400 text-slate-950 px-6 py-2.5 rounded-full text-sm font-extrabold shadow-lg flex items-center gap-1.5">
              <FiZap /> 📝 Test Series & Store
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => <div key={i} className="h-80 rounded-3xl shimmer" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {examKits.map(kit => {
              let features = [];
              let pdfList = [];
              let videoList = [];

              try { features = typeof kit.features === 'string' ? JSON.parse(kit.features) : (kit.features || []); } catch(e){}
              try { pdfList = typeof kit.includedPdfs === 'string' ? JSON.parse(kit.includedPdfs) : (kit.includedPdfs || []); } catch(e){}
              try { videoList = typeof kit.includedVideos === 'string' ? JSON.parse(kit.includedVideos) : (kit.includedVideos || []); } catch(e){}

              return (
                <div key={kit.id} className="card overflow-hidden flex flex-col justify-between border-2 border-slate-200/80 hover:border-primary-500 shadow-lg hover:shadow-2xl transition-all duration-300 group">
                  <div>
                    {/* Thumbnail Banner */}
                    <div className="relative h-52 bg-slate-950 overflow-hidden">
                      <img
                        src={kit.thumbnailUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80'}
                        alt={kit.title}
                        className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 bg-rose-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-full shadow-lg">
                        SPECIAL DISCOUNT
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-6 flex flex-col justify-end">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="badge bg-amber-400 text-slate-950 font-bold text-xs">
                            {kit.categoryType || 'Test Series'}
                          </span>
                          <span className="badge bg-slate-800 text-white text-[11px]">
                            {kit.validity || '1 Year Validity'}
                          </span>
                        </div>
                        <h3 className="font-bold text-white text-xl md:text-2xl leading-snug drop-shadow">{kit.title}</h3>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-5">
                      <p className="text-slate-600 text-sm leading-relaxed">{kit.description}</p>

                      {/* Material Included Summary Badge */}
                      <div className="grid grid-cols-2 gap-3 p-3 bg-slate-100/70 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-primary-600 text-white flex items-center justify-center text-sm font-bold">
                            <FiFileText />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900">{pdfList.length} PDF Notes</div>
                            <div className="text-[10px] text-slate-500">Test papers & Keys</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center text-sm font-bold">
                            <FiVideo />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900">{videoList.length} Video Classes</div>
                            <div className="text-[10px] text-slate-500">Video solutions</div>
                          </div>
                        </div>
                      </div>

                      {/* Feature Checklist */}
                      <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Package Highlights:</div>
                        <ul className="space-y-2">
                          {features.map((f, i) => (
                            <li key={i} className="text-xs text-slate-700 font-medium flex items-center gap-2">
                              <FiCheck className="text-emerald-600 flex-shrink-0 font-bold" size={16} />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Price & Buy Now CTA */}
                  <div className="p-6 border-t bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-slate-400 font-semibold uppercase">Discount Price</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-slate-900 font-display">₹{Number(kit.sellingPrice).toLocaleString('en-IN')}</span>
                        <span className="text-sm text-slate-400 line-through font-semibold">₹{Number(kit.mrpPrice).toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => openCheckout(kit)}
                      className="btn-primary bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-8 py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm transition-all hover:scale-105 w-full sm:w-auto"
                    >
                      <FiZap size={16} /> ⚡ BUY NOW
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* INSTANT BUY NOW / UPI QR CHECKOUT MODAL */}
      {selectedKit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-slate-900 to-slate-800 text-white">
              <div>
                <span className="badge bg-amber-400 text-slate-950 font-bold text-[11px] uppercase">Instant Checkout</span>
                <h3 className="font-bold text-lg leading-tight mt-1">{selectedKit.title}</h3>
              </div>
              <button onClick={() => setSelectedKit(null)} className="p-1.5 hover:bg-white/20 rounded-full text-white"><FiX size={20}/></button>
            </div>

            {orderConfirmed ? (
              /* Order Confirmation View */
              <div className="p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
                  <FiCheck />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-900">Order Confirmed! 🎉</h3>
                  <p className="text-slate-600 text-sm">
                    Your Order ID is <strong className="text-primary-700 font-mono">{orderConfirmed.orderNo}</strong>.
                    Receipt & login details have been emailed to <strong>{orderConfirmed.studentEmail}</strong>.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border text-xs text-slate-700 text-left space-y-1.5">
                  <div className="font-bold text-slate-900">Order Summary:</div>
                  <div>Amount Paid: <strong>₹{Number(orderConfirmed.amountPaid).toLocaleString('en-IN')}</strong></div>
                  <div>Payment Method: <strong>{orderConfirmed.paymentMethod}</strong></div>
                  <div>Student Name: <strong>{orderConfirmed.studentName}</strong> ({orderConfirmed.studentPhone})</div>
                </div>

                <button onClick={() => setSelectedKit(null)} className="btn-primary w-full py-3">
                  Done & Close Storefront
                </button>
              </div>
            ) : (
              /* Checkout Form & UPI QR */
              <form onSubmit={handleConfirmPurchase} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                  <div>
                    <div className="text-xs font-bold text-amber-900">PACKAGE TOTAL PRICE</div>
                    <div className="text-2xl font-extrabold text-slate-900 font-display">
                      ₹{Number(selectedKit.sellingPrice).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <span className="badge bg-emerald-600 text-white font-bold text-xs px-3 py-1">
                    Instant Access Enabled
                  </span>
                </div>

                {/* Customer Info */}
                <div className="space-y-3">
                  <div>
                    <label className="label">Your Name *</label>
                    <input
                      type="text"
                      value={checkoutForm.studentName}
                      onChange={e => setCheckoutForm(p => ({ ...p, studentName: e.target.value }))}
                      className="input w-full text-xs"
                      placeholder="e.g. Priya Sharma"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Phone Number *</label>
                      <input
                        type="tel"
                        value={checkoutForm.studentPhone}
                        onChange={e => setCheckoutForm(p => ({ ...p, studentPhone: e.target.value }))}
                        className="input w-full text-xs"
                        placeholder="9876543210"
                        required
                      />
                    </div>

                    <div>
                      <label className="label">Email Address *</label>
                      <input
                        type="email"
                        value={checkoutForm.studentEmail}
                        onChange={e => setCheckoutForm(p => ({ ...p, studentEmail: e.target.value }))}
                        className="input w-full text-xs"
                        placeholder="student@example.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Option */}
                <div className="space-y-3">
                  <label className="label">Choose Payment Method *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['UPI QR Code', 'Net Banking / Card', 'Cash / Pay at Center'].map(pm => (
                      <button
                        type="button"
                        key={pm}
                        onClick={() => setCheckoutForm(p => ({ ...p, paymentMethod: pm }))}
                        className={`p-3 rounded-xl text-xs font-bold border transition-all text-center ${
                          checkoutForm.paymentMethod === pm ? 'bg-primary-600 text-white border-primary-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {pm}
                      </button>
                    ))}
                  </div>
                </div>

                {/* UPI QR Display if UPI selected */}
                {checkoutForm.paymentMethod === 'UPI QR Code' && (
                  <div className="p-4 bg-slate-900 text-white rounded-2xl text-center space-y-3">
                    <div className="text-xs font-bold text-amber-400 flex items-center justify-center gap-1.5">
                      <FiCreditCard size={16} /> Scan UPI QR Code to Pay ₹{Number(selectedKit.sellingPrice).toLocaleString('en-IN')}
                    </div>
                    <div className="bg-white p-3 rounded-xl w-40 h-40 mx-auto flex items-center justify-center shadow-lg">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=dseducation@upi%26pn=DsEducation%26am=${selectedKit.sellingPrice}`}
                        alt="UPI QR Code"
                        className="w-full h-full"
                      />
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono">UPI ID: dseducation@upi (GPay / PhonePe / Paytm)</div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button type="button" onClick={() => setSelectedKit(null)} className="btn-secondary text-sm">Cancel</button>
                  <button type="submit" disabled={purchasing} className="btn-primary text-sm flex items-center gap-2">
                    {purchasing ? 'Processing Order...' : <><FiSend /> Confirm Order & Complete</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
