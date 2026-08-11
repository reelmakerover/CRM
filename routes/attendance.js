const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/attendanceController');
const { protect, teacherOrAdmin } = require('../middleware/auth');

// Attendance routes (Teacher & Admin)
router.post('/mark', protect, teacherOrAdmin, ctrl.markAttendance);
router.get('/batch/:batchId', protect, teacherOrAdmin, ctrl.getBatchAttendance);
router.get('/monthly/:batchId', protect, teacherOrAdmin, ctrl.getMonthlyBatchAttendance);
router.get('/student/:studentId', protect, ctrl.getStudentAttendance);
router.get('/stats', protect, teacherOrAdmin, ctrl.getAttendanceStats);
router.post('/log-whatsapp', protect, teacherOrAdmin, ctrl.logWhatsAppDispatch);

module.exports = router;
