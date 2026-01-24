const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dz_kitab_db',
};

async function addRole() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected.');

    try {
        await connection.query(`
        ALTER TABLE users 
        ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user';
        `);
        console.log('Role column added.');
    } catch (e) {
        console.log('Error adding role column (likely already exists):', e.message);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) await connection.end();
  }
}

addRole();
