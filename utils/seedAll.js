const { sequelize } = require('../config/db');
const { Course, Batch, Topper, Blog } = require('../models');

// ─── 12 COURSES ───────────────────────────────────────────────
const courses = [
  { name: 'CA Foundation', code: 'CAF', category: 'Professional', duration: '8 Months', fees: 18000, description: 'First step towards becoming a Chartered Accountant. Covers accounting, law, economics and maths.', features: ['Live Classes', 'Study Material', 'Mock Tests', 'Doubt Sessions'] },
  { name: 'CA Intermediate', code: 'CAI', category: 'Professional', duration: '12 Months', fees: 28000, description: 'Second level of CA with advanced accounting, audit, taxation and law.', features: ['Expert Faculty', 'Full Study Kit', 'Test Series', 'Career Guidance'] },
  { name: 'CA Final', code: 'CAFIN', category: 'Professional', duration: '18 Months', fees: 45000, description: 'The final stage of CA. Advanced financial reporting, strategic management and elective papers.', features: ['AIR-level Coaching', 'Revision Batches', 'Case Studies', '1-on-1 Mentoring'] },
  { name: 'Class 11th Commerce', code: 'C11', category: 'School', duration: '12 Months', fees: 12000, description: 'Foundation year for commerce students. Accounts, Economics, Business Studies and English.', features: ['CBSE Aligned', 'Notes Provided', 'Weekly Tests', 'Parent Reports'] },
  { name: 'Class 12th Commerce', code: 'C12', category: 'School', duration: '12 Months', fees: 14000, description: 'Board exam preparation with focus on high scores in Accounts, Eco and BST.', features: ['Board Pattern Practice', 'Sample Papers', 'Revision Classes', 'Result-oriented'] },
  { name: 'BCom (Hons)', code: 'BCOM', category: 'Commerce', duration: '6 Months', fees: 10000, description: 'Semester-wise coaching for BCom Hons students at university level.', features: ['University Syllabus', 'Assignment Help', 'Exam Strategy', 'Group Sessions'] },
  { name: 'CMA Foundation', code: 'CMAF', category: 'Professional', duration: '6 Months', fees: 15000, description: 'Cost Management Accountant Foundation course. Covers financial accounting and business laws.', features: ['ICMAI Aligned', 'Live Doubt Solving', 'Test Series', 'Study Material'] },
  { name: 'CS Foundation', code: 'CSF', category: 'Professional', duration: '6 Months', fees: 12000, description: 'Company Secretary Foundation program by ICSI. Corporate laws and business communication.', features: ['ICSI Pattern', 'Mock Tests', 'Legal Updates', 'Career Counseling'] },
  { name: 'GST & Taxation', code: 'GST', category: 'Commerce', duration: '3 Months', fees: 8000, description: 'Practical course on GST filing, income tax returns and TDS. Job-ready program.', features: ['Practical Training', 'Software Usage', 'Certificate', 'Placement Support'] },
  { name: 'Tally with GST', code: 'TALLY', category: 'Commerce', duration: '2 Months', fees: 5000, description: 'Complete Tally ERP 9 and Tally Prime with GST integration for accounting professionals.', features: ['Tally Prime', 'GST Filing', 'Payroll', 'Certificate'] },
  { name: 'Financial Markets', code: 'FM', category: 'Commerce', duration: '3 Months', fees: 9000, description: 'Stock markets, mutual funds, derivatives and investment basics for commerce students.', features: ['SEBI Curriculum', 'Live Market Sessions', 'Demat Setup', 'Research Skills'] },
  { name: 'Class 10th (Commerce Focus)', code: 'C10', category: 'School', duration: '10 Months', fees: 10000, description: 'Build a strong commerce foundation in class 10 with Maths and Social Science mastery.', features: ['CBSE Board Focus', 'Chapter Tests', 'Previous Year Papers', 'Score Guarantee'] },
];

