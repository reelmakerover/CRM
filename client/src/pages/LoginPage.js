import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  FiBook, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, 
  FiShield, FiKey, FiArrowLeft, FiCheckCircle, FiRefreshCw, 
  FiUser, FiPhone, FiMapPin, FiLayers, FiZap 
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  // Mode: 'login' | 'register' | '2fa' | 'forgot_email' | 'forgot_reset'
  const [mode, setMode] = useState(initialMode);

  // Login Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Register Form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCity, setRegCity] = useState('');
  
  const [show, setShow] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const { login, register, verifyLoginOtp, forgotPassword, resetPassword, resendOtp } = useAuth();
  const navigate = useNavigate();

  // Step 1: Initial Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res && res.requireOtp) {
        toast.success('2FA Security OTP sent to your email!');
        setMode('2fa');
      } else {
        toast.success(`Welcome back, ${res.name}!`);
        const r = (res.role || '').toString().trim().toLowerCase();
        if (r === 'superproadmin') navigate('/superproadmin/dashboard');
        else if (r === 'superadmin') navigate('/superadmin/dashboard');
        else if (r === 'admin') navigate('/admin/dashboard');
        else if (['teacher', 'faculty'].includes(r)) navigate('/teacher/dashboard');
        else navigate('/student/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 1.5: Student Self-Registration Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      return toast.error('Please fill in all required fields');
    }
    if (regPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      const res = await register({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword.trim(),
        city: regCity.trim()
      });
      toast.success(`🎉 Account created successfully! Welcome, ${res.name}`);
      navigate('/student/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || (err.message === 'Network Error' ? 'Server is offline. Please ensure backend is running.' : 'Registration failed. Please try again.');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: 2FA OTP Submit
  const handle2FASubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      return toast.error('Please enter valid OTP code');
    }
    setLoading(true);
    try {
      const data = await verifyLoginOtp(email, otp);
      toast.success(`2FA Verification successful! Welcome ${data.name}`);
      const r = (data.role || '').toString().trim().toLowerCase();
      if (r === 'superproadmin') navigate('/superproadmin/dashboard');
      else if (r === 'superadmin') navigate('/superadmin/dashboard');
      else if (r === 'admin') navigate('/admin/dashboard');
      else if (['teacher', 'faculty'].includes(r)) navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Step 1: Send OTP
  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      toast.success(res.message || 'OTP sent to your email');
      setMode('forgot_reset');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Step 2: Reset Password
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      const res = await resetPassword(email, otp, newPassword);
      toast.success(res.message || 'Password reset successfully!');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setMode('login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async (purpose) => {
    setResending(true);
    try {
      const res = await resendOtp(email, purpose);
      toast.success(res.message || 'New OTP sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background particles */}
      {[...Array(8)].map((_, i) => (
        <div key={i} className="particle" style={{
          left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          width: `${Math.random() * 5 + 2}px`, height: `${Math.random() * 5 + 2}px`,
          animationDelay: `${Math.random() * 5}s`,
        }} />
      ))}
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-56 h-56 bg-gold-400/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FiBook className="text-white text-2xl" />
            </div>
          </Link>
          <h1 className="font-display text-3xl font-bold text-white mt-4">D's Education</h1>
        </div>

        {/* Main Card */}
        <div className="glass rounded-3xl p-7 sm:p-8 shadow-glass transition-all duration-300">

          {/* Top Tabs: Login vs Register (only when in login/register modes) */}
          {(mode === 'login' || mode === 'register') && (
            <div className="grid grid-cols-2 bg-white/10 p-1 rounded-2xl mb-6 border border-white/15">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  mode === 'login' 
                    ? 'bg-gold-400 text-slate-950 shadow-md' 
                    : 'text-primary-200 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  mode === 'register' 
                    ? 'bg-gold-400 text-slate-950 shadow-md' 
                    : 'text-primary-200 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* MODE 1: Standard Login */}
          {mode === 'login' && (
            <>
              <h2 className="text-white font-semibold text-xl mb-1">Welcome Back</h2>
              <p className="text-primary-300 text-sm mb-6">Sign in to access your CRM & Portal</p>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-primary-200 text-xs font-medium mb-1.5">Email / Enrollment ID</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" />
                    <input
                      type="text" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder="Email or Enrollment No"
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-primary-400 focus:bg-white/15 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-primary-200 text-xs font-medium">Password</label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot_email')}
                      className="text-gold-400 hover:text-gold-300 text-xs font-semibold transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" />
                    <input
                      type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                      placeholder="Your password"
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 pl-11 pr-12 py-3 rounded-xl focus:outline-none focus:border-primary-400 focus:bg-white/15 transition-all text-sm"
                    />
                    <button type="button" onClick={() => setShow(!show)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-400 hover:text-white transition-colors">
                      {show ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full btn-gold py-3.5 justify-center text-sm sm:text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-2">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">Sign In <FiArrowRight /></span>
                  )}
                </button>

                <div className="text-center pt-2">
                  <p className="text-xs text-primary-300">
                    New to D's Education?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="text-gold-400 hover:text-gold-300 font-bold underline ml-1"
                    >
                      Create Free Account
                    </button>
                  </p>
                </div>
              </form>
            </>
          )}

          {/* MODE 1.5: Student Self-Registration */}
          {mode === 'register' && (
            <>
              <div className="mb-4">
                <span className="badge bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  <FiZap className="inline mr-1" /> Free Student Access
                </span>
                <h2 className="text-white font-semibold text-xl mt-1.5">Create Free Account</h2>
                <p className="text-primary-300 text-xs mt-0.5">Start giving mock exams & explore courses</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Name */}
                <div>
                  <label className="block text-primary-200 text-xs font-medium mb-1">Full Name (पूरा नाम) *</label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400" />
                    <input
                      type="text" value={regName} onChange={e => setRegName(e.target.value)} required
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 pl-10 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-primary-400 text-sm"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-primary-200 text-xs font-medium mb-1">Email Address (ईमेल) *</label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400" />
                    <input
                      type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required
                      placeholder="your.email@gmail.com"
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 pl-10 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-primary-400 text-sm"
                    />
                  </div>
                </div>

                {/* Phone & City in 2 Cols */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-primary-200 text-xs font-medium mb-1">WhatsApp / Phone *</label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 text-xs" />
                      <input
                        type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} required
                        placeholder="9876543210"
                        className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 pl-8 pr-2 py-2.5 rounded-xl focus:outline-none focus:border-primary-400 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-primary-200 text-xs font-medium mb-1">City (शहर)</label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 text-xs" />
                      <input
                        type="text" value={regCity} onChange={e => setRegCity(e.target.value)}
                        placeholder="e.g. Indore"
                        className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 pl-8 pr-2 py-2.5 rounded-xl focus:outline-none focus:border-primary-400 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-primary-200 text-xs font-medium mb-1">Password (कम से कम 6 अक्षर) *</label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400" />
                    <input
                      type={showRegPass ? 'text' : 'password'} value={regPassword} onChange={e => setRegPassword(e.target.value)} required minLength={6}
                      placeholder="Create your password"
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 pl-10 pr-10 py-2.5 rounded-xl focus:outline-none focus:border-primary-400 text-sm"
                    />
                    <button type="button" onClick={() => setShowRegPass(!showRegPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary-400 hover:text-white transition-colors">
                      {showRegPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full btn-gold py-3.5 justify-center text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-3">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">Create Free Account <FiArrowRight /></span>
                  )}
                </button>

                <div className="text-center pt-1">
                  <p className="text-xs text-primary-300">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-gold-400 hover:text-gold-300 font-bold underline ml-1"
                    >
                      Sign In here
                    </button>
                  </p>
                </div>
              </form>
            </>
          )}

          {/* MODE 2: 2FA Security OTP Verification */}
          {mode === '2fa' && (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-400/20 text-gold-300 text-xs font-semibold mb-4">
                <FiShield className="text-sm" /> 2FA Security Verification
              </div>

              <h2 className="text-white font-semibold text-xl mb-1">Enter Verification Code</h2>
              <p className="text-primary-300 text-sm mb-6">
                We sent a 6-digit OTP code to <strong className="text-white">{email}</strong>.
              </p>

              <form onSubmit={handle2FASubmit} className="space-y-5">
                <div>
                  <label className="block text-primary-200 text-sm font-medium mb-2">6-Digit OTP Code</label>
                  <div className="relative">
                    <FiKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-400 text-lg" />
                    <input
                      type="text"
                      maxLength="6"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      required
                      placeholder="e.g. 123456"
                      className="w-full bg-white/10 border border-gold-400/50 text-gold-300 font-mono tracking-widest text-center text-2xl py-3.5 rounded-xl focus:outline-none focus:border-gold-400 focus:bg-white/15 transition-all"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full btn-gold py-4 justify-center text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying OTP...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">Verify & Login <FiCheckCircle /></span>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-primary-300 hover:text-white text-xs flex items-center gap-1 transition-colors"
                  >
                    <FiArrowLeft /> Back to Login
                  </button>

                  <button
                    type="button"
                    disabled={resending}
                    onClick={() => handleResend('login')}
                    className="text-gold-400 hover:text-gold-300 text-xs flex items-center gap-1 font-semibold transition-colors disabled:opacity-50"
                  >
                    <FiRefreshCw className={resending ? 'animate-spin' : ''} /> Resend OTP
                  </button>
                </div>
              </form>
            </>
          )}

          {/* MODE 3: Forgot Password - Step 1 Email Request */}
          {mode === 'forgot_email' && (
            <>
              <h2 className="text-white font-semibold text-xl mb-1">Forgot Password</h2>
              <p className="text-primary-300 text-sm mb-6">Enter your email to receive a password reset OTP</p>

              <form onSubmit={handleForgotEmailSubmit} className="space-y-5">
                <div>
                  <label className="block text-primary-200 text-sm font-medium mb-2">Registered Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" />
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder="your@email.com"
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-primary-400 focus:bg-white/15 transition-all"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full btn-gold py-4 justify-center text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending Code...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">Send Reset OTP <FiArrowRight /></span>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-primary-300 hover:text-white text-xs inline-flex items-center gap-1 transition-colors"
                  >
                    <FiArrowLeft /> Remembered Password? Login
                  </button>
                </div>
              </form>
            </>
          )}

          {/* MODE 4: Forgot Password - Step 2 Enter OTP & New Password */}
          {mode === 'forgot_reset' && (
            <>
              <h2 className="text-white font-semibold text-xl mb-1">Reset Your Password</h2>
              <p className="text-primary-300 text-sm mb-6">Enter the OTP sent to <strong className="text-white">{email}</strong></p>

              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-primary-200 text-sm font-medium mb-1">6-Digit Reset OTP Code</label>
                  <div className="relative">
                    <FiKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-400 text-lg" />
                    <input
                      type="text"
                      maxLength="6"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      required
                      placeholder="e.g. 123456"
                      className="w-full bg-white/10 border border-gold-400/50 text-gold-300 font-mono tracking-widest text-center text-xl py-3 rounded-xl focus:outline-none focus:border-gold-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-primary-200 text-sm font-medium mb-1">New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" />
                    <input
                      type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} required
                      placeholder="Minimum 6 characters"
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 pl-11 pr-12 py-3 rounded-xl focus:outline-none focus:border-primary-400 transition-all"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-400 hover:text-white transition-colors">
                      {showNew ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-primary-200 text-sm font-medium mb-1">Confirm New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" />
                    <input
                      type={showNew ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                      placeholder="Re-enter new password"
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 pl-11 pr-12 py-3 rounded-xl focus:outline-none focus:border-primary-400 transition-all"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full btn-gold py-3.5 justify-center text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Resetting Password...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">Set New Password <FiCheckCircle /></span>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-primary-300 hover:text-white text-xs flex items-center gap-1 transition-colors"
                  >
                    <FiArrowLeft /> Back to Login
                  </button>

                  <button
                    type="button"
                    disabled={resending}
                    onClick={() => handleResend('forgot_password')}
                    className="text-gold-400 hover:text-gold-300 text-xs flex items-center gap-1 font-semibold transition-colors disabled:opacity-50"
                  >
                    <FiRefreshCw className={resending ? 'animate-spin' : ''} /> Resend OTP
                  </button>
                </div>
              </form>
            </>
          )}

        </div>

        <p className="text-center text-primary-400 text-sm mt-6">
          <Link to="/" className="hover:text-white transition-colors">← Back to Homepage</Link>
        </p>
      </div>
    </div>
  );
}
