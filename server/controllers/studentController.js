const { Op } = require('sequelize');
const Student = require('../models/Student');
const User = require('../models/User');
const Batch = require('../models/Batch');
const Course = require('../models/Course');
const { sequelize } = require('../config/db');
const { sendWelcomeCredentials } = require('../utils/mailer');

exports.getAllStudents = async (req, res) => {
  try {
    const { course, batch, search } = req.query;
    let where = {};
    if (course) where.courseId = course;
    if (batch) where.batchId = batch;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { enrollmentNo: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    const students = await Student.findAll({
      where,
      include: ['course', 'batch'],
      order: [['createdAt', 'DESC']]
    });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: ['course', 'batch']
    });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createStudent = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, email, phone, parentName, parentEmail, parentPhone, course, batch, fees, password, ...rest } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      await t.rollback();
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Generate enrollment number
    const count = await Student.count();
    const enrollmentNo = `DSE${new Date().getFullYear()}${String(count + 1).padStart(4, '0')}`;
    
    // Calculate pending amount
    const totalFees = parseFloat(fees?.totalFees || 0);
    const paidAmount = parseFloat(fees?.paidAmount || 0);
    
    const courseId = (course && course !== '') ? parseInt(course, 10) : null;
    const batchId = (batch && batch !== '') ? parseInt(batch, 10) : null;

    const student = await Student.create({
      enrollmentNo, name, email, phone, parentName, parentEmail, parentPhone, 
      courseId, 
      batchId,
      fees: { totalFees, paidAmount, pendingAmount: totalFees - paidAmount, installments: fees?.installments || [] },
      ...rest
    }, { transaction: t });
    
    // Create user account
    const userPassword = password || `DSE@${phone?.slice(-4) || '1234'}`;
    await User.create({ 
      name, email, password: userPassword, role: 'student', phone, parentEmail, 
      studentId: student.id 
    }, { transaction: t });
    
    await t.commit();

    // Send welcome email with login credentials to student
    try {
      const courseObj = courseId ? await Course.findByPk(courseId) : null;
      sendWelcomeCredentials({
        student,
        email,
        password: userPassword,
        courseName: courseObj?.name || '',
        enrollmentNo: student.enrollmentNo
      }).catch(e => console.error('Background welcome email error:', e.message));
    } catch (e) {
      console.error('Error preparing welcome email:', e.message);
    }

    res.status(201).json({ student, password: userPassword });
  } catch (err) {
    await t.rollback();
    console.error('Error in createStudent:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { fees, batch, course, ...rest } = req.body;
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    let updatedFees = student.fees;
    if (fees) {
      const totalFees = parseFloat(fees.totalFees ?? student.fees?.totalFees ?? 0);
      const paidAmount = parseFloat(fees.paidAmount ?? student.fees?.paidAmount ?? 0);
      updatedFees = { ...student.fees, ...fees, totalFees, paidAmount, pendingAmount: totalFees - paidAmount };
    }
    
    const courseId = (course !== undefined && course !== '') ? (course ? parseInt(course, 10) : null) : student.courseId;
    const batchId = (batch !== undefined && batch !== '') ? (batch ? parseInt(batch, 10) : null) : student.batchId;

    await student.update({ 
      ...rest, 
      batchId,
      courseId,
      fees: updatedFees 
    });
    
    if (rest.email || rest.name) {
      const user = await User.findOne({ where: { studentId: student.id } });
      if (user) {
        await user.update({
          name: rest.name || user.name,
          email: rest.email || user.email
        });
      }
    }

    const updated = await Student.findByPk(req.params.id, { include: ['course', 'batch'] });
    res.json(updated);
  } catch (err) {
    console.error('Error in updateStudent:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteStudent = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    await User.destroy({ where: { email: student.email }, transaction: t });
    await student.destroy({ transaction: t });
    
    await t.commit();
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};

exports.updateFees = async (req, res) => {
  try {
    const { installmentId, status, paidDate, amount } = req.body;
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    let fees = { ...student.fees };
    if (installmentId && fees.installments) {
      fees.installments = fees.installments.map(inst => {
        if (inst.id === installmentId || inst._id === installmentId) {
          return { ...inst, status, paidDate };
        }
        return inst;
      });
    }
    
    if (amount) {
      fees.paidAmount = (Number(fees.paidAmount) || 0) + Number(amount);
      fees.pendingAmount = (Number(fees.totalFees) || 0) - fees.paidAmount;
    }
    
    await student.update({ fees });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await Student.count();
    const active = await Student.count({ where: { isActive: true } });
    
    // For aggregate sums in Sequelize
    const stats = await Student.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.json('fees.totalFees')), 'totalFees'],
        [sequelize.fn('SUM', sequelize.json('fees.paidAmount')), 'paidAmount'],
        [sequelize.fn('SUM', sequelize.json('fees.pendingAmount')), 'pendingAmount'],
      ],
      raw: true
    });

    // Calculate real monthly enrollment trend for the last 6 months
    const allStudents = await Student.findAll({
      attributes: ['createdAt'],
      raw: true
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMap = {};
    const today = new Date();

    // Initialize last 6 months bucket
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const label = `${months[d.getMonth()]}`;
      trendMap[label] = { month: label, students: 0, sortKey: d.getTime() };
    }

    allStudents.forEach(s => {
      if (!s.createdAt) return;
      const d = new Date(s.createdAt);
      const label = `${months[d.getMonth()]}`;
      if (trendMap[label]) {
        trendMap[label].students++;
      }
    });

    const enrollmentTrend = Object.values(trendMap)
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(({ month, students }) => ({ month, students }));

    res.json({ 
      total, 
      active, 
      feeStats: stats[0] || {},
      enrollmentTrend
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
