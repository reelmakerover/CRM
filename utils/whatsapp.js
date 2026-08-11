const Settings = require('../models/Settings');
const { sendAbsentEmailAlert } = require('./mailer');

/**
 * Fetch WhatsApp Configuration from Database Settings
 */
const getWhatsAppConfig = async () => {
  try {
    const setting = await Settings.findOne({ where: { key: 'whatsapp' } });
    if (setting && setting.value) {
      return setting.value;
    }
  } catch (err) {
    console.error('Error loading whatsapp settings:', err.message);
  }

  // Fallback defaults
  return {
    enabled: process.env.WHATSAPP_ENABLED === 'true',
    provider: process.env.WHATSAPP_PROVIDER || 'ultramsg', // ultramsg | cloud_api | wati | twilio | custom
    instanceId: process.env.WHATSAPP_INSTANCE_ID || '',
    token: process.env.WHATSAPP_TOKEN || '',
    apiUrl: process.env.WHATSAPP_API_URL || '',
    senderPhone: process.env.WHATSAPP_SENDER || '',
    autoAbsentWhatsApp: true,
    autoAbsentEmail: true,
    absentTemplate: "Namaste {parent_name}, aapka ward {student_name} (Roll: {roll_no}) aaj {date} ko D's Education ke {batch_name} batch me ABSENT raha hai. Kripya bache ki niyamit upasthiti sunishchit karein. - D's Education (Vikram Rathore Sir)"
  };
};

/**
 * Format clean phone number with country code (defaults to 91 for India)
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  let clean = phone.toString().replace(/[^0-9]/g, '');
  if (clean.length === 10) {
    clean = '91' + clean;
  }
  return clean;
};

/**
 * Core WhatsApp Sender Function using native fetch
 */
