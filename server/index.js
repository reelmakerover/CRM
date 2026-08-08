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


// Health check
app.get('/api/health', (req, res) => res.json({ status: "D's Education Server Running" }));

// Serve static frontend build with universal fallback
const fs = require('fs');
const publicDir = path.join(__dirname, 'public');
const clientBuildDir = path.join(__dirname, '../client/build');
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
  res.sendFile(htmlFile);
});

// Start HTTP Server immediately for Passenger
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
        role: "admin"
      });
      console.log(`✅ Default Admin verified/created at: ${adminEmail}`);
    }
  } catch (err) {
    console.error('Failed to ensure default admin credentials on startup:', err.message);
  }
}).catch(err => {
  console.error('Database connection error:', err);
});

module.exports = app;
