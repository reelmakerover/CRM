const express = require('express');
const router = express.Router();
const { getAllStudents, getStudent, createStudent, updateStudent, deleteStudent, updateFees, getStats } = require('../controllers/studentController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.get('/stats', adminOnly, getStats);
router.get('/', adminOnly, getAllStudents);
router.post('/', adminOnly, createStudent);
router.get('/:id', adminOnly, getStudent);
router.put('/:id', adminOnly, updateStudent);
router.delete('/:id', adminOnly, deleteStudent);
router.patch('/:id/fees', adminOnly, updateFees);

module.exports = router;
