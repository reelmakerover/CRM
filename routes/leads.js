const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { getAllLeads, createLead, updateLeadResponse, deleteLead, emailExcelReport, bulkImportLeads } = require('../controllers/leadController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getAllLeads);
router.post('/', protect, createLead);
router.post('/import', protect, upload.single('file'), bulkImportLeads);
router.put('/:id', protect, updateLeadResponse);
router.delete('/:id', protect, adminOnly, deleteLead);
router.post('/email-excel', protect, emailExcelReport);

module.exports = router;
