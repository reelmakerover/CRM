const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Batch = sequelize.define('Batch', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
  },
  timing: {
    type: DataTypes.STRING,
  },
  totalSeats: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
  },
  instructor: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM('upcoming', 'active', 'completed'),
    defaultValue: 'upcoming',
  },
  fees: {
    type: DataTypes.DECIMAL(10, 2),
  },
  mode: {
    type: DataTypes.ENUM('offline', 'online', 'hybrid'),
    defaultValue: 'offline',
  },
}, {
  timestamps: true,
});

module.exports = Batch;
