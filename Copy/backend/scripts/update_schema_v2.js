const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' }); // Adjust path if needed

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dz_kitab_db',
};

async function updateSchema() {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected.');

    // 1. Add role column to users
    console.log('Adding role column to users...');
    try {
        await connection.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS role ENUM('user', 'admin') DEFAULT 'user';
        `);
        console.log('Role column added (or already exists).');
    } catch (e) {
        console.log('Error adding role column (might already exist):', e.message);
    }

    // 2. Create ratings table
    console.log('Creating ratings table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        rater_id INT NOT NULL,
        rated_user_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (rater_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (rated_user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('Ratings table created.');

    console.log('Schema update complete.');

  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    if (connection) await connection.end();
  }
}

updateSchema();
