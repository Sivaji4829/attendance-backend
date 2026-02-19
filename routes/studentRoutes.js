// backend/routes/studentRoutes.js

const express = require('express');
const router = express.Router();
const {
  addStudent,
  getStudents,
  deleteStudent,
  getStudentById
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

/**
 * @route   POST /api/students
 * @desc    Add a new student
 * @access  Private (Admin only)
 */
router.post('/', protect, authorize('admin'), addStudent);

/**
 * @route   GET /api/students
 * @desc    Get all students with optional filters (year, branch, section)
 * @access  Private (Admin/Faculty)
 */
router.get('/', protect, authorize('admin', 'faculty'), getStudents);

/**
 * @route   GET /api/students/:id
 * @desc    Get student by ID with attendance percentage
 * @access  Private (Admin/Faculty)
 */
router.get('/:id', protect, authorize('admin', 'faculty'), getStudentById);

/**
 * @route   DELETE /api/students/:id
 * @desc    Soft delete a student
 * @access  Private (Admin only)
 */
router.delete('/:id', protect, authorize('admin'), deleteStudent);

module.exports = router;