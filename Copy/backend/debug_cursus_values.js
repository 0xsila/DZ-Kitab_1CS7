const { pool } = require('../src/config/database');

async function checkCursus() {
  try {
    console.log("Checking cursus table...");
    const [cursus] = await pool.query('SELECT * FROM cursus');
    console.log("Cursus entries:", cursus);

    console.log("\nChecking recommended_books table...");
    const [books] = await pool.query('SELECT DISTINCT title, cursus_id FROM recommended_books');
    console.log("Recommended books entries (sample):", books.slice(0, 5));
    
    // Check joined view that Listing uses
    console.log("\nChecking derived view values...");
    const [viewData] = await pool.query(`
        SELECT rb.title as book_title, MIN(c.title) as cursus_title
        FROM recommended_books rb 
        JOIN cursus c ON rb.cursus_id = c.id 
        GROUP BY rb.title
    `);
    console.log("Joined View Data:", viewData);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCursus();
