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
    const where = {};
    if (req.query.course) where.courseId = req.query.course;
    if (req.query.subject) where.subjectId = req.query.subject;
    if (req.query.chapter) where.chapter = req.query.chapter;

    const exams = await Exam.findAll({
      where,
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
    const { course, subject, chapter, ...rest } = req.body;
    const exam = await Exam.create({ 
      ...rest, 
      courseId: course, 
      subjectId: subject,
      chapter: (chapter && chapter.trim()) ? chapter.trim() : 'General'
    });
    const created = await Exam.findByPk(exam.id, { include: ['course', 'subject'] });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const { course, subject, chapter, ...rest } = req.body;
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    
    await exam.update({ 
      ...rest, 
      courseId: course || exam.courseId, 
      subjectId: subject || exam.subjectId,
      chapter: chapter !== undefined ? ((chapter && chapter.trim()) ? chapter.trim() : 'General') : exam.chapter
    });
    const updated = await Exam.findByPk(exam.id, { include: ['course', 'subject'] });
    res.json(updated);
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
    
    const isAdminOrTeacher = req.user && ['admin', 'superadmin', 'teacher'].includes(req.user.role);

    // Enforce active status and student profile checks ONLY for non-admin students
    if (!isAdminOrTeacher && req.query.preview !== 'true') {
      if (exam.status !== 'active') return res.status(400).json({ message: 'Exam is not active' });
      
      const student = await Student.findOne({ where: { email: req.user.email } });
      if (!student) return res.status(404).json({ message: 'Student profile not found. Only registered students can attempt exams.' });
      
      const existing = await Result.findOne({ where: { studentId: student.id, examId: exam.id } });
      if (existing) return res.status(400).json({ message: 'You have already attempted this exam' });
    }
    
    // Smart Question Sync with Fallbacks
    let whereClause = {};
    if (exam.subjectId) whereClause.subjectId = exam.subjectId;
    if (exam.courseId) whereClause.courseId = exam.courseId;
    if (exam.chapter && exam.chapter !== 'General') whereClause.chapter = exam.chapter;

    let allQuestions = await Question.findAll({ where: whereClause });

    // Fallback 1: Remove chapter filter if no chapter-specific questions found
    if (allQuestions.length === 0 && exam.chapter && exam.chapter !== 'General') {
      delete whereClause.chapter;
      allQuestions = await Question.findAll({ where: whereClause });
    }

    // Fallback 2: Match by Subject ID alone
    if (allQuestions.length === 0 && exam.subjectId) {
      allQuestions = await Question.findAll({ where: { subjectId: exam.subjectId } });
    }

    // Fallback 3: Match by Course ID alone
    if (allQuestions.length === 0 && exam.courseId) {
      allQuestions = await Question.findAll({ where: { courseId: exam.courseId } });
    }

    // Fallback 4: Fetch all questions in system
    if (allQuestions.length === 0) {
      allQuestions = await Question.findAll();
    }

    // If zero questions in DB, return error message
    if (allQuestions.length === 0) {
      return res.status(400).json({ message: 'No questions available in the question bank for this exam. Please add questions first.' });
    }

    // Dynamic question cap - use available questions up to questionsPerExam
    const targetCount = Math.min(exam.questionsPerExam || 50, allQuestions.length);
    let selected = shuffleArray([...allQuestions]).slice(0, targetCount);
    
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
    res.setHeader('Content-Length', buffer.length);
    return res.end(buffer);
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
      const rawChapter = getField(row, ['Chapter', 'chapter', 'Chapter Name', 'ChapterName', 'Topic', 'topic', 'Folder', 'folder']);
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

      // 2. Resolve Subject (Active UI subject takes priority if uploaded inside a specific subject)
      let subject = null;
      if (req.body.subjectId) {
        subject = allSubjects.find(s => String(s.id) === String(req.body.subjectId)) || null;
      }
      if (!subject && rawSubject) {
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
      }
      if (!subject && course) {
        subject = allSubjects.find(s => s.courseId === course.id);
      }
      if (!subject) {
        subject = allSubjects[0] || null;
      }

      // 3. Resolve Chapter (Active UI chapter takes priority if uploaded inside a specific chapter)
      const finalChapter = (req.body.chapter && req.body.chapter.trim()) 
        ? req.body.chapter.trim() 
        : ((rawChapter && rawChapter.trim()) ? rawChapter.trim() : 'General');

      // Sanitize foreign keys to ensure SQLite Foreign Key constraints NEVER fail
      let validCourseId = null;
      if (course && course.id) {
        const cExist = allCourses.find(c => String(c.id) === String(course.id));
        if (cExist) validCourseId = cExist.id;
      }
      
      let validSubjectId = null;
      if (subject && subject.id) {
        const sExist = allSubjects.find(s => String(s.id) === String(subject.id));
        if (sExist) validSubjectId = sExist.id;
      }

      if (!validCourseId && validSubjectId) {
        const sObj = allSubjects.find(s => String(s.id) === String(validSubjectId));
        if (sObj && sObj.courseId) validCourseId = sObj.courseId;
      }

      try {
        await Question.create({
          question: questionText,
          optionA: String(optA),
          optionB: String(optB),
          optionC: String(optC),
          optionD: String(optD),
          correctAnswer,
          courseId: validCourseId,
          subjectId: validSubjectId,
          chapter: finalChapter,
          difficulty: normalizeDifficulty(rawDiff),
          marks: rawMarks,
          explanation: rawExp || null,
          isActive: true
        });
        imported++;
      } catch (insertErr) {
        console.error(`Row ${rowNum} import error:`, insertErr);
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
    const { course, subject, courseId, subjectId, chapter, correctAnswer, difficulty, marks, question, optionA, optionB, optionC, optionD, ...rest } = req.body;
    
    // Normalize Correct Answer to A, B, C, D
    let normCorrect = String(correctAnswer || 'A').trim().toUpperCase();
    if (!['A', 'B', 'C', 'D'].includes(normCorrect)) normCorrect = 'A';

    // Normalize Difficulty to easy, medium, hard
    let normDiff = String(difficulty || 'medium').trim().toLowerCase();
    if (!['easy', 'medium', 'hard'].includes(normDiff)) normDiff = 'medium';

    const normMarks = parseInt(marks) || 1;

    // Parse integer IDs or null to prevent SQLITE_CONSTRAINT foreign key errors
    const rawCourse = course || courseId;
    const rawSubject = subject || subjectId;

    const targetCourseId = (rawCourse && String(rawCourse).trim() !== '' && !isNaN(rawCourse)) ? parseInt(rawCourse) : null;
    const targetSubjectId = (rawSubject && String(rawSubject).trim() !== '' && !isNaN(rawSubject)) ? parseInt(rawSubject) : null;

    // Validate foreign keys exist
    let validSubjectId = null;
    if (targetSubjectId) {
      const sExists = await Subject.findByPk(targetSubjectId);
      if (sExists) validSubjectId = targetSubjectId;
    }

    let validCourseId = null;
    if (targetCourseId) {
      const cExists = await Course.findByPk(targetCourseId);
      if (cExists) validCourseId = targetCourseId;
    } else if (validSubjectId) {
      const sObj = await Subject.findByPk(validSubjectId);
      if (sObj && sObj.courseId) validCourseId = sObj.courseId;
    }

    const q = await Question.create({
      ...rest,
      question: String(question || '').trim(),
      optionA: String(optionA || '').trim(),
      optionB: String(optionB || '').trim(),
      optionC: String(optionC || '').trim(),
      optionD: String(optionD || '').trim(),
      correctAnswer: normCorrect,
      difficulty: normDiff,
      marks: normMarks,
      courseId: validCourseId,
      subjectId: validSubjectId,
      chapter: (chapter && chapter.trim()) ? chapter.trim() : 'General',
      isActive: true
    });

    const created = await Question.findByPk(q.id, { include: ['course', 'subject'] });
    res.status(201).json(created);
  } catch (err) {
    console.error('Error in addQuestion:', err);
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
    const { course, subject, courseId, subjectId, chapter, correctAnswer, difficulty, marks, question, optionA, optionB, optionC, optionD, ...rest } = req.body;
    const q = await Question.findByPk(req.params.id);
    if (!q) return res.status(404).json({ message: 'Question not found' });
    
    let normCorrect = q.correctAnswer;
    if (correctAnswer) {
      normCorrect = String(correctAnswer).trim().toUpperCase();
      if (!['A', 'B', 'C', 'D'].includes(normCorrect)) normCorrect = 'A';
    }

    let normDiff = q.difficulty;
    if (difficulty) {
      normDiff = String(difficulty).trim().toLowerCase();
      if (!['easy', 'medium', 'hard'].includes(normDiff)) normDiff = 'medium';
    }

    const rawCourse = course || courseId;
    const rawSubject = subject || subjectId;

    const targetCourseId = (rawCourse && String(rawCourse).trim() !== '' && !isNaN(rawCourse)) ? parseInt(rawCourse) : null;
    const targetSubjectId = (rawSubject && String(rawSubject).trim() !== '' && !isNaN(rawSubject)) ? parseInt(rawSubject) : null;

    let validSubjectId = q.subjectId;
    if (targetSubjectId !== null) {
      const sExists = await Subject.findByPk(targetSubjectId);
      validSubjectId = sExists ? targetSubjectId : null;
    }

    let validCourseId = q.courseId;
    if (targetCourseId !== null) {
      const cExists = await Course.findByPk(targetCourseId);
      validCourseId = cExists ? targetCourseId : null;
    }

    await q.update({
      ...rest,
      question: question ? String(question).trim() : q.question,
      optionA: optionA ? String(optionA).trim() : q.optionA,
      optionB: optionB ? String(optionB).trim() : q.optionB,
      optionC: optionC ? String(optionC).trim() : q.optionC,
      optionD: optionD ? String(optionD).trim() : q.optionD,
      correctAnswer: normCorrect,
      difficulty: normDiff,
      marks: marks ? (parseInt(marks) || 1) : q.marks,
      courseId: validCourseId,
      subjectId: validSubjectId,
      chapter: chapter !== undefined ? ((chapter && chapter.trim()) ? chapter.trim() : 'General') : q.chapter
    });
    
    const updated = await Question.findByPk(q.id, { include: ['course', 'subject'] });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAllQuestions = async (req, res) => {
  try {
    const subjectId = req.body?.subjectId || req.query?.subjectId;
    const chapter = req.body?.chapter || req.query?.chapter;
    const courseId = req.body?.courseId || req.query?.courseId;

    let where = {};
    if (subjectId) where.subjectId = subjectId;
    if (chapter) where.chapter = chapter;
    if (courseId) where.courseId = courseId;

    const count = await Question.destroy({ where, truncate: false });
    res.json({ message: `Successfully deleted ${count} questions.`, deletedCount: count });
  } catch (err) {
    console.error('Error in deleteAllQuestions:', err);
    res.status(500).json({ message: err.message || 'Failed to delete questions' });
  }
};

exports.seedDemoData = async (req, res) => {
  try {
    // 1. Ensure/Create Course
    let [course] = await Course.findOrCreate({
      where: { code: 'COMM12' },
      defaults: {
        name: 'Class 12 Commerce',
        code: 'COMM12',
        category: 'Commerce',
        fees: 15000,
        description: 'Complete Class 12 Commerce Preparation'
      }
    });

    // 2. Ensure/Create Subjects
    let [subjectAcc] = await Subject.findOrCreate({
      where: { name: 'Accountancy', courseId: course.id },
      defaults: {
        name: 'Accountancy',
        code: 'ACC12',
        courseId: course.id,
        description: 'Class 12 Accountancy & Financial Management'
      }
    });

    let [subjectBst] = await Subject.findOrCreate({
      where: { name: 'Business Studies', courseId: course.id },
      defaults: {
        name: 'Business Studies',
        code: 'BST12',
        courseId: course.id,
        description: 'Principles & Functions of Management'
      }
    });

    // 3. Seed Sample Questions
    const sampleQuestions = [
      {
        question: 'Sacrificing Ratio is calculated as:',
        optionA: 'New Ratio − Old Ratio',
        optionB: 'Old Ratio − New Ratio',
        optionC: 'Old Ratio × New Ratio',
        optionD: 'Gaining Ratio − Old Ratio',
        correctAnswer: 'B',
        courseId: course.id,
        subjectId: subjectAcc.id,
        chapter: 'Chapter 1: Partnership Accounting',
        difficulty: 'easy',
        marks: 1,
        explanation: 'Sacrificing Ratio = Old Ratio − New Ratio.'
      },
      {
        question: 'On admission of a new partner, increase in value of an asset is credited to:',
        optionA: 'Revaluation Account',
        optionB: 'Asset Account',
        optionC: 'Old Partners Capital Account',
        optionD: 'Profit & Loss Account',
        correctAnswer: 'A',
        courseId: course.id,
        subjectId: subjectAcc.id,
        chapter: 'Chapter 1: Partnership Accounting',
        difficulty: 'medium',
        marks: 1,
        explanation: 'Increase in asset value is a gain, so it is credited to Revaluation A/c.'
      },
      {
        question: 'Which of the following is NOT an outflow of cash under Financing Activities?',
        optionA: 'Redemption of Debentures',
        optionB: 'Payment of Dividend',
        optionC: 'Purchase of Plant and Machinery',
        optionD: 'Repayment of Long-term Bank Loan',
        correctAnswer: 'C',
        courseId: course.id,
        subjectId: subjectAcc.id,
        chapter: 'Chapter 2: Financial Statements',
        difficulty: 'medium',
        marks: 1,
        explanation: 'Purchase of fixed assets is an Investing Activity, not a Financing Activity.'
      },
      {
        question: 'Securities Premium Reserve CANNOT be utilized for which of the following purposes?',
        optionA: 'Issuing fully paid bonus shares',
        optionB: 'Writing off preliminary expenses',
        optionC: 'Distribution of cash dividend to shareholders',
        optionD: 'Writing off discount on issue of debentures',
        correctAnswer: 'C',
        courseId: course.id,
        subjectId: subjectAcc.id,
        chapter: 'Chapter 2: Financial Statements',
        difficulty: 'hard',
        marks: 1,
        explanation: 'Section 52(2) of Companies Act 2013 prohibits distribution of dividends from Securities Premium.'
      },
      {
        question: 'Which management function involves establishing authority-responsibility relationships?',
        optionA: 'Planning',
        optionB: 'Organising',
        optionC: 'Staffing',
        optionD: 'Directing',
        correctAnswer: 'B',
        courseId: course.id,
        subjectId: subjectBst.id,
        chapter: 'Chapter 1: Principles of Management',
        difficulty: 'easy',
        marks: 1,
        explanation: 'Organising defines organizational structure and authority hierarchy.'
      }
    ];

    let createdQCount = 0;
    for (const qData of sampleQuestions) {
      const [q, created] = await Question.findOrCreate({
        where: { question: qData.question },
        defaults: qData
      });
      if (created) createdQCount++;
    }

    // 4. Seed Sample Exams
    const sampleExams = [
      {
        title: 'Class 12 Accountancy - Partnership Test',
        courseId: course.id,
        subjectId: subjectAcc.id,
        chapter: 'Chapter 1: Partnership Accounting',
        totalQuestions: 10,
        questionsPerExam: 5,
        duration: 30,
        totalMarks: 10,
        passingMarks: 4,
        status: 'active',
        instructions: 'Attempt all questions. Each question carries equal marks.',
        shuffleQuestions: true,
        shuffleOptions: true,
        negativeMarking: false
      },
      {
        title: 'Financial Statements Master Quiz',
        courseId: course.id,
        subjectId: subjectAcc.id,
        chapter: 'Chapter 2: Financial Statements',
        totalQuestions: 10,
        questionsPerExam: 5,
        duration: 45,
        totalMarks: 15,
        passingMarks: 6,
        status: 'active',
        instructions: 'Test your understanding of Balance Sheets & Cash Flow Statements.',
        shuffleQuestions: true,
        shuffleOptions: true,
        negativeMarking: true,
        negativeMarks: 0.25
      }
    ];

    let createdECount = 0;
    for (const eData of sampleExams) {
      const [e, created] = await Exam.findOrCreate({
        where: { title: eData.title },
        defaults: eData
      });
      if (created) createdECount++;
    }

    res.json({
      success: true,
      message: `Demo Data Seeded Successfully! (${createdQCount} Questions, ${createdECount} Exams created under Course: Class 12 Commerce)`,
      course,
      subject: subjectAcc
    });
  } catch (err) {
    console.error('Error in seedDemoData:', err);
    res.status(500).json({ message: err.message });
  }
};
