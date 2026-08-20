const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Admin get all settings
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const settings = await Settings.findAll();
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });
    res.json(map);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Public get homepage settings & banners
router.get('/public', async (req, res) => {
  try {
    const settings = await Settings.findAll();
    const map = {};
    settings.forEach(s => { 
      if (s.key !== 'smtp') { // exclude sensitive smtp credentials
        map[s.key] = s.value; 
        if (typeof s.value === 'object' && s.value !== null && !Array.isArray(s.value)) {
          Object.assign(map, s.value);
        }
      }
    });
    res.json(map);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Save or update setting
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { key, value } = req.body;
    const [setting] = await Settings.upsert({ key, value });
    res.json(setting);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Upload Banner Image
const fs = require('fs');
router.post('/upload-banner', protect, adminOnly, upload.single('banner'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }
    const fileBuffer = fs.readFileSync(req.file.path);
    const base64Data = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
    try { fs.unlinkSync(req.file.path); } catch (e) {}
    res.json({
      message: 'Banner saved to Database successfully!',
      url: base64Data
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Test WhatsApp Dispatch
const { sendTestWhatsAppMessage } = require('../utils/whatsapp');
router.post('/test-whatsapp', protect, adminOnly, async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone) {
      return res.status(400).json({ message: 'Target phone number is required' });
    }
    const result = await sendTestWhatsAppMessage({ to: phone, message });
    if (result.success) {
      res.json({ message: 'WhatsApp message sent successfully!', result });
    } else {
      res.status(400).json({ message: result.error || 'Failed to send WhatsApp message', result });
    }
  } catch (err) {
    res.status(500).json({ message: err.message || 'WhatsApp test failed' });
  }
});

// Test Email Dispatch
router.post('/test-email', protect, adminOnly, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Target email address is required' });
    }
    const nodemailer = require('nodemailer');
    const smtpSettings = await Settings.findOne({ where: { key: 'smtp' } });
    const config = smtpSettings?.value;
    if (!config || !config.email || !config.password) {
      return res.status(400).json({ message: 'SMTP settings not configured yet' });
    }

    const transporter = nodemailer.createTransport({
      host: config.host || 'smtp.gmail.com',
      port: Number(config.port) || 587,
      secure: Number(config.port) === 465,
      auth: { user: config.email, pass: config.password }
    });

    await transporter.sendMail({
      from: `"D's Education Test" <${config.email}>`,
      to: email,
      subject: "✅ D's Education SMTP Test Email",
      html: "<div style='font-family: Arial; padding: 20px;'><h2>D's Education</h2><p>Your SMTP Email configuration is working perfectly! 🚀</p></div>"
    });

    res.json({ message: `Test email sent successfully to ${email}!` });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Email test failed' });
  }
});

// WhatsApp QR Multi-Device Session Endpoints
const qrEngine = require('../utils/whatsappQrEngine');

router.get('/whatsapp-qr-status', protect, adminOnly, async (req, res) => {
  try {
    const status = await qrEngine.getQrSessionStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/whatsapp-qr-init', protect, adminOnly, async (req, res) => {
  try {
    const session = await qrEngine.generateNewQrCode();
    res.json({ message: 'QR code generated successfully', session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/whatsapp-qr-pair', protect, adminOnly, async (req, res) => {
  try {
    const { phone, name } = req.body;
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '919810012345';
    const session = await qrEngine.confirmDevicePaired(cleanPhone, name);

    // Save WhatsApp provider as qr_device & enabled in DB
    const existing = await Settings.findOne({ where: { key: 'whatsapp' } });
    const currentVal = existing ? (existing.value || {}) : {};
    const updatedVal = {
      ...currentVal,
      enabled: true,
      provider: 'qr_device',
      senderPhone: cleanPhone
    };
    await Settings.upsert({ key: 'whatsapp', value: updatedVal });

    res.json({ message: 'Device successfully paired and linked for 30 days!', session, whatsapp: updatedVal });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/whatsapp-qr-disconnect', protect, adminOnly, async (req, res) => {
  try {
    const session = await qrEngine.disconnectSession();
    res.json({ message: 'WhatsApp session disconnected', session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

