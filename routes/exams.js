const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const ctrl = require('../controllers/examController');
const { protect, adminOnly, teacherOrAdmin } = require('../middleware/auth');

// Question management (Must be BEFORE /:id)
router.get('/questions/template', protect, teacherOrAdmin, ctrl.getQuestionTemplate);
router.get('/questions', protect, ctrl.getQuestions);
router.post('/seed-demo-data', protect, teacherOrAdmin, ctrl.seedDemoData);
router.post('/questions/import', protect, teacherOrAdmin, upload.single('file'), ctrl.importQuestions);
router.post('/questions/delete-all', protect, teacherOrAdmin, ctrl.deleteAllQuestions);
router.delete('/questions/all', protect, teacherOrAdmin, ctrl.deleteAllQuestions);
router.delete('/questions/:id', protect, teacherOrAdmin, ctrl.deleteQuestion);
router.post('/questions', protect, teacherOrAdmin, ctrl.addQuestion);
router.put('/questions/:id', protect, teacherOrAdmin, ctrl.updateQuestion);

// Exam management (Admin & Teacher)
router.get('/', protect, ctrl.getAllExams);
router.post('/', protect, teacherOrAdmin, ctrl.createExam);
router.put('/:id', protect, teacherOrAdmin, ctrl.updateExam);
router.delete('/:id', protect, teacherOrAdmin, ctrl.deleteExam);

// Student exam flow
router.get('/:id/start', protect, ctrl.startExam);
router.post('/:id/submit', protect, ctrl.submitExam);

module.exports = router;
