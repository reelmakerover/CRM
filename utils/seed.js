require('dotenv').config();
const { sequelize } = require('../config/db');
const { 
  User, Student, Course, Subject, Batch, Question, Exam, Topper 
} = require('../models');

const courses = [
  { name: '10th Commerce', code: 'C10', category: 'School', fees: 8000, duration: '1 Year', description: 'Build a strong foundation in commerce subjects.', features: ['Expert faculty', 'Weekly tests', 'Study material', 'Doubt sessions', 'Parent updates'] },
  { name: '11th Commerce', code: 'C11', category: 'School', fees: 12000, duration: '1 Year', description: 'Master senior commerce with deep Accountancy & Economics.', features: ['Expert faculty', 'Weekly tests', 'Study material', 'Mock board exams'] },
  { name: '12th Commerce', code: 'C12', category: 'School', fees: 15000, duration: '1 Year', description: 'Board exam mastery with intensive test series.', features: ['Board pattern tests', 'Last 10 yrs papers', 'Study material', 'Personal mentoring'] },
  { name: 'BCom / MCom', code: 'BCOM', category: 'Commerce', fees: 18000, duration: '1 Year', description: 'Advanced commerce and management concepts.', features: ['University aligned', 'Online test series', 'Study material', 'Career guidance'] },
  { name: 'BBA', code: 'BBA', category: 'Commerce', fees: 16000, duration: '1 Year', description: 'Business Administration fundamentals.', features: ['Industry examples', 'Case studies', 'Study material', 'Mock interviews'] },
  { name: 'CA Foundation', code: 'CAF', category: 'Professional', fees: 20000, duration: '6 Months', description: 'ICAI-aligned preparation for CA Foundation.', features: ['ICAI pattern', 'Mock tests', 'Study material', 'Success guarantee'] },
  { name: 'CA Intermediate', code: 'CAI', category: 'Professional', fees: 25000, duration: '1 Year', description: 'Comprehensive CA Intermediate coaching.', features: ['Both groups', 'Topic tests', 'Study material', 'Personal mentoring'] },
  { name: 'CMA / CS', code: 'CMACS', category: 'Professional', fees: 22000, duration: '1 Year', description: 'Cost Accounting & Company Secretary coaching.', features: ['Expert faculty', 'Mock exams', 'Study material', 'Placement support'] },
];

const toppers = [
  { name: 'Sneha Agarwal', course: '12th Commerce', marks: '98.4%', rank: 'State Rank 3', year: '2024', testimonial: "D's Education helped me achieve my dream score with structured preparation!" },
  { name: 'Aryan Joshi', course: 'CA Foundation', marks: 'Cleared', rank: 'All India Rank 47', year: '2024', testimonial: "Vikram Sir's guidance was invaluable. Cleared in first attempt!" },
];

const sampleQuestions = [
  { question: 'Which accounting concept requires that revenue should be recognized when it is earned?', optionA: 'Matching Concept', optionB: 'Revenue Recognition Concept', optionC: 'Going Concern Concept', optionD: 'Cost Concept', correctAnswer: 'B' },
  { question: 'The balance sheet is prepared to know the financial position of a business on a:', optionA: 'Particular date', optionB: 'Particular period', optionC: 'Fiscal year', optionD: 'None of these', correctAnswer: 'A' },
  { question: 'Which of the following is a current asset?', optionA: 'Land and Building', optionB: 'Plant and Machinery', optionC: 'Stock in Trade', optionD: 'Goodwill', correctAnswer: 'C' },
  { question: 'Capital = Assets – ?', optionA: 'Revenue', optionB: 'Liabilities', optionC: 'Expenses', optionD: 'Income', correctAnswer: 'B' },
  { question: 'Journal is a book of:', optionA: 'Final entry', optionB: 'Primary entry', optionC: 'Secondary entry', optionD: 'None', correctAnswer: 'B' },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL');

    // Force sync (drop and recreate tables)
    await sequelize.sync({ force: true });
    console.log('🧹 Cleared existing data and recreated tables');

    // Create superadmin
    await User.create({
      name: 'System Super Admin',
      email: 'superadmin@dseducation.in',
      password: 'SuperAdmin@123',
      role: 'superadmin',
    });
    console.log('👑 Super Admin created: superadmin@dseducation.in / SuperAdmin@123');

    // Create courses
    const createdCourses = await Course.bulkCreate(courses);
    console.log(`📚 ${createdCourses.length} courses created`);

    // Find CA Foundation course
    const caFoundation = createdCourses.find(c => c.code === 'CAF');
    
    // Create subjects
    const subjects = await Subject.bulkCreate([
      { name: 'Accounts', code: 'CAF-ACC', courseId: caFoundation.id, description: 'Principles of Accounting' },
      { name: 'Business Laws', code: 'CAF-LAW', courseId: caFoundation.id, description: 'Business & Mercantile Laws' },
    ]);
    console.log(`📖 ${subjects.length} subjects created`);

    // Create batches
    const batches = await Batch.bulkCreate([
      {
        name: 'CA Foundation Morning Batch',
        courseId: caFoundation.id,
        startDate: new Date(Date.now() + 7 * 86400000),
        timing: '7:00 AM – 9:00 AM',
        totalSeats: 25,
        status: 'upcoming',
        mode: 'offline',
        instructor: 'Vikram Rathore Sir',
        fees: 20000,
        description: 'Intensive morning batch for CA Foundation preparation',
      }
    ]);
    console.log(`📅 ${batches.length} batches created`);

    // Create demo student
    const demoStudent = await Student.create({
      enrollmentNo: 'DSE20240001',
      name: 'Rahul Sharma',
      email: 'student@dseducation.in',
      phone: '9876543210',
      parentName: 'Suresh Sharma',
      parentEmail: 'parent@example.com',
      parentPhone: '9876543211',
      courseId: caFoundation.id,
      batchId: batches[0].id,
      fees: {
        totalFees: 20000,
        paidAmount: 10000,
        pendingAmount: 10000,
        installments: [
          { id: 1, amount: 10000, dueDate: new Date(), paidDate: new Date(), status: 'paid' },
          { id: 2, amount: 10000, dueDate: new Date(Date.now() + 90 * 86400000), status: 'pending' },
        ],
      },
    });

    await User.create({
      name: 'Rahul Sharma',
      email: 'student@dseducation.in',
      password: 'Student@123',
      role: 'student',
      phone: '9876543210',
      studentId: demoStudent.id,
    });
    console.log('👨‍🎓 Demo student created: student@dseducation.in / Student@123');

    // Insert questions
    const questionsToInsert = sampleQuestions.map(q => ({
      ...q,
      courseId: caFoundation.id,
      subjectId: subjects[0].id,
      difficulty: 'medium',
      marks: 1,
    }));
    await Question.bulkCreate(questionsToInsert);
    console.log(`❓ ${questionsToInsert.length} questions inserted`);

    // Create demo exam
    await Exam.create({
      title: 'CA Foundation Accounts – Mock Test 1',
      courseId: caFoundation.id,
      subjectId: subjects[0].id,
      totalQuestions: 5,
      questionsPerExam: 5,
      duration: 60,
      totalMarks: 5,
      passingMarks: 2,
      status: 'active',
      shuffleQuestions: true,
      shuffleOptions: true,
      instructions: 'This is a mock test.',
    });
    console.log('📝 Demo exam created');

    // Create toppers
    await Topper.bulkCreate(toppers);
    console.log(`🏆 ${toppers.length} toppers added`);

    console.log('\n✅ Database seeded successfully!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
