require('dotenv').config();
const { sequelize } = require('./config/db');
require('./models'); // Load all models
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
const Question = require('./models/Question');

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync();

  console.log("🌱 Starting Database Seeding...");

  // 1. Create Superadmin & Admin
  const superadminExists = await User.findOne({ where: { email: 'superadmin@dseducation.com' } });
  if (!superadminExists) {
    await User.create({
      name: "Super Admin",
      email: "superadmin@dseducation.com",
      password: "Admin@123",
      role: "superadmin"
    });
    console.log("✅ Superadmin Created!");
  }

  const adminExists = await User.findOne({ where: { email: 'admin@dseducation.com' } });
  if (!adminExists) {
    await User.create({
      name: "Admin",
      email: "admin@dseducation.com",
      password: "Admin@123",
      role: "admin"
    });
    console.log("✅ Admin Created!");
  }

  // 2. Seed Default Courses
  const defaultCourses = [
    { name: '10th Commerce', code: 'C10', category: 'School', fees: 8000, duration: '1 Year', description: 'Build a strong foundation in commerce subjects — Accounts, Economics, Business Studies & Maths.', features: ['Expert faculty', 'Weekly tests', 'Study material', 'Doubt sessions', 'Parent updates'] },
    { name: '11th Commerce', code: 'C11', category: 'School', fees: 12000, duration: '1 Year', description: 'Master the transition to senior commerce with deep dives into Accountancy, Economics & BST.', features: ['Expert faculty', 'Weekly tests', 'Study material', 'Doubt sessions', 'Mock board exams'] },
    { name: '12th Commerce', code: 'C12', category: 'School', fees: 15000, duration: '1 Year', description: 'Board exam mastery with intensive test series, revision sheets and one-on-one doubt clearance.', features: ['Board pattern tests', 'Last 10 yrs papers', 'Study material', 'Personal mentoring', 'Parent updates'] },
    { name: 'BCom / MCom', code: 'BCOM', category: 'Commerce', fees: 18000, duration: '1 Year', description: 'Advanced commerce and management concepts with university-aligned curriculum and practice tests.', features: ['University aligned', 'Online test series', 'Study material', 'Personal mentoring', 'Career guidance'] },
    { name: 'BBA', code: 'BBA', category: 'Commerce', fees: 16000, duration: '1 Year', description: 'Business Administration fundamentals — Management, Marketing, Finance and Entrepreneurship.', features: ['Industry examples', 'Case studies', 'Study material', 'Group discussions', 'Mock interviews'] },
    { name: 'CA Foundation', code: 'CAF', category: 'Professional', fees: 20000, duration: '6 Months', description: 'ICAI-aligned preparation for CA Foundation with subject specialists and rigorous mock tests.', features: ['ICAI pattern', 'Mock tests', 'Study material', 'Personal mentoring', 'Success guarantee'] },
    { name: 'CA Intermediate', code: 'CAI', category: 'Professional', fees: 25000, duration: '1 Year', description: 'Comprehensive CA Intermediate coaching across both groups with past paper analysis.', features: ['Both groups', 'Topic tests', 'Study material', 'Personal mentoring', 'Parent updates'] },
    { name: 'CMA / CS', code: 'CMACS', category: 'Professional', fees: 22000, duration: '1 Year', description: 'Cost & Management Accounting and Company Secretary foundation with expert guidance.', features: ['Expert faculty', 'Mock exams', 'Study material', 'Personal mentoring', 'Placement support'] },
  ];

  const courseMap = {};
  for (const c of defaultCourses) {
    const [courseObj] = await Course.findOrCreate({
      where: { code: c.code },
      defaults: c
    });
    courseMap[c.code] = courseObj;
  }

  const defaultSubjects = [
    // 10th
    { name: 'Accountancy', code: 'ACC10', courseCode: 'C10', description: 'Class 10 Commercial Studies & Accounting' },
    { name: 'Economics', code: 'ECO10', courseCode: 'C10', description: 'Class 10 Economics' },
    { name: 'Mathematics', code: 'MATH10', courseCode: 'C10', description: 'Class 10 Mathematics' },
    { name: 'Commercial Studies', code: 'COM10', courseCode: 'C10', description: 'Class 10 Commercial Studies' },

    // 11th
    { name: 'Accountancy', code: 'ACC11', courseCode: 'C11', description: 'Class 11 Accountancy' },
    { name: 'Economics', code: 'ECO11', courseCode: 'C11', description: 'Class 11 Microeconomics & Statistics' },
    { name: 'Business Studies', code: 'BST11', courseCode: 'C11', description: 'Class 11 Business Studies' },
    { name: 'Applied Mathematics', code: 'MATH11', courseCode: 'C11', description: 'Class 11 Mathematics' },

    // 12th
    { name: 'Accountancy', code: 'ACC12', courseCode: 'C12', description: 'Class 12 Partnership, Company & Cash Flow' },
    { name: 'Economics', code: 'ECO12', courseCode: 'C12', description: 'Class 12 Macroeconomics & Indian Economy' },
    { name: 'Business Studies', code: 'BST12', courseCode: 'C12', description: 'Class 12 Principles & Functions of Management' },
    { name: 'Mathematics', code: 'MATH12', courseCode: 'C12', description: 'Class 12 Mathematics' },

    // BCom / MCom
    { name: 'Financial Accounting', code: 'FA_BCOM', courseCode: 'BCOM', description: 'Financial Accounting & Reporting' },
    { name: 'Corporate Accounting', code: 'CA_BCOM', courseCode: 'BCOM', description: 'Corporate Accounting & Valuation' },
    { name: 'Business Law', code: 'BL_BCOM', courseCode: 'BCOM', description: 'Mercantile & Business Law' },
    { name: 'Income Tax', code: 'TAX_BCOM', courseCode: 'BCOM', description: 'Direct Tax Laws & Practice' },
    { name: 'Cost Accounting', code: 'CMA_BCOM', courseCode: 'BCOM', description: 'Cost & Management Accounting' },
    { name: 'Auditing', code: 'AUD_BCOM', courseCode: 'BCOM', description: 'Auditing Principles & Assurance' },

    // BBA
    { name: 'Principles of Management', code: 'POM_BBA', courseCode: 'BBA', description: 'Management Principles & Practice' },
    { name: 'Marketing Management', code: 'MM_BBA', courseCode: 'BBA', description: 'Marketing Concepts & Strategies' },
    { name: 'Business Economics', code: 'BE_BBA', courseCode: 'BBA', description: 'Managerial & Business Economics' },
    { name: 'Financial Management', code: 'FM_BBA', courseCode: 'BBA', description: 'Corporate Finance & Management' },

    // CA Foundation
    { name: 'Principles and Practice of Accounting', code: 'ACC_CAF', courseCode: 'CAF', description: 'CA Foundation Accounting Paper 1' },
    { name: 'Business Laws', code: 'LAW_CAF', courseCode: 'CAF', description: 'CA Foundation Business Laws Paper 2' },
    { name: 'Quantitative Aptitude', code: 'QA_CAF', courseCode: 'CAF', description: 'Maths, Stats & Logical Reasoning Paper 3' },
    { name: 'Business Economics', code: 'ECO_CAF', courseCode: 'CAF', description: 'Business Economics Paper 4' },

    // CA Intermediate
    { name: 'Advanced Accounting', code: 'ADVACC_CAI', courseCode: 'CAI', description: 'CA Inter Paper 1' },
    { name: 'Corporate and Other Laws', code: 'LAW_CAI', courseCode: 'CAI', description: 'CA Inter Paper 2' },
    { name: 'Taxation', code: 'TAX_CAI', courseCode: 'CAI', description: 'CA Inter Paper 3 (DT + IDT)' },
    { name: 'Cost and Management Accounting', code: 'COST_CAI', courseCode: 'CAI', description: 'CA Inter Paper 4' },
    { name: 'Auditing and Ethics', code: 'AUD_CAI', courseCode: 'CAI', description: 'CA Inter Paper 5' },
    { name: 'Financial Management and Strategic Management', code: 'FMSM_CAI', courseCode: 'CAI', description: 'CA Inter Paper 6' },

    // CMA / CS
    { name: 'Fundamentals of Accounting', code: 'ACC_CMA', courseCode: 'CMACS', description: 'CMA / CS Accounting' },
    { name: 'Business Laws and Ethics', code: 'LAW_CMA', courseCode: 'CMACS', description: 'CMA / CS Law & Ethics' },
    { name: 'Business Mathematics & Statistics', code: 'MATH_CMA', courseCode: 'CMACS', description: 'CMA / CS Quantitative Methods' },
    { name: 'Business Economics', code: 'ECO_CMA', courseCode: 'CMACS', description: 'CMA / CS Business Economics' }
  ];

  for (const s of defaultSubjects) {
    const courseObj = courseMap[s.courseCode];
    const existing = await Subject.findOne({ where: { code: s.code } });
    if (!existing) {
      await Subject.create({
        name: s.name,
        code: s.code,
        description: s.description,
        courseId: courseObj ? courseObj.id : null
      });
    } else if (!existing.courseId && courseObj) {
      await existing.update({ courseId: courseObj.id });
    }
  }

  // 3. Seed Batches
  const firstCourse = await Course.findOne({ where: { code: 'C12' } });
  const caCourse = await Course.findOne({ where: { code: 'CAF' } });
  const caInterCourse = await Course.findOne({ where: { code: 'CAI' } });

  const defaultBatches = [
    { name: 'Class 12th Toppers Batch A', startDate: new Date('2026-04-01'), endDate: new Date('2027-03-31'), timing: '07:00 AM - 09:00 AM', totalSeats: 35, instructor: 'Vikram Rathore Sir', status: 'active', mode: 'offline', fees: 15000, courseId: firstCourse?.id },
    { name: 'Class 12th Rankers Batch B', startDate: new Date('2026-06-01'), endDate: new Date('2027-03-31'), timing: '04:00 PM - 06:00 PM', totalSeats: 30, instructor: 'Vikram Rathore Sir', status: 'upcoming', mode: 'offline', fees: 15000, courseId: firstCourse?.id },
    { name: 'CA Foundation Nov 2026 Batch', startDate: new Date('2026-05-15'), endDate: new Date('2026-11-15'), timing: '10:00 AM - 01:00 PM', totalSeats: 40, instructor: 'Vikram Rathore & Team', status: 'upcoming', mode: 'hybrid', fees: 20000, courseId: caCourse?.id },
    { name: 'CA Intermediate Both Groups Batch', startDate: new Date('2026-05-01'), endDate: new Date('2027-05-01'), timing: '08:00 AM - 12:00 PM', totalSeats: 25, instructor: 'Vikram Rathore Sir', status: 'upcoming', mode: 'hybrid', fees: 25000, courseId: caInterCourse?.id },
  ];

  for (const b of defaultBatches) {
    const exists = await Batch.findOne({ where: { name: b.name } });
    if (!exists) await Batch.create(b);
  }

  // 4. Seed Toppers
  const defaultToppers = [
    { name: 'Priya Sharma', course: '12th Commerce', marks: '97.4%', percentage: '97.4%', rank: 'AIR 1', year: '2025', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', testimonial: "Vikram Sir's teaching style is exceptional. I scored 97.4% in Accountancy thanks to D's Education's structured approach." },
    { name: 'Rahul Gupta', course: 'CA Foundation', marks: '345/400', percentage: '86.25%', rank: 'AIR 4', year: '2025', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', testimonial: 'The test series here is unmatched. The instant feedback and ranking system kept me motivated throughout my preparation.' },
    { name: 'Anjali Mehta', course: 'BCom', marks: '94.8%', percentage: '94.8%', rank: '1st Rank', year: '2024', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80', testimonial: 'Small batch sizes made all the difference. I never hesitated to ask doubts and always got personalized attention.' },
    { name: 'Karan Verma', course: '11th Commerce', marks: '96.2%', percentage: '96.2%', rank: '1st Rank', year: '2024', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80', testimonial: 'The mock exam system is brilliant. Knowing my rank among peers pushed me to study harder every single day.' },
    { name: 'Sneha Patel', course: '12th Commerce', marks: '96.8%', percentage: '96.8%', rank: 'AIR 12', year: '2025', photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80', testimonial: 'Clear concept clarity in accounts and macro economics. Highly recommend D\'s Education!' },
    { name: 'Rohan Sharma', course: 'CA Intermediate', marks: '520/800', percentage: '65%', rank: 'Both Groups Cleared', year: '2025', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80', testimonial: 'Cleared both groups of CA Inter in first attempt under Vikram Sir\'s guidance!' }
  ];

  for (const t of defaultToppers) {
    const exists = await Topper.findOne({ where: { name: t.name, course: t.course } });
    if (!exists) await Topper.create(t);
  }

  // 5. Seed Blogs (with high-res Unsplash cover images)
  const defaultBlogs = [
    {
      title: 'How to Score 95%+ in Class 12th Board Exams (Commerce)',
      slug: 'how-to-score-95-in-class-12th-board-exams-commerce',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
      excerpt: 'Comprehensive study strategy, chapter-wise weightage and presentation tips by Vikram Rathore Sir.',
      content: 'Scoring distinction in 12th Commerce requires a blend of conceptual clarity, rigorous answer writing, and regular mock testing. Here are proven steps to achieve top results in Accountancy, Economics & Business Studies...',
      author: 'Vikram Rathore Sir',
      category: 'Board Exams',
      tags: ['12th Commerce', 'Accounts', 'Board Strategy']
    },
    {
      title: 'CA Foundation Nov 2026 Preparation Strategy',
      slug: 'ca-foundation-nov-2026-preparation-strategy',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
      excerpt: 'Step-by-step roadmap to clear CA Foundation in your first attempt with ICAI pattern practice.',
      content: 'CA Foundation tests fundamental accounting concepts, commercial law, quantitative aptitude and business economics. Follow our 6-month revision plan to ensure success on your very first attempt...',
      author: 'Vikram Rathore Sir',
      category: 'CA Foundation',
      tags: ['CA Foundation', 'ICAI', 'Study Plan']
    },
    {
      title: 'Why Commerce Stream Opens Endless Career Opportunities',
      slug: 'why-commerce-stream-opens-endless-career-opportunities',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      excerpt: 'Discover top career paths after 12th Commerce: CA, CS, CMA, Investment Banking & Corporate Law.',
      content: 'Commerce is one of the most dynamic streams with high growth potential across corporate, financial and professional domains. Learn how to choose between CA, CS, BBA and Banking...',
      author: 'D\'s Education Editorial',
      category: 'Career Guidance',
      tags: ['Career', 'Commerce', 'Future Scope']
    },
    {
      title: 'Top 5 Time Management Hacks for CA Intermediate Aspirants',
      slug: 'top-5-time-management-hacks-for-ca-intermediate-aspirants',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
      excerpt: 'Master Both Groups of CA Inter with daily revision schedules and topic test series.',
      content: 'Preparing for CA Intermediate Both Groups requires disciplined routine, chapterwise mock tests, and smart revision. Here are 5 practical time management hacks used by AIR rankers...',
      author: 'Vikram Rathore Sir',
      category: 'Exam Tips',
      tags: ['CA Inter', 'Time Management', 'Exam Strategy']
    }
  ];

  for (const bl of defaultBlogs) {
    const exists = await Blog.findOne({ where: { slug: bl.slug } });
    if (!exists) {
      await Blog.create(bl);
    } else {
      await exists.update({ image: bl.image });
    }
  }

  // 6. Seed Exam Kits (Test Series Packages)
  const defaultKits = [
    {
      title: '🎯 CA Intermediate Both Groups Master Test Series Package 2026',
      subtitle: 'Paper 1 to 8 Full Syllabus Test Papers, Answers & Video Solutions',
      categoryType: 'CA Intermediate Test Series',
      validity: '1 Year Validity',
      description: 'Comprehensive Test Series for CA Intermediate both groups (Group 1 & Group 2). Includes past 10 years ICAI question paper analysis, chapterwise mock tests, PDF keys, and detailed video solution masterclasses.',
      mrpPrice: 9999.00,
      sellingPrice: 3999.00,
      thumbnailUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80',
      features: JSON.stringify([
        'Full Syllabus Video Solution Classes for Group 1 & Group 2',
        '25+ PDF Test Papers with Step-by-Step Model Answers',
        'ICAI Past 10 Years Solved Questions & Revision Notes',
        'Direct One-on-One Doubt Clearance by Vikram Rathore Sir',
        'Instant Access & Multi-Device Streaming'
      ]),
      includedPdfs: JSON.stringify([
        { title: 'CA Inter Advanced Accounting Test Paper 1.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
        { title: 'CA Inter Corporate Law Model Solution Key.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
        { title: 'Taxation & GST Chapterwise Formula Sheet.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
        { title: 'Cost & Management Accounting Practice Set.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
      ]),
      includedVideos: JSON.stringify([
        { title: 'Advanced Accounting Paper 1 Solution Class', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
        { title: 'Corporate Law Important Sections Revision', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
        { title: 'Taxation GST Computation Video Solution', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
      ]),
      status: 'published',
      salesCount: 215,
      courseId: caInterCourse?.id
    },
    {
      title: '🔥 12th Commerce Board Exam Victory Kit 2026',
      subtitle: 'Complete Board Exam Master Bundle with Notes, Formulas & Video Series',
      categoryType: '12th Board Test Series',
      validity: '1 Year Validity',
      description: 'The ultimate all-in-one preparation package for CBSE & State Board 12th Commerce students. Includes Accountancy, Economics & Business Studies revision notes and sample paper solutions.',
      mrpPrice: 4999.00,
      sellingPrice: 1999.00,
      thumbnailUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
      features: JSON.stringify([
        'Full Syllabus Video Lectures & Revision Series',
        'Chapterwise PDF Notes & Formula Sheets',
        '10 Model Question Papers with Model Answers',
        'Direct Doubt Support from Vikram Rathore Sir',
        'Lifetime Access on Web & Mobile'
      ]),
      includedPdfs: JSON.stringify([
        { title: 'Chapter 1 - Accounting Foundations PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
        { title: 'Chapter 2 - Partnership Accounts Revision Sheet', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
        { title: 'Macro Economics Demand & Supply Formula Sheet.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
      ]),
      includedVideos: JSON.stringify([
        { title: 'Accountancy Masterclass 1', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
        { title: 'Economics Demand & Supply Analysis', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
      ]),
      status: 'published',
      salesCount: 142,
      courseId: firstCourse?.id
    },
    {
      title: '⭐ CA Foundation All Papers Master Package',
      subtitle: 'Paper 1 to 4 Complete Study Kit with Practice Questions & Tests',
      categoryType: 'CA Foundation Test Series',
      validity: '6 Months Validity',
      description: 'Comprehensive Exam Kit designed specially for CA Aspirants. Covers Principles & Practice of Accounting, Business Laws, Maths & Business Economics.',
      mrpPrice: 7999.00,
      sellingPrice: 2999.00,
      thumbnailUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80',
      features: JSON.stringify([
        'CA Foundation Complete 4 Papers Study Notes',
        'RTP & MTP Practice Sheets',
        'Past 10 Years Solved Exam Questions',
        'Exam Strategy & Speed Building Sessions'
      ]),
      includedPdfs: JSON.stringify([
        { title: 'Indian Contract Act 1872 PDF Notes', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
        { title: 'Business Economics Practice Questions.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
      ]),
      includedVideos: JSON.stringify([
        { title: 'CA Law Fundamentals Video Class', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
      ]),
      status: 'published',
      salesCount: 189,
      courseId: caCourse?.id
    }
  ];

  for (const kit of defaultKits) {
    const exists = await ExamKit.findOne({ where: { title: kit.title } });
    if (!exists) {
      await ExamKit.create(kit);
    } else {
      await exists.update({
        categoryType: kit.categoryType,
        validity: kit.validity,
        includedPdfs: kit.includedPdfs,
        includedVideos: kit.includedVideos,
        thumbnailUrl: kit.thumbnailUrl
      });
    }
  }

  // 7. Seed Public Demo Mock Exams and Questions
  const class12Course = await Course.findOne({ where: { name: '12th Commerce' } });
  const caFoundCourse = await Course.findOne({ where: { name: 'CA Foundation' } });
  const acctSubject = await Subject.findOne({ where: { name: 'Accountancy' } });
  const caAcctSubject = await Subject.findOne({ where: { name: 'Principles and Practice of Accounting' } });

  if (class12Course && acctSubject) {
    const demoExam1 = await Exam.findOne({ where: { title: 'Class 12th Accountancy Comprehensive Free Mock Test' } });
    const examData1 = {
      title: 'Class 12th Accountancy Comprehensive Free Mock Test',
      duration: 30,
      totalQuestions: 10,
      questionsPerExam: 10,
      totalMarks: 20,
      passingMarks: 8,
      status: 'active',
      isPublic: true,
      instructions: 'Answer all 10 questions. +2 Marks for each correct answer. Submit your email at the end to get full performance report & scholarship voucher.',
      shuffleQuestions: true,
      shuffleOptions: true,
      negativeMarking: false,
      courseId: class12Course.id,
      subjectId: acctSubject.id
    };

    let createdExam1;
    if (!demoExam1) {
      createdExam1 = await Exam.create(examData1);
    } else {
      await demoExam1.update(examData1);
      createdExam1 = demoExam1;
    }

    const sampleQuestions = [
      {
        question: 'In the absence of a partnership deed, the rate of interest allowed on a partner’s loan to the firm is:',
        optionA: '6% p.a. simple interest',
        optionB: '8% p.a.',
        optionC: '12% p.a.',
        optionD: 'No interest is allowed',
        correctAnswer: 'A',
        difficulty: 'easy',
        marks: 2,
        explanation: 'According to Section 13(d) of Indian Partnership Act 1932, interest on partner loan is 6% p.a. in absence of agreement.'
      },
      {
        question: 'Goodwill is classified under which type of asset?',
        optionA: 'Tangible Fixed Asset',
        optionB: 'Intangible Fixed Asset',
        optionC: 'Current Asset',
        optionD: 'Fictitious Asset',
        correctAnswer: 'B',
        difficulty: 'easy',
        marks: 2,
        explanation: 'Goodwill is an intangible asset that has realisable value.'
      },
      {
        question: 'Sacrificing Ratio is calculated as:',
        optionA: 'New Ratio − Old Ratio',
        optionB: 'Old Ratio − New Ratio',
        optionC: 'Old Ratio × New Ratio',
        optionD: 'Gaining Ratio − Old Ratio',
        correctAnswer: 'B',
        difficulty: 'easy',
        marks: 2,
        explanation: 'Sacrificing Ratio = Old Share − New Share.'
      },
      {
        question: 'On admission of a new partner, increase in value of an asset is credited to:',
        optionA: 'Revaluation Account',
        optionB: 'Asset Account',
        optionC: 'Old Partners Capital Account',
        optionD: 'Profit & Loss Account',
        correctAnswer: 'A',
        difficulty: 'medium',
        marks: 2,
        explanation: 'Increase in asset value is a gain, hence credited to Revaluation A/c.'
      },
      {
        question: 'Which of the following is NOT an outflow of cash under Financing Activities?',
        optionA: 'Redemption of Debentures',
        optionB: 'Payment of Dividend',
        optionC: 'Purchase of Plant and Machinery',
        optionD: 'Repayment of Long-term Bank Loan',
        correctAnswer: 'C',
        difficulty: 'medium',
        marks: 2,
        explanation: 'Purchase of fixed assets is an Investing Activity.'
      },
      {
        question: 'Securities Premium Reserve CANNOT be utilized for which of the following purposes?',
        optionA: 'Issuing fully paid bonus shares',
        optionB: 'Writing off preliminary expenses',
        optionC: 'Distribution of cash dividend to shareholders',
        optionD: 'Writing off discount on issue of debentures',
        correctAnswer: 'C',
        difficulty: 'hard',
        marks: 2,
        explanation: 'Section 52(2) of Companies Act 2013 prohibits distribution of dividends from Securities Premium.'
      },
      {
        question: 'General Reserve at the time of admission of a partner is transferred to:',
        optionA: 'Old Partners in Old Ratio',
        optionB: 'All Partners in New Ratio',
        optionC: 'Revaluation Account',
        optionD: 'New Partner Capital Account',
        correctAnswer: 'A',
        difficulty: 'easy',
        marks: 2,
        explanation: 'Accumulated profits/reserves belong to old partners in their old profit-sharing ratio.'
      },
      {
        question: 'Working Capital is defined as:',
        optionA: 'Total Assets − Total Liabilities',
        optionB: 'Current Assets − Current Liabilities',
        optionC: 'Fixed Assets − Current Liabilities',
        optionD: 'Current Assets + Current Liabilities',
        correctAnswer: 'B',
        difficulty: 'easy',
        marks: 2,
        explanation: 'Working Capital = Current Assets minus Current Liabilities.'
      },
      {
        question: 'If a share of ₹10 (on which ₹8 is paid) is forfeited, the maximum discount on re-issue can be:',
        optionA: '₹10',
        optionB: '₹8',
        optionC: '₹2',
        optionD: '₹0',
        correctAnswer: 'B',
        difficulty: 'medium',
        marks: 2,
        explanation: 'Maximum discount on reissue of forfeited share cannot exceed the amount already forfeited (₹8).'
      },
      {
        question: 'Debentures represent which of the following for a company?',
        optionA: 'Owners Capital',
        optionB: 'Loan Capital (Long-term Debt)',
        optionC: 'Short-term Borrowing',
        optionD: 'Contingent Liability',
        correctAnswer: 'B',
        difficulty: 'easy',
        marks: 2,
        explanation: 'Debentures are debt instruments signifying loan capital.'
      }
    ];

    for (const q of sampleQuestions) {
      const qExists = await Question.findOne({ where: { question: q.question } });
      if (!qExists) {
        await Question.create({
          ...q,
          courseId: class12Course.id,
          subjectId: acctSubject.id,
          isActive: true
        });
      }
    }
  }

  if (caFoundCourse && caAcctSubject) {
    const demoExam2 = await Exam.findOne({ where: { title: 'CA Foundation Accounting Speed & Accuracy Demo Mock' } });
    const examData2 = {
      title: 'CA Foundation Accounting Speed & Accuracy Demo Mock',
      duration: 30,
      totalQuestions: 10,
      questionsPerExam: 10,
      totalMarks: 20,
      passingMarks: 10,
      status: 'active',
      isPublic: true,
      instructions: 'Real ICAI exam pattern mock. Score 50%+ to qualify for special scholarship discount.',
      shuffleQuestions: true,
      shuffleOptions: true,
      negativeMarking: true,
      negativeMarks: 0.5,
      courseId: caFoundCourse.id,
      subjectId: caAcctSubject.id
    };

    if (!demoExam2) {
      await Exam.create(examData2);
    } else {
      await demoExam2.update(examData2);
    }
  }

  console.log("🎉 SEEDING COMPLETE!");
  if (require.main === module) process.exit(0);
}

if (require.main === module) {
  seed().catch(err => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
}

module.exports = seed;
