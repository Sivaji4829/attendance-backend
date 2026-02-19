// backend/controllers/studentController.js

const db = require('../config/db');

/**
 * @desc    Get all students with filters
 * @route   GET /api/students
 * @access  Private (Admin/Faculty)
 */
const getStudents = async (req, res) => {
  const { year_id, branch_id, section_id } = req.query;

  try {
    /**
     * Query logic aligned with backend/models/schema.sql:
     * - students table has: id, roll_number, full_name, parent_phone, course_id, year_id, branch_id, section_id
     */
    let queryText = `
      SELECT 
        s.id, 
        s.roll_number, 
        s.full_name, 
        s.parent_phone,
        y.year_name, 
        b.branch_name, 
        sec.section_name, 
        c.course_name 
      FROM public.students s
      LEFT JOIN public.years y ON s.year_id = y.id
      LEFT JOIN public.branches b ON s.branch_id = b.id
      LEFT JOIN public.sections sec ON s.section_id = sec.id
      LEFT JOIN public.courses c ON s.course_id = c.id
      WHERE s.is_deleted = false
    `;
    
    const queryParams = [];

    if (year_id && year_id !== '') {
      queryParams.push(year_id);
      queryText += ` AND s.year_id = $${queryParams.length}`;
    }
    
    if (branch_id && branch_id !== '') {
      queryParams.push(branch_id);
      queryText += ` AND s.branch_id = $${queryParams.length}`;
    }
    
    if (section_id && section_id !== '') {
      queryParams.push(section_id);
      queryText += ` AND s.section_id = $${queryParams.length}`;
    }

    queryText += ' ORDER BY s.roll_number ASC';

    const result = await db.query(queryText, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Get Students Error:', error);
    res.status(500).json({ 
      message: 'Database query error', 
      error: error.message 
    });
  }
};

/**
 * @desc    Add a new student
 * @route   POST /api/students
 * @access  Private (Admin)
 */
const addStudent = async (req, res) => {
  const { roll_number, full_name, parent_phone, course_id, year_id, branch_id, section_id } = req.body;

  try {
    // Validating all required fields including branch_id which is NOT NULL in schema
    if (!roll_number || !full_name || !parent_phone || !course_id || !year_id || !branch_id || !section_id) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: Roll Number, Name, Phone, Course, Year, Branch, and Section.' 
      });
    }

    const result = await db.query(
      `INSERT INTO public.students 
      (roll_number, full_name, parent_phone, course_id, year_id, branch_id, section_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`,
      [roll_number, full_name, parent_phone, course_id, year_id, branch_id, section_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add Student Error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Roll number already exists' });
    }
    res.status(500).json({ message: 'Server error while adding student' });
  }
};

/**
 * @desc    Soft delete a student
 * @route   DELETE /api/students/:id
 * @access  Private (Admin only)
 */
const deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'UPDATE public.students SET is_deleted = true WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully', id: result.rows[0].id });
  } catch (error) {
    console.error('Delete Student Error:', error);
    res.status(500).json({ message: 'Server error while deleting student' });
  }
};

/**
 * @desc    Get student by ID with attendance percentage
 * @route   GET /api/students/:id
 * @access  Private (Admin/Faculty)
 */
const getStudentById = async (req, res) => {
  const { id } = req.params;
  try {
    const studentResult = await db.query(
      `SELECT 
        s.*, 
        y.year_name, 
        b.branch_name, 
        sec.section_name 
       FROM public.students s
       LEFT JOIN public.years y ON s.year_id = y.id
       LEFT JOIN public.branches b ON s.branch_id = b.id
       LEFT JOIN public.sections sec ON s.section_id = sec.id
       WHERE s.id = $1 AND s.is_deleted = false`, 
      [id]
    );
    
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const statsResult = await db.query(
      `SELECT 
        COUNT(*) as total_sessions,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_sessions
      FROM public.attendance 
      WHERE student_id = $1`,
      [id]
    );

    const stats = statsResult.rows[0];
    const total = parseInt(stats.total_sessions) || 0;
    const present = parseInt(stats.present_sessions) || 0;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : "0.00";

    res.json({
      ...studentResult.rows[0],
      attendance_stats: { 
        total_sessions: total, 
        present_sessions: present, 
        percentage: percentage 
      }
    });
  } catch (error) {
    console.error('Get Student Detail Error:', error);
    res.status(500).json({ message: 'Server error while fetching student details' });
  }
};

module.exports = { addStudent, getStudents, deleteStudent, getStudentById };