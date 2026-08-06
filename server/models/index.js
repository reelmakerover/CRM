const Course = require('./Course');
const Subject = require('./Subject');
const User = require('./User');
const Student = require('./Student');
const Batch = require('./Batch');
const Question = require('./Question');
const Exam = require('./Exam');
const Result = require('./Result');
const Topper = require('./Topper');
const Settings = require('./Settings');
const Blog = require('./Blog');
const Lead = require('./Lead');
const ExamKit = require('./ExamKit');
const KitOrder = require('./KitOrder');
const Lecture = require('./Lecture');

// --- Associations ---

// Course & Subject
Course.hasMany(Subject, { foreignKey: 'courseId', as: 'subjects' });
Subject.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Course & Batch
Course.hasMany(Batch, { foreignKey: 'courseId', as: 'batches' });
Batch.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Course & Student
Course.hasMany(Student, { foreignKey: 'courseId', as: 'students' });
Student.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Course & Question
Course.hasMany(Question, { foreignKey: 'courseId', as: 'questions' });
Question.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Subject & Question
Subject.hasMany(Question, { foreignKey: 'subjectId', as: 'questions' });
Question.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

// Course & Exam
Course.hasMany(Exam, { foreignKey: 'courseId', as: 'exams' });
Exam.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Subject & Exam
Subject.hasMany(Exam, { foreignKey: 'subjectId', as: 'exams' });
Exam.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

// Batch & Student
Batch.hasMany(Student, { foreignKey: 'batchId', as: 'students' });
Student.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch' });

// Student & User
Student.hasOne(User, { foreignKey: 'studentId', as: 'user' });
User.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// Student & Result
Student.hasMany(Result, { foreignKey: 'studentId', as: 'results' });
Result.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// Exam & Result
Exam.hasMany(Result, { foreignKey: 'examId', as: 'results' });
Result.belongsTo(Exam, { foreignKey: 'examId', as: 'exam' });

// Course & Result
Course.hasMany(Result, { foreignKey: 'courseId', as: 'results' });
Result.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Subject & Result
Subject.hasMany(Result, { foreignKey: 'subjectId', as: 'results' });
Result.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

// Course & ExamKit
Course.hasMany(ExamKit, { foreignKey: 'courseId', as: 'examKits' });
ExamKit.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// ExamKit & KitOrder
ExamKit.hasMany(KitOrder, { foreignKey: 'examKitId', as: 'orders' });
KitOrder.belongsTo(ExamKit, { foreignKey: 'examKitId', as: 'examKit' });

// Lecture associations
Course.hasMany(Lecture, { foreignKey: 'courseId', as: 'lectures' });
Lecture.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Subject.hasMany(Lecture, { foreignKey: 'subjectId', as: 'lectures' });
Lecture.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

module.exports = {
  Course,
  Subject,
  User,
  Student,
  Batch,
  Question,
  Exam,
  Result,
  Topper,
  Settings,
  Blog,
  Lead,
  ExamKit,
  KitOrder,
  Lecture
};
