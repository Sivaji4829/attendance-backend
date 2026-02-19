// backend/controllers/attendanceController.js

const db = require('../config/db');

/**
 * @desc    Mark attendance for a list of students
 * @route   POST /api/attendance
 * @access  Private (Admin/Faculty)
 */
const markAttendance = async (req, res) => {
  const { date, session, attendance_data } = req.body;
  // attendance_data: [{ student_id: 1, status: 'present' }, ...]

  if (!date || !session || !attendance_data || !Array.isArray(attendance_data)) {
    return res.status(400).json({ message: 'Invalid attendance data provided' });
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    const marked_by = req.user.id;
    const results = [];
    const absentees = [];

    for (const record of attendance_data) {
      const { student_id, status } = record;

      // Requirement: Check if attendance already exists for this session/date
      // The UNIQUE constraint in SQL handles this, but we check here for better error messaging
      const checkExist = await client.query(
        'SELECT id FROM attendance WHERE student_id = $1 AND attendance_date = $2 AND session = $3',
        [student_id, date, session]
      );

      if (checkExist.rows.length > 0) {
        throw new Error(`Attendance already submitted for Student ID ${student_id} for this session. Updates are not allowed.`);
      }

      const insertResult = await client.query(
        `INSERT INTO attendance (student_id, attendance_date, session, status, marked_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [student_id, date, session, status, marked_by]
      );

      results.push(insertResult.rows[0]);

      // Track absentees for SMS notification
      if (status === 'absent') {
        absentees.push(student_id);
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Attendance marked successfully',
      records_count: results.length,
      absentees_count: absentees.length,
      absentee_ids: absentees // Frontend can use this to trigger SMS service
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Mark Attendance Error:', error);
    res.status(400).json({ message: error.message || 'Error marking attendance' });
  } finally {
    client.release();
  }
};

/**
 * @desc    Get attendance report by date, session, and section
 * @route   GET /api/attendance/report
 * @access  Private (Admin/Faculty)
 */
const getAttendanceReport = async (req, res) => {
  const { date, session, section_id } = req.query;

  try {
    const query = `
      SELECT 
        a.id, 
        s.roll_number, 
        s.full_name, 
        a.status, 
        a.attendance_date, 
        a.session,
        u.full_name as marked_by_name
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON a.marked_by = u.id
      WHERE a.attendance_date = $1 
      AND a.session = $2
      AND s.section_id = $3
    `;
    
    const result = await db.query(query, [date, session, section_id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get Report Error:', error);
    res.status(500).json({ message: 'Server error while fetching report' });
  }
};

/**
 * @desc    Get session-wise attendance summary for a section
 * @route   GET /api/attendance/summary
 * @access  Private (Admin/Faculty)
 */
const getSectionSummary = async (req, res) => {
  const { section_id } = req.query;

  try {
    const query = `
      SELECT 
        s.id as student_id,
        s.roll_number,
        s.full_name,
        COUNT(a.id) as total_sessions,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
        ROUND((SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END)::float / NULLIF(COUNT(a.id), 0)) * 100, 2) as percentage
      FROM students s
      LEFT JOIN attendance a ON s.id = a.student_id
      WHERE s.section_id = $1 AND s.is_deleted = false
      GROUP BY s.id
      ORDER BY s.roll_number ASC
    `;

    const result = await db.query(query, [section_id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Summary Error:', error);
    res.status(500).json({ message: 'Server error while fetching summary' });
  }
};

module.exports = {
  markAttendance,
  getAttendanceReport,
  getSectionSummary
};