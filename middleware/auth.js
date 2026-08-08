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

const adminOnly = (req, res, next) => {
  if (req.user && ['admin', 'superadmin', 'superproadmin'].includes(req.user.role)) return next();
  res.status(403).json({ message: 'Admin access required' });
};

const superadminOnly = (req, res, next) => {
  if (req.user && ['superadmin', 'superproadmin'].includes(req.user.role)) return next();
  res.status(403).json({ message: 'Super Admin access required' });
};

const superproadminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'superproadmin') return next();
  res.status(403).json({ message: 'Super Pro Admin access required' });
};

module.exports = { protect, adminOnly, superadminOnly, superproadminOnly };
