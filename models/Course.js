const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
  },
  duration: {
    type: DataTypes.STRING,
  },
  fees: {
    type: DataTypes.DECIMAL(10, 2),
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'Commerce',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  image: {
    type: DataTypes.TEXT('long'),
  },
  features: {
    type: DataTypes.JSON, // Storing array as JSON
    defaultValue: [],
  },
}, {
  timestamps: true,
});

module.exports = Course;
