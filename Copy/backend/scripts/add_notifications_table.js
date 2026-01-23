const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Ensure correct path to .env

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

    // Create notifications table
    console.log('Creating notifications table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(50) NOT NULL, -- 'wishlist_available', 'message', etc.
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        related_id INT, -- ID of the related entity (e.g., listing_id)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('Notifications table created.');

  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    if (connection) await connection.end();
  }
}

updateSchema();
