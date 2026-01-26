const { pool } = require('../config/database');
const axios = require('axios');

// Helper: Format date for MySQL (YYYY-MM-DD)
function formatDateForMySQL(dateString) {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    // Check year range for MySQL (1000-9999)
    const year = date.getFullYear();
    if (year < 1000 || year > 9999) return null;

    return date.toISOString().split('T')[0];
  } catch (e) {
    return null;
  }
}

// Helper: fetch book info from external API (OpenLibrary)
async function fetchBookFromAPI(isbn) {
  try {
    // Clean ISBN (remove dashes)
    const cleanIsbn = isbn.replace(/-/g, '');
    
    const response = await axios.get(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`,
      { timeout: 5000 }
    );

    const key = `ISBN:${cleanIsbn}`;
    const data = response.data[key];

    if (!data) return null;

    let authors = 'Unknown';
    if (data.authors && data.authors.length > 0) {
      authors = data.authors.map(a => a.name).join(', ');
    }

    return {
      isbn: cleanIsbn,
      title: data.title || 'Unknown',
      author: authors,
      publication_date: formatDateForMySQL(data.publish_date),
      cover_url: data.cover ? data.cover.large || data.cover.medium : null
    };
  } catch (err) {
    console.error("Error fetching from OpenLibrary:", err.message);
    return null; // graceful failure
  }
}

const createListing = async (req, res) => {
  try {
    const { isbn, condition, price, title, author, publication_date, cover_url, description, accept_exchange } = req.body;
    const userId = req.userId;
    
    if (!isbn) {
      return res.status(400).json({ message: 'ISBN is required' });
    }

    // Clean ISBN
    const cleanIsbn = isbn.replace(/-/g, '');

    // Handle uploaded photos from slots
    let photoUrls = [];
    
    // Check slots 0 to 4
    for (let i = 0; i < 5; i++) {
      const fieldName = `photo_${i}`;
      if (req.files && req.files[fieldName] && req.files[fieldName][0]) {
        // New file uploaded for this slot (Cloudinary path)
        photoUrls.push(req.files[fieldName][0].path);
      } else if (req.body[fieldName]) {
        // Existing URL or external URL provided for this slot
        photoUrls.push(req.body[fieldName]);
      }
    }

    // Fallback for legacy or single cover_url if no slots used
    if (photoUrls.length === 0) {
      if (cover_url) {
        photoUrls = [cover_url];
      } else if (req.body.photos) {
        try {
          const parsed = JSON.parse(req.body.photos);
          if (Array.isArray(parsed)) photoUrls = parsed;
          else photoUrls = [req.body.photos];
        } catch (e) {
          photoUrls = [req.body.photos];
        }
      }
    }

    // Use the first photo as the main cover if available
    const mainCoverUrl = photoUrls.length > 0 ? photoUrls[0] : null;

    // Check if book exists (try both clean and original to be safe, but prefer clean)
    let [book] = await pool.query('SELECT * FROM books WHERE isbn = ? OR isbn = ?', [cleanIsbn, isbn]);
    
    if (book.length === 0) {
      // Try to use provided details first
      if (title) {
         const result = await pool.query(
          'INSERT INTO books (isbn, title, author, publication_date, cover_url) VALUES (?, ?, ?, ?, ?)',
          [cleanIsbn, title, author || 'Unknown', formatDateForMySQL(publication_date), mainCoverUrl]
        );
        book = [{ id: result[0].insertId, title: title }];
      } else {
        // Fetch from API
        const bookData = await fetchBookFromAPI(cleanIsbn);
        if (!bookData) return res.status(404).json({ message: 'Book not found in API and no details provided' });

        const result = await pool.query(
          'INSERT INTO books (isbn, title, author, publication_date, cover_url) VALUES (?, ?, ?, ?, ?)',
          [bookData.isbn, bookData.title, bookData.author, bookData.publication_date, bookData.cover_url]
        );
        book = [{ id: result[0].insertId, title: bookData.title }];
      }
    } else {
      // If book exists but has no cover, and we have one, update it
      if (!book[0].cover_url && mainCoverUrl) {
        await pool.query('UPDATE books SET cover_url = ? WHERE id = ?', [mainCoverUrl, book[0].id]);
      }
    }

    // Create listing
    const [listing] = await pool.query(
      'INSERT INTO listings (book_id, user_id, book_condition, price, photos, description, accept_exchange) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        book[0].id,
        userId,
        condition,
        price,
        JSON.stringify(photoUrls),
        description || '',
        (accept_exchange === 1 || accept_exchange === '1' || accept_exchange === true || accept_exchange === 'true') ? 1 : 0
      ]
    );

    // Check for wishlist matches and create notifications
    try {
      const [wishlistUsers] = await pool.query(
        'SELECT DISTINCT user_id FROM wishlist WHERE book_id = ? AND user_id != ?',
        [book[0].id, userId]
      );

      if (wishlistUsers.length > 0) {
        const notificationValues = wishlistUsers.map(u => [
          u.user_id,
          'wishlist_available',
          JSON.stringify({
            key: 'wishlist_available_msg',
            args: { title: book[0].title || title }
          }),
          listing.insertId
        ]);

        await pool.query(
          'INSERT INTO notifications (user_id, type, message, related_id) VALUES ?',
          [notificationValues]
        );
      }
    } catch (notifError) {
      console.error('Error creating notifications:', notifError);
      // Don't fail the request if notification creation fails
    }

    res.status(201).json({ message: 'Listing created', listingId: listing.insertId });
  } catch (err) {
    console.error('Error in createListing:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
const getBookStats = async (req, res) => {
  const { isbn } = req.params;
  const cleanIsbn = isbn.replace(/-/g, '');

  try {
    // Get book id first - check both clean and potentially dashed versions in DB
    // We use REPLACE(isbn, '-', '') to match regardless of how it's stored
    const [books] = await pool.query("SELECT id FROM books WHERE REPLACE(isbn, '-', '') = ?", [cleanIsbn]);
    
    if (books.length === 0) {
      return res.json({ avg_price: null, active_count: 0, sold_count: 0 });
    }
    
    // If multiple books match (duplicates with different formats), aggregate stats from all of them
    const bookIds = books.map(b => b.id);

    // Get stats
    const [stats] = await pool.query(`
      SELECT 
        AVG(CASE WHEN status = 'active' THEN price END) as avg_price,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
        COUNT(CASE WHEN status = 'sold' THEN 1 END) as sold_count
      FROM listings 
      WHERE book_id IN (?) AND status IN ('active', 'sold')
    `, [bookIds]);

    res.json({
      avg_price: stats[0].avg_price ? Math.round(stats[0].avg_price) : null,
      active_count: stats[0].active_count || 0,
      sold_count: stats[0].sold_count || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCursusList = async (req, res) => {
  try {
    const [cursus] = await pool.query('SELECT * FROM cursus');
    res.json(cursus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllListings = async (req, res) => {
  try {
    const { cursus } = req.query;
    
    let query = `
      SELECT l.id, l.book_condition as \`condition\`, l.price, l.status, l.photos, l.description, l.created_at, l.user_id, l.accept_exchange,
             b.id AS book_id, b.isbn, b.title, b.author, b.cover_url, b.publication_date,
             u.first_name, u.last_name, u.phone, u.wilaya, u.avatar, u.email, u.show_phone,
             rc.title as recommended_cursus, rc.university as recommended_university
      FROM listings l
      JOIN books b ON l.book_id = b.id
      JOIN users u ON l.user_id = u.id
      LEFT JOIN (
        SELECT rb.title as book_title, MIN(c.title) as title, MIN(c.university) as university
        FROM recommended_books rb 
        JOIN cursus c ON rb.cursus_id = c.id 
        GROUP BY rb.title
      ) rc ON rc.book_title COLLATE utf8mb4_unicode_ci = b.title COLLATE utf8mb4_unicode_ci
      WHERE l.status = 'active'
    `;

    const params = [];

    if (cursus) {
      query += ` AND EXISTS (
        SELECT 1 FROM recommended_books rb 
        JOIN cursus c ON rb.cursus_id = c.id 
        WHERE rb.title COLLATE utf8mb4_unicode_ci = b.title COLLATE utf8mb4_unicode_ci AND c.title = ?
      )`;
      params.push(cursus);
    }

    query += ` ORDER BY l.created_at DESC`;

    const [listings] = await pool.query(query, params);

    // Parse photos
    const parsedListings = listings.map(l => {
      try {
        if (typeof l.photos === 'string') {
          l.photos = JSON.parse(l.photos);
        }
      } catch (e) {
        l.photos = [];
      }
      
      // Hide phone number if user disabled it
      if (!l.show_phone) {
          l.phone = null;
      }

      return l;
    });

    res.json(parsedListings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserListings = async (req, res) => {
  const userId = req.userId;
  try {
    const [listings] = await pool.query(`
      SELECT l.id, l.book_condition as \`condition\`, l.price, l.status, l.photos, l.description, l.created_at, l.accept_exchange,
             b.id AS book_id, b.isbn, b.title, b.author, b.cover_url, b.publication_date,
             rc.title as recommended_cursus
      FROM listings l
      JOIN books b ON l.book_id = b.id
      LEFT JOIN (
        SELECT rb.title as book_title, MIN(c.title) as title
        FROM recommended_books rb 
        JOIN cursus c ON rb.cursus_id = c.id 
        GROUP BY rb.title
      ) rc ON rc.book_title COLLATE utf8mb4_unicode_ci = b.title COLLATE utf8mb4_unicode_ci
      WHERE l.user_id = ?
      ORDER BY l.created_at DESC
    `, [userId]);

    // Parse photos
    const parsedListings = listings.map(l => {
      try {
        // Ensure photos is an array
        if (typeof l.photos === 'string') {
          l.photos = JSON.parse(l.photos);
        } else if (!l.photos) {
            l.photos = [];
        }
      } catch (e) {
        l.photos = [];
      }
      return l;
    });

    res.json(parsedListings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};



const updateListing = async (req, res) => {
  const { id } = req.params;
  const { isbn, condition, price, status, title, author, publication_date, cover_url, description, accept_exchange } = req.body;
  const userId = req.userId;

  try {
    // Check ownership
    const [existing] = await pool.query('SELECT * FROM listings WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Listing not found' });
    if (existing[0].user_id !== userId) return res.status(403).json({ message: 'Not authorized' });

    let newPhotos = [];
    
    // Handle uploaded photos from slots
    // Check slots 0 to 4
    let hasSlotUpdate = false;
    for (let i = 0; i < 5; i++) {
      const fieldName = `photo_${i}`;
      if (req.files && req.files[fieldName] && req.files[fieldName][0]) {
        // New file uploaded for this slot (Cloudinary path)
        newPhotos.push(req.files[fieldName][0].path);
        hasSlotUpdate = true;
      } else if (req.body[fieldName]) {
        // Existing URL or external URL provided for this slot
        newPhotos.push(req.body[fieldName]);
        hasSlotUpdate = true;
      }
    }

    if (!hasSlotUpdate) {
      // Fallback if no slots used (e.g. keeping existing without changes, or legacy update)
      if (cover_url) {
        newPhotos = [cover_url];
      } else if (req.body.photos) {
        try {
           const parsed = JSON.parse(req.body.photos);
           newPhotos = Array.isArray(parsed) ? parsed : [req.body.photos];
        } catch(e) {
           newPhotos = [req.body.photos];
        }
      } else {
        // Keep existing photos if nothing provided
        try {
          newPhotos = typeof existing[0].photos === 'string' ? JSON.parse(existing[0].photos) : existing[0].photos;
        } catch (e) {
          newPhotos = [];
        }
      }
    }

    const finalPhotosJson = JSON.stringify(newPhotos);

    // Handle Book Details Update
    let bookId = existing[0].book_id;
    
    // If ISBN is provided, check if we need to update book info or switch books
    if (isbn) {
        const [currentBook] = await pool.query('SELECT * FROM books WHERE id = ?', [bookId]);
        
        if (currentBook.length > 0 && currentBook[0].isbn !== isbn) {
            // ISBN changed. Check if new ISBN exists
            const [newBook] = await pool.query('SELECT * FROM books WHERE isbn = ?', [isbn]);
            
            if (newBook.length > 0) {
                bookId = newBook[0].id;
            } else {
                // Create new book
                const [result] = await pool.query(
                    'INSERT INTO books (isbn, title, author, publication_date, cover_url) VALUES (?, ?, ?, ?, ?)',
                    [isbn, title || 'Unknown', author || 'Unknown', publication_date || null, cover_url || null]
                );
                bookId = result.insertId;
            }
        } else if (currentBook.length > 0) {
            // ISBN is same, but maybe title/author changed. Update the book details.
            if (title || author || publication_date || cover_url) {
                 await pool.query(
                    'UPDATE books SET title = ?, author = ?, publication_date = ?, cover_url = COALESCE(?, cover_url) WHERE id = ?',
                    [
                      title || currentBook[0].title, 
                      author || currentBook[0].author, 
                      publication_date || currentBook[0].publication_date, 
                      cover_url || null,
                      bookId
                    ]
                );
            }
        }
    }

    // Use existing values if not provided in body (Partial Update)
    const finalCondition = condition || existing[0].book_condition;
    const finalPrice = price || existing[0].price;
    const finalStatus = status || existing[0].status;
    const finalDescription = description !== undefined ? description : (existing[0].description || '');
    const finalAcceptExchange = accept_exchange !== undefined
      ? (accept_exchange === 1 || accept_exchange === '1' || accept_exchange === true || accept_exchange === 'true' ? 1 : 0)
      : existing[0].accept_exchange;

    await pool.query(
      'UPDATE listings SET book_id=?, book_condition=?, price=?, photos=?, description=?, status=?, accept_exchange=?, updated_at=NOW() WHERE id=?',
      [bookId, finalCondition, finalPrice, finalPhotosJson, finalDescription, finalStatus, finalAcceptExchange, id]
    );

    res.json({ message: 'Listing updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteListing = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const [existing] = await pool.query('SELECT * FROM listings WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Listing not found' });
    if (existing[0].user_id !== userId) return res.status(403).json({ message: 'Not authorized' });

    // Soft delete: update status to 'deleted'
    await pool.query("UPDATE listings SET status = 'deleted' WHERE id = ?", [id]);
    res.json({ message: 'Listing moved to trash' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const permanentDeleteListing = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const [existing] = await pool.query('SELECT * FROM listings WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Listing not found' });
    if (existing[0].user_id !== userId) return res.status(403).json({ message: 'Not authorized' });

    await pool.query("DELETE FROM listings WHERE id = ?", [id]);
    res.json({ message: 'Listing permanently deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getListingById = async (req, res) => {
  const { id } = req.params;
  try {
    const [listings] = await pool.query(`
      SELECT l.id, l.book_condition as \`condition\`, l.price, l.status, l.photos, l.description, l.created_at, l.user_id, l.accept_exchange,
             b.id AS book_id, b.isbn, b.title, b.author, b.cover_url, b.publication_date,
             u.first_name, u.last_name, u.phone, u.wilaya, u.avatar, u.email, u.show_phone
      FROM listings l
      JOIN books b ON l.book_id = b.id
      JOIN users u ON l.user_id = u.id
      WHERE l.id = ?
    `, [id]);

    if (listings.length === 0) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const listing = listings[0];
    
    // Parse photos if string
    let photos = [];
    try {
      if (typeof listing.photos === 'string') {
        photos = JSON.parse(listing.photos);
      } else if (Array.isArray(listing.photos)) {
        photos = listing.photos;
      }
    } catch (e) {
      photos = listing.cover_url ? [listing.cover_url] : [];
    }

    // Format response
    const formattedListing = {
      id: listing.id,
      title: listing.title,
      authors: listing.author,
      isbn: listing.isbn,
      price: listing.price,
      condition: listing.condition,
      status: listing.status,
      description: listing.description,
      accept_exchange: listing.accept_exchange,
      photos: photos,
      cover_url: listing.cover_url,
      publication_date: listing.publication_date,
      created_at: listing.created_at,
      user: {
        id: listing.user_id,
        first_name: listing.first_name,
        last_name: listing.last_name,
        email: listing.email,
        phone: listing.show_phone ? listing.phone : null,
        wilaya: listing.wilaya,
        avatar: listing.avatar
      }
    };

    res.json(formattedListing);
  } catch (err) {
    console.error('Error fetching listing by ID:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const lookupBookByIsbn = async (req, res) => {
  const { isbn } = req.params;
  try {
    // First check local DB
    const [localBook] = await pool.query('SELECT * FROM books WHERE isbn = ?', [isbn]);
    if (localBook.length > 0) {
      return res.json(localBook[0]);
    }

    // If not found, check external API
    const bookData = await fetchBookFromAPI(isbn);
    if (bookData) {
      return res.json(bookData);
    }

    res.status(404).json({ message: 'Book not found' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getListingsByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const [listings] = await pool.query(`
      SELECT l.id, l.book_condition as \`condition\`, l.price, l.status, l.photos, l.created_at, l.accept_exchange,
             b.id AS book_id, b.isbn, b.title, b.author, b.cover_url, b.publication_date,
             (SELECT c.name 
              FROM recommended_books rb 
              JOIN cursus c ON rb.cursus_id = c.id 
              WHERE rb.title = b.title 
              LIMIT 1) as recommended_cursus
      FROM listings l
      JOIN books b ON l.book_id = b.id
      WHERE l.user_id = ? AND l.status IN ('active', 'sold')
      ORDER BY l.created_at DESC
    `, [userId]);

    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createListing,
  getAllListings,
  getUserListings,
  getListingsByUserId,
  getListingById,
  updateListing,
  deleteListing,
  permanentDeleteListing,
  lookupBookByIsbn,
  getBookStats,
  getCursusList
};
