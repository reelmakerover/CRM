const express = require('express');
const router = express.Router();
const { Blog } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all blogs (public)
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      where: { isPublished: true },
      order: [['createdAt', 'DESC']]
    });
    res.json(blogs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get single blog by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ where: { slug: req.params.slug } });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    
    // Increment views
    await blog.increment('views');
    
    res.json(blog);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

const fs = require('fs');

// Create blog (admin)
router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path);
      data.image = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    // Generate slug if not provided
    if (!data.slug) {
      data.slug = data.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }
    const blog = await Blog.create(data);
    res.status(201).json(blog);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update blog (admin)
router.put('/:id', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const data = { ...req.body };
    if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path);
      data.image = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    await blog.update(data);
    res.json(blog);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete blog (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    await blog.destroy();
    res.json({ message: 'Blog deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
