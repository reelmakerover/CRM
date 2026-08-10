const nodemailer = require('nodemailer');
const Settings = require('../models/Settings');

const getTransporter = async () => {
  const smtpSettings = await Settings.findOne({ where: { key: 'smtp' } });
  const config = smtpSettings?.value || {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    email: process.env.SMTP_EMAIL,
    password: process.env.SMTP_PASSWORD,
  };
  
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.email, pass: config.password },
  });
};

exports.sendExamResult = async ({ student, result, exam }) => {
  const transporter = await getTransporter();
  const smtpSettings = await Settings.findOne({ where: { key: 'smtp' } });
  const from = smtpSettings?.value?.email || process.env.SMTP_EMAIL;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 12px;">
      <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">D's Education</h1>
        <p style="color: #bfdbfe; margin: 5px 0 0 0;">Exam Result Notification</p>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none;">
        <p style="color: #374151; font-size: 16px;">Dear Parent/Guardian,</p>
        <p style="color: #374151;">We are pleased to share the exam result of <strong>${student.name}</strong>.</p>
        <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 4px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin: 0 0 15px 0;">Exam Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #6b7280;">Student Name:</td><td style="padding: 8px 0; font-weight: bold; color: #111827;">${student.name}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Exam:</td><td style="padding: 8px 0; font-weight: bold; color: #111827;">${exam.title}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Marks Obtained:</td><td style="padding: 8px 0; font-weight: bold; color: #111827;">${result.marksObtained} / ${result.totalMarks}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Percentage:</td><td style="padding: 8px 0; font-weight: bold; color: #111827;">${result.percentage?.toFixed(2)}%</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Grade:</td><td style="padding: 8px 0; font-weight: bold; color: #111827;">${result.grade}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Rank:</td><td style="padding: 8px 0; font-weight: bold; color: #1e40af;">#${result.rank}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Status:</td><td style="padding: 8px 0; font-weight: bold; color: ${result.status === 'pass' ? '#059669' : '#dc2626'};">${result.status.toUpperCase()}</td></tr>
          </table>
        </div>
        <p style="color: #374151; margin-top: 20px;">For detailed results and performance analysis, please visit the D's Education student portal.</p>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p>D's Education | Led by Vikram Rathore Sir</p>
          <p>Result-Driven Commerce Coaching</p>
        </div>
      </div>
    </div>
  `;
  
  await transporter.sendMail({
    from: `"D's Education" <${from}>`,
    to: student.parentEmail,
    subject: `Exam Result: ${student.name} scored ${result.percentage?.toFixed(1)}% in ${exam.title}`,
    html,
  });
};

exports.sendAnnouncement = async ({ to, subject, message }) => {
  const transporter = await getTransporter();
  const smtpSettings = await Settings.findOne({ where: { key: 'smtp' } });
  const from = smtpSettings?.value?.email || process.env.SMTP_EMAIL;
  
  await transporter.sendMail({
    from: `"D's Education" <${from}>`,
    to: Array.isArray(to) ? to.join(',') : to,
    subject,
    html: `<div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;">${message}</div>`,
  });
};

exports.sendWelcomeCredentials = async ({ student, email, password, courseName, enrollmentNo }) => {
  try {
    const transporter = await getTransporter();
    const smtpSettings = await Settings.findOne({ where: { key: 'smtp' } });
    const from = smtpSettings?.value?.email || process.env.SMTP_EMAIL || 'noreply@dseducation.in';
    const loginUrl = process.env.CLIENT_URL || 'http://localhost:3000/login';

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 16px;">
        <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 26px; font-weight: bold; letter-spacing: 0.5px;">D's Education</h1>
          <p style="color: #93c5fd; margin: 6px 0 0 0; font-size: 14px;">Welcome to India's Premier Commerce Coaching</p>
        </div>

        <div style="background: white; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
          <h2 style="color: #1e293b; margin-top: 0; font-size: 20px;">Welcome aboard, ${student.name}! 🎉</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            Your student account at <strong>D's Education</strong> has been created successfully. Below are your account and login credentials:
          </p>

          <div style="background: #f1f5f9; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <h3 style="color: #1e3a8a; margin: 0 0 16px 0; font-size: 16px;">🔑 Your Student Login Credentials</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; width: 40%;">Enrollment No:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${enrollmentNo}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Course Enrolled:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${courseName || 'Commerce Coaching'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Login Email:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #2563eb;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Password:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #0f172a; font-family: monospace; font-size: 16px;">${password}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${loginUrl}" style="background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
              Login to Student Portal &rarr;
            </a>
          </div>

          <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-top: 24px; border-top: 1px dashed #e2e8f0; padding-top: 16px;">
            🔒 For security purposes, please login and change your password after your first login.
          </p>

          <div style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 24px;">
            <p style="margin: 4px 0;">D's Education | Led by Vikram Rathore Sir</p>
            <p style="margin: 4px 0;">Result-Driven Commerce Coaching for 11th, 12th, BCom, CA & CS</p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"D's Education" <${from}>`,
      to: email,
      subject: `🎉 Welcome to D's Education! Your Login Credentials (${enrollmentNo})`,
      html,
    });
    console.log(`✉️ Login credentials email sent successfully to ${email}`);
  } catch (err) {
    console.error('Failed to send welcome credentials email:', err.message);
  }
};

