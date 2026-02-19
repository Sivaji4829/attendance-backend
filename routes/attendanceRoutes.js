// backend/routes/attendanceRoutes.js

const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendanceReport,
  getSectionSummary
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

/**
 * @route   POST /api/attendance
 * @desc    Mark attendance for students (Session-wise)
 * @access  Private (Admin/Faculty)
 */
router.post('/', protect, authorize('admin', 'faculty'), markAttendance);

/**
 * @route   GET /api/attendance/report
 * @desc    Get detailed attendance report by date and session
 * @access  Private (Admin/Faculty)
 */
router.get('/report', protect, authorize('admin', 'faculty'), getAttendanceReport);

/**
 * @route   GET /api/attendance/summary
 * @desc    Get attendance percentage summary for a specific section
 * @access  Private (Admin/Faculty)
 */
router.get('/summary', protect, authorize('admin', 'faculty'), getSectionSummary);

module.exports = router;