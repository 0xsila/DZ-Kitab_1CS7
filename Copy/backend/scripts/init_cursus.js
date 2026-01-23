const { pool } = require('../src/config/database');

async function initCursus() {
  try {
    // Create Cursus table with title and isbn fields
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cursus (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        isbn VARCHAR(20),
        name VARCHAR(255),
        university VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Recommended Books table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recommended_books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255),
        cursus_id INT,
        FOREIGN KEY (cursus_id) REFERENCES cursus(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert Cursus
    const cursusList = [
      { title: '1ère année de Licence Informatique', isbn: null, name: 'Licence Informatique', university: 'USTHB' },
      { title: '1ère Année Médecine', isbn: null, name: '1ère Année Médecine', university: 'Université d\'Alger' },
      { title: '1ère année de Licence Architecture', isbn: null, name: 'Architecture', university: 'EPAU' }
    ];

    for (const c of cursusList) {
      const [exists] = await pool.query('SELECT id FROM cursus WHERE title = ?', [c.title]);
      if (exists.length === 0) {
        await pool.query('INSERT INTO cursus (title, isbn, name, university) VALUES (?, ?, ?, ?)', [c.title, c.isbn, c.name, c.university]);
        console.log(`Added cursus: ${c.title}`);
      }
    }

    // Insert Recommended Books
    const recommendations = [
        { cursus: '1ère année de Licence Informatique', books: ['Introduction to Algorithms', 'Clean Code', 'The C Programming Language', 'Algorithmique', 'Structure Machine'] },
        { cursus: '1ère Année Médecine', books: ['Gray\'s Anatomy', 'Atlas of Human Anatomy', 'Guyton and Hall Textbook of Medical Physiology', 'Anatomie Humaine', 'Cytologie'] },
        { cursus: '1ère année de Licence Architecture', books: ['The Architecture of Happiness', '101 Things I Learned in Architecture School', 'Histoire de l\'Architecture'] }
    ];

    for (const rec of recommendations) {
        const [cursusRows] = await pool.query('SELECT id FROM cursus WHERE title = ?', [rec.cursus]);
        if (cursusRows.length > 0) {
            const cursusId = cursusRows[0].id;
            for (const bookTitle of rec.books) {
                const [exists] = await pool.query('SELECT id FROM recommended_books WHERE title = ? AND cursus_id = ?', [bookTitle, cursusId]);
                if (exists.length === 0) {
                    await pool.query('INSERT INTO recommended_books (title, cursus_id) VALUES (?, ?)', [bookTitle, cursusId]);
                    console.log(`Added recommendation: "${bookTitle}" for ${rec.cursus}`);
                }
            }
        }
    }

    console.log('Database initialized for Cursus and Recommended Books.');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initCursus();