exports.sendLeadExcelReport = async ({ toEmail, leads, triggerReason }) => {
  try {
    const xlsx = require('xlsx');
    const transporter = await getTransporter();
    const smtpSettings = await Settings.findOne({ where: { key: 'smtp' } });
    const from = smtpSettings?.value?.email || process.env.SMTP_EMAIL || 'noreply@dseducation.in';
    const recipient = toEmail || process.env.SMTP_EMAIL || 'admin@dseducation.com';

    // Build Excel Workbook
    const excelData = leads.map((l, index) => ({
      'S.No': index + 1,
      'Lead Name': l.name,
      'Phone Number': l.phone,
      'Email': l.email || 'N/A',
      'Course Interested': l.courseName || 'N/A',
      'Call Status': l.status,
      'Telecaller Name': l.callerName || 'Telecaller',
      'Call Response Notes': l.notes || 'No notes provided',
      'Total Calls Made': l.callCount || 1,
      'Last Called Date': l.lastCalledAt ? new Date(l.lastCalledAt).toLocaleString('en-IN') : new Date().toLocaleString('en-IN'),
      'Next Follow-Up Date': l.nextFollowUpDate || 'None'
    }));

    const worksheet = xlsx.utils.json_to_sheet(excelData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Telecaller Leads');

    const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    const currentDate = new Date().toISOString().slice(0, 10);
    const fileName = `Telecaller_Leads_Report_${currentDate}.xlsx`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 24px; border-radius: 8px 8px 0 0; text-align: center; color: white;">
          <h2 style="margin: 0;">📊 Telecaller Call Response Excel Report</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px;">D's Education Lead Management System</p>
        </div>
        <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
          <p>Hello Admin,</p>
          <p>Please find attached the updated <strong>Telecaller Leads & Call Response Report</strong> Excel spreadsheet.</p>
          <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p style="margin: 0; font-weight: bold; color: #065f46;">Report Summary:</p>
            <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #047857; font-size: 14px;">
              <li>Total Leads Logged: <strong>${leads.length}</strong></li>
              <li>Trigger Event: <strong>${triggerReason || 'Telecaller Response Submission'}</strong></li>
              <li>Date: <strong>${new Date().toLocaleDateString('en-IN')}</strong></li>
            </ul>
          </div>
          <p style="font-size: 13px; color: #64748b;">The complete Excel sheet (${fileName}) is attached to this email.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"D's Education CRM" <${from}>`,
      to: recipient,
      subject: `📊 Telecaller Lead Call Response Excel Report (${currentDate})`,
      html,
      attachments: [
        {
          filename: fileName,
          content: excelBuffer,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      ]
    });

    console.log(`📊 Telecaller Excel Lead Report emailed successfully to ${recipient}`);
  } catch (err) {
    console.error('Failed to send Telecaller Excel email:', err.message);
  }
};

exports.sendKitOrderReceipt = async ({ order, kit }) => {
  try {
    const transporter = await getTransporter();
    const smtpSettings = await Settings.findOne({ where: { key: 'smtp' } });
    const from = smtpSettings?.value?.email || process.env.SMTP_EMAIL || 'noreply@dseducation.in';
    const adminEmail = smtpSettings?.value?.email || process.env.SMTP_EMAIL || 'admin@dseducation.com';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 16px;">
        <div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); padding: 32px; border-radius: 12px 12px 0 0; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 26px;">D's Education</h1>
          <p style="margin: 6px 0 0 0; color: #bfdbfe; font-size: 14px;">Exam Kit Order & Purchase Receipt</p>
        </div>

        <div style="background: white; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
          <h2 style="color: #1e293b; margin-top: 0; font-size: 18px;">Thank you for your purchase, ${order.studentName}! 🎉</h2>
          <p style="color: #475569; font-size: 14px;">Your order for <strong>${kit.title}</strong> has been received & confirmed.</p>

          <div style="background: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e3a8a; margin: 0 0 15px 0; font-size: 15px;">🧾 Order Details</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 6px 0; color: #64748b;">Order ID:</td><td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${order.orderNo}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Exam Kit:</td><td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${kit.title}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Amount Paid:</td><td style="padding: 6px 0; font-weight: bold; color: #059669; font-size: 16px;">₹${Number(order.amountPaid).toLocaleString('en-IN')}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Payment Method:</td><td style="padding: 6px 0; font-weight: bold; color: #2563eb;">${order.paymentMethod}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Txn Reference:</td><td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${order.transactionRef || 'SUCCESS'}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Customer Phone:</td><td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${order.studentPhone}</td></tr>
            </table>
          </div>

          <p style="color: #475569; font-size: 14px;">Our student support team will contact you shortly to activate full portal & study notes access.</p>

          <div style="border-top: 1px dashed #cbd5e1; margin-top: 24px; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
            <p>D's Education | Led by Vikram Rathore Sir</p>
            <p>Result-Driven Commerce Coaching</p>
          </div>
        </div>
      </div>
    `;

    // Send receipt to student
    await transporter.sendMail({
      from: `"D's Education Store" <${from}>`,
      to: order.studentEmail,
      subject: `🎉 Order Receipt: ${kit.title} (${order.orderNo})`,
      html,
    });

    // Also notify admin
    await transporter.sendMail({
      from: `"D's Education Store" <${from}>`,
      to: adminEmail,
      subject: `💰 NEW EXAM KIT SALE: ₹${order.amountPaid} for ${kit.title} by ${order.studentName}`,
      html,
    });

    console.log(`✉️ Order receipt sent to ${order.studentEmail} & admin notified!`);
  } catch (err) {
    console.error('Failed to send kit order receipt email:', err.message);
  }
};

exports.sendLoginOtp = async ({ email, otp, name, role }) => {
  console.log(`\n==========================================`);
  console.log(`🔑 [2FA LOGIN OTP] For ${name} (${role})`);
  console.log(`📧 Email: ${email}`);
  console.log(`⚡ OTP CODE: ${otp}`);
  console.log(`==========================================\n`);

  try {
    const transporter = await getTransporter();
    const smtpSettings = await Settings.findOne({ where: { key: 'smtp' } });
    const from = smtpSettings?.value?.email || process.env.SMTP_EMAIL || 'noreply@dseducation.in';

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 16px;">
        <div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); padding: 28px; border-radius: 12px 12px 0 0; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">D's Education</h1>
          <p style="margin: 4px 0 0 0; color: #93c5fd; font-size: 13px;">Security 2FA Verification Code</p>
        </div>
        <div style="background: white; padding: 28px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
          <p style="color: #334155; font-size: 15px; margin-top: 0;">Hello <strong>${name}</strong> (${role.toUpperCase()}),</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.5;">
            A login request was received for your D's Education account. Use the following 6-digit OTP code to complete your login:
          </p>

          <div style="background: #eff6ff; border: 2px dashed #3b82f6; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0;">
            <div style="font-size: 12px; color: #1d4ed8; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Your One-Time Password</div>
            <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1e3a8a; font-family: monospace;">${otp}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 8px;">⏱ Valid for 10 minutes only</div>
          </div>

          <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
            If you did not request this login attempt, please change your password immediately or contact administration.
          </p>

          <div style="border-top: 1px solid #f1f5f9; margin-top: 24px; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
            D's Education Security Team | Result-Driven Commerce Coaching
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"D's Education Security" <${from}>`,
      to: email,
      subject: `🔑 ${otp} is your D's Education Login OTP`,
      html,
    });
    console.log(`✉️ Login OTP email sent successfully to ${email}`);
  } catch (err) {
    console.error('Failed to send login OTP email via SMTP:', err.message);
  }
};

