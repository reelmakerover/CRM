const express = require('express');
const router = express.Router();
const { Lecture, Course, Subject, Student } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');
const { Op } = require('sequelize');

// ==========================================
// PUBLIC ROUTE: Get free/demo lectures
// ==========================================
router.get('/free', async (req, res) => {
  try {
    const lectures = await Lecture.findAll({
      where: { isFree: true },
      include: [
        { model: Course, as: 'course', attributes: ['id', 'name'] },
        { model: Subject, as: 'subject', attributes: ['id', 'name', 'code'] }
      ],
      order: [['order', 'ASC'], ['createdAt', 'DESC']]
    });
    res.json(lectures);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// PROTECTED ROUTE: Get all lectures for user
// ==========================================
router.get('/', protect, async (req, res) => {
  try {
    const role = req.user.role;
    
    // Admins see all lectures
    if (['admin', 'superadmin', 'superproadmin'].includes(role)) {
      const lectures = await Lecture.findAll({
        include: [
          { model: Course, as: 'course', attributes: ['id', 'name'] },
          { model: Subject, as: 'subject', attributes: ['id', 'name', 'code'] }
        ],
        order: [['order', 'ASC'], ['createdAt', 'DESC']]
      });
      return res.json(lectures);
    }

    // Students see lectures of their course OR free lectures
    if (role === 'student') {
      let courseId = null;
      if (req.user.studentId) {
        const student = await Student.findByPk(req.user.studentId);
        if (student) {
          courseId = student.courseId;
        }
      }

      const whereClause = courseId 
        ? { [Op.or]: [{ courseId: courseId }, { isFree: true }] }
        : { isFree: true };

      const lectures = await Lecture.findAll({
        where: whereClause,
        include: [
          { model: Course, as: 'course', attributes: ['id', 'name'] },
          { model: Subject, as: 'subject', attributes: ['id', 'name', 'code'] }
        ],
        order: [['order', 'ASC'], ['createdAt', 'DESC']]
      });
      return res.json(lectures);
    }

    // Default empty array for unknown roles
    res.json([]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// ADMIN ROUTES
// ==========================================

// Create lecture
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { title, description, videoUrl, isFree, order, courseId, subjectId } = req.body;
    
    const lecture = await Lecture.create({
      title,
      description,
      videoUrl,
      isFree: isFree === 'true' || isFree === true,
      order: parseInt(order) || 0,
      courseId: courseId ? parseInt(courseId) : null,
      subjectId: subjectId ? parseInt(subjectId) : null
    });

    const fullLecture = await Lecture.findByPk(lecture.id, {
      include: [
        { model: Course, as: 'course', attributes: ['id', 'name'] },
        { model: Subject, as: 'subject', attributes: ['id', 'name', 'code'] }
      ]
    });
    
    res.status(201).json(fullLecture);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update lecture
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const lecture = await Lecture.findByPk(req.params.id);
    if (!lecture) return res.status(404).json({ message: 'Lecture not found' });

    const { title, description, videoUrl, isFree, order, courseId, subjectId } = req.body;
    
    await lecture.update({
      title: title || lecture.title,
      description: description !== undefined ? description : lecture.description,
      videoUrl: videoUrl || lecture.videoUrl,
      isFree: isFree !== undefined ? (isFree === 'true' || isFree === true) : lecture.isFree,
      order: order !== undefined ? parseInt(order) : lecture.order,
      courseId: courseId !== undefined ? (courseId ? parseInt(courseId) : null) : lecture.courseId,
      subjectId: subjectId !== undefined ? (subjectId ? parseInt(subjectId) : null) : lecture.subjectId
    });

    const updatedLecture = await Lecture.findByPk(lecture.id, {
      include: [
        { model: Course, as: 'course', attributes: ['id', 'name'] },
        { model: Subject, as: 'subject', attributes: ['id', 'name', 'code'] }
      ]
    });

    res.json(updatedLecture);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete lecture
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const lecture = await Lecture.findByPk(req.params.id);
    if (!lecture) return res.status(404).json({ message: 'Lecture not found' });
    
    await lecture.destroy();
    res.json({ message: 'Lecture deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
