const express = require('express');
const router = express.Router();
const { getResults, getResult, getLeaderboard, createResult, updateResult, deleteResult } = require('../controllers/resultController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getResults);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/:id', protect, getResult);

router.post('/', protect, adminOnly, createResult);
router.put('/:id', protect, adminOnly, updateResult);
router.delete('/:id', protect, adminOnly, deleteResult);

module.exports = router;
