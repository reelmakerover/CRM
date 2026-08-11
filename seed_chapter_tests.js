const { sequelize } = require('./config/db');
const { Course, Subject, Exam, Question } = require('./models');

async function seedChapterTests() {
  await sequelize.sync();

  const queryInterface = sequelize.getQueryInterface();
  try {
    const qInfo = await queryInterface.describeTable('Questions');
    if (!qInfo.chapter) {
      await queryInterface.addColumn('Questions', 'chapter', { type: require('sequelize').DataTypes.STRING, allowNull: true });
    }
  } catch (e) {}

  try {
    const eInfo = await queryInterface.describeTable('Exams');
    if (!eInfo.chapter) {
      await queryInterface.addColumn('Exams', 'chapter', { type: require('sequelize').DataTypes.STRING, defaultValue: 'General' });
    }
  } catch (e) {}

  console.log('🌱 Seeding Chapter-Wise Tests and Questions...');

  // 1. Ensure Courses
  let course12 = await Course.findOne({ where: { name: '12th Commerce' } });
  if (!course12) {
    course12 = await Course.create({
      name: '12th Commerce',
      code: '12COM',
      category: 'Commerce',
      fees: 15000,
      description: '12th Commerce Board Preparation'
    });
  }

  let courseCA = await Course.findOne({ where: { name: 'CA Foundation' } });
  if (!courseCA) {
    courseCA = await Course.create({
      name: 'CA Foundation',
      code: 'CAF',
      category: 'CA / Professional',
      fees: 25000,
      description: 'CA Foundation Comprehensive Coaching'
    });
  }

  // 2. Ensure Subjects
  let subjAccounts = await Subject.findOne({ where: { name: 'Accountancy' } });
  if (!subjAccounts) {
    subjAccounts = await Subject.create({
      name: 'Accountancy',
      code: 'ACC12',
      courseId: course12.id,
      description: 'Accountancy for Commerce & CA'
    });
  } else {
    subjAccounts.courseId = course12.id;
    await subjAccounts.save();
  }

  let subjEco = await Subject.findOne({ where: { name: 'Economics' } });
  if (!subjEco) {
    subjEco = await Subject.create({
      name: 'Economics',
      code: 'ECO12',
      courseId: course12.id,
      description: 'Macroeconomics & Indian Economic Development'
    });
  } else {
    subjEco.courseId = course12.id;
    await subjEco.save();
  }

  // 3. Clear existing sample questions & exams for fresh chapter demo
  console.log('Cleaning old demo exams and questions...');
  await Exam.destroy({ where: {} });
  await Question.destroy({ where: {} });

  // 4. Sample Questions for Accountancy
  const accQuestions = [
    // Chapter 1: Fundamentals of Partnership
    {
      question: 'In the absence of a Partnership Deed, what is the rate of interest allowed on a partner’s loan?',
      optionA: '6% p.a. simple interest',
      optionB: '8% p.a. compound interest',
      optionC: '12% p.a.',
      optionD: 'No interest is allowed',
      correctAnswer: 'A',
      chapter: 'Chapter 1: Fundamentals of Partnership',
      difficulty: 'easy',
      marks: 2,
      explanation: 'Under Section 13(d) of Indian Partnership Act 1932, partners are entitled to 6% p.a. interest on advances/loans.'
    },
    {
      question: 'Interest on Capital is generally treated as:',
      optionA: 'An appropriation of profit',
      optionB: 'A charge against profit',
      optionC: 'An operating expense',
      optionD: 'A capital expenditure',
      correctAnswer: 'A',
      chapter: 'Chapter 1: Fundamentals of Partnership',
      difficulty: 'medium',
      marks: 2,
      explanation: 'Interest on capital is an appropriation of profit unless specified as a charge in the partnership agreement.'
    },
    {
      question: 'Fluctuating Capital Account method records which of the following in capital account?',
      optionA: 'Capital introduced & withdrawn only',
      optionB: 'All adjustments including drawings, interest, salary, and profit share',
      optionC: 'Only salary and commission',
      optionD: 'Fixed capital balance only',
      correctAnswer: 'B',
      chapter: 'Chapter 1: Fundamentals of Partnership',
      difficulty: 'easy',
      marks: 2,
      explanation: 'Under the fluctuating method, all transactions between firm and partner are recorded directly in the Capital Account.'
    },
    {
      question: 'If a fixed amount is withdrawn on the first day of every month, for what average period is interest on drawings calculated?',
      optionA: '6 months',
      optionB: '6.5 months',
      optionC: '5.5 months',
      optionD: '7 months',
      correctAnswer: 'B',
      chapter: 'Chapter 1: Fundamentals of Partnership',
      difficulty: 'medium',
      marks: 2,
      explanation: 'Average period = (Time left after 1st drawing + Time left after last drawing) / 2 = (12 + 1) / 2 = 6.5 months.'
    },
    {
      question: 'Rent paid to a partner for using his personal premises for business is:',
      optionA: 'Appropriation of profit',
      optionB: 'Charge against profit (Debited to P&L A/c)',
      optionC: 'Credited to Partner’s Capital A/c directly',
      optionD: 'Debited to P&L Appropriation A/c',
      correctAnswer: 'B',
      chapter: 'Chapter 1: Fundamentals of Partnership',
      difficulty: 'hard',
      marks: 2,
      explanation: 'Rent paid to partner is an expense (charge against profit) and is debited to P&L Account.'
    },
    {
      question: 'A and B share profits in ratio 3:2. Firm earned Rs. 50,000 profit. A’s share of profit is:',
      optionA: 'Rs. 20,000',
      optionB: 'Rs. 30,000',
      optionC: 'Rs. 25,000',
      optionD: 'Rs. 35,000',
      correctAnswer: 'B',
      chapter: 'Chapter 1: Fundamentals of Partnership',
      difficulty: 'easy',
      marks: 2,
      explanation: 'A share = 50,000 * 3/5 = Rs. 30,000.'
    },

    // Chapter 2: Goodwill - Nature and Valuation
    {
      question: 'Goodwill of a firm is which type of asset?',
      optionA: 'Fictitious Asset',
      optionB: 'Intangible Asset (Real Asset)',
      optionC: 'Current Asset',
      optionD: 'Liquid Asset',
      correctAnswer: 'B',
      chapter: 'Chapter 2: Goodwill - Nature and Valuation',
      difficulty: 'easy',
      marks: 2,
      explanation: 'Goodwill is an intangible real asset having saleable value.'
    },
    {
      question: 'Super Profit is calculated as:',
      optionA: 'Average Profit - Normal Profit',
      optionB: 'Normal Profit - Actual Profit',
      optionC: 'Average Profit + Normal Profit',
      optionD: 'Capital Employed * NRR',
      correctAnswer: 'A',
      chapter: 'Chapter 2: Goodwill - Nature and Valuation',
      difficulty: 'easy',
      marks: 2,
      explanation: 'Super Profit = Actual/Average Maintainable Profit - Normal Profit.'
    },
    {
      question: 'Under Weighted Average Profit Method, highest weight is given to:',
      optionA: 'First year’s profit',
      optionB: 'Most recent year’s profit',
      optionC: 'Year having highest profit',
      optionD: 'Equally to all years',
      correctAnswer: 'B',
      chapter: 'Chapter 2: Goodwill - Nature and Valuation',
      difficulty: 'medium',
      marks: 2,
      explanation: 'Recent years represent the latest earning capacity and are assigned higher weights.'
    },
    {
      question: 'If Capital Employed is Rs. 5,00,000, Normal Rate of Return is 10%, and Actual Profit is Rs. 70,000, Super Profit is:',
      optionA: 'Rs. 50,000',
      optionB: 'Rs. 20,000',
      optionC: 'Rs. 70,000',
      optionD: 'Rs. 10,000',
      correctAnswer: 'B',
      chapter: 'Chapter 2: Goodwill - Nature and Valuation',
      difficulty: 'medium',
      marks: 2,
      explanation: 'Normal Profit = 5,00,000 * 10% = 50,000. Super Profit = 70,000 - 50,000 = Rs. 20,000.'
    },
    {
      question: 'Purchased Goodwill is recorded in books of account as per AS-26 because:',
      optionA: 'It has paid consideration in money or money’s worth',
      optionB: 'It is internally generated',
      optionC: 'Management wants to inflate assets',
      optionD: 'It never depreciates',
      correctAnswer: 'A',
      chapter: 'Chapter 2: Goodwill - Nature and Valuation',
      difficulty: 'hard',
      marks: 2,
      explanation: 'AS-26 allows recognition of goodwill only when consideration has been paid for it.'
    },

    // Chapter 3: Admission & Retirement of Partner
    {
      question: 'Sacrificing Ratio is calculated as:',
      optionA: 'New Ratio - Old Ratio',
      optionB: 'Old Ratio - New Ratio',
      optionC: 'Old Ratio + Gaining Ratio',
      optionD: 'New Ratio / 2',
      correctAnswer: 'B',
      chapter: 'Chapter 3: Admission & Retirement of Partner',
      difficulty: 'easy',
      marks: 2,
      explanation: 'Sacrificing Ratio = Old Profit Share - New Profit Share.'
    },
    {
      question: 'Revaluation Account is which nature of account?',
      optionA: 'Real Account',
      optionB: 'Personal Account',
      optionC: 'Nominal Account',
      optionD: 'Representative Personal Account',
      correctAnswer: 'C',
      chapter: 'Chapter 3: Admission & Retirement of Partner',
      difficulty: 'easy',
      marks: 2,
      explanation: 'Revaluation Account records profits and losses on revaluation, hence it is a Nominal Account.'
    },
    {
      question: 'Gain (Profit) on Revaluation of assets & liabilities at the time of admission is shared by:',
      optionA: 'All partners including the new partner in new ratio',
      optionB: 'Old partners only in their old profit sharing ratio',
      optionC: 'Sacrificing partners in sacrificing ratio',
      optionD: 'Equally by all partners',
      correctAnswer: 'B',
      chapter: 'Chapter 3: Admission & Retirement of Partner',
      difficulty: 'medium',
      marks: 2,
      explanation: 'Past accumulated profits/revaluation gains belong to old partners in their old ratio.'
    },
    {
      question: 'Premium for Goodwill brought in cash by incoming partner is shared by old partners in:',
      optionA: 'Old Ratio',
      optionB: 'Sacrificing Ratio',
      optionC: 'New Ratio',
      optionD: 'Equal Ratio',
      correctAnswer: 'B',
      chapter: 'Chapter 3: Admission & Retirement of Partner',
      difficulty: 'medium',
      marks: 2,
      explanation: 'Goodwill premium compensates old partners for the sacrifice of their profit share.'
    },
    {
      question: 'Accumulated profits and reserves shown in balance sheet on date of admission are transferred to:',
      optionA: 'Revaluation Account',
      optionB: 'Old Partners Capital A/cs in Old Ratio',
      optionC: 'All Partners Capital A/cs in New Ratio',
      optionD: 'P&L Suspense Account',
      correctAnswer: 'B',
      chapter: 'Chapter 3: Admission & Retirement of Partner',
      difficulty: 'easy',
      marks: 2,
      explanation: 'Free reserves (General Reserve, P&L credit balance) are credited to old partners in old ratio.'
    }
  ];

  // Insert Accountancy questions
  for (const q of accQuestions) {
    await Question.create({
      ...q,
      courseId: course12.id,
      subjectId: subjAccounts.id,
      isActive: true
    });
  }

  // 5. Sample Questions for Economics
  const ecoQuestions = [
    {
      question: 'Which of the following is the primary function of Money?',
      optionA: 'Medium of Exchange & Measure of Value',
      optionB: 'Store of Value',
      optionC: 'Standard of Deferred Payments',
      optionD: 'Transfer of Value',
      correctAnswer: 'A',
      chapter: 'Chapter 1: Money and Banking',
      difficulty: 'easy',
      marks: 2,
      explanation: 'Medium of exchange and unit of value are primary functions of money.'
    },
    {
      question: 'Money Multiplier is calculated as:',
      optionA: '1 / LRR (Legal Reserve Ratio)',
      optionB: '1 + LRR',
      optionC: 'Total Deposits / Cash',
      optionD: 'CRR * SLR',
      correctAnswer: 'A',
      chapter: 'Chapter 1: Money and Banking',
      difficulty: 'medium',
      marks: 2,
      explanation: 'Money Multiplier (k) = 1 / LRR.'
    },
    {
      question: 'When RBI increases Cash Reserve Ratio (CRR), the credit creation capacity of commercial banks:',
      optionA: 'Increases',
      optionB: 'Decreases',
      optionC: 'Remains unchanged',
      optionD: 'Becomes zero',
      correctAnswer: 'B',
      chapter: 'Chapter 1: Money and Banking',
      difficulty: 'medium',
      marks: 2,
      explanation: 'Higher CRR locks more cash reserves with RBI, reducing commercial bank loanable funds.'
    },
    {
      question: 'Fiscal Deficit equals:',
      optionA: 'Total Expenditure - Total Receipts excluding borrowings',
      optionB: 'Revenue Expenditure - Revenue Receipts',
      optionC: 'Fiscal Deficit - Interest Payments',
      optionD: 'Capital Expenditure - Capital Receipts',
      correctAnswer: 'A',
      chapter: 'Chapter 2: Government Budget and Economy',
      difficulty: 'medium',
      marks: 2,
      explanation: 'Fiscal Deficit = Total Budget Expenditure - (Revenue Receipts + Non-debt Capital Receipts).'
    },
    {
      question: 'Which of the following is a Non-Tax Revenue for the government?',
      optionA: 'GST',
      optionB: 'Income Tax',
      optionC: 'Dividends & Profits from PSUs, Fees & Fines',
      optionD: 'Customs Duty',
      correctAnswer: 'C',
      chapter: 'Chapter 2: Government Budget and Economy',
      difficulty: 'easy',
      marks: 2,
      explanation: 'Fees, fines, gifts, and dividends from public sector enterprises are non-tax revenues.'
    }
  ];

  for (const q of ecoQuestions) {
    await Question.create({
      ...q,
      courseId: course12.id,
      subjectId: subjEco.id,
      isActive: true
    });
  }

  // 6. Create Chapter-Wise Exams
  console.log('Creating Chapter-Wise Exams...');

  // Accountancy Chapter 1 Tests
  await Exam.create({
    title: 'Partnership Basics & Profit Sharing Test',
    chapter: 'Chapter 1: Fundamentals of Partnership',
    courseId: course12.id,
    subjectId: subjAccounts.id,
    totalQuestions: 6,
    questionsPerExam: 5,
    duration: 20,
    totalMarks: 10,
    passingMarks: 4,
    status: 'active',
    instructions: 'Covers Partnership Deed provisions, Interest on Capital & Drawings calculations.',
    shuffleQuestions: true,
    shuffleOptions: true,
    negativeMarking: true,
    negativeMarks: 0.5,
    isPublic: true
  });

  await Exam.create({
    title: 'P&L Appropriation & Capital Accounts Practice Test',
    chapter: 'Chapter 1: Fundamentals of Partnership',
    courseId: course12.id,
    subjectId: subjAccounts.id,
    totalQuestions: 6,
    questionsPerExam: 4,
    duration: 15,
    totalMarks: 8,
    passingMarks: 4,
    status: 'active',
    instructions: 'Focuses on Rent to Partner, Interest on Partner Loan, and Past Adjustments.',
    shuffleQuestions: true,
    shuffleOptions: true,
    negativeMarking: false,
    isPublic: true
  });

  // Accountancy Chapter 2 Tests
  await Exam.create({
    title: 'Goodwill Valuation (Avg & Super Profit) Test',
    chapter: 'Chapter 2: Goodwill - Nature and Valuation',
    courseId: course12.id,
    subjectId: subjAccounts.id,
    totalQuestions: 5,
    questionsPerExam: 4,
    duration: 20,
    totalMarks: 8,
    passingMarks: 4,
    status: 'active',
    instructions: 'Covers AS-26 rules, Average Profit Method, and Super Profit Capitalisation.',
    shuffleQuestions: true,
    shuffleOptions: true,
    negativeMarking: true,
    negativeMarks: 0.5,
    isPublic: true
  });

  // Accountancy Chapter 3 Tests
  await Exam.create({
    title: 'Revaluation & Sacrificing Ratio Mastery Test',
    chapter: 'Chapter 3: Admission & Retirement of Partner',
    courseId: course12.id,
    subjectId: subjAccounts.id,
    totalQuestions: 5,
    questionsPerExam: 4,
    duration: 25,
    totalMarks: 8,
    passingMarks: 4,
    status: 'active',
    instructions: 'Covers Sacrificing Ratio, Revaluation A/c preparation, and Goodwill Treatment on admission.',
    shuffleQuestions: true,
    shuffleOptions: true,
    negativeMarking: false,
    isPublic: true
  });

  // Economics Chapter 1 & 2 Tests
  await Exam.create({
    title: 'Money Supply & Credit Creation Test',
    chapter: 'Chapter 1: Money and Banking',
    courseId: course12.id,
    subjectId: subjEco.id,
    totalQuestions: 3,
    questionsPerExam: 3,
    duration: 15,
    totalMarks: 6,
    passingMarks: 3,
    status: 'active',
    instructions: 'Covers Money functions, Money Multiplier, and RBI Quantitative Tools (CRR, SLR, Repo).',
    shuffleQuestions: true,
    shuffleOptions: true,
    negativeMarking: false,
    isPublic: true
  });

  await Exam.create({
    title: 'Government Budget & Fiscal Policy Test',
    chapter: 'Chapter 2: Government Budget and Economy',
    courseId: course12.id,
    subjectId: subjEco.id,
    totalQuestions: 2,
    questionsPerExam: 2,
    duration: 10,
    totalMarks: 4,
    passingMarks: 2,
    status: 'active',
    instructions: 'Covers Revenue & Capital Receipts, Fiscal Deficit formulas, and Budget objectives.',
    shuffleQuestions: true,
    shuffleOptions: true,
    negativeMarking: false,
    isPublic: true
  });

  console.log('✅ Seed completed successfully! Chapter-wise exams and questions ready.');
}

seedChapterTests().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
