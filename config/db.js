// backend/config/db.js

const { Pool } = require('pg');
require('dotenv').config();

// Debug: Check if env variables are loaded
if (!process.env.DB_HOST) {
  console.warn('WARNING: DB_HOST is not defined in environment variables. Check your .env file.');
}

/**
 * Database connection configuration for Supabase PostgreSQL.
 */
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  // Supabase requires SSL for external connections
  ssl: {
    rejectUnauthorized: false
  },
  // Increase connection timeout
  connectionTimeoutMillis: 5000,
});

// Test the database connection
pool.on('connect', () => {
  console.log(`Connected to database at ${process.env.DB_HOST}`);
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};