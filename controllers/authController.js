const jwt = require('jsonwebtoken');
const { Sequelize } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('../models/User');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Lead = require('../models/Lead');
const { sendLoginOtp, sendForgotPasswordOtp } = require('../utils/mailer');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '365d' });

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Student Self-Registration
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, courseId, city } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const cleanEmail = email.toString().trim().toLowerCase();
    const cleanPhone = phone ? phone.toString().trim() : '';

    // Check if User already exists
    const existingUser = await User.findOne({ where: { email: cleanEmail } });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists. Please login.' });
    }

    // Check if Student profile exists
    let student = await Student.findOne({ where: { email: cleanEmail } });
    if (!student && cleanPhone) {
      student = await Student.findOne({ where: { phone: cleanPhone } });
    }

    // 1. Create User
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: password.trim(),
      role: 'student',
      visiblePassword: password.trim(),
      phone: cleanPhone || null
    });

    if (!student) {
      // Generate unique enrollment number: DS-YYYY-RANDOM
      const year = new Date().getFullYear();
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const enrollmentNo = `DS-${year}-${randomDigits}`;

      // Resolve Course (Optional)
      let courseRecord = null;
      if (courseId) {
        courseRecord = await Course.findByPk(courseId);
      }

      // Create Student profile
      student = await Student.create({
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone || 'Not Provided',
        enrollmentNo,
        courseId: courseRecord ? courseRecord.id : null,
        address: city ? city.trim() : '',
        isActive: true,
        joinDate: new Date(),
        fees: {
          totalFees: 0,
          paidAmount: 0,
          pendingAmount: 0,
          installments: []
        }
      });

      // Also register as a Lead for admin telecallers/counselors
      try {
        await Lead.create({
          name: name.trim(),
          email: cleanEmail,
          phone: cleanPhone || 'Not Provided',
          courseName: courseRecord ? courseRecord.name : 'Commerce',
          city: city ? city.trim() : '',
          status: 'New Lead',
          source: 'Self Registered Free Account',
          notes: `Free Account Created on Portal. City: ${city || 'Not Specified'}. Enrollment ID: ${enrollmentNo}`,
          callerName: 'Portal Auto-Register',
          callCount: 0,
          statusUpdatedAt: new Date()
        });
      } catch (leadErr) {
        console.log('Lead creation note:', leadErr.message);
      }
    }

    let studentWithAssociations = null;
    try {
      studentWithAssociations = await Student.findOne({
        where: { id: student.id },
        include: ['course', 'batch']
      });
    } catch (e) {
      studentWithAssociations = student;
    }

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
      student: studentWithAssociations || student
    });
  } catch (err) {
    console.error('Error during student registration:', err);
    res.status(500).json({ message: err.message || 'Registration failed' });
  }
};

// Login handler
exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email/enrollment ID and password' });
    }
    const cleanInput = email.toString().trim();
    const cleanPass = password.toString().trim();

    let user = await User.findOne({ where: { email: cleanInput } });
    if (!user) {
      user = await User.findOne({ 
        where: sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), cleanInput.toLowerCase()) 
      });
    }

    // Try finding User directly by phone number
    if (!user) {
      user = await User.findOne({ where: { phone: cleanInput } });
    }

    if (!user) {
      // Check if student identifier was entered (Enrollment No or Phone)
      const student = await Student.findOne({
        where: {
          [Sequelize.Op.or]: [
            { enrollmentNo: cleanInput },
            { phone: cleanInput }
          ]
        }
      });
      if (student && student.email) {
        user = await User.findOne({ where: { email: student.email } });
      }
    }

    if (!user || !(await user.matchPassword(cleanPass))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Normalize user role string
    const rawRole = user.role ? user.role.toString().trim().toLowerCase() : 'student';
    const finalRole = ['teacher', 'faculty'].includes(rawRole) ? 'teacher' : rawRole;

    // For Student role direct login
    let studentData = null;
    if (finalRole === 'student') {
      try {
        studentData = await Student.findOne({ 
          where: { email: user.email }, 
          include: ['course', 'batch'] 
        });
      } catch (e) {
        studentData = await Student.findOne({ where: { email: user.email } });
      }
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: finalRole,
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

    const rawRole = user.role ? user.role.toString().trim().toLowerCase() : 'student';
    const finalRole = ['teacher', 'faculty'].includes(rawRole) ? 'teacher' : rawRole;

    let studentData = null;
    if (finalRole === 'student') {
      studentData = await Student.findOne({ 
        where: { email }, 
        include: ['course', 'batch'] 
      });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: finalRole,
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
    
    if (!user) return res.status(404).json({ message: 'User profile not found' });

    const rawRole = user.role ? user.role.toString().trim().toLowerCase() : 'student';
    const finalRole = ['teacher', 'faculty'].includes(rawRole) ? 'teacher' : rawRole;

    const userJson = user.toJSON();
    userJson.role = finalRole;

    let studentData = null;
    if (finalRole === 'student') {
      studentData = await Student.findOne({ 
        where: { email: user.email }, 
        include: ['course', 'batch'] 
      });
    }
    res.json({ user: userJson, student: studentData });
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

