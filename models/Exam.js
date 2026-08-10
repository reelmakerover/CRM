const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Exam = sequelize.define('Exam', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
  },
  questionsPerExam: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
  },
  totalMarks: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
  },
  passingMarks: {
    type: DataTypes.INTEGER,
    defaultValue: 20,
  },
  startDate: {
    type: DataTypes.DATE,
  },
  endDate: {
    type: DataTypes.DATE,
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'completed'),
    defaultValue: 'draft',
  },
  instructions: {
    type: DataTypes.TEXT,
  },
  shuffleQuestions: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  shuffleOptions: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  negativeMarking: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  negativeMarks: {
    type: DataTypes.FLOAT,
    defaultValue: 0.25,
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
});

module.exports = Exam;