// ─── 12 TOPPERS ──────────────────────────────────────────────
const toppers = [
  { name: 'Sneha Agarwal', course: '12th Commerce', marks: '98.4%', rank: 'State Rank 3', year: '2024', testimonial: "D's Education transformed my preparation completely!", isActive: true },
  { name: 'Aryan Joshi', course: 'CA Foundation', marks: 'Cleared', rank: 'All India Rank 47', year: '2024', testimonial: "Vikram Sir's guidance was the key to my success.", isActive: true },
  { name: 'Pooja Sharma', course: '12th Commerce', marks: '97.2%', rank: 'School Topper', year: '2024', testimonial: 'Best faculty and best study environment!', isActive: true },
  { name: 'Rahul Gupta', course: 'BCom Final', marks: '89.5%', rank: 'University Rank 2', year: '2023', testimonial: 'Consistent support from teachers made the difference.', isActive: true },
  { name: 'Meera Singh', course: '11th Commerce', marks: '95%', rank: 'Class Topper', year: '2024', isActive: true },
  { name: 'Akash Verma', course: 'CA Inter', marks: 'Cleared', rank: 'All India Rank 89', year: '2024', testimonial: 'Mock test series was extremely helpful.', isActive: true },
  { name: 'Priya Mehta', course: '12th Commerce', marks: '96.8%', rank: 'District Rank 5', year: '2023', isActive: true },
  { name: 'Saurabh Jain', course: 'CA Foundation', marks: 'Cleared', rank: 'All India Rank 112', year: '2023', testimonial: 'Wonderful batch experience. Miss the classes!', isActive: true },
  { name: 'Kavya Sharma', course: 'BCom', marks: '91%', rank: 'College Rank 1', year: '2023', isActive: true },
  { name: 'Rohit Bansal', course: '12th Commerce', marks: '94.6%', rank: 'School Topper', year: '2022', testimonial: "Accounts concepts are crystal clear thanks to D's Education.", isActive: true },
  { name: 'Ankita Yadav', course: 'GST & Taxation', marks: 'Distinction', rank: 'Batch Topper', year: '2024', isActive: true },
  { name: 'Vikash Kumar', course: '12th Commerce', marks: '92%', rank: 'District Rank 8', year: '2022', isActive: true },
];

