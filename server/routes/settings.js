const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Admin get all settings
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const settings = await Settings.findAll();
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });
    res.json(map);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Public get homepage settings & banners
router.get('/public', async (req, res) => {
  try {
    const settings = await Settings.findAll();
    const map = {};
    settings.forEach(s => { 
      if (s.key !== 'smtp') { // exclude sensitive smtp credentials
        map[s.key] = s.value; 
      }
    });
    res.json(map);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Save or update setting
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { key, value } = req.body;
    const [setting] = await Settings.upsert({ key, value });
    res.json(setting);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Upload Banner Image
const fs = require('fs');
router.post('/upload-banner', protect, adminOnly, upload.single('banner'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }
    const fileBuffer = fs.readFileSync(req.file.path);
    const base64Data = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
    try { fs.unlinkSync(req.file.path); } catch (e) {}
    res.json({
      message: 'Banner saved to Database successfully!',
      url: base64Data
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
