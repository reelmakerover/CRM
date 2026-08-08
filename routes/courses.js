const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// ==========================================
// SUBJECTS ROUTES (Must be placed before /:id)
// ==========================================

// Get all subjects
router.get('/subjects', async (req, res) => {
  try {
    const where = req.query.course ? { courseId: req.query.course } : {};
    const subjects = await Subject.findAll({ where, include: ['course'] });
    res.json(subjects);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create subject
router.post('/subjects', protect, adminOnly, async (req, res) => {
  try {
    const { name, code, course, courseId, description } = req.body;
    const targetCourseId = course || courseId;
    const subject = await Subject.create({ name, code, courseId: targetCourseId, description });
    const fullSubject = await Subject.findByPk(subject.id, { include: ['course'] });
    res.status(201).json(fullSubject);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update subject
router.put('/subjects/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, code, course, courseId, description } = req.body;
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    
    const targetCourseId = course || courseId || subject.courseId;
    await subject.update({
      name: name || subject.name,
      code: code || subject.code,
      courseId: targetCourseId,
      description: description !== undefined ? description : subject.description
    });
    
    const updatedSubject = await Subject.findByPk(subject.id, { include: ['course'] });
    res.json(updatedSubject);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete subject
router.delete('/subjects/:id', protect, adminOnly, async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    await subject.destroy();
    res.json({ message: 'Subject deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ==========================================
// COURSES ROUTES
// ==========================================

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.findAll({ 
      where: { isActive: true },
      include: ['subjects']
    });
    res.json(courses);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

const fs = require('fs');

// Create course with image upload
router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path);
      data.image = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    if (typeof data.features === 'string') {
      try { data.features = JSON.parse(data.features); } catch(e) {}
    }
    const course = await Course.create(data);
    res.status(201).json(course);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update course with image upload
router.put('/:id', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    const data = { ...req.body };
    if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path);
      data.image = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    if (typeof data.features === 'string') {
      try { data.features = JSON.parse(data.features); } catch(e) {}
    }
    await course.update(data);
    res.json(course);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete course
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    await course.destroy();
    res.json({ message: 'Course deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
