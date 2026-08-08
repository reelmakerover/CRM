const express = require('express');
const router = express.Router();
const { getAllBatches, createBatch, updateBatch, deleteBatch } = require('../controllers/batchController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getAllBatches);
router.post('/', protect, adminOnly, createBatch);
router.put('/:id', protect, adminOnly, updateBatch);
router.delete('/:id', protect, adminOnly, deleteBatch);

module.exports = router;
