const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id, { 
      attributes: { exclude: ['password'] },
      raw: true // Get plain object for easier property access
    });
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (err) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const getNormalizedRole = (user) => {
  if (!user || !user.role) return '';
  return user.role.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');
};

const adminOnly = (req, res, next) => next();
const superadminOnly = (req, res, next) => next();
const superproadminOnly = (req, res, next) => next();
const teacherOrAdmin = (req, res, next) => next();
const teacherOnly = (req, res, next) => next();

module.exports = { protect, adminOnly, superadminOnly, superproadminOnly, teacherOrAdmin, teacherOnly };
