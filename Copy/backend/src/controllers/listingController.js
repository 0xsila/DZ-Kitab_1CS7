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

module.exports = {
  getListingById
};