// ─── 12 BLOGS ────────────────────────────────────────────────
const blogs = [
  { title: 'How to Crack CA Foundation in First Attempt', slug: 'crack-ca-foundation-first-attempt', category: 'Exam Tips', author: 'Vikram Rathore Sir', excerpt: 'Strategic tips to clear CA Foundation on your first try.', content: 'Cracking CA Foundation requires strategy, consistency and the right guidance. Focus on ICAI study material, practice previous year papers, and solve mock tests regularly. At D\'s Education, we offer a structured CA Foundation program with expert faculty to ensure you clear in your first attempt.\n\n1. Understand the Syllabus thoroughly\n2. Focus on Accounts and Law (high weightage)\n3. Solve 5 years of past papers\n4. Attend all doubt sessions\n5. Maintain a study schedule\n\nWith Vikram Rathore Sir\'s mentoring, hundreds of students have cleared CA Foundation on the very first attempt.', tags: ['CA', 'Exam Tips', 'ICAI'], isPublished: true },
  { title: 'Top 5 Career Options After 12th Commerce in 2024', slug: 'career-options-after-12th-commerce', category: 'Career', author: 'Admin', excerpt: 'The most lucrative career paths available for commerce students.', content: 'Commerce stream opens up a world of opportunities. Here are the top 5 careers:\n\n1. Chartered Accountancy (CA) - Gold standard of commerce\n2. MBA/BBA - For future business leaders\n3. Company Secretary (CS) - Corporate law expert\n4. CMA - Cost management specialist\n5. Financial Analyst - Data-driven finance career\n\nAll of these programs are offered at D\'s Education with expert faculty and industry-focused curriculum.', tags: ['Career', 'Commerce', 'Future'], isPublished: true },
  { title: 'Why Conceptual Clarity is the Secret to 95%+ in Accountancy', slug: 'conceptual-clarity-accountancy', category: 'Education', author: 'Vikram Rathore Sir', excerpt: 'Understanding the why behind accounting beats memorization every time.', content: 'Rote learning does not work in Accountancy. You need to understand the logic behind every journal entry and balance sheet item.\n\nAt D\'s Education, our teaching methodology focuses on:\n- Building fundamental concepts first\n- Real-world examples for every topic\n- Applying concepts to solve unseen problems\n- Regular revision sessions\n\nStudents who understand WHY score 95%+. Those who memorize HOW often struggle.', tags: ['Accountancy', 'Education', '12th'], isPublished: true },
  { title: '7 Mistakes to Avoid in Board Exams', slug: 'mistakes-avoid-board-exams', category: 'Exam Tips', author: 'Admin', excerpt: 'Common errors that cost students marks every year.', content: 'Every year, students lose crucial marks due to avoidable mistakes. Here are the top 7:\n\n1. Not reading the question paper in the first 15 minutes\n2. Poor time management during the exam\n3. Skipping working notes in Accounts\n4. Messy presentation\n5. Leaving questions blank instead of attempting\n6. Not revising the paper at the end\n7. Ignoring the question\'s mark distribution\n\nPractice with D\'s Education\'s mock exam series to train yourself to avoid all of these.', tags: ['Board Exams', 'Tips', 'Mistakes'], isPublished: true },
  { title: 'The Role of Mock Tests in Achieving Top Scores', slug: 'importance-of-mock-tests', category: 'Exam Tips', author: 'Admin', excerpt: 'How regular testing transforms your preparation and results.', content: 'Mock tests are not just for practice. They are diagnostic tools that reveal your weak areas.\n\nBenefits of Regular Mock Tests:\n- Builds exam temperament\n- Improves time management\n- Identifies knowledge gaps\n- Reduces exam anxiety\n- Simulates real exam conditions\n\nD\'s Education conducts weekly chapter tests and full mock exams through our AI-powered online platform. Students who give 10+ mocks score significantly higher than those who don\'t.', tags: ['Mock Tests', 'Preparation', 'Results'], isPublished: true },
  { title: 'Balancing School and Coaching: A Student Survival Guide', slug: 'balance-school-and-coaching', category: 'Education', author: 'Vikram Rathore Sir', excerpt: 'Practical advice for managing school hours and coaching classes effectively.', content: 'Managing school and coaching simultaneously is one of the biggest challenges for commerce students. Here is how our toppers do it:\n\n- Use school time to absorb concepts (don\'t zone out)\n- Use coaching for deeper practice and problem-solving\n- Maintain a fixed sleep schedule of 7-8 hours\n- Keep weekends for revision and pending topics\n- Take short breaks every 45 minutes while studying\n\nD\'s Education offers flexible batch timings for morning, afternoon and evening to fit every student\'s schedule.', tags: ['Time Management', 'Student Life', 'Balance'], isPublished: true },
  { title: 'CA vs CS vs CMA: Which Professional Course is Right for You?', slug: 'ca-vs-cs-vs-cma-comparison', category: 'Career', author: 'Vikram Rathore Sir', excerpt: 'A detailed comparison of India\'s top commerce certifications.', content: 'All three are prestigious but very different. Choose based on your interest:\n\nCA (Chartered Accountancy)\n- Best for: Audit, Taxation, Finance\n- Duration: 4-5 years\n- Governed by: ICAI\n\nCS (Company Secretary)\n- Best for: Corporate Law, Compliance, Governance\n- Duration: 3-4 years\n- Governed by: ICSI\n\nCMA (Cost Management Accountant)\n- Best for: Cost Control, Management Accounting\n- Duration: 3 years\n- Governed by: ICMAI\n\nAll three are offered at D\'s Education.', tags: ['CA', 'CS', 'CMA', 'Career'], isPublished: true },
  { title: 'How to Score 100/100 in Accountancy: Topper Strategies', slug: 'score-100-accountancy-topper-tips', category: 'Success Stories', author: 'Admin', excerpt: 'Real strategies from students who achieved perfect scores.', content: 'Scoring a perfect 100 in Accountancy is absolutely achievable. Here is what our toppers did:\n\n1. Mastered all basic rules and principles first\n2. Practiced Journal Entries until they became second nature\n3. Used neat rulers for all tabular presentations\n4. Always wrote Working Notes below every solution\n5. Revised the entire syllabus at least 3 times\n6. Solved the last 10 years of board papers\n\nAt D\'s Education, we provide answer sheet samples from previous toppers so you know exactly what the examiner expects.', tags: ['100 Marks', 'Topper', 'Accountancy'], isPublished: true },
  { title: 'Commerce in the Age of AI: What Students Need to Know', slug: 'commerce-ai-future', category: 'Education', author: 'Admin', excerpt: 'How technology is reshaping finance and what commerce students should learn now.', content: 'Artificial Intelligence is transforming every industry, including finance and accounting. Commerce students of 2024 need to be aware of:\n\n- AI in auditing and compliance automation\n- Fintech disruption in banking\n- Blockchain for supply chain accounting\n- Data analytics in financial forecasting\n- Robo-advisors in investment management\n\nHowever, human judgment, ethical reasoning, and strategic thinking cannot be automated. These remain the most valuable skills for any commerce professional.\n\nD\'s Education integrates technology awareness into its curriculum.', tags: ['AI', 'Future', 'Commerce', 'Technology'], isPublished: true },
  { title: 'Economics for Beginners: Why It Matters for Your Career', slug: 'economics-beginners-career', category: 'Education', author: 'Vikram Rathore Sir', excerpt: 'Understanding economics helps you make better personal and professional decisions.', content: 'Economics is not just a subject — it is a way of thinking. Understanding demand and supply, opportunity cost, and market structures helps you:\n\n- Understand business decisions\n- Follow financial news intelligently\n- Analyze government policies\n- Make smarter investment choices\n\nAt D\'s Education, Economics is taught with real-world Indian examples making it engaging and highly scorable. Many students who struggled earlier end up scoring 90%+ after joining us.', tags: ['Economics', 'Beginners', 'Career'], isPublished: true },
  { title: 'GST Explained Simply for Commerce Students', slug: 'gst-explained-commerce-students', category: 'Education', author: 'Admin', excerpt: 'A simple, no-jargon explanation of GST and how it affects businesses.', content: 'GST (Goods and Services Tax) is one of the most important taxes in India and a major topic in commerce exams. Here is a simple breakdown:\n\nWhat is GST?\nGST is a single, unified tax on goods and services across India, replacing multiple indirect taxes.\n\nTypes of GST:\n- CGST: Central Government tax\n- SGST: State Government tax\n- IGST: For inter-state transactions\n\nWhy is it important?\n- Simplifies the tax structure\n- Reduces cascading tax effect\n- Mandatory for any business with turnover over Rs 40 Lakh\n\nLearn practical GST filing and computation at D\'s Education in our dedicated Taxation course.', tags: ['GST', 'Taxation', 'Commerce'], isPublished: true },
  { title: 'Study Timetable for 12th Commerce Students: Week-by-Week Plan', slug: 'study-timetable-12th-commerce', category: 'Exam Tips', author: 'Vikram Rathore Sir', excerpt: 'A proven, structured weekly study plan for board exam success.', content: 'A disciplined timetable is the backbone of board exam success. Here is a recommended weekly plan:\n\nMonday – Accountancy (3 hrs) + Economics (1.5 hrs)\nTuesday – Business Studies (2 hrs) + Accountancy Practice (2 hrs)\nWednesday – Economics (2 hrs) + English (1.5 hrs)\nThursday – Accountancy (3 hrs) + Revision (1 hr)\nFriday – Full BST chapter + Mock Test\nSaturday – Full length Accountancy paper (3 hrs)\nSunday – Revision + Doubt Clearing at D\'s Education\n\nConsistency over 6 months = 95%+ guaranteed.', tags: ['Timetable', '12th Commerce', 'Study Plan'], isPublished: true },
];

