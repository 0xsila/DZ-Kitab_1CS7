const { pool } = require('./src/config/database');

async function checkSchema() {
  try {
    console.log('Checking database schema...');
    
    // List tables
    const [tables] = await pool.query('SHOW TABLES');
    console.log('Tables:', tables.map(t => Object.values(t)[0]));

    // Check cursus columns
    try {
      const [cursusCols] = await pool.query('SHOW COLUMNS FROM cursus');
      console.log('Cursus columns:', cursusCols.map(c => c.Field));
    } catch (e) {
      console.log('Cursus table error:', e.message);
    }

    // Check ratings table
    try {
      const [ratingsCols] = await pool.query('SHOW COLUMNS FROM ratings');
      console.log('Ratings columns:', ratingsCols.map(c => c.Field));
    } catch (e) {
      console.log('Ratings table error:', e.message);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkSchema();
