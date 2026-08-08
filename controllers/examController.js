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

exports.importQuestions = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    let imported = 0, errors = [];
    
    for (const row of data) {
      try {
        const course = await Course.findOne({ where: { name: { [Op.like]: `%${row.Course}%` } } });
        const subject = await Subject.findOne({ where: { name: { [Op.like]: `%${row.Subject}%` } } });
        
        if (!course || !subject) { errors.push(`Row skipped: Course/Subject not found - ${row.Course}/${row.Subject}`); continue; }
        
        await Question.create({
          question: row.Question,
          optionA: row['Option A'] || row.OptionA,
          optionB: row['Option B'] || row.OptionB,
          optionC: row['Option C'] || row.OptionC,
          optionD: row['Option D'] || row.OptionD,
          correctAnswer: row['Correct Answer'] || row.CorrectAnswer,
          courseId: course.id,
          subjectId: subject.id,
          difficulty: row.Difficulty?.toLowerCase() || 'medium',
        });
        imported++;
      } catch (e) { errors.push(`Row error: ${e.message}`); }
    }
    
    res.json({ imported, errors, total: data.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
