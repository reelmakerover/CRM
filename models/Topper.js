const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Topper = sequelize.define('Topper', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  course: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  marks: {
    type: DataTypes.STRING,
  },
  percentage: {
    type: DataTypes.STRING,
  },
  rank: {
    type: DataTypes.STRING,
  },
  year: {
    type: DataTypes.STRING,
  },
  photo: {
    type: DataTypes.TEXT('long'),
  },
  testimonial: {
    type: DataTypes.TEXT,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
});

module.exports = Topper;