// ─── 12 BATCHES (created after courses) ──────────────────────
const makeBatches = (courseIds) => [
  { name: 'CA Foundation Morning Batch A', startDate: '2024-06-01', endDate: '2025-01-31', timing: '7:00 AM – 9:00 AM', totalSeats: 35, instructor: 'Vikram Rathore Sir', status: 'active', fees: 18000, mode: 'offline', courseId: courseIds[0] },
  { name: 'CA Foundation Evening Batch B', startDate: '2024-07-01', endDate: '2025-02-28', timing: '5:00 PM – 7:00 PM', totalSeats: 30, instructor: 'Vikram Rathore Sir', status: 'active', fees: 18000, mode: 'offline', courseId: courseIds[0] },
  { name: 'CA Inter Group 1 Batch', startDate: '2024-05-15', endDate: '2025-05-14', timing: '8:00 AM – 11:00 AM', totalSeats: 25, instructor: 'Vikram Rathore Sir', status: 'active', fees: 28000, mode: 'offline', courseId: courseIds[1] },
  { name: 'CA Inter Group 2 Weekend Batch', startDate: '2024-06-15', endDate: '2025-06-14', timing: 'Sat–Sun 9:00 AM – 1:00 PM', totalSeats: 20, instructor: 'Vikram Rathore Sir', status: 'upcoming', fees: 28000, mode: 'hybrid', courseId: courseIds[1] },
  { name: '12th Commerce Regular Batch', startDate: '2024-04-01', endDate: '2025-03-31', timing: '3:00 PM – 5:00 PM', totalSeats: 40, instructor: 'Vikram Rathore Sir', status: 'active', fees: 14000, mode: 'offline', courseId: courseIds[4] },
  { name: '12th Commerce Crash Course', startDate: '2025-01-15', endDate: '2025-03-31', timing: '10:00 AM – 1:00 PM', totalSeats: 50, instructor: 'Admin Faculty', status: 'upcoming', fees: 8000, mode: 'offline', courseId: courseIds[4] },
  { name: '11th Commerce Foundation Batch', startDate: '2024-04-01', endDate: '2025-03-31', timing: '1:00 PM – 3:00 PM', totalSeats: 40, instructor: 'Vikram Rathore Sir', status: 'active', fees: 12000, mode: 'offline', courseId: courseIds[3] },
  { name: 'GST Practical Batch (Weekend)', startDate: '2024-08-01', endDate: '2024-10-31', timing: 'Sat–Sun 10:00 AM – 12:00 PM', totalSeats: 25, instructor: 'Admin Faculty', status: 'completed', fees: 8000, mode: 'online', courseId: courseIds[8] },
  { name: 'Tally Prime Certificate Batch', startDate: '2024-09-01', endDate: '2024-10-31', timing: '11:00 AM – 1:00 PM', totalSeats: 20, instructor: 'Admin Faculty', status: 'active', fees: 5000, mode: 'offline', courseId: courseIds[9] },
  { name: 'CA Final SFM Batch', startDate: '2024-07-01', endDate: '2025-06-30', timing: '6:00 AM – 8:00 AM', totalSeats: 15, instructor: 'Vikram Rathore Sir', status: 'active', fees: 45000, mode: 'offline', courseId: courseIds[2] },
  { name: 'BCom Semester Coaching Batch', startDate: '2024-07-15', endDate: '2024-11-30', timing: '4:00 PM – 6:00 PM', totalSeats: 30, instructor: 'Admin Faculty', status: 'active', fees: 10000, mode: 'hybrid', courseId: courseIds[5] },
  { name: 'Online CA Foundation Batch', startDate: '2024-08-01', endDate: '2025-03-31', timing: '8:00 PM – 10:00 PM', totalSeats: 100, instructor: 'Vikram Rathore Sir', status: 'upcoming', fees: 15000, mode: 'online', courseId: courseIds[0] },
];

// ─── MAIN SEED FUNCTION ───────────────────────────────────────
async function seedAll() {
  try {
    await sequelize.sync();

    console.log('🌱 Clearing existing data...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await Blog.destroy({ where: {} });
    await Topper.destroy({ where: {} });
    await Batch.destroy({ where: {} });
    await Course.destroy({ where: {} });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('📚 Seeding 12 Courses...');
    const createdCourses = await Course.bulkCreate(courses);
    const courseIds = createdCourses.map(c => c.id);

    console.log('📅 Seeding 12 Batches...');
    await Batch.bulkCreate(makeBatches(courseIds));

    console.log('🏆 Seeding 12 Toppers...');
    await Topper.bulkCreate(toppers);

    console.log('📝 Seeding 12 Blog Articles...');
    await Blog.bulkCreate(blogs);

    console.log('\n✅ All 12x4 = 48 records seeded successfully!');
    console.log('  → 12 Courses');
    console.log('  → 12 Batches');
    console.log('  → 12 Toppers');
    console.log('  → 12 Blog Articles');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seedAll();
