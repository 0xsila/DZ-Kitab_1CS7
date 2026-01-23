// Script to make a specific user an admin
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' }); // Adjust path to .env

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword', // Fallback to what we saw, but .env should work if detailed properly
  database: process.env.DB_NAME || 'myapp_db', 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const targetEmail = 'bilalbrahami026@gmail.com';
const targetPassword = 'ABCd1234';
const targetRole = 'admin';

async function setupAdmin() {
  try {
    console.log(`Checking for user: ${targetEmail}`);
    
    // Check if user exists
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [targetEmail]);
    
    if (users.length > 0) {
      console.log('User exists. Updating role to admin...');
      await pool.query('UPDATE users SET role = ? WHERE email = ?', [targetRole, targetEmail]);
    } else {
      console.log('User does not exist. Creating new admin user...');
      const hashedPassword = await bcrypt.hash(targetPassword, 10);
      
      await pool.query(
        `INSERT INTO users (first_name, last_name, email, password, role, wilaya, phone) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['Bilal', 'Brahami', targetEmail, hashedPassword, targetRole, 'Alger', '0555123456']
      );
    }
    
    console.log('✅ Success! User is now an admin.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setupAdmin();
