import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiBook, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiShield, FiKey, FiArrowLeft, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  // Mode: 'login' | '2fa' | 'forgot_email' | 'forgot_reset'
  const [mode, setMode] = useState('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [show, setShow] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const { login, verifyLoginOtp, forgotPassword, resetPassword, resendOtp } = useAuth();
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
        if (res.role === 'superproadmin') navigate('/superproadmin/dashboard');
        else if (res.role === 'superadmin') navigate('/superadmin/dashboard');
        else if (res.role === 'admin') navigate('/admin/dashboard');
        else navigate('/student/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
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
      if (data.role === 'superproadmin') navigate('/superproadmin/dashboard');
      else if (data.role === 'superadmin') navigate('/superadmin/dashboard');
      else if (data.role === 'admin') navigate('/admin/dashboard');
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
        <div className="glass rounded-3xl p-8 shadow-glass transition-all duration-300">

          {/* MODE 1: Standard Login */}
          {mode === 'login' && (
            <>
              <h2 className="text-white font-semibold text-xl mb-1">Welcome Back</h2>
              <p className="text-primary-300 text-sm mb-6">Sign in to access your CRM & Portal</p>

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label className="block text-primary-200 text-sm font-medium mb-2">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" />
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder="your@email.com"
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-primary-400 focus:bg-white/15 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-primary-200 text-sm font-medium">Password</label>
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
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 pl-11 pr-12 py-3.5 rounded-xl focus:outline-none focus:border-primary-400 focus:bg-white/15 transition-all"
                    />
                    <button type="button" onClick={() => setShow(!show)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-400 hover:text-white transition-colors">
                      {show ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full btn-gold py-4 justify-center text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">Sign In <FiArrowRight /></span>
                  )}
                </button>
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
