// backend/scripts/seed.js

const db = require('../config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

/**
 * This script creates the initial admin user defined in your .env file.
 * Run this once to enable login.
 */
const seedAdmin = async () => {
  const name = "System Administrator";
  const email = process.env.ADMIN_EMAIL || 'admin@college.edu';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const role = 'admin';

  try {
    console.log(`Attempting to seed admin: ${email}...`);

    // 1. Check if user already exists
    const userExists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (userExists.rows.length > 0) {
      console.log('Admin user already exists in the database.');
      process.exit(0);
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Insert the user
    await db.query(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
      [name, email, hashedPassword, role]
    );

    console.log('-----------------------------------------------');
    console.log('Admin user created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password} (stored as hash)`);
    console.log('-----------------------------------------------');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error.message);
    process.exit(1);
  }
};

seedAdmin();