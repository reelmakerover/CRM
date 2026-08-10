const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ExamKit = sequelize.define('ExamKit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subtitle: {
    type: DataTypes.STRING,
  },
  categoryType: {
    type: DataTypes.STRING,
    defaultValue: 'Test Series & Study Kit',
  },
  validity: {
    type: DataTypes.STRING,
    defaultValue: '1 Year Validity',
  },
  description: {
    type: DataTypes.TEXT,
  },
  mrpPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 4999.00,
  },
  sellingPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 1999.00,
  },
  thumbnailUrl: {
    type: DataTypes.TEXT('long'),
  },
  features: {
    type: DataTypes.TEXT, // Stored as JSON string or comma-separated
  },
  includedPdfs: {
    type: DataTypes.TEXT, // Stored as JSON string [{ title, url }]
  },
  includedVideos: {
    type: DataTypes.TEXT, // Stored as JSON string [{ title, url }]
  },
  status: {
    type: DataTypes.ENUM('published', 'draft'),
    defaultValue: 'published',
  },
  salesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = ExamKit;
