
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function upgrade() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'myapp_db'
    });

    console.log('Connected to database');

    // Check if column exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'listings' AND COLUMN_NAME = 'accept_exchange'
    `, [process.env.DB_NAME || 'myapp_db']);

    if (columns.length === 0) {
      console.log('Adding accept_exchange column...');
      await connection.query(`
        ALTER TABLE listings
        ADD COLUMN accept_exchange BOOLEAN DEFAULT FALSE AFTER price
      `);
      console.log('Column added successfully.');
    } else {
      console.log('Column accept_exchange already exists.');
    }

  } catch (error) {
    console.error('Error upgrading database:', error);
  } finally {
    if (connection) await connection.end();
  }
}

upgrade();
