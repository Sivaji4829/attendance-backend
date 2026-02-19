// backend/controllers/academicController.js

const db = require('../config/db');

/**
 * @desc    Get all academic years
 * @route   GET /api/academic/years
 */
const getYears = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM years ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching years', error: error.message });
  }
};

/**
 * @desc    Get all courses
 * @route   GET /api/academic/courses
 */
const getCourses = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM courses ORDER BY course_name ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
};

/**
 * @desc    Get all branches
 * @route   GET /api/academic/branches
 */
const getBranches = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM branches ORDER BY branch_name ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching branches', error: error.message });
  }
};

/**
 * @desc    Get sections (optionally filtered)
 * @route   GET /api/academic/sections
 */
const getSections = async (req, res) => {
  const { year_id, branch_id } = req.query;
  try {
    let query = 'SELECT * FROM sections WHERE 1=1';
    const params = [];

    if (year_id) {
      params.push(year_id);
      query += ` AND year_id = $${params.length}`;
    }
    if (branch_id) {
      params.push(branch_id);
      query += ` AND branch_id = $${params.length}`;
    }

    query += ' ORDER BY section_name ASC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sections', error: error.message });
  }
};

module.exports = {
  getYears,
  getCourses,
  getBranches,
  getSections
};