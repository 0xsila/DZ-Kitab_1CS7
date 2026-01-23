const { pool } = require('../src/config/database');

async function updateCursusTitles() {
  try {
    console.log('Updating Cursus titles...');

    // Update Licence Informatique
    await pool.query('UPDATE cursus SET title = ? WHERE title = ?', 
      ['1ère année de Licence Informatique', 'Licence Informatique']);
    
    // Update Architecture
    await pool.query('UPDATE cursus SET title = ? WHERE title = ?', 
      ['1ère année de Licence Architecture', 'Architecture']);

    console.log('Cursus titles updated.');
    process.exit(0);
  } catch (error) {
    console.error('Error updating titles:', error);
    process.exit(1);
  }
}

updateCursusTitles();
