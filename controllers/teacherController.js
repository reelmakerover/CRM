const { User, Batch, Course, Student, Exam, Subject } = require('../models');
const { Op } = require('sequelize');

// Admin: Get all Teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.findAll({
      where: { role: 'teacher' },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    // Populate assigned batch & course names defensively
    const populated = await Promise.all(
      teachers.map(async (t) => {
        const json = t.toJSON();
        
        // Parse assignedBatches safely
        let batchIds = [];
        if (typeof json.assignedBatches === 'string') {
          try { batchIds = JSON.parse(json.assignedBatches); } catch (e) {}
        } else if (Array.isArray(json.assignedBatches)) {
          batchIds = json.assignedBatches;
        }

        // Parse assignedSubjects safely
        let subjs = [];
        if (typeof json.assignedSubjects === 'string') {
          try { subjs = JSON.parse(json.assignedSubjects); } catch (e) {}
        } else if (Array.isArray(json.assignedSubjects)) {
          subjs = json.assignedSubjects;
        }

        // Parse assignedCourses safely
        let crses = [];
        if (typeof json.assignedCourses === 'string') {
          try { crses = JSON.parse(json.assignedCourses); } catch (e) {}
        } else if (Array.isArray(json.assignedCourses)) {
          crses = json.assignedCourses;
        }

        let batches = [];
        if (batchIds && batchIds.length > 0) {
          try {
            batches = await Batch.findAll({
              where: { id: { [Op.in]: batchIds.map(Number) } },
              include: [{ association: 'course', attributes: ['id', 'name'] }]
            });
          } catch (bErr) {
            console.error('Error fetching batch details for teacher:', bErr.message);
          }
        }

        json.assignedBatches = batchIds || [];
        json.assignedSubjects = subjs || [];
        json.assignedCourses = crses || [];
        json.batchDetails = batches || [];

        return json;
      })
    );

    res.json(populated);
  } catch (err) {
    console.error('getAllTeachers error:', err);
    res.status(500).json({ message: err.message || 'Failed to fetch teachers' });
  }
};

// Admin: Create Teacher
exports.createTeacher = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      specialization, 
      experience, 
      assignedBatches, 
      assignedSubjects, 
      assignedCourses 
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const batches = Array.isArray(assignedBatches) ? assignedBatches.map(Number) : [];
    const subjects = Array.isArray(assignedSubjects) ? assignedSubjects : [];
    const courses = Array.isArray(assignedCourses) ? assignedCourses : [];

    const teacher = await User.create({
      name,
      email,
      password,
      visiblePassword: password,
      role: 'teacher',
      phone: phone || null,
      specialization: specialization || 'Faculty',
      experience: experience || '',
      assignedBatches: batches,
      assignedSubjects: subjects,
      assignedCourses: courses,
      permissions: ['exams', 'questions', 'batches', 'attendance', 'students']
    });

    const sanitized = teacher.toJSON();
    delete sanitized.password;

    // Attach empty batchDetails for instant UI display
    sanitized.batchDetails = [];

    res.status(201).json({
      message: 'Teacher account created successfully',
      teacher: sanitized
    });
  } catch (err) {
    console.error('createTeacher error:', err);
    res.status(500).json({ message: err.message || 'Failed to create teacher' });
  }
};

// Admin: Update Teacher
exports.updateTeacher = async (req, res) => {
  try {
    const teacher = await User.findByPk(req.params.id);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const { 
      name, 
      email, 
      password, 
      phone, 
      specialization, 
      experience, 
      assignedBatches, 
      assignedSubjects, 
      assignedCourses 
    } = req.body;

    if (name) teacher.name = name;
    if (email) teacher.email = email;
    if (phone !== undefined) teacher.phone = phone;
    if (specialization !== undefined) teacher.specialization = specialization;
    if (experience !== undefined) teacher.experience = experience;
    if (assignedBatches !== undefined) teacher.assignedBatches = Array.isArray(assignedBatches) ? assignedBatches.map(Number) : [];
    if (assignedSubjects !== undefined) teacher.assignedSubjects = Array.isArray(assignedSubjects) ? assignedSubjects : [];
    if (assignedCourses !== undefined) teacher.assignedCourses = Array.isArray(assignedCourses) ? assignedCourses : [];

    if (password && password.trim()) {
      teacher.password = password;
      teacher.visiblePassword = password;
    }

    await teacher.save();

    const sanitized = teacher.toJSON();
    delete sanitized.password;

    res.json({
      message: 'Teacher updated successfully',
      teacher: sanitized
    });
  } catch (err) {
    console.error('updateTeacher error:', err);
    res.status(500).json({ message: err.message || 'Failed to update teacher' });
  }
};

// Admin: Delete Teacher
exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await User.findByPk(req.params.id);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    await teacher.destroy();
    res.json({ message: 'Teacher deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Teacher Portal: Get logged-in teacher data & assigned batches/students
exports.getMyTeacherData = async (req, res) => {
  try {
    const teacher = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    let batchIds = [];
    if (typeof teacher.assignedBatches === 'string') {
      try { batchIds = JSON.parse(teacher.assignedBatches); } catch (e) {}
    } else if (Array.isArray(teacher.assignedBatches)) {
      batchIds = teacher.assignedBatches;
    }

    let batches = [];
    if (batchIds.length > 0) {
      batches = await Batch.findAll({
        where: { id: { [Op.in]: batchIds.map(Number) } },
        include: [
          { association: 'course' },
          { 
            association: 'students',
            attributes: ['id', 'name', 'enrollmentNo', 'email', 'phone', 'parentName', 'parentPhone', 'parentEmail', 'photo']
          }
        ]
      });
    } else {
      // Fallback: If no batch specifically assigned, return all active batches
      batches = await Batch.findAll({
        include: [
          { association: 'course' },
          { 
            association: 'students',
            attributes: ['id', 'name', 'enrollmentNo', 'email', 'phone', 'parentName', 'parentPhone', 'parentEmail', 'photo']
          }
        ]
      });
    }

    const totalStudents = batches.reduce((acc, b) => acc + (b.students?.length || 0), 0);

    // Get assigned subject details
    const subjectList = await Subject.findAll({
      include: [{ association: 'course', attributes: ['id', 'name'] }]
    });

    res.json({
      teacher,
      batches,
      totalBatches: batches.length,
      totalStudents,
      subjects: subjectList
    });
  } catch (err) {
    console.error('getMyTeacherData error:', err);
    res.status(500).json({ message: err.message || 'Failed to fetch teacher dashboard data' });
  }
};
