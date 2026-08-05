const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  enrollmentNo: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
  },
  parentName: {
    type: DataTypes.STRING,
  },
  parentEmail: {
    type: DataTypes.STRING,
  },
  parentPhone: {
    type: DataTypes.STRING,
  },
  photo: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.TEXT,
  },
  dateOfBirth: {
    type: DataTypes.DATE,
  },
  fees: {
    type: DataTypes.JSON,
    defaultValue: {
      totalFees: 0,
      paidAmount: 0,
      pendingAmount: 0,
      installments: []
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  joinDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
});

module.exports = Student;