exports.sendForgotPasswordOtp = async ({ email, otp, name }) => {
  console.log(`\n==========================================`);
  console.log(`🔑 [FORGOT PASSWORD OTP] For ${name}`);
  console.log(`📧 Email: ${email}`);
  console.log(`⚡ RESET OTP CODE: ${otp}`);
  console.log(`==========================================\n`);

  try {
    const transporter = await getTransporter();
    const smtpSettings = await Settings.findOne({ where: { key: 'smtp' } });
    const from = smtpSettings?.value?.email || process.env.SMTP_EMAIL || 'noreply@dseducation.in';

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 16px;">
        <div style="background: linear-gradient(135deg, #dc2626, #f87171); padding: 28px; border-radius: 12px 12px 0 0; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">D's Education</h1>
          <p style="margin: 4px 0 0 0; color: #fecaca; font-size: 13px;">Password Reset Verification Code</p>
        </div>
        <div style="background: white; padding: 28px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
          <p style="color: #334155; font-size: 15px; margin-top: 0;">Hello <strong>${name || 'User'}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.5;">
            We received a request to reset your password for your D's Education account. Enter the 6-digit OTP code below to reset your password:
          </p>

          <div style="background: #fef2f2; border: 2px dashed #ef4444; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0;">
            <div style="font-size: 12px; color: #b91c1c; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Password Reset Code</div>
            <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #991b1b; font-family: monospace;">${otp}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 8px;">⏱ Valid for 10 minutes only</div>
          </div>

          <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
            If you did not request a password reset, please ignore this email. Your password will remain unchanged.
          </p>

          <div style="border-top: 1px solid #f1f5f9; margin-top: 24px; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
            D's Education Security Team | Result-Driven Commerce Coaching
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"D's Education Support" <${from}>`,
      to: email,
      subject: `🔒 ${otp} is your D's Education Password Reset OTP`,
      html,
    });
    console.log(`✉️ Forgot password OTP email sent successfully to ${email}`);
  } catch (err) {
    console.error('Failed to send forgot password OTP email via SMTP:', err.message);
  }
};
