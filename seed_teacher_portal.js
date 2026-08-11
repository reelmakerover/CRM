const { sequelize } = require('./config/db');
const { Course, Subject, Batch, Student, User, Attendance } = require('./models');

async function seedTeacherPortal() {
  await sequelize.sync();

  const queryInterface = sequelize.getQueryInterface();

  // Column verification
  try {
    const uInfo = await queryInterface.describeTable('Users');
    if (!uInfo.assignedBatches) await queryInterface.addColumn('Users', 'assignedBatches', { type: require('sequelize').DataTypes.JSON, defaultValue: [] });
    if (!uInfo.assignedSubjects) await queryInterface.addColumn('Users', 'assignedSubjects', { type: require('sequelize').DataTypes.JSON, defaultValue: [] });
    if (!uInfo.assignedCourses) await queryInterface.addColumn('Users', 'assignedCourses', { type: require('sequelize').DataTypes.JSON, defaultValue: [] });
    if (!uInfo.specialization) await queryInterface.addColumn('Users', 'specialization', { type: require('sequelize').DataTypes.STRING, allowNull: true });
    if (!uInfo.experience) await queryInterface.addColumn('Users', 'experience', { type: require('sequelize').DataTypes.STRING, allowNull: true });
    if (!uInfo.visiblePassword) await queryInterface.addColumn('Users', 'visiblePassword', { type: require('sequelize').DataTypes.STRING, allowNull: true });
  } catch (e) {}

  console.log('🌱 Seeding Running Batches, Students & Faculty Accounts...');

  // 1. Courses
  let course12 = await Course.findOne({ where: { name: '12th Commerce' } });
  if (!course12) {
    course12 = await Course.create({ name: '12th Commerce', code: '12COM', fees: 15000 });
  }

  let courseCA = await Course.findOne({ where: { name: 'CA Foundation' } });
  if (!courseCA) {
    courseCA = await Course.create({ name: 'CA Foundation', code: 'CAF', fees: 25000 });
  }

  // 2. Batches
  let batchAcc = await Batch.findOne({ where: { name: '12th Commerce - Accounts Morning Batch' } });
  if (!batchAcc) {
    batchAcc = await Batch.create({
      name: '12th Commerce - Accounts Morning Batch',
      courseId: course12.id,
      timing: '08:00 AM - 09:30 AM',
      status: 'active',
      instructor: 'Prof. Rajesh Sharma',
      startDate: new Date(),
      totalSeats: 30,
      fees: 15000,
      mode: 'offline'
    });
  }

  let batchEco = await Batch.findOne({ where: { name: '12th Commerce - Economics Evening Batch' } });
  if (!batchEco) {
    batchEco = await Batch.create({
      name: '12th Commerce - Economics Evening Batch',
      courseId: course12.id,
      timing: '05:00 PM - 06:30 PM',
      status: 'active',
      instructor: 'Prof. Rajesh Sharma',
      startDate: new Date(),
      totalSeats: 30,
      fees: 15000,
      mode: 'offline'
    });
  }

  let batchCA = await Batch.findOne({ where: { name: 'CA Foundation - Principles of Accounting' } });
  if (!batchCA) {
    batchCA = await Batch.create({
      name: 'CA Foundation - Principles of Accounting',
      courseId: courseCA.id,
      timing: '10:00 AM - 12:00 PM',
      status: 'active',
      instructor: 'CA Ananya Verma',
      startDate: new Date(),
      totalSeats: 40,
      fees: 25000,
      mode: 'offline'
    });
  }

  // 3. Students for Batch 1 (Accounts Morning)
  const studentsBatch1 = [
    {
      name: 'Aarav Sharma',
      enrollmentNo: 'DS-2026-001',
      email: 'aarav.sharma@example.com',
      phone: '9811223344',
      parentName: 'Mr. Sunil Sharma',
      parentPhone: '9811223344',
      batchId: batchAcc.id,
      courseId: course12.id
    },
    {
      name: 'Priya Patel',
      enrollmentNo: 'DS-2026-002',
      email: 'priya.patel@example.com',
      phone: '9822334455',
      parentName: 'Mrs. Geeta Patel',
      parentPhone: '9822334455',
      batchId: batchAcc.id,
      courseId: course12.id
    },
    {
      name: 'Rohan Gupta',
      enrollmentNo: 'DS-2026-003',
      email: 'rohan.gupta@example.com',
      phone: '9833445566',
      parentName: 'Mr. Ramesh Gupta',
      parentPhone: '9833445566',
      batchId: batchAcc.id,
      courseId: course12.id
    },
    {
      name: 'Sneha Verma',
      enrollmentNo: 'DS-2026-004',
      email: 'sneha.verma@example.com',
      phone: '9844556677',
      parentName: 'Dr. Anand Verma',
      parentPhone: '9844556677',
      batchId: batchAcc.id,
      courseId: course12.id
    },
    {
      name: 'Kabir Singh',
      enrollmentNo: 'DS-2026-005',
      email: 'kabir.singh@example.com',
      phone: '9855667788',
      parentName: 'Sardar Manjit Singh',
      parentPhone: '9855667788',
      batchId: batchAcc.id,
      courseId: course12.id
    }
  ];

  for (const st of studentsBatch1) {
    const existing = await Student.findOne({ where: { enrollmentNo: st.enrollmentNo } });
    if (!existing) {
      await Student.create(st);
    } else {
      existing.batchId = batchAcc.id;
      existing.parentName = st.parentName;
      existing.parentPhone = st.parentPhone;
      await existing.save();
    }
  }

  // 4. Students for Batch 2 (Economics Evening)
  const studentsBatch2 = [
    {
      name: 'Diya Malhotra',
      enrollmentNo: 'DS-2026-011',
      email: 'diya.malhotra@example.com',
      phone: '9866778899',
      parentName: 'Mr. Vivek Malhotra',
      parentPhone: '9866778899',
      batchId: batchEco.id,
      courseId: course12.id
    },
    {
      name: 'Aryan Saxena',
      enrollmentNo: 'DS-2026-012',
      email: 'aryan.saxena@example.com',
      phone: '9877889900',
      parentName: 'Mrs. Ritu Saxena',
      parentPhone: '9877889900',
      batchId: batchEco.id,
      courseId: course12.id
    },
    {
      name: 'Tanya Joshi',
      enrollmentNo: 'DS-2026-013',
      email: 'tanya.joshi@example.com',
      phone: '9899001122',
      parentName: 'Mr. Deepak Joshi',
      parentPhone: '9899001122',
      batchId: batchEco.id,
      courseId: course12.id
    }
  ];

  for (const st of studentsBatch2) {
    const existing = await Student.findOne({ where: { enrollmentNo: st.enrollmentNo } });
    if (!existing) {
      await Student.create(st);
    } else {
      existing.batchId = batchEco.id;
      existing.parentName = st.parentName;
      existing.parentPhone = st.parentPhone;
      await existing.save();
    }
  }

  // 5. Create / Update Faculty Teacher Account
  const teacherEmail = 'teacher@dseducation.com';
  let teacherUser = await User.findOne({ where: { email: teacherEmail } });
  if (!teacherUser) {
    teacherUser = await User.create({
      name: 'Prof. Rajesh Sharma',
      email: teacherEmail,
      password: 'Teacher@123',
      visiblePassword: 'Teacher@123',
      role: 'teacher',
      phone: '9810012345',
      specialization: 'Senior Faculty (Accountancy & Economics)',
      experience: '10+ Years',
      assignedBatches: [batchAcc.id, batchEco.id, batchCA.id],
      assignedSubjects: ['Accountancy', 'Economics'],
      assignedCourses: [course12.id, courseCA.id],
      permissions: ['exams', 'questions', 'batches', 'attendance', 'students']
    });
    console.log('✅ Teacher account created: teacher@dseducation.com / Teacher@123');
  } else {
    teacherUser.role = 'teacher';
    teacherUser.password = 'Teacher@123';
    teacherUser.visiblePassword = 'Teacher@123';
    teacherUser.specialization = 'Senior Faculty (Accountancy & Economics)';
    teacherUser.assignedBatches = [batchAcc.id, batchEco.id, batchCA.id];
    teacherUser.assignedSubjects = ['Accountancy', 'Economics'];
    await teacherUser.save();
    console.log('✅ Teacher account updated: teacher@dseducation.com / Teacher@123');
  }

  console.log('🎉 Seed complete! Batches, students & teacher portal ready.');
}

seedTeacherPortal().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
