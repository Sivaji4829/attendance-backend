// backend/controllers/smsController.js

const db = require('../config/db');
const { sendAbsenteeSMS } = require('../services/smsService');

/**
 * @desc    Get all SMS logs
 */
const getSMSLogs = async (req, res) => {
  try {
    const query = `
      SELECT l.*, s.full_name as student_name, s.roll_number 
      FROM sms_logs l
      JOIN students s ON l.student_id = s.id
      ORDER BY l.sent_at DESC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching logs' });
  }
};

/**
 * @desc    Manually trigger SMS
 * @route   POST /api/sms/send
 */
const triggerSMS = async (req, res) => {
  const { student_id, date, session } = req.body;

  try {
    const studentResult = await db.query(
      'SELECT id, full_name, parent_phone FROM students WHERE id = $1',
      [student_id]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const student = studentResult.rows[0];
    const smsResult = await sendAbsenteeSMS(
      student.id,
      student.parent_phone,
      student.full_name,
      date,
      session
    );

    if (smsResult.success) {
      res.json({ message: 'SMS sent successfully', data: smsResult.data });
    } else {
      // Return 402 (Payment Required) or 400 for wallet issues instead of 500
      res.status(400).json({ 
        message: smsResult.error, 
        provider_response: smsResult.details 
      });
    }
  } catch (error) {
    console.error('Trigger SMS Error:', error);
    res.status(500).json({ message: 'Internal server error during SMS trigger' });
  }
};

module.exports = { getSMSLogs, triggerSMS };