const { pool } = require('./src/config/database');

async function debug() {
  try {
    console.log('--- BOOKS ---');
    const [books] = await pool.query('SELECT id, isbn, title FROM books');
    console.table(books);

    console.log('\n--- LISTINGS ---');
    const [listings] = await pool.query('SELECT l.id, l.book_id, l.status, b.isbn FROM listings l JOIN books b ON l.book_id = b.id');
    console.table(listings);

    console.log('\n--- WISHLIST ---');
    const [wishlist] = await pool.query('SELECT w.id, w.book_id, w.user_id, b.isbn FROM wishlist w JOIN books b ON w.book_id = b.id');
    console.table(wishlist);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

debug();
