// backend/server.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const academicRoutes = require('./routes/academicRoute'); // Corrected naming to match your project tree
const smsRoutes = require('./routes/smsRoute');           // Corrected naming to match your project tree

const app = express();

// --- MIDDLEWARE ---
// Helmet helps secure your Express apps by setting various HTTP headers.
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Explicit CORS configuration for Vite development
app.use(cors({
  origin: true, // Allows all origins during local debugging to resolve Network Error
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Request Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Global Logger to confirm traffic reach
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ROUTES ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'College Attendance Portal API is running' });
});

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/sms', smsRoutes);

// --- ERROR HANDLING ---
app.use((req, res, next) => {
  res.status(404).json({ message: 'Resource not found' });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;

// Simplified listen to allow default system binding (resolves some localhost access issues)
const server = app.listen(PORT, () => {
  console.log('==================================================');
  console.log(` SERVER STARTED SUCCESSFULLY `);
  console.log(` Port: ${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/health`);
  console.log(` API Endpoint: http://localhost:${PORT}/api`);
  console.log('==================================================');
});

// Handling Unhandled Promise Rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Fatal Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;