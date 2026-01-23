const { pool } = require('./src/config/database');

async function checkUsers() {
  try {
    const [users] = await pool.query('SELECT id, email, first_name, last_name FROM users');
    console.log('Users:', users);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkUsers();
