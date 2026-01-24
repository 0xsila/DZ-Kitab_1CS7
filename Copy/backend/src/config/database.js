const mysql = require('mysql2');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'myapp_db',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

// Get promise-based connection
const promisePool = pool.promise();

// Test database connection
const testConnection = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await promisePool.getConnection();
      console.log('✅ Database connected successfully');
      connection.release();
      return;
    } catch (error) {
      console.error(`❌ Database connection failed (attempt ${i + 1}/${retries}):`, error.message);
      if (i < retries - 1) {
        console.log(`Waiting ${delay / 1000}s before retrying...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('❌ All connection attempts failed.');
        process.exit(1);
      }
    }
  }
};

module.exports = {
  pool: promisePool,
  testConnection
};