const { pool } = require('../src/config/database');

async function run() {
  try {
    console.log('Adding show_phone column to users table...');
    
    // Check if column exists
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'show_phone'
    `);

    if (columns.length === 0) {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN show_phone BOOLEAN DEFAULT TRUE AFTER phone
      `);
      console.log('Successfully added show_phone column.');
    } else {
      console.log('Column show_phone already exists.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

run();
