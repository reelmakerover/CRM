const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const { sendLoginOtp, sendForgotPasswordOtp } = require('../utils/mailer');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '365d' });

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Login handler
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }


    // For Student role direct login
    let studentData = null;
    if (user.role === 'student') {
      studentData = await Student.findOne({ 
        where: { email }, 
        include: ['course', 'batch'] 
      });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
      student: studentData,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify 2FA OTP for Superadmin/Admin login
exports.verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP code are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.otpCode || user.otpCode !== otp.toString().trim() || user.otpPurpose !== 'login') {
      return res.status(400).json({ message: 'Invalid OTP code. Please check and try again.' });
    }

    if (new Date() > new Date(user.otpExpires)) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new code.' });
    }

    // Clear OTP fields upon successful verification
    user.otpCode = null;
    user.otpExpires = null;
    user.otpPurpose = null;
    await user.save();

    let studentData = null;
    if (user.role === 'student') {
      studentData = await Student.findOne({ 
        where: { email }, 
        include: ['course', 'batch'] 
      });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
      student: studentData,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Initiate Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'No account found registered with this email' });
    }

    const otp = generateOtp();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.otpPurpose = 'forgot_password';
    await user.save();

    await sendForgotPasswordOtp({ email: user.email, otp, name: user.name });

    res.json({
      message: `Password reset OTP code sent to ${email}`,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reset Password using OTP
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.otpCode || user.otpCode !== otp.toString().trim() || user.otpPurpose !== 'forgot_password') {
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    if (new Date() > new Date(user.otpExpires)) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Update password (triggers beforeSave hook to hash)
    user.password = newPassword;
    user.otpCode = null;
    user.otpExpires = null;
    user.otpPurpose = null;
    await user.save();

    res.json({ message: 'Password reset successfully! You can now log in with your new password.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Resend OTP
exports.resendOtp = async (req, res) => {
  try {
    const { email, purpose } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOtp();
    const targetPurpose = purpose || user.otpPurpose || 'login';
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.otpPurpose = targetPurpose;
    await user.save();

    if (targetPurpose === 'forgot_password') {
      await sendForgotPasswordOtp({ email: user.email, otp, name: user.name });
    } else {
      await sendLoginOtp({ email: user.email, otp, name: user.name, role: user.role });
    }

    res.json({ message: `A new 6-digit OTP code has been sent to ${email}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get User Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'otpCode', 'otpExpires', 'otpPurpose'] }
    });
    
    let studentData = null;
    if (user && user.role === 'student') {
      studentData = await Student.findOne({ 
        where: { email: user.email }, 
        include: ['course', 'batch'] 
      });
    }
    res.json({ user, student: studentData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Superadmin feature)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'User already exists' });
    
    const user = await User.create({ name, email, password, role: 'admin' });
    res.status(201).json({ message: 'Admin created successfully', user: { id: user.id, name, email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update User Profile (Name, Email, Phone, Parent Details)
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, parentName, parentPhone, address } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const { Op } = require('sequelize');
    const existing = await User.findOne({
      where: {
        email,
        id: { [Op.ne]: req.user.id }
      }
    });

    if (existing) {
      return res.status(400).json({ message: 'This email is already in use by another user' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const oldEmail = user.email;
    user.name = name;
    user.email = email;
    await user.save();

    let studentData = null;
    if (user.role === 'student') {
      let student = null;
      if (user.studentId) {
        student = await Student.findByPk(user.studentId);
      }
      if (!student) {
        student = await Student.findOne({ where: { email: oldEmail } });
      }

      if (student) {
        student.name = name;
        student.email = email;
        if (phone !== undefined) student.phone = phone;
        if (parentName !== undefined) student.parentName = parentName;
        if (parentPhone !== undefined) student.parentPhone = parentPhone;
        if (address !== undefined) student.address = address;
        await student.save();
        studentData = await Student.findByPk(student.id, { include: ['course', 'batch'] });
      }
    }

    res.json({
      message: 'Profile updated successfully!',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      student: studentData
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update User Password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

