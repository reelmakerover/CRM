const { Op } = require('sequelize');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Result = require('../models/Result');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const xlsx = require('xlsx');
const { sendExamResult } = require('../utils/mailer');
const { sequelize } = require('../config/db');

// Shuffle array
const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);

exports.getAllExams = async (req, res) => {
  try {
    const exams = await Exam.findAll({
      include: [
        { association: 'course', required: false },
        { association: 'subject', required: false }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(exams);
  } catch (err) {
    console.error('Error in getAllExams:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.createExam = async (req, res) => {
  try {
    const { course, subject, ...rest } = req.body;
    const exam = await Exam.create({ ...rest, courseId: course, subjectId: subject });
    res.status(201).json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const { course, subject, ...rest } = req.body;
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    
    await exam.update({ 
      ...rest, 
      courseId: course || exam.courseId, 
      subjectId: subject || exam.subjectId 
    });
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    await exam.destroy();
    res.json({ message: 'Exam deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.startExam = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id, {
      include: ['course', 'subject']
    });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    if (exam.status !== 'active') return res.status(400).json({ message: 'Exam is not active' });
    
    const student = await Student.findOne({ where: { email: req.user.email } });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    const existing = await Result.findOne({ where: { studentId: student.id, examId: exam.id } });
    if (existing) return res.status(400).json({ message: 'You have already attempted this exam' });
    
    const allQuestions = await Question.findAll({ 
      where: { subjectId: exam.subjectId, courseId: exam.courseId, isActive: true } 
    });
    
    if (allQuestions.length < exam.questionsPerExam) {
      return res.status(400).json({ message: `Not enough questions. Need ${exam.questionsPerExam}, have ${allQuestions.length}` });
    }
    
    let selected = shuffleArray([...allQuestions]).slice(0, exam.questionsPerExam);
    
    const questions = selected.map(q => {
      const opts = [
        { key: 'A', value: q.optionA },
        { key: 'B', value: q.optionB },
        { key: 'C', value: q.optionC },
        { key: 'D', value: q.optionD },
      ];
      const shuffled = shuffleArray([...opts]);
      const answerMap = {};
      shuffled.forEach((opt, i) => { answerMap[String.fromCharCode(65 + i)] = opt.key; });
      const newCorrect = Object.keys(answerMap).find(k => answerMap[k] === q.correctAnswer);
      
      return {
        id: q.id,
        question: q.question,
        optionA: shuffled[0].value,
        optionB: shuffled[1].value,
        optionC: shuffled[2].value,
        optionD: shuffled[3].value,
        marks: q.marks,
        _answerMap: answerMap,
        _newCorrect: newCorrect,
      };
    });
    
    res.json({ exam, questions, startTime: new Date() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.submitExam = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { answers, timeTaken, questionData } = req.body;
    const exam = await Exam.findByPk(req.params.id);
    const student = await Student.findOne({ 
      where: { email: req.user.email }, 
      include: ['course', 'batch'] 
    });
    
    let correctAnswers = 0, incorrectAnswers = 0, marksObtained = 0;
    const processedAnswers = [];
    
    for (const ans of answers) {
      const question = await Question.findByPk(ans.questionId);
      if (!question) continue;
      
      const qData = questionData?.find(q => q.id === ans.questionId);
      const isCorrect = qData?._answerMap 
        ? qData._answerMap[ans.selectedAnswer] === question.correctAnswer
        : ans.selectedAnswer === question.correctAnswer;
      
      const marks = isCorrect ? question.marks : (ans.selectedAnswer && exam.negativeMarking ? -exam.negativeMarks : 0);
      
      processedAnswers.push({
        questionId: question.id,
        selectedAnswer: ans.selectedAnswer,
        correctAnswer: qData?._newCorrect || question.correctAnswer,
        isCorrect,
        marksObtained: marks,
      });
      
      if (isCorrect) { correctAnswers++; marksObtained += question.marks; }
      else if (ans.selectedAnswer) { incorrectAnswers++; if (exam.negativeMarking) marksObtained -= exam.negativeMarks; }
    }
    
    const skipped = exam.questionsPerExam - correctAnswers - incorrectAnswers;
    const percentage = (marksObtained / exam.totalMarks) * 100;
    const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : percentage >= 60 ? 'B' : percentage >= 50 ? 'C' : 'F';
    
    const result = await Result.create({
      studentId: student.id,
      examId: exam.id,
      courseId: exam.courseId,
      subjectId: exam.subjectId,
      answers: processedAnswers,
      totalQuestions: exam.questionsPerExam,
      attemptedQuestions: correctAnswers + incorrectAnswers,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions: skipped,
      marksObtained: Math.max(0, marksObtained),
      totalMarks: exam.totalMarks,
      percentage: Math.max(0, percentage),
      grade,
      status: marksObtained >= exam.passingMarks ? 'pass' : 'fail',
      timeTaken,
    }, { transaction: t });
    
    // Calculate rank
    const allResults = await Result.findAll({ 
      where: { examId: exam.id }, 
      order: [['marksObtained', 'DESC']],
      transaction: t
    });
    const rank = allResults.findIndex(r => r.id === result.id) + 1;
    await result.update({ rank }, { transaction: t });
    
    await t.commit();

    // Send notification (async)
    if (student.parentEmail) {
      sendExamResult({ student, result: { ...result.toJSON(), rank }, exam })
        .then(() => result.update({ notificationSent: true }))
        .catch(e => console.log('Email error:', e.message));
    }
    
    res.json({ result, rank });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};

exports.getQuestionTemplate = async (req, res) => {
  try {
    const courses = await Course.findAll({ include: ['subjects'] });
    
    const sampleData = [
      {
        'Question': 'Which accounting concept requires revenue to be recognized when earned?',
        'Option A': 'Matching Concept',
        'Option B': 'Revenue Recognition Concept',
        'Option C': 'Going Concern Concept',
        'Option D': 'Cost Concept',
        'Correct Answer': 'B',
        'Course': 'CA Foundation',
        'Subject': 'Principles and Practice of Accounting',
        'Difficulty': 'medium',
        'Marks': 1,
        'Explanation': 'Revenue recognition concept states revenue should be recognized when realized or earned.'
      },
      {
        'Question': 'The balance sheet shows financial position as on a:',
        'Option A': 'Particular date',
        'Option B': 'Particular period',
        'Option C': 'Fiscal year',
        'Option D': 'None of these',
        'Correct Answer': 'A',
        'Course': '12th Commerce',
        'Subject': 'Accountancy',
        'Difficulty': 'easy',
        'Marks': 1,
        'Explanation': 'Balance sheet is a statement of financial position as of a specific date.'
      },
      {
        'Question': 'Capital = Assets – ?',
        'Option A': 'Revenue',
        'Option B': 'Liabilities',
        'Option C': 'Expenses',
        'Option D': 'Income',
        'Correct Answer': 'B',
        'Course': '12th Commerce',
        'Subject': 'Accountancy',
        'Difficulty': 'easy',
        'Marks': 1,
        'Explanation': 'Basic Accounting Equation: Assets = Liabilities + Capital.'
      }
    ];

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(sampleData);
    ws['!cols'] = [
      { wch: 60 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 },
      { wch: 15 }, { wch: 20 }, { wch: 35 }, { wch: 12 }, { wch: 8 }, { wch: 40 }
    ];
    xlsx.utils.book_append_sheet(wb, ws, 'Questions');

    // Reference Sheet with available courses and subjects
    const refData = [];
    for (const c of courses) {
      if (c.subjects && c.subjects.length > 0) {
        for (const s of c.subjects) {
          refData.push({ 'Course Name': c.name, 'Course Code': c.code, 'Subject Name': s.name, 'Subject Code': s.code });
        }
      } else {
        refData.push({ 'Course Name': c.name, 'Course Code': c.code, 'Subject Name': 'General', 'Subject Code': 'GEN' });
      }
    }
    if (refData.length > 0) {
      const refWs = xlsx.utils.json_to_sheet(refData);
      refWs['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 35 }, { wch: 15 }];
      xlsx.utils.book_append_sheet(wb, refWs, 'Available Courses & Subjects');
    }

    const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
    res.setHeader('Content-Disposition', 'attachment; filename="DS_Questions_Template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.importQuestions = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'No Excel/CSV file uploaded. Please select a file.' });
    }

    let workbook;
    try {
      workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    } catch (readErr) {
      return res.status(400).json({ message: 'Failed to parse Excel file. Please ensure it is a valid .xlsx, .xls, or .csv file.' });
    }

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return res.status(400).json({ message: 'The uploaded Excel file contains no sheets.' });
    }

    // Find first non-empty sheet
    let data = [];
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });
      if (rows && rows.length > 0) {
        data = rows;
        break;
      }
    }

    if (data.length === 0) {
      return res.status(400).json({ message: 'The uploaded sheet is empty. Please add questions data.' });
    }

    // Pre-fetch all courses and subjects for flexible matching
    const allCourses = await Course.findAll();
    const allSubjects = await Subject.findAll();

    // Helper: Find value from multiple possible header keys
    const getField = (row, possibleKeys) => {
      const rowKeys = Object.keys(row);
      for (const key of possibleKeys) {
        const exactMatch = row[key];
        if (exactMatch !== undefined && exactMatch !== null && String(exactMatch).trim() !== '') {
          return String(exactMatch).trim();
        }
        // Case-insensitive / whitespace-stripped match
        const cleanedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        const matchedRowKey = rowKeys.find(rk => rk.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanedKey);
        if (matchedRowKey && row[matchedRowKey] !== undefined && row[matchedRowKey] !== null && String(row[matchedRowKey]).trim() !== '') {
          return String(row[matchedRowKey]).trim();
        }
      }
      return '';
    };

    // Helper: Normalize answer to A, B, C, D
    const normalizeAnswer = (val, optA, optB, optC, optD) => {
      if (!val) return 'A';
      const clean = String(val).trim().toUpperCase();
      if (clean === 'A' || clean === 'OPTION A' || clean === 'OPTIONA' || clean === '1' || clean === 'A.') return 'A';
      if (clean === 'B' || clean === 'OPTION B' || clean === 'OPTIONB' || clean === '2' || clean === 'B.') return 'B';
      if (clean === 'C' || clean === 'OPTION C' || clean === 'OPTIONC' || clean === '3' || clean === 'C.') return 'C';
      if (clean === 'D' || clean === 'OPTION D' || clean === 'OPTIOND' || clean === '4' || clean === 'D.') return 'D';

      // Check if answer text matches one of the options
      const raw = String(val).trim().toLowerCase();
      if (optA && raw === String(optA).trim().toLowerCase()) return 'A';
      if (optB && raw === String(optB).trim().toLowerCase()) return 'B';
      if (optC && raw === String(optC).trim().toLowerCase()) return 'C';
      if (optD && raw === String(optD).trim().toLowerCase()) return 'D';

      return 'A';
    };

    // Helper: Normalize difficulty
    const normalizeDifficulty = (val) => {
      if (!val) return 'medium';
      const clean = String(val).trim().toLowerCase();
      if (clean.includes('easy')) return 'easy';
      if (clean.includes('hard') || clean.includes('diff')) return 'hard';
      return 'medium';
    };

    let imported = 0;
    const errors = [];

    for (let index = 0; index < data.length; index++) {
      const row = data[index];
      const rowNum = index + 2;

      const questionText = getField(row, ['Question', 'question', 'Question Text', 'QuestionText', 'Q', 'q', 'Problem']);
      if (!questionText) {
        const hasAnyContent = Object.values(row).some(v => v !== undefined && String(v).trim() !== '');
        if (hasAnyContent) {
          errors.push(`Row ${rowNum}: Question text is missing`);
        }
        continue;
      }

      const optA = getField(row, ['Option A', 'OptionA', 'optionA', 'option_a', 'Option 1', 'Option1', 'A', 'a', 'OptA', 'opt_a']) || 'Option A';
      const optB = getField(row, ['Option B', 'OptionB', 'optionB', 'option_b', 'Option 2', 'Option2', 'B', 'b', 'OptB', 'opt_b']) || 'Option B';
      const optC = getField(row, ['Option C', 'OptionC', 'optionC', 'option_c', 'Option 3', 'Option3', 'C', 'c', 'OptC', 'opt_c']) || 'Option C';
      const optD = getField(row, ['Option D', 'OptionD', 'optionD', 'option_d', 'Option 4', 'Option4', 'D', 'd', 'OptD', 'opt_d']) || 'Option D';

      const rawAns = getField(row, ['Correct Answer', 'CorrectAnswer', 'correctAnswer', 'correct_answer', 'Answer', 'answer', 'Ans', 'ans', 'Correct', 'correct']);
      const correctAnswer = normalizeAnswer(rawAns, optA, optB, optC, optD);

      const rawCourse = getField(row, ['Course', 'course', 'Course Name', 'CourseName', 'Course Code', 'CourseCode']);
      const rawSubject = getField(row, ['Subject', 'subject', 'Subject Name', 'SubjectName', 'Subject Code', 'SubjectCode']);
      const rawDiff = getField(row, ['Difficulty', 'difficulty', 'Level', 'level']);
      const rawMarks = parseInt(getField(row, ['Marks', 'marks', 'Mark', 'mark'])) || 1;
      const rawExp = getField(row, ['Explanation', 'explanation', 'Exp', 'exp']);

      // 1. Resolve Course
      let course = null;
      if (rawCourse) {
        const cleanCourse = rawCourse.toLowerCase().trim();
        course = allCourses.find(c => 
          c.name.toLowerCase() === cleanCourse ||
          c.code.toLowerCase() === cleanCourse ||
          c.name.toLowerCase().includes(cleanCourse) ||
          cleanCourse.includes(c.name.toLowerCase())
        );
      }
      if (!course) {
        if (rawCourse) {
          try {
            const newCode = (rawCourse.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5) || 'CRS').toUpperCase();
            course = await Course.create({
              name: rawCourse,
              code: newCode,
              category: 'Commerce',
              fees: 10000,
              description: `${rawCourse} Course`
            });
            allCourses.push(course);
          } catch (cErr) {
            course = allCourses[0] || null;
          }
        } else {
          course = allCourses[0] || null;
        }
      }

      // 2. Resolve Subject
      let subject = null;
      if (rawSubject) {
        const cleanSubj = rawSubject.toLowerCase().trim();
        if (course) {
          subject = allSubjects.find(s => 
            s.courseId === course.id && (
              s.name.toLowerCase() === cleanSubj ||
              s.code.toLowerCase() === cleanSubj ||
              s.name.toLowerCase().includes(cleanSubj) ||
              cleanSubj.includes(s.name.toLowerCase())
            )
          );
        }
        if (!subject) {
          subject = allSubjects.find(s => 
            s.name.toLowerCase() === cleanSubj ||
            s.code.toLowerCase() === cleanSubj ||
            s.name.toLowerCase().includes(cleanSubj) ||
            cleanSubj.includes(s.name.toLowerCase())
          );
          if (subject && !subject.courseId && course) {
            subject.courseId = course.id;
            await subject.save().catch(() => {});
          }
        }
        // Auto-create subject if not found
        if (!subject) {
          try {
            const subCode = (rawSubject.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5) + (course ? course.id : '')).toUpperCase();
            subject = await Subject.create({
              name: rawSubject,
              code: subCode || `SUB_${Date.now()}`,
              courseId: course ? course.id : null,
              description: `${rawSubject} subject`
            });
            allSubjects.push(subject);
          } catch (sErr) {
            subject = allSubjects[0] || null;
          }
        }
      } else {
        if (course) {
          subject = allSubjects.find(s => s.courseId === course.id);
        }
        if (!subject) {
          subject = allSubjects[0] || null;
        }
      }

      try {
        await Question.create({
          question: questionText,
          optionA: String(optA),
          optionB: String(optB),
          optionC: String(optC),
          optionD: String(optD),
          correctAnswer,
          courseId: course ? course.id : null,
          subjectId: subject ? subject.id : null,
          difficulty: normalizeDifficulty(rawDiff),
          marks: rawMarks,
          explanation: rawExp || null,
          isActive: true
        });
        imported++;
      } catch (insertErr) {
        errors.push(`Row ${rowNum}: ${insertErr.message}`);
      }
    }

    return res.json({
      success: true,
      imported,
      errors,
      total: data.length,
      message: imported > 0 
        ? `Successfully imported ${imported} out of ${data.length} questions!` 
        : `Could not import questions. ${errors.length > 0 ? errors[0] : 'Please check file format.'}`
    });
  } catch (err) {
    console.error('Error in importQuestions:', err);
    return res.status(500).json({ message: 'Excel import error: ' + err.message });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const { course, subject } = req.query;
    let where = {};
    if (course) where.courseId = course;
    if (subject) where.subjectId = subject;
    const questions = await Question.findAll({
      where,
      include: ['course', 'subject']
    });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addQuestion = async (req, res) => {
  try {
    const { course, subject, ...rest } = req.body;
    const q = await Question.create({ ...rest, courseId: course, subjectId: subject });
    res.status(201).json(q);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const q = await Question.findByPk(req.params.id);
    if (!q) return res.status(404).json({ message: 'Question not found' });
    await q.destroy();
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const { course, subject, courseId, subjectId, ...rest } = req.body;
    const q = await Question.findByPk(req.params.id);
    if (!q) return res.status(404).json({ message: 'Question not found' });
    
    await q.update({
      ...rest,
      courseId: course || courseId || q.courseId,
      subjectId: subject || subjectId || q.subjectId
    });
    
    const updated = await Question.findByPk(q.id, { include: ['course', 'subject'] });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
