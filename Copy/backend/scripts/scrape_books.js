const axios = require('axios');
const { pool } = require('../src/config/database');

const SOURCES = [
  {
    url: 'https://openlibrary.org/subjects/computer_science.json?limit=15',
    cursus: 'Licence Informatique',
    university: 'USTHB'
  },
  {
    url: 'https://openlibrary.org/subjects/medicine.json?limit=15',
    cursus: '1ère Année Médecine',
    university: 'Université d\'Alger'
  },
  {
    url: 'https://openlibrary.org/subjects/architecture.json?limit=15',
    cursus: 'Architecture',
    university: 'EPAU'
  }
];

async function scrapeAndStore() {
  try {
    for (const source of SOURCES) {
      console.log(`Fetching data from ${source.url} for ${source.cursus}...`);
      
      const response = await axios.get(source.url);
      const works = response.data.works || [];
      const books = [];

      for (const work of works) {
        const title = work.title;
        const author = work.authors && work.authors.length > 0 ? work.authors[0].name : 'Unknown Author';
        books.push({ title, author });
      }

      console.log(`Found ${books.length} books.`);

      // Get Cursus ID
      const [cursusRows] = await pool.query(
        'SELECT id FROM cursus WHERE name = ? AND university = ?', 
        [source.cursus, source.university]
      );

      if (cursusRows.length === 0) {
        console.error(`Cursus not found: ${source.cursus}`);
        continue;
      }

      const cursusId = cursusRows[0].id;

      // Insert books
      for (const book of books) {
        // Check if exists
        const [exists] = await pool.query(
          'SELECT id FROM recommended_books WHERE title = ? AND cursus_id = ?',
          [book.title, cursusId]
        );

        if (exists.length === 0) {
          await pool.query(
            'INSERT INTO recommended_books (title, author, cursus_id) VALUES (?, ?, ?)',
            [book.title, book.author, cursusId]
          );
          console.log(`Inserted: ${book.title}`);
        }
      }
    }

    console.log('Data extraction completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error extracting data:', error);
    process.exit(1);
  }
}

scrapeAndStore();
