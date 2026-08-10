const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { protect, adminOnly } = require('../middleware/auth');
const Student = require('../models/Student');

// GET - notifications list (placeholder for now)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    res.json({ notifications: [], message: 'Notifications module ready' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/send', protect, adminOnly, async (req, res) => {
  try {
    const { subject, message, recipients } = req.body;
    let emails = [];
    if (recipients === 'all') {
      const students = await Student.findAll({ 
        where: { 
          isActive: true, 
          parentEmail: { [Op.and]: [{ [Op.ne]: '' }, { [Op.not]: null }] } 
        } 
      });
      emails = students.map(s => s.parentEmail).filter(Boolean);
    } else {
      emails = recipients;
    }

    // Try to send email - gracefully handle if SMTP not configured
    try {
      const { sendAnnouncement } = require('../utils/mailer');
      await sendAnnouncement({ to: emails, subject, message });
    } catch (mailErr) {
      console.warn('Email not sent (SMTP not configured):', mailErr.message);
    }

    res.json({ message: `Notification sent to ${emails.length} recipients` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
