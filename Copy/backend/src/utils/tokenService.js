const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Generate password reset token (shorter expiration)
const generateResetToken = (userId) => {
  return jwt.sign(
    { userId, type: 'reset' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_RESET_EXPIRE || '15m' }
  );
};

// Verify token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = {
  generateToken,
  generateResetToken,
  verifyToken
};