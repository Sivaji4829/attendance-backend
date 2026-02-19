// backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * Middleware to verify JWT token and authenticate the user.
 * Expects token in the format: Authorization: Bearer <token>
 */
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database using the id from the token payload
      // We exclude the password_hash for security
      const userResult = await db.query(
        'SELECT id, full_name, email, role FROM users WHERE id = $1',
        [decoded.id]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Attach user to the request object
      req.user = userResult.rows[0];
      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };