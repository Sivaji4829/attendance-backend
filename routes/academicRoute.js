// backend/routes/academicRoutes.js

const express = require('express');
const router = express.Router();
const { 
  getYears, 
  getBranches, 
  getSections, 
  getCourses 
} = require('../controllers/academicController');
const { protect } = require('../middleware/authMiddleware');

/**
 * These routes provide the metadata for dropdowns in the frontend.
 * They are protected to ensure only authenticated faculty/admins can access them.
 */
router.get('/years', protect, getYears);
router.get('/branches', protect, getBranches);
router.get('/sections', protect, getSections);
router.get('/courses', protect, getCourses);

module.exports = router;