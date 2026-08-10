const { sequelize } = require('../config/db');
const { Course, Batch, Topper, Blog, Student, User, Exam, Result } = require('../models');

async function seedEverything() {
  try {
    await sequelize.sync({ force: true }); // Wipe db completely and recreate
    console.log('Database wiped and recreated.');

    // 10 Courses
    const coursesData = Array.from({ length: 10 }, (_, i) => ({
      name: `Course ${i + 1}`,
      code: `C${i + 1}`,
      category: i % 2 === 0 ? 'Professional' : 'School',
      duration: '6 Months',
      fees: 10000 + (i * 1000),
      description: `Description for Course ${i + 1}`,
      features: ['Live Classes', 'Mock Tests']
    }));
    const courses = await Course.bulkCreate(coursesData);
    
    // 10 Batches
    const batchesData = Array.from({ length: 10 }, (_, i) => ({
      name: `Batch ${i + 1}`,
      startDate: new Date(),
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // +6 months
      timing: '10:00 AM - 12:00 PM',
      totalSeats: 50,
      instructor: 'Vikram Sir',
      status: 'active',
      fees: courses[i].fees,
      mode: 'offline',
      courseId: courses[i].id
    }));
    const batches = await Batch.bulkCreate(batchesData);

    // 10 Students & their Users
    const studentsData = Array.from({ length: 10 }, (_, i) => ({
      name: `Student ${i + 1}`,
      enrollmentNo: `DS2024${1000 + i}`,
      email: `student${i + 1}@example.com`,
      phone: `987654321${i}`,
      parentName: `Parent ${i + 1}`,
      parentEmail: `parent${i + 1}@example.com`,
      parentPhone: `987654321${i}`,
      dob: '2005-01-01',
      gender: i % 2 === 0 ? 'Male' : 'Female',
      address: `Address ${i + 1}`,
      courseId: courses[i].id,
      batchId: batches[i].id,
      isActive: true,
      enrollmentDate: new Date()
    }));
    
    // Create superadmin & admin
    await User.create({ name: "Super Admin", email: "superadmin@dseducation.com", password: "Admin@123", role: "superadmin" });
    await User.create({ name: "Admin", email: "admin@dseducation.com", password: "Admin@123", role: "admin" });

    for (const sData of studentsData) {
      const student = await Student.create(sData);
      await User.create({
        name: student.name,
        email: student.email,
        password: "password123",
        role: "student",
        studentId: student.id
      });
    }

    // 10 Exams
    const examsData = Array.from({ length: 10 }, (_, i) => ({
      title: `Exam ${i + 1}`,
      description: `Description for Exam ${i + 1}`,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // next week
      duration: 120, // 120 mins
      totalMarks: 100,
      passingMarks: 40,
      courseId: courses[i].id,
      isActive: true
    }));
    const exams = await Exam.bulkCreate(examsData);

    // 10 Results (1 for each student/exam)
    const students = await Student.findAll();
    const resultsData = Array.from({ length: 10 }, (_, i) => ({
      studentId: students[i].id,
      examId: exams[i].id,
      marksObtained: 40 + i * 5,
      totalMarks: 100,
      status: 'pass',
      remarks: 'Good job'
    }));
    await Result.bulkCreate(resultsData);

    // 10 Blogs
    const blogsData = Array.from({ length: 10 }, (_, i) => ({
      title: `Blog Post ${i + 1}`,
      slug: `blog-post-${i + 1}`,
      category: 'Education',
      author: 'Admin',
      excerpt: `Excerpt for blog post ${i + 1}`,
      content: `Full content for blog post ${i + 1}. This is some dummy text.`,
      tags: ['test', 'blog'],
      isPublished: true
    }));
    await Blog.bulkCreate(blogsData);

    // 10 Toppers
    const toppersData = Array.from({ length: 10 }, (_, i) => ({
      name: `Topper ${i + 1}`,
      course: courses[i].name,
      marks: `${90 + i}%`,
      rank: `Rank ${10 - i}`,
      year: '2024',
      testimonial: `Testimonial for topper ${i + 1}`,
      isActive: true
    }));
    await Topper.bulkCreate(toppersData);

    console.log('✅ Success: 10 records for all entities have been seeded.');
    process.exit(0);
  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
}

seedEverything();
