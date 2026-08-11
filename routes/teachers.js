const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/teacherController');
const { protect, adminOnly, teacherOnly, teacherOrAdmin } = require('../middleware/auth');

// Admin manage teachers
router.get('/', protect, adminOnly, ctrl.getAllTeachers);
router.post('/', protect, adminOnly, ctrl.createTeacher);
router.put('/:id', protect, adminOnly, ctrl.updateTeacher);
router.delete('/:id', protect, adminOnly, ctrl.deleteTeacher);

// Teacher portal endpoints
router.get('/my-data', protect, teacherOrAdmin, ctrl.getMyTeacherData);

module.exports = router;
