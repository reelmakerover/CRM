require('dotenv').config();
const { sequelize } = require('./config/db');
require('./models'); // Load all models & associations

const User = require('./models/User');
const Course = require('./models/Course');
const Subject = require('./models/Subject');
const Batch = require('./models/Batch');
const Topper = require('./models/Topper');
const Blog = require('./models/Blog');
const Settings = require('./models/Settings');
const ExamKit = require('./models/ExamKit');
const Lead = require('./models/Lead');
const Student = require('./models/Student');
const Result = require('./models/Result');
const Exam = require('./models/Exam');

async function clearAll() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database Connected\n');
    console.log('🗑️  FULL WIPE — Clearing everything...\n');

    // Disable FK constraints for SQLite
    await sequelize.query('PRAGMA foreign_keys = OFF;');

    await Result.destroy({ where: {} });
    console.log('✅ Results cleared');

    await Exam.destroy({ where: {} });
    console.log('✅ Exams cleared');

    await ExamKit.destroy({ where: {} });
    console.log('✅ Exam Kits cleared');

    await Student.destroy({ where: {} });
    console.log('✅ Students cleared');

    await Lead.destroy({ where: {} });
    console.log('✅ Leads cleared');

    await Topper.destroy({ where: {} });
    console.log('✅ Toppers cleared');

    await Blog.destroy({ where: {} });
    console.log('✅ Blogs cleared');

    await Subject.destroy({ where: {} });
    console.log('✅ Subjects cleared');

    await Batch.destroy({ where: {} });
    console.log('✅ Batches cleared');

    await Course.destroy({ where: {} });
    console.log('✅ Courses cleared');

    await Settings.destroy({ where: {} });
    console.log('✅ Settings cleared');

    await User.destroy({ where: {} });
    console.log('✅ ALL Users cleared (including admins)');

    // Re-enable FK constraints
    await sequelize.query('PRAGMA foreign_keys = ON;');

    console.log('\n🎉 Database fully wiped!');
    console.log('📌 Super Pro Admin will auto-recreate when server restarts.');
    console.log('\n✨ Fresh start — Website is ready to go LIVE!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

clearAll();
