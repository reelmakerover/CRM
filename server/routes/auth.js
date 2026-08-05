const express = require('express');
const router = express.Router();
const { 
  login, 
  verifyLoginOtp, 
  forgotPassword, 
  resetPassword, 
  resendOtp, 
  getProfile, 
  updateProfile,
  updatePassword,
  createAdmin 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', login);
router.post('/verify-login-otp', verifyLoginOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-otp', resendOtp);

router.get('/profile', protect, getProfile);
router.put('/update-profile', protect, updateProfile);
router.put('/update-password', protect, updatePassword);
router.post('/create-admin', createAdmin);

module.exports = router;
