// backend/routes/smsRoutes.js

const express = require('express');
const router = express.Router();
const { triggerSMS, getSMSLogs } = require('../controllers/smsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

/**
 * @route   POST /api/sms/send
 * @desc    Manually trigger an SMS for a student
 * @access  Private
 */
router.post('/send', protect, triggerSMS);

/**
 * @route   GET /api/sms/logs
 * @desc    View SMS history
 * @access  Private (Admin Only)
 */
router.get('/logs', protect, authorize('admin'), getSMSLogs);

module.exports = router;