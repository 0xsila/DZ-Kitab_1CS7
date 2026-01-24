const { pool } = require('./src/config/database');

async function checkListings() {
  try {
    const [listings] = await pool.query('SELECT l.id, l.user_id, l.status, b.title FROM listings l JOIN books b ON l.book_id = b.id');
    console.log('Listings:', listings);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkListings();
