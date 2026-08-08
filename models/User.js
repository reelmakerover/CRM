const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('superproadmin', 'superadmin', 'admin', 'student'),
    defaultValue: 'student',
  },
  visiblePassword: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  permissions: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  phone: {
    type: DataTypes.STRING,
  },
  parentEmail: {
    type: DataTypes.STRING,
  },
  parentPhone: {
    type: DataTypes.STRING,
  },
  photo: {
    type: DataTypes.TEXT('long'),
  },
  otpCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  otpExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  otpPurpose: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        user.visiblePassword = user.password;
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
  },
});

User.prototype.matchPassword = async function (enteredPassword) {
  if (!enteredPassword) return false;
  if (this.password === enteredPassword || this.visiblePassword === enteredPassword) return true;
  try {
    if (this.password && (this.password.startsWith('$2a$') || this.password.startsWith('$2b$') || this.password.startsWith('$2y$'))) {
      return await bcrypt.compare(enteredPassword, this.password);
    }
  } catch (e) {
    return false;
  }
  return false;
};

module.exports = User;
