// backend/services/smsService.js

const axios = require('axios');
const db = require('../config/db');

const sendAbsenteeSMS = async (studentId, parentPhone, studentName, date, session) => {
  const apiKey = process.env.FAST2SMS_API_KEY;
  const message = `Dear Parent, your ward ${studentName} was ABSENT for the ${session} session on ${date}. - Admin`;

  try {
    // Using the Fast2SMS V2 endpoint which is standard for the 'q' (Quick) route
    const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
      route: 'q',
      message: message,
      language: 'english',
      numbers: parentPhone,
    }, {
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });

    const success = response.data.return === true;
    
    await db.query(
      `INSERT INTO sms_logs (student_id, parent_phone, message, status, request_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [studentId, parentPhone, message, success ? 'sent' : 'failed', response.data.request_id || null]
    );

    return { success, data: response.data };
  } catch (error) {
    console.error('SMS Service Error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendAbsenteeSMS };