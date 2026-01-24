require('dotenv').config();
const mysql = require('mysql2/promise');

async function addShowPhoneColumn() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('Connected to database');
    
    // Check if column exists
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM users LIKE 'show_phone'"
    );
    
    if (columns.length === 0) {
      console.log('Adding show_phone column...');
      await connection.query(
        'ALTER TABLE users ADD COLUMN show_phone BOOLEAN DEFAULT TRUE AFTER bio'
      );
      console.log('✅ Column show_phone added successfully');
    } else {
      console.log('ℹ️  Column show_phone already exists');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

addShowPhoneColumn();
