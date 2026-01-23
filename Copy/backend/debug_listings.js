const { pool } = require('./src/config/database');

async function debugListings() {
  try {
    console.log('--- ALL LISTINGS (Raw) ---');
    const [allListings] = await pool.query('SELECT * FROM listings');
    console.table(allListings);

    console.log('\n--- ACTIVE LISTINGS (Query Test) ---');
    const [activeListings] = await pool.query(`
      SELECT l.id, l.status, l.user_id, l.book_id
      FROM listings l
      JOIN books b ON l.book_id = b.id
      JOIN users u ON l.user_id = u.id
      WHERE l.status = 'active'
    `);
    console.table(activeListings);

    if (activeListings.length === 0) {
        console.log("\nNo active listings found with valid joins.");
        
        // Check for orphaned listings
        const [orphanedBooks] = await pool.query('SELECT l.id FROM listings l LEFT JOIN books b ON l.book_id = b.id WHERE b.id IS NULL');
        if (orphanedBooks.length > 0) console.log("Orphaned Book IDs:", orphanedBooks);

        const [orphanedUsers] = await pool.query('SELECT l.id FROM listings l LEFT JOIN users u ON l.user_id = u.id WHERE u.id IS NULL');
        if (orphanedUsers.length > 0) console.log("Orphaned User IDs:", orphanedUsers);
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

debugListings();
