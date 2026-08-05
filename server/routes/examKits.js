const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getPublicExamKits,
  getAdminExamKits,
  createExamKit,
  updateExamKit,
  deleteExamKit,
  createKitOrder,
  getAllOrders,
  uploadMediaFile
} = require('../controllers/examKitController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', getPublicExamKits);
router.post('/order', createKitOrder);

// Admin routes
router.get('/admin', protect, adminOnly, getAdminExamKits);
router.post('/', protect, adminOnly, createExamKit);
router.post('/upload-media', protect, adminOnly, upload.single('file'), uploadMediaFile);
router.put('/:id', protect, adminOnly, updateExamKit);
router.delete('/:id', protect, adminOnly, deleteExamKit);
router.get('/orders', protect, adminOnly, getAllOrders);

module.exports = router;
