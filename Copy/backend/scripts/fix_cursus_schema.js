const { pool } = require('../src/config/database');

async function fixCursusSchema() {
  try {
    console.log('Fixing Cursus schema...');

    // Check if title column exists
    const [columns] = await pool.query("SHOW COLUMNS FROM cursus LIKE 'title'");
    
    if (columns.length === 0) {
      console.log('Adding title and isbn columns to cursus table...');
      // Add columns
      await pool.query(`
        ALTER TABLE cursus 
        ADD COLUMN title VARCHAR(255),
        ADD COLUMN isbn VARCHAR(20)
      `);
      
      console.log('Columns added. Migrating data...');
      
      // Migrate name to title for existing records
      await pool.query('UPDATE cursus SET title = name WHERE title IS NULL');
      
      // Make title NOT NULL after population
      await pool.query('ALTER TABLE cursus MODIFY COLUMN title VARCHAR(255) NOT NULL');
      
      console.log('Data migration complete.');
    } else {
      console.log('Cursus table already has title column.');
    }

    // Also check recommended_books for title column just in case
    const [rbColumns] = await pool.query("SHOW COLUMNS FROM recommended_books LIKE 'title'");
    if (rbColumns.length === 0) {
       console.log('Adding title column to recommended_books table...');
       await pool.query(`ALTER TABLE recommended_books ADD COLUMN title VARCHAR(255) NOT NULL`);
    }

    console.log('Schema fix completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing schema:', error);
    process.exit(1);
  }
}

fixCursusSchema();
