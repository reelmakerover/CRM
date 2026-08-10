const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, superadminOnly } = require('../middleware/auth');

// Apply middleware to all routes
router.use(protect);
router.use(superadminOnly);

// @route   GET /api/superadmin/admins
// @desc    Get all admins
router.get('/admins', async (req, res) => {
  try {
    const admins = await User.findAll({ 
      where: { role: 'admin' },
      attributes: { exclude: ['password'] }
    });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/superadmin/admins
// @desc    Create a new admin
router.post('/admins', async (req, res) => {
  try {
    const { name, email, password, permissions } = req.body;
    
    let user = await User.findOne({ where: { email } });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = await User.create({ name, email, password, role: 'admin', permissions: permissions || [] });
    
    res.status(201).json({ message: 'Admin created successfully', user: { id: user.id, name, email, permissions: user.permissions } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/superadmin/admins/:id
// @desc    Update admin permissions
router.put('/admins/:id', async (req, res) => {
  try {
    const { name, email, permissions } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Admin not found' });

    await user.update({
      name: name || user.name,
      email: email || user.email,
      permissions: permissions || user.permissions
    });

    res.json({ message: 'Admin updated successfully', user: { id: user.id, name: user.name, email: user.email, permissions: user.permissions } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/superadmin/admins/:id
// @desc    Delete an admin
router.delete('/admins/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Admin not found' });
    if (user.role !== 'admin') return res.status(400).json({ message: 'Can only delete admins' });

    await user.destroy();
    res.json({ message: 'Admin removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/superadmin/stats
// @desc    Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalAdmins = await User.count({ where: { role: 'admin' } });
    const totalStudents = await User.count({ where: { role: 'student' } });
    
    res.json({ totalAdmins, totalStudents });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