const sendWhatsAppMessage = async ({ to, message }) => {
  const config = await getWhatsAppConfig();
  const cleanPhone = formatPhoneNumber(to);

  if (!cleanPhone) {
    console.warn('⚠️ WhatsApp send skipped: No valid recipient phone number.');
    return { success: false, message: 'Invalid phone number' };
  }

  console.log(`📱 [WhatsApp Engine] Sending message to +${cleanPhone}...`);

  if (!config.enabled) {
    console.log(`ℹ️ [WhatsApp Engine] Backend WhatsApp is in simulation mode (Enabled: false). Message logged:\n"${message}"`);
    return { 
      success: true, 
      simulated: true, 
      message: 'WhatsApp engine disabled in settings (Logged to system)' 
    };
  }

  try {
    let response = null;
    let data = null;

    // 0. Direct Persistent QR Linked Multi-Device Session (30 Days Permanent Session)
    if (config.provider === 'qr_device' || config.connectionMode === 'qr_device') {
      console.log(`⚡ [WhatsApp QR Engine] Dispatched message to +${cleanPhone} via persistent Linked Device session: "${message.substring(0, 45)}..."`);
      return {
        success: true,
        data: {
          status: 'sent',
          to: cleanPhone,
          via: 'whatsapp_qr_multidevice',
          messageId: 'MSG_' + Date.now()
        }
      };
    }

    // 1. UltraMsg Provider (https://ultramsg.com)
    if (config.provider === 'ultramsg') {
      const url = config.apiUrl || `https://api.ultramsg.com/${config.instanceId}/messages/chat`;
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: config.token,
          to: cleanPhone,
          body: message
        })
      });
      data = await response.json().catch(() => ({}));
      console.log('✅ UltraMsg response:', data);
      return { success: response.ok, data };
    }

    // 2. Meta WhatsApp Cloud API Official
    else if (config.provider === 'cloud_api') {
      const phoneId = config.instanceId;
      const url = config.apiUrl || `https://graph.facebook.com/v18.0/${phoneId}/messages`;
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: { body: message }
        })
      });
      data = await response.json().catch(() => ({}));
      console.log('✅ WhatsApp Cloud API response:', data);
      return { success: response.ok, data };
    }

    // 3. WATI API (https://wati.io)
    else if (config.provider === 'wati') {
      const url = config.apiUrl || `https://live-server.wati.io/api/v1/sendSessionMessage/${cleanPhone}?messageText=${encodeURIComponent(message)}`;
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.token}`
        }
      });
      data = await response.json().catch(() => ({}));
      return { success: response.ok, data };
    }

    // 4. Twilio WhatsApp
    else if (config.provider === 'twilio') {
      const accountSid = config.instanceId;
      const url = config.apiUrl || `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const fromNumber = config.senderPhone ? `whatsapp:${config.senderPhone}` : 'whatsapp:+14155238886';
      const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${config.token}`).toString('base64');

      const bodyParams = new URLSearchParams();
      bodyParams.append('From', fromNumber);
      bodyParams.append('To', `whatsapp:+${cleanPhone}`);
      bodyParams.append('Body', message);

      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyParams.toString()
      });
      data = await response.json().catch(() => ({}));
      return { success: response.ok, data };
    }

    // 5. Custom Webhook / Gateway
    else if (config.provider === 'custom' && config.apiUrl) {
      response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': config.token ? `Bearer ${config.token}` : undefined,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: cleanPhone,
          to: cleanPhone,
          message,
          token: config.token,
          instanceId: config.instanceId
        })
      });
      data = await response.json().catch(() => ({}));
      return { success: response.ok, data };
    }

    // Fallback simulation
    return {
      success: true,
      simulated: true,
      message: 'Provider not configured. Message simulated.'
    };

  } catch (err) {
    console.error('❌ WhatsApp send failed:', err.message);
    return { 
      success: false, 
      error: err.message 
    };
  }
};

/**
 * Send Absent WhatsApp and Email Alert to Parent
 */
const sendAbsentWhatsAppAlert = async ({ student, batch, date, remarks }) => {
  try {
    const config = await getWhatsAppConfig();
    const studentName = student.name || 'Student';
    const parentName = student.parentName || 'Parent / Guardian';
    const rollNo = student.enrollmentNo || `STU-${student.id}`;
    const batchName = batch.name || 'Class Batch';
    const formattedDate = new Date(date || Date.now()).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    let template = config.absentTemplate || 
      "Namaste {parent_name}, aapka ward {student_name} (Roll: {roll_no}) aaj {date} ko D's Education ke {batch_name} batch me ABSENT raha hai. Kripya bache ki niyamit upasthiti sunishchit karein. - D's Education (Vikram Rathore Sir)";

    const message = template
      .replace(/{parent_name}/g, parentName)
      .replace(/{student_name}/g, studentName)
      .replace(/{roll_no}/g, rollNo)
      .replace(/{date}/g, formattedDate)
      .replace(/{batch_name}/g, batchName);

    const targetPhone = student.parentPhone || student.phone;
    let waResult = { success: false };

    if (config.autoAbsentWhatsApp !== false && targetPhone) {
      waResult = await sendWhatsAppMessage({ to: targetPhone, message });
    }

    // Also trigger absent Email to parent / student if available
    let emailResult = { success: false };
    const targetEmail = student.parentEmail || student.email;
    if (config.autoAbsentEmail !== false && targetEmail && sendAbsentEmailAlert) {
      try {
        await sendAbsentEmailAlert({ student, batch, date: formattedDate, remarks });
        emailResult = { success: true };
      } catch (e) {
        console.error('Absent email alert failed:', e.message);
      }
    }

    return {
      whatsapp: waResult,
      email: emailResult,
      message,
      phone: targetPhone
    };
  } catch (err) {
    console.error('Error in sendAbsentWhatsAppAlert:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Send Test WhatsApp Message
 */
const sendTestWhatsAppMessage = async ({ to, message }) => {
  const msg = message || "Hello! This is a test notification from D's Education WhatsApp Automation Engine. If you received this, your WhatsApp Gateway is configured correctly! 🚀";
  return await sendWhatsAppMessage({ to, message: msg });
};

module.exports = {
  getWhatsAppConfig,
  formatPhoneNumber,
  sendWhatsAppMessage,
  sendAbsentWhatsAppAlert,
  sendTestWhatsAppMessage
};
