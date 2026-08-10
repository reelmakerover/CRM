const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Lead = sequelize.define('Lead', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
  },
  city: {
    type: DataTypes.STRING,
  },
  score: {
    type: DataTypes.STRING,
  },
  source: {
    type: DataTypes.STRING,
    defaultValue: 'Website',
  },
  courseName: {
    type: DataTypes.STRING,
    defaultValue: '12th Commerce',
  },
  status: {
    type: DataTypes.ENUM('New Lead', 'Interested', 'Callback Requested', 'Not Interested', 'Enrolled', 'Busy / No Answer'),
    defaultValue: 'New Lead',
  },
  notes: {
    type: DataTypes.TEXT,
  },
  callerName: {
    type: DataTypes.STRING,
    defaultValue: 'Telecaller',
  },
  callCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lastCalledAt: {
    type: DataTypes.DATE,
  },
  statusUpdatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  nextFollowUpDate: {
    type: DataTypes.DATEONLY,
  },
}, {
  timestamps: true,
});

module.exports = Lead;
