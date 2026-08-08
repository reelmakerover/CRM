const ExamKit = require('../models/ExamKit');
const KitOrder = require('../models/KitOrder');
const Course = require('../models/Course');
const Student = require('../models/Student');
const User = require('../models/User');
const { sendKitOrderReceipt, sendWelcomeCredentials } = require('../utils/mailer');

exports.getPublicExamKits = async (req, res) => {
  try {
    const kits = await ExamKit.findAll({
      where: { status: 'published' },
      include: [{ model: Course, as: 'course', attributes: ['id', 'name'] }],
      order: [['salesCount', 'DESC'], ['updatedAt', 'DESC']]
    });
    res.json(kits);
  } catch (err) {
    console.error('Error in getPublicExamKits:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAdminExamKits = async (req, res) => {
  try {
    const kits = await ExamKit.findAll({
      include: [{ model: Course, as: 'course', attributes: ['id', 'name'] }],
      order: [['updatedAt', 'DESC']]
    });
    res.json(kits);
  } catch (err) {
    console.error('Error in getAdminExamKits:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.createExamKit = async (req, res) => {
  try {
    const { title, subtitle, categoryType, validity, description, mrpPrice, sellingPrice, thumbnailUrl, features, includedPdfs, includedVideos, status, courseId } = req.body;

    const kit = await ExamKit.create({
      title,
      subtitle: subtitle || '',
      categoryType: categoryType || 'Test Series & Study Kit',
      validity: validity || '1 Year Validity',
      description: description || '',
      mrpPrice: mrpPrice || 4999.00,
      sellingPrice: sellingPrice || 1999.00,
      thumbnailUrl: thumbnailUrl || '',
      features: typeof features === 'object' ? JSON.stringify(features) : (features || ''),
      includedPdfs: typeof includedPdfs === 'object' ? JSON.stringify(includedPdfs) : (includedPdfs || ''),
      includedVideos: typeof includedVideos === 'object' ? JSON.stringify(includedVideos) : (includedVideos || ''),
      status: status || 'published',
      courseId: courseId || null
    });

    res.status(201).json(kit);
  } catch (err) {
    console.error('Error in createExamKit:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateExamKit = async (req, res) => {
  try {
    const kit = await ExamKit.findByPk(req.params.id);
    if (!kit) return res.status(404).json({ message: 'Exam Kit not found' });

    const { title, subtitle, categoryType, validity, description, mrpPrice, sellingPrice, thumbnailUrl, features, includedPdfs, includedVideos, status, courseId } = req.body;

    await kit.update({
      title: title || kit.title,
      subtitle: subtitle !== undefined ? subtitle : kit.subtitle,
      categoryType: categoryType || kit.categoryType,
      validity: validity || kit.validity,
      description: description !== undefined ? description : kit.description,
      mrpPrice: mrpPrice !== undefined ? mrpPrice : kit.mrpPrice,
      sellingPrice: sellingPrice !== undefined ? sellingPrice : kit.sellingPrice,
      thumbnailUrl: thumbnailUrl !== undefined ? thumbnailUrl : kit.thumbnailUrl,
      features: typeof features === 'object' ? JSON.stringify(features) : (features !== undefined ? features : kit.features),
      includedPdfs: typeof includedPdfs === 'object' ? JSON.stringify(includedPdfs) : (includedPdfs !== undefined ? includedPdfs : kit.includedPdfs),
      includedVideos: typeof includedVideos === 'object' ? JSON.stringify(includedVideos) : (includedVideos !== undefined ? includedVideos : kit.includedVideos),
      status: status || kit.status,
      courseId: courseId !== undefined ? (courseId || null) : kit.courseId
    });

    res.json(kit);
  } catch (err) {
    console.error('Error in updateExamKit:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteExamKit = async (req, res) => {
  try {
    const kit = await ExamKit.findByPk(req.params.id);
    if (!kit) return res.status(404).json({ message: 'Exam Kit not found' });

    await kit.destroy();
    res.json({ message: 'Exam Kit deleted' });
  } catch (err) {
    console.error('Error in deleteExamKit:', err);
    res.status(500).json({ message: err.message });
  }
};

// PUBLIC CHECKOUT / ORDER CREATION
exports.createKitOrder = async (req, res) => {
  try {
    const { examKitId, studentName, studentPhone, studentEmail, city, paymentMethod, transactionRef } = req.body;

    const kit = await ExamKit.findByPk(examKitId);
    if (!kit) return res.status(404).json({ message: 'Exam Kit not found' });

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNo = `DSKIT-${new Date().getFullYear()}-${randomSuffix}`;

    const order = await KitOrder.create({
      orderNo,
      examKitId: kit.id,
      studentName,
      studentPhone,
      studentEmail,
      city: city || '',
      amountPaid: kit.sellingPrice,
      paymentMethod: paymentMethod || 'UPI QR Code',
      paymentStatus: 'completed',
      transactionRef: transactionRef || `UPI-${Date.now()}`
    });

    // Increment kit sales count
    await kit.increment('salesCount', { by: 1 });

    // Send order receipt email
    sendKitOrderReceipt({ order, kit }).catch(e => console.error(e.message));

    // Auto-provision student user account if it does not exist
    try {
      const emailLower = studentEmail.trim().toLowerCase();
      let user = await User.findOne({ where: { email: emailLower } });
      if (!user) {
        // Create Student
        const studentCount = await Student.count();
        const enrollmentNo = `DSE${new Date().getFullYear()}${String(studentCount + 1).padStart(4, '0')}`;
        
        const newStudent = await Student.create({
          enrollmentNo,
          name: studentName,
          email: emailLower,
          phone: studentPhone,
          courseId: kit.courseId || null,
          fees: {
            totalFees: parseFloat(kit.sellingPrice),
            paidAmount: parseFloat(kit.sellingPrice),
            pendingAmount: 0,
            installments: []
          }
        });

        // Create User
        const userPassword = `DSE@${studentPhone?.slice(-4) || '1234'}`;
        await User.create({
          name: studentName,
          email: emailLower,
          password: userPassword,
          role: 'student',
          phone: studentPhone,
          studentId: newStudent.id
        });

        // Send Welcome Credentials
        const courseObj = kit.courseId ? await Course.findByPk(kit.courseId) : null;
        sendWelcomeCredentials({
          student: newStudent,
          email: emailLower,
          password: userPassword,
          courseName: courseObj?.name || kit.title,
          enrollmentNo: newStudent.enrollmentNo
        }).catch(e => console.error('Background welcome email error for kit buyer:', e.message));
      }
    } catch (provisionErr) {
      console.error('Error auto-provisioning account for kit buyer:', provisionErr.message);
    }

    res.status(201).json({
      message: 'Order placed & confirmed successfully!',
      order,
      kitTitle: kit.title
    });
  } catch (err) {
    console.error('Error in createKitOrder:', err);
    res.status(500).json({ message: err.message });
  }
};

// ADMIN ORDERS REPORT
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await KitOrder.findAll({
      include: [{ model: ExamKit, as: 'examKit', attributes: ['id', 'title', 'sellingPrice'] }],
      order: [['createdAt', 'DESC']]
    });

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.amountPaid || 0), 0);
    const totalOrders = orders.length;

    res.json({
      orders,
      stats: {
        totalRevenue,
        totalOrders
      }
    });
  } catch (err) {
    console.error('Error in getAllOrders:', err);
    res.status(500).json({ message: err.message });
  }
};

// DIRECT MEDIA FILE UPLOAD (PDF / VIDEO / IMAGE)
const fs = require('fs');
exports.uploadMediaFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    let fileUrl = `/uploads/${req.file.filename}`;
    if (req.file.mimetype.startsWith('image/')) {
      const fileBuffer = fs.readFileSync(req.file.path);
      fileUrl = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    res.json({
      message: 'File uploaded successfully!',
      url: fileUrl,
      fileName: req.file.originalname
    });
  } catch (err) {
    console.error('Error in uploadMediaFile:', err);
    res.status(500).json({ message: err.message });
  }
};

// GET EXAM KITS FOR LOGGED-IN STUDENT
exports.getStudentExamKits = async (req, res) => {
  try {
    let courseId = null;
    let studentEmail = req.user.email ? req.user.email.toLowerCase() : '';

    if (req.user.role === 'student' && req.user.studentId) {
      const student = await Student.findByPk(req.user.studentId);
      if (student) {
        courseId = student.courseId;
        if (student.email) {
          studentEmail = student.email.toLowerCase();
        }
      }
    }

    // Find all published exam kits
    const kits = await ExamKit.findAll({
      where: { status: 'published' },
      include: [{ model: Course, as: 'course', attributes: ['id', 'name'] }],
      order: [['updatedAt', 'DESC']]
    });

    // Check if student has a completed order for each kit
    let orderedKitIds = [];
    if (studentEmail) {
      const completedOrders = await KitOrder.findAll({
        where: {
          studentEmail: studentEmail,
          paymentStatus: 'completed'
        }
      });
      orderedKitIds = completedOrders.map(o => o.examKitId);
    }

    // Filter kits: student gets access if the kit is linked to their course OR if they purchased it
    const authorizedKits = kits.filter(kit => {
      const isCourseAssigned = courseId && kit.courseId === courseId;
      const isPurchased = orderedKitIds.includes(kit.id);
      return isCourseAssigned || isPurchased;
    });

    res.json(authorizedKits);
  } catch (err) {
    console.error('Error in getStudentExamKits:', err);
    res.status(500).json({ message: err.message });
  }
};
