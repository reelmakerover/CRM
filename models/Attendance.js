const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late'),
    defaultValue: 'present',
    allowNull: false,
  },
  remarks: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  whatsappStatus: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  batchId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  markedById: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['date', 'studentId', 'batchId']
    }
  ]
});

module.exports = Attendance;
