const { Blog } = require('../models');
const { sequelize } = require('../config/db');

const blogs = [
  {
    title: 'How to Crack CA Foundation in First Attempt: A Complete Guide',
    slug: 'crack-ca-foundation-first-attempt',
    content: `Cracking the CA Foundation exam on your first try requires more than just hard work; it requires a strategic approach. 
    1. Understand the Syllabus: Thoroughly go through the ICAI study material. 
    2. Focus on Statistics and Law: These subjects are often game-changers. 
    3. Regular Practice: Solve at least 5 years of past papers. 
    4. Time Management: Dedicate specific hours to each subject daily. 
    Join D's Education for expert guidance and personalized mentoring by Vikram Rathore Sir.`,
    excerpt: 'Strategic tips and study plan to clear your CA Foundation exams in the very first go.',
    category: 'Exam Tips',
    author: 'Vikram Rathore Sir',
    tags: ['CA Foundation', 'ICAI', 'Study Tips'],
    isPublished: true
  },
  {
    title: 'Top 5 Career Options After 12th Commerce in 2024',
    slug: 'career-options-after-12th-commerce',
    content: `The commerce stream offers a plethora of high-paying career paths. 
    1. Chartered Accountancy (CA): The gold standard of commerce. 
    2. Management (BBA/MBA): For those with leadership aspirations. 
    3. Company Secretary (CS): Focusing on corporate law and governance. 
    4. Certified Management Accountant (CMA): Global recognition in management accounting. 
    5. Data Analytics in Finance: The future of the financial world.`,
    excerpt: 'Explore the most lucrative and promising career paths available for commerce students today.',
    category: 'Career',
    author: 'Admin',
    tags: ['Career Guidance', 'Commerce', 'Future'],
    isPublished: true
  },
  {
    title: 'Why Conceptual Clarity is the Secret to Mastering Accountancy',
    slug: 'conceptual-clarity-in-accountancy',
    content: `Rote learning doesn't work in Accountancy. You must understand the 'Why' behind every journal entry. 
    Accounts is like a language; once you know the grammar (concepts), you can write any story (solve any problem). 
    At D's Education, we focus on building a strong foundation so that students never have to memorize entries.`,
    excerpt: 'Learn why understanding the core logic of accounting is better than memorizing formulas.',
    category: 'Education',
    author: 'Vikram Rathore Sir',
    tags: ['Accountancy', 'Learning', 'Education'],
    isPublished: true
  },
  {
    title: '7 Common Mistakes to Avoid During Your Board Exams',
    slug: 'mistakes-to-avoid-board-exams',
    content: `Board exams can be stressful, but avoiding these common pitfalls can boost your score:
    1. Not reading the question paper properly.
    2. Poor time management during the exam.
    3. Messy presentation and handwriting.
    4. Skipping the easy questions first.
    5. Ignoring the marking scheme.
    Stay calm and follow our expert presentation tips for 12th Commerce.`,
    excerpt: 'Identify and rectify the most common errors students make during their final board examinations.',
    category: 'Exam Tips',
    author: 'Admin',
    tags: ['Boards', '12th Commerce', 'Success'],
    isPublished: true
  },
  {
    title: 'The Role of Mock Tests in Achieving 95+ Score',
    slug: 'importance-of-mock-tests',
    content: `Mock tests are not just for practice; they are for performance analysis. 
    Our AI-powered exam engine at D's Education helps you identify your weak areas instantly. 
    Taking regular tests builds confidence and reduces exam anxiety.`,
    excerpt: 'Discover how regular testing can transform your preparation and final results.',
    category: 'Exam Tips',
    author: 'Admin',
    tags: ['Mock Test', 'Exam Prep', 'Technology'],
    isPublished: true
  },
  {
    title: 'Balancing School and Coaching: A Survival Guide for Students',
    slug: 'balance-school-and-coaching',
    content: `Managing both school and coaching can be overwhelming. 
    The key is to create a synergy between the two. 
    1. Use school time for conceptual understanding. 
    2. Use coaching for problem-solving and advanced tips. 
    3. Maintain a consistent sleep schedule. 
    D's Education's flexible batch timings help students manage their time effectively.`,
    excerpt: 'Practical advice on how to manage your time between school hours and coaching classes.',
    category: 'Success Stories',
    author: 'Vikram Rathore Sir',
    tags: ['Time Management', 'Student Life'],
    isPublished: true
  },
  {
    title: 'Choosing Between CA, CS, and CMA: Which One is for You?',
    slug: 'choosing-between-ca-cs-cma',
    content: `All three are prestigious professional courses, but they cater to different interests. 
    CA is for those who love auditing, taxation, and accounting. 
    CS is for students interested in law, compliance, and corporate governance. 
    CMA is for those who want to excel in cost management and strategic finance. 
    Compare the curriculum and job roles before making a choice.`,
    excerpt: 'A detailed comparison of India\'s top three professional commerce certifications.',
    category: 'Career',
    author: 'Vikram Rathore Sir',
    tags: ['CA', 'CS', 'CMA', 'Career Advice'],
    isPublished: true
  },
  {
    title: 'How to Score 100/100 in Accountancy: Topper Secrets',
    slug: 'score-100-in-accountancy',
    content: `Scoring a perfect century in Accounts is possible with:
    1. Mastery over Basic Principles.
    2. Speed and Accuracy in calculations.
    3. Neat Balance Sheets and Ledgers.
    4. Working Notes for every step.
    Our toppers share their answer sheets and strategies at D's Education.`,
    excerpt: 'Real strategies used by toppers to achieve a perfect score in Accountancy board exams.',
    category: 'Success Stories',
    author: 'Admin',
    tags: ['Topper Secrets', 'Accountancy'],
    isPublished: true
  },
  {
    title: 'Future of Commerce in the Digital and AI Era',
    slug: 'future-of-commerce-ai',
    content: `Commerce is no longer just about ledgers. With AI and Blockchain, the role of a commerce professional is evolving. 
    Automation will take over routine tasks, but the need for strategic financial analysis and human judgment will only grow. 
    Stay ahead by learning about Fintech and Digital Finance.`,
    excerpt: 'How technology is reshaping the commerce landscape and what students should learn now.',
    category: 'Education',
    author: 'Admin',
    tags: ['Future Tech', 'Commerce', 'AI'],
    isPublished: true
  },
  {
    title: 'Importance of Economics in Developing Critical Thinking',
    slug: 'importance-of-economics',
    content: `Economics is not just a subject; it's a way of looking at the world. 
    It teaches you how resources are allocated and how decisions are made. 
    Understanding Micro and Macro economics is essential for any aspiring business leader.`,
    excerpt: 'Why studying economics is vital for understanding global markets and individual decision-making.',
    category: 'Education',
    author: 'Vikram Rathore Sir',
    tags: ['Economics', 'Critical Thinking'],
    isPublished: true
  }
];

async function seedBlogs() {
  try {
    await sequelize.sync();
    // Clear existing blogs to avoid duplicates during seeding
    await Blog.destroy({ where: {}, truncate: true });
    
    await Blog.bulkCreate(blogs);
    console.log('✅ 10 SEO-friendly articles seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding blogs:', err);
    process.exit(1);
  }
}

seedBlogs();
