const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Result = sequelize.define('Result', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  answers: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
  },
  attemptedQuestions: {
    type: DataTypes.INTEGER,
  },
  correctAnswers: {
    type: DataTypes.INTEGER,
  },
  incorrectAnswers: {
    type: DataTypes.INTEGER,
  },
  skippedQuestions: {
    type: DataTypes.INTEGER,
  },
  marksObtained: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  totalMarks: {
    type: DataTypes.INTEGER,
  },
  percentage: {
    type: DataTypes.FLOAT,
  },
  rank: {
    type: DataTypes.INTEGER,
  },
  grade: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM('pass', 'fail'),
    defaultValue: 'fail',
  },
  timeTaken: {
    type: DataTypes.INTEGER,
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  notificationSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  courseId: {
    type: DataTypes.INTEGER,
  },
  subjectId: {
    type: DataTypes.INTEGER,
  },
}, {
  timestamps: true,
});

module.exports = Result;
