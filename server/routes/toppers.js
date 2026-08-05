const express = require('express');
const router = express.Router();
const Topper = require('../models/Topper');
const { protect, adminOnly } = require('../middleware/auth');

const upload = require('../middleware/upload');

router.get('/', async (req, res) => {
  try {
    const toppers = await Topper.findAll({ 
      where: { isActive: true },
      order: [['year', 'DESC']]
    });
    res.json(toppers);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

const fs = require('fs');

router.post('/', protect, adminOnly, upload.single('photo'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path);
      data.photo = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    const topper = await Topper.create(data);
    res.status(201).json(topper);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', protect, adminOnly, upload.single('photo'), async (req, res) => {
  try {
    const topper = await Topper.findByPk(req.params.id);
    if (!topper) return res.status(404).json({ message: 'Topper not found' });
    
    const data = { ...req.body };
    if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path);
      data.photo = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    
    await topper.update(data);
    res.json(topper);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const topper = await Topper.findByPk(req.params.id);
    if (!topper) return res.status(404).json({ message: 'Topper not found' });
    await topper.destroy();
    res.json({ message: 'Topper deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
