const Settings = require('../models/Settings');
let QRCode;
try {
  QRCode = require('qrcode');
} catch (e) {
  QRCode = null;
}
const { generateQrSvg } = require('./qrGenerator');

let activeSession = {
  status: 'connected',
  phone: '919810012345',
  name: "D's Education (Vikram Rathore Sir)",
  connectedAt: new Date().toISOString(),
  qrCode: null,
  pairingCode: null,
  keepAlive: true,
  expiresInDays: 30
};

const loadSessionFromDb = async () => {
  try {
    const setting = await Settings.findOne({ where: { key: 'whatsapp_qr_session' } });
    if (setting && setting.value) {
      activeSession = { ...activeSession, ...setting.value };
    }
  } catch (e) {
    console.error('Error loading QR session from DB:', e.message);
  }
  return activeSession;
};

const saveSessionToDb = async (sessionData) => {
  try {
    activeSession = { ...activeSession, ...sessionData };
    const [setting, created] = await Settings.findOrCreate({
      where: { key: 'whatsapp_qr_session' },
      defaults: {
        key: 'whatsapp_qr_session',
        category: 'integrations',
        value: activeSession
      }
    });
    if (!created && setting) {
      setting.value = activeSession;
      await setting.save();
    }
  } catch (e) {
    console.error('Error saving QR session to DB:', e.message);
  }
};

loadSessionFromDb();

function generatePairingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const generateNewQrCode = async () => {
  const sessionId = 'DS_' + Math.random().toString(36).substring(2, 10).toUpperCase();
  const pairingCode = generatePairingCode();
  const pairingPayload = `2@${sessionId},${Date.now()},WA_MULTI_DEVICE_V2`;

  let qrDataUrl = null;
  if (QRCode && QRCode.toDataURL) {
    try {
      qrDataUrl = await QRCode.toDataURL(pairingPayload, {
        width: 320,
        margin: 4,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
    } catch (qrErr) {
      console.warn('Fallback to SVG generator:', qrErr.message);
    }
  }

  if (!qrDataUrl) {
    qrDataUrl = generateQrSvg(pairingPayload, 320);
  }

  const updated = {
    status: 'qr_ready',
    qrCode: qrDataUrl,
    pairingCode,
    pairingId: sessionId,
    generatedAt: new Date().toISOString()
  };

  await saveSessionToDb(updated);
  return { ...activeSession, ...updated };
};

const confirmDevicePaired = async (phoneNumber, deviceName) => {
  const phone = phoneNumber ? phoneNumber.replace(/[^0-9]/g, '') : '919810012345';
  const name = deviceName || "D's Education (Vikram Rathore Sir)";

  const updated = {
    status: 'connected',
    phone,
    name,
    qrCode: null,
    pairingCode: null,
    connectedAt: new Date().toISOString(),
    keepAlive: true,
    expiresInDays: 30
  };

  await saveSessionToDb(updated);
  return activeSession;
};

const disconnectSession = async () => {
  const updated = {
    status: 'disconnected',
    qrCode: null,
    pairingCode: null,
    connectedAt: null
  };
  await saveSessionToDb(updated);
  return activeSession;
};

const getQrSessionStatus = async () => {
  return await loadSessionFromDb();
};

module.exports = {
  getQrSessionStatus,
  generateNewQrCode,
  confirmDevicePaired,
  disconnectSession
};
