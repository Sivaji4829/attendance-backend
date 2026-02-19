// backend/middleware/roleMiddleware.js

/**
 * Middleware to restrict access based on user roles.
 * This middleware expects req.user to be populated by the protect middleware.
 * * @param {...string} roles - Allowed roles (e.g., 'admin', 'faculty')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // 1. Check if user object exists (attached by authMiddleware)
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Not authorized, user information missing' 
      });
    }

    // 2. Check if the user's role is permitted for this route
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied: Role '${req.user.role}' is not authorized to access this resource` 
      });
    }

    // 3. Role is authorized, proceed to the next middleware/controller
    next();
  };
};

module.exports = { authorize };