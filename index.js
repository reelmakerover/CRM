require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, sequelize } = require('./config/db');
require('./models'); // Load associations

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/batches', require('./routes/batches'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/results', require('./routes/results'));
app.use('/api/toppers', require('./routes/toppers'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/superadmin', require('./routes/superadmin'));
app.use('/api/superproadmin', require('./routes/superproadmin'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/exam-kits', require('./routes/examKits'));
app.use('/api/lectures', require('./routes/lectures'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/teachers', require('./routes/teachers'));


// Health check
app.get('/api/health', (req, res) => res.json({ status: "D's Education Server Running" }));

// Serve static frontend build with universal fallback
const fs = require('fs');
const publicDir = path.join(__dirname, 'public');
const clientBuildDir = path.join(__dirname, 'client/build');
const staticDir = fs.existsSync(publicDir) ? publicDir : (fs.existsSync(clientBuildDir) ? clientBuildDir : __dirname);

app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/static', express.static(path.join(publicDir, 'static')));
app.use(express.static(staticDir));
app.use(express.static(__dirname));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
  const htmlFile = fs.existsSync(path.join(publicDir, 'index.html'))
    ? path.join(publicDir, 'index.html')
    : (fs.existsSync(path.join(__dirname, 'index.html')) ? path.join(__dirname, 'index.html') : path.join(clientBuildDir, 'index.html'));
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(htmlFile);
});

// Start HTTP Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`D's Education Server running on port ${PORT}`));

// Connect DB & Sync in Background
connectDB().then(async () => {
  // Sync database safely
  await sequelize.sync();

  // Ensure columns exist in Users table for SQLite compatibility before queries
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableInfo = await queryInterface.describeTable('Users');
    if (!tableInfo.otpCode) {
      await queryInterface.addColumn('Users', 'otpCode', { type: require('sequelize').DataTypes.STRING, allowNull: true });
    }
    if (!tableInfo.otpExpires) {
      await queryInterface.addColumn('Users', 'otpExpires', { type: require('sequelize').DataTypes.DATE, allowNull: true });
    }
    if (!tableInfo.otpPurpose) {
      await queryInterface.addColumn('Users', 'otpPurpose', { type: require('sequelize').DataTypes.STRING, allowNull: true });
    }
    if (!tableInfo.visiblePassword) {
      await queryInterface.addColumn('Users', 'visiblePassword', { type: require('sequelize').DataTypes.STRING, allowNull: true });
    }
    if (!tableInfo.assignedBatches) {
      await queryInterface.addColumn('Users', 'assignedBatches', { type: require('sequelize').DataTypes.JSON, defaultValue: [] });
    }
    if (!tableInfo.assignedSubjects) {
      await queryInterface.addColumn('Users', 'assignedSubjects', { type: require('sequelize').DataTypes.JSON, defaultValue: [] });
    }
    if (!tableInfo.assignedCourses) {
      await queryInterface.addColumn('Users', 'assignedCourses', { type: require('sequelize').DataTypes.JSON, defaultValue: [] });
    }
    if (!tableInfo.specialization) {
      await queryInterface.addColumn('Users', 'specialization', { type: require('sequelize').DataTypes.STRING, allowNull: true });
    }
    if (!tableInfo.experience) {
      await queryInterface.addColumn('Users', 'experience', { type: require('sequelize').DataTypes.STRING, allowNull: true });
    }
    console.log('Database synced & User columns verified');

    // Ensure columns exist in Lectures table for SQLite compatibility
    try {
      const lectTableInfo = await queryInterface.describeTable('Lectures');
      if (!lectTableInfo.youtubeId) {
        await queryInterface.addColumn('Lectures', 'youtubeId', { type: require('sequelize').DataTypes.STRING, allowNull: true });
      }
      if (!lectTableInfo.isFree) {
        await queryInterface.addColumn('Lectures', 'isFree', { type: require('sequelize').DataTypes.BOOLEAN, defaultValue: false });
      }
      if (!lectTableInfo.order) {
        await queryInterface.addColumn('Lectures', 'order', { type: require('sequelize').DataTypes.INTEGER, defaultValue: 0 });
      }
      if (!lectTableInfo.courseId) {
        await queryInterface.addColumn('Lectures', 'courseId', { type: require('sequelize').DataTypes.INTEGER, allowNull: true });
      }
      if (!lectTableInfo.subjectId) {
        await queryInterface.addColumn('Lectures', 'subjectId', { type: require('sequelize').DataTypes.INTEGER, allowNull: true });
      }
      console.log('Lectures columns verified');
    } catch (lectErr) {
      // If table doesn't exist, sync already handles it
      console.log('Lectures table check skipped or handled by sync');
    }

    // Verify and migrate Courses table category column type to STRING
    try {
      const courseTableInfo = await queryInterface.describeTable('Courses');
      if (!courseTableInfo.category_migrated) {
        // 1. Rename old column
        await queryInterface.renameColumn('Courses', 'category', 'category_old');
        // 2. Add new category column as STRING
        await queryInterface.addColumn('Courses', 'category', { type: require('sequelize').DataTypes.STRING, defaultValue: 'Commerce' });
        // 3. Add helper flag column category_migrated so this runs only once
        await queryInterface.addColumn('Courses', 'category_migrated', { type: require('sequelize').DataTypes.BOOLEAN, defaultValue: true });
        // 4. Copy data
        await sequelize.query('UPDATE Courses SET category = category_old');
        console.log('Courses category column migrated from ENUM to STRING successfully!');
      }
    } catch (courseErr) {
      console.log('Courses table category migration skipped or already done:', courseErr.message);
    }
    // Ensure columns exist in Exams table
    try {
      const examTableInfo = await queryInterface.describeTable('Exams');
      if (!examTableInfo.isPublic) {
        await queryInterface.addColumn('Exams', 'isPublic', { type: require('sequelize').DataTypes.BOOLEAN, defaultValue: false });
      }
      if (!examTableInfo.chapter) {
        await queryInterface.addColumn('Exams', 'chapter', { type: require('sequelize').DataTypes.STRING, defaultValue: 'General' });
      }
      console.log('Exams columns verified');
    } catch (examColErr) {
      console.log('Exams table column check skipped');
    }

    // Ensure columns exist in Questions table
    try {
      const qTableInfo = await queryInterface.describeTable('Questions');
      if (!qTableInfo.chapter) {
        await queryInterface.addColumn('Questions', 'chapter', { type: require('sequelize').DataTypes.STRING, allowNull: true });
      }
      console.log('Questions columns verified');
    } catch (qColErr) {
      console.log('Questions table column check skipped');
    }

    // Ensure columns exist in Leads table
    try {
      const leadTableInfo = await queryInterface.describeTable('Leads');
      if (!leadTableInfo.city) {
        await queryInterface.addColumn('Leads', 'city', { type: require('sequelize').DataTypes.STRING, allowNull: true });
      }
      if (!leadTableInfo.score) {
        await queryInterface.addColumn('Leads', 'score', { type: require('sequelize').DataTypes.STRING, allowNull: true });
      }
      if (!leadTableInfo.source) {
        await queryInterface.addColumn('Leads', 'source', { type: require('sequelize').DataTypes.STRING, defaultValue: 'Website' });
      }
      console.log('Leads columns verified');
    } catch (leadColErr) {
      console.log('Leads table column check skipped');
    }
  } catch (colErr) {
    console.error('Error verifying table columns:', colErr.message);
  }

  // Auto-seed admin credentials from environment variables if DB is empty / users don't exist
  try {
    const User = require('./models/User');
    const superProEmail = process.env.SUPER_PRO_ADMIN_EMAIL || 'teamyash2004@gmail.com';
    const superProPassword = process.env.SUPER_PRO_ADMIN_PASSWORD || '@Saini1508Y';
    const superEmail = process.env.SUPERADMIN_EMAIL || 'superadmin@dseducation.com';
    const superPassword = process.env.SUPERADMIN_PASSWORD || 'Admin@123';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@dseducation.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    // 1. Super Pro Admin
    let superProUser = await User.findOne({ where: { email: superProEmail } });
    if (!superProUser) {
      await User.create({
        name: "Super Pro Admin",
        email: superProEmail,
        password: superProPassword,
        role: "superproadmin"
      });
      console.log(`✅ Default Super Pro Admin created: ${superProEmail}`);
    } else {
      const match = await superProUser.matchPassword(superProPassword);
      if (!match || superProUser.role !== 'superproadmin') {
        superProUser.password = superProPassword;
        superProUser.role = 'superproadmin';
        await superProUser.save();
        console.log(`✅ Super Pro Admin password/role resynced: ${superProEmail}`);
      } else {
        console.log(`✅ Super Pro Admin verified: ${superProEmail}`);
      }
    }

    // 2. Super Admin
    let superUser = await User.findOne({ where: { email: superEmail } });
    if (!superUser) {
      await User.create({
        name: "Super Admin",
        email: superEmail,
        password: superPassword,
        role: "superadmin"
      });
      console.log(`✅ Default Super Admin created: ${superEmail}`);
    } else {
      const match = await superUser.matchPassword(superPassword);
      if (!match || superUser.role !== 'superadmin') {
        superUser.password = superPassword;
        superUser.role = 'superadmin';
        await superUser.save();
        console.log(`✅ Super Admin password/role resynced: ${superEmail}`);
      } else {
        console.log(`✅ Super Admin verified: ${superEmail}`);
      }
    }

    // Auto-populate visiblePassword for existing superadmins if null
    const superAdminsNullPass = await User.findAll({ where: { role: 'superadmin', visiblePassword: null } });
    for (const sa of superAdminsNullPass) {
      sa.visiblePassword = 'Admin@123';
      await sa.save();
    }

    // 3. Admin
    let adminUser = await User.findOne({ where: { email: adminEmail } });
    if (!adminUser) {
      await User.create({
        name: "Admin",
        email: adminEmail,
        password: adminPassword,
        role: "admin",
        visiblePassword: adminPassword
      });
      console.log(`✅ Default Admin created: ${adminEmail}`);
    } else {
      const match = await adminUser.matchPassword(adminPassword);
      if (!match || adminUser.role !== 'admin') {
        adminUser.password = adminPassword;
        adminUser.role = 'admin';
        adminUser.visiblePassword = adminPassword;
        await adminUser.save();
        console.log(`✅ Admin password/role resynced: ${adminEmail}`);
      } else {
        console.log(`✅ Admin verified: ${adminEmail}`);
      }
    }

    // 4. Default Student Account
    const Student = require('./models/Student');
    const studentEmail = 'student@dseducation.com';
    const studentPassword = 'Student@123';
    
    let studentUser = await User.findOne({ where: { email: studentEmail } });
    if (!studentUser) {
      studentUser = await User.create({
        name: "Demo Student",
        email: studentEmail,
        password: studentPassword,
        role: "student",
        visiblePassword: studentPassword
      });
      console.log(`✅ Default Student User created: ${studentEmail}`);
    } else {
      const match = await studentUser.matchPassword(studentPassword);
      if (!match) {
        studentUser.password = studentPassword;
        studentUser.visiblePassword = studentPassword;
        await studentUser.save();
        console.log(`✅ Student User password resynced: ${studentEmail}`);
      } else {
        console.log(`✅ Student User verified: ${studentEmail}`);
      }
    }

    let studentProfile = await Student.findOne({ where: { email: studentEmail } });
    if (!studentProfile) {
      await Student.create({
        name: "Demo Student",
        email: studentEmail,
        phone: "9876543210",
        enrollmentNo: "STU2026001",
        status: "active"
      });
      console.log(`✅ Default Student Profile created: ${studentEmail}`);
    }
  } catch (err) {
    console.error('Failed to ensure default admin credentials on startup:', err.message);
  }
}).catch(err => {
  console.error('Database connection error:', err);
});

module.exports = app;
