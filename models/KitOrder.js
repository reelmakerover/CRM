const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const KitOrder = sequelize.define('KitOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  orderNo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  studentName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  studentPhone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  studentEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
  },
  amountPaid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.ENUM('UPI QR Code', 'Net Banking / Card', 'Cash / Pay at Center'),
    defaultValue: 'UPI QR Code',
  },
  paymentStatus: {
    type: DataTypes.ENUM('completed', 'pending', 'failed'),
    defaultValue: 'completed',
  },
  transactionRef: {
    type: DataTypes.STRING,
  },
  examKitId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = KitOrder;
