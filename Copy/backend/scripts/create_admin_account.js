require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createAdminAccount() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('✅ Connected to database');
    
    const email = 'bilalbrahami30@gmail.com';
    const password = 'Bilalbrahami30';
    const firstName = 'Bilal';
    const lastName = 'Brahami';
    
    // Check if user exists
    const [existing] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      console.log('⚠️  User already exists, updating to admin...');
      await connection.query(
        'UPDATE users SET role = ?, is_verified = 1 WHERE email = ?',
        ['admin', email]
      );
      console.log('✅ User updated to admin role');
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await connection.query(
        `INSERT INTO users (email, password, first_name, last_name, role, is_verified, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [email, hashedPassword, firstName, lastName, 'admin', 1]
      );
      console.log('✅ Admin account created successfully!');
    }
    
    console.log('\n📧 Email: bilalbrahami30@gmail.com');
    console.log('🔑 Password: Bilalbrahami30');
    console.log('👤 Role: admin\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

createAdminAccount();
