const { pool } = require('../config/database');

const addToWishlist = async (req, res) => {
  const { isbn, title, authors } = req.body;
  const userId = req.userId;

  if (!isbn || !title) {
    return res.status(400).json({ message: 'ISBN and Title are required' });
  }

  const cleanIsbn = isbn.replace(/-/g, '');

  try {
    // 1. Check if book exists, if not create it
    let [books] = await pool.query('SELECT id FROM books WHERE isbn = ? OR isbn = ?', [cleanIsbn, isbn]);
    let bookId;

    if (books.length === 0) {
      const [result] = await pool.query(
        'INSERT INTO books (isbn, title, author) VALUES (?, ?, ?)',
        [cleanIsbn, title, authors || 'Unknown']
      );
      bookId = result.insertId;
    } else {
      bookId = books[0].id;
    }

    // 2. Add to wishlist
    await pool.query(
      'INSERT IGNORE INTO wishlist (user_id, book_id) VALUES (?, ?)',
      [userId, bookId]
    );

    res.status(201).json({ message: 'Book added to wishlist', bookId });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getWishlist = async (req, res) => {
  const userId = req.userId;

  try {
    // Get all wishlist items with book details
    const [wishlistItems] = await pool.query(`
      SELECT w.id as wishlist_id, w.created_at as dateAdded, b.* 
      FROM wishlist w
      JOIN books b ON w.book_id = b.id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `, [userId]);

    // For each book, check if there are active listings
    // We can do this in a single query or separate. Single query is better.
    // But let's keep it simple for now.
    
    const availableBooks = [];
    const pendingBooks = [];

    for (const item of wishlistItems) {
      // Debug logging
      console.log(`Checking book: ${item.title} (ID: ${item.id})`);
      
      // Check for listings by ISBN (clean or original) to handle duplicates
      const cleanIsbn = item.isbn.replace(/-/g, '');
      
      const [listings] = await pool.query(`
        SELECT l.id, COUNT(*) OVER() as count 
        FROM listings l
        JOIN books b ON l.book_id = b.id
        WHERE (
          b.isbn = ? 
          OR b.isbn = ? 
          OR (b.title = ? AND b.author = ?)
        ) 
        AND l.status = 'active'
        LIMIT 1
      `, [cleanIsbn, item.isbn, item.title, item.author]);

      const count = listings.length > 0 ? listings[0].count : 0;
      console.log(`Found ${count} active listings`);

      const formattedItem = {
        id: item.wishlist_id, // Use wishlist ID for deletion
        book_id: item.id,
        title: item.title,
        authors: item.author,
        isbn: item.isbn,
        dateAdded: new Date(item.dateAdded).toLocaleDateString('fr-FR'),
        cover_url: item.cover_url,
        listing_id: listings.length > 0 ? listings[0].id : null
      };

      if (count > 0) {
        availableBooks.push(formattedItem);
      } else {
        pendingBooks.push(formattedItem);
      }
    }

    res.json({ availableBooks, pendingBooks });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const removeFromWishlist = async (req, res) => {
  const { id } = req.params; // wishlist id
  const userId = req.userId;

  try {
    await pool.query('DELETE FROM wishlist WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist
};
