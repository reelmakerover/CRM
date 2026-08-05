const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const ctrl = require('../controllers/examController');
const { protect, adminOnly } = require('../middleware/auth');

// Admin exam management
router.get('/', protect, ctrl.getAllExams);
router.post('/', protect, adminOnly, ctrl.createExam);
router.put('/:id', protect, adminOnly, ctrl.updateExam);
router.delete('/:id', protect, adminOnly, ctrl.deleteExam);

// Question management
router.get('/questions', protect, ctrl.getQuestions);
router.post('/questions', protect, adminOnly, ctrl.addQuestion);
router.put('/questions/:id', protect, adminOnly, ctrl.updateQuestion);
router.delete('/questions/:id', protect, adminOnly, ctrl.deleteQuestion);
router.post('/questions/import', protect, adminOnly, upload.single('file'), ctrl.importQuestions);

// Student exam flow
router.get('/:id/start', protect, ctrl.startExam);
router.post('/:id/submit', protect, ctrl.submitExam);

module.exports = router;
