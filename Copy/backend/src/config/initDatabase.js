const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDatabase() {
  try {
    // Create connection without database selected
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });

    console.log('Connected to MySQL server');

    const dbName = process.env.DB_NAME || 'myapp_db';

    // Check if we should skip db creation (useful for managed cloud DBs)
    if (process.env.SKIP_DB_CREATE !== 'true') {
      try {
          await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
          console.log(`Database ${dbName} created or already exists`);
      } catch (err) {
          console.warn('Warning: Could not create database. It might already exist or permission denied. Attempting to use it directly.');
      }
    }

    // Use the database
    await connection.query(`USE ${dbName}`);

    // Read init.sql file
    const sqlPath = path.join(__dirname, '../../init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute SQL commands
    await connection.query(sql);
    console.log('Tables created successfully');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();
