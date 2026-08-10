const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, superproadminOnly } = require('../middleware/auth');

// Apply middleware to all routes
router.use(protect);
router.use(superproadminOnly);

// @route   GET /api/superproadmin/superadmins
// @desc    Get all Super Admins with their current visible passwords
router.get('/superadmins', async (req, res) => {
  try {
    const superadmins = await User.findAll({
      where: { role: 'superadmin' },
      attributes: { exclude: ['password'] }
    });
    res.json(superadmins);
  } catch (err) {
    console.error('Error fetching superadmins:', err);
    res.status(500).json({ message: 'Server error fetching superadmins' });
  }
});

// @route   POST /api/superproadmin/superadmins
// @desc    Create a new Super Admin
router.post('/superadmins', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    
    let user = await User.findOne({ where: { email } });
    if (user) return res.status(400).json({ message: 'User with this email already exists' });

    user = await User.create({
      name,
      email,
      password,
      role: 'superadmin',
      permissions: ['students', 'courses', 'batches', 'exams', 'questions', 'results', 'notifications', 'settings']
    });
    
    res.status(201).json({
      message: 'Super Admin created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        visiblePassword: user.visiblePassword
      }
    });
  } catch (err) {
    console.error('Error creating superadmin:', err);
    res.status(500).json({ message: err.message || 'Server error creating superadmin' });
  }
});

// @route   PUT /api/superproadmin/superadmins/:id
// @desc    Update Super Admin details (name, email)
router.put('/superadmins/:id', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Super Admin not found' });
    if (user.role !== 'superadmin') return res.status(400).json({ message: 'User is not a Super Admin' });

    if (name) user.name = name;
    if (email) user.email = email;
    await user.save();

    res.json({
      message: 'Super Admin details updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        visiblePassword: user.visiblePassword
      }
    });
  } catch (err) {
    console.error('Error updating superadmin:', err);
    res.status(500).json({ message: err.message || 'Server error updating superadmin' });
  }
});

// @route   PUT /api/superproadmin/superadmins/:id/password
// @desc    Change Super Admin password (updates hashed password and visiblePassword)
router.put('/superadmins/:id/password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Super Admin not found' });
    if (user.role !== 'superadmin') return res.status(400).json({ message: 'Can only change password for Super Admins' });

    user.password = newPassword;
    await user.save();

    res.json({
      message: `Password for ${user.name} changed successfully!`,
      visiblePassword: user.visiblePassword
    });
  } catch (err) {
    console.error('Error changing superadmin password:', err);
    res.status(500).json({ message: err.message || 'Server error changing password' });
  }
});

// @route   DELETE /api/superproadmin/superadmins/:id
// @desc    Delete a Super Admin
router.delete('/superadmins/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Super Admin not found' });
    if (user.role !== 'superadmin') return res.status(400).json({ message: 'Can only delete Super Admins' });

    await user.destroy();
    res.json({ message: 'Super Admin removed successfully' });
  } catch (err) {
    console.error('Error deleting superadmin:', err);
    res.status(500).json({ message: err.message || 'Server error deleting superadmin' });
  }
});

// @route   GET /api/superproadmin/stats
// @desc    Get system overview stats for Super Pro Admin
router.get('/stats', async (req, res) => {
  try {
    const totalSuperAdmins = await User.count({ where: { role: 'superadmin' } });
    const totalAdmins = await User.count({ where: { role: 'admin' } });
    const totalStudents = await User.count({ where: { role: 'student' } });

    res.json({ totalSuperAdmins, totalAdmins, totalStudents });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
});

module.exports = router;
