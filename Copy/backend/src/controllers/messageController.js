const { pool } = require('../config/database');

/**
 * Send a message (buyer → seller)
 */
const sendMessage = async (req, res, next) => {
  try {
    const { listingId, content, receiverId } = req.body;
    const senderId = req.userId;

    // Get listing owner (seller)
    const [listingRows] = await pool.query(
      'SELECT user_id FROM listings WHERE id = ?',
      [listingId]
    );

    if (listingRows.length === 0) {
      const err = new Error('Listing not found');
      err.statusCode = 404;
      throw err;
    }

    const sellerId = listingRows[0].user_id;

    // If receiverId is provided, use it. Otherwise, infer the receiver.
    let finalReceiverId = receiverId;
    if (!finalReceiverId) {
      if (senderId === sellerId) {
        // Seller is sending, find the buyer from the latest message for this listing
        const [msgRows] = await pool.query(
          'SELECT sender_id, receiver_id FROM messages WHERE listing_id = ? AND sender_id != ? ORDER BY created_at DESC LIMIT 1',
          [listingId, sellerId]
        );
        if (msgRows.length === 0) {
          const err = new Error('No buyer found to reply to');
          err.statusCode = 400;
          throw err;
        }
        // The buyer is the other participant (not the seller)
        finalReceiverId = msgRows[0].sender_id !== sellerId ? msgRows[0].sender_id : msgRows[0].receiver_id;
      } else {
        // Buyer is sending, receiver is seller
        finalReceiverId = sellerId;
      }
    }

    if (finalReceiverId === senderId) {
      const err = new Error('You cannot message yourself');
      err.statusCode = 400;
      throw err;
    }

    const [result] = await pool.query(
      `INSERT INTO messages (listing_id, sender_id, receiver_id, content)
       VALUES (?, ?, ?, ?)`,
      [listingId, senderId, finalReceiverId, content]
    );

    // Log the inserted message details for debugging
    console.log('[sendMessage] Inserted message:', {
      id: result.insertId,
      listingId,
      senderId,
      receiverId: finalReceiverId,
      content
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all messages for logged-in user
 */
const getMyMessages = async (req, res, next) => {
  try {
    const userId = req.userId;
    let messages = [];
    try {
      [messages] = await pool.query(
        `
        SELECT 
          m.id,
          m.content,
          m.is_read,
          m.created_at,
          m.listing_id,
          l.user_id AS seller_id,
          u1.id AS sender_id,
          CONCAT(u1.first_name, ' ', u1.last_name) AS sender_name,
          u1.avatar AS sender_avatar,
          u2.id AS receiver_id,
          CONCAT(u2.first_name, ' ', u2.last_name) AS receiver_name,
          u2.avatar AS receiver_avatar,
          b.title AS book_title,
          b.author AS book_author,
          b.cover_url AS book_image,
          l.photos AS listing_photos
        FROM messages m
        JOIN users u1 ON m.sender_id = u1.id
        JOIN users u2 ON m.receiver_id = u2.id
        JOIN listings l ON m.listing_id = l.id
        JOIN books b ON l.book_id = b.id
        WHERE m.sender_id = ? OR m.receiver_id = ?
        ORDER BY m.created_at DESC
        `,
        [userId, userId]
      );
    } catch (sqlErr) {
      console.error('[getMyMessages] SQL error:', sqlErr);
      throw sqlErr;
    }

    // Add role: 'buyer' or 'seller' for each message
    const messagesWithRole = messages.map(m => {
      // Parse photos to get the first one
      let mainImage = m.book_image;
      if (m.listing_photos) {
        try {
          const photos = typeof m.listing_photos === 'string' ? JSON.parse(m.listing_photos) : m.listing_photos;
          if (Array.isArray(photos) && photos.length > 0) {
            mainImage = photos[0];
          }
        } catch (e) {
          // ignore parsing error
        }
      }

      return {
        ...m,
        book_main_image: mainImage,
        role: m.sender_id === userId && m.sender_id !== m.seller_id ? 'buyer'
             : m.sender_id === m.seller_id ? 'seller'
             : m.receiver_id === userId && m.receiver_id !== m.seller_id ? 'buyer'
             : 'seller'
      };
    });

    res.json({ success: true, messages: messagesWithRole });
  } catch (err) {
    console.error('[getMyMessages] Handler error:', err);
    next(err);
  }
};

/**
 * Get conversation for a specific listing
 */
const getListingConversation = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { listingId } = req.params;

    let messages = [];
    try {
      [messages] = await pool.query(
      `
      SELECT 
        m.id,
        m.content,
        m.is_read,
        m.created_at,
        m.listing_id,
        l.user_id AS seller_id,
        u1.id AS sender_id,
        CONCAT(u1.first_name, ' ', u1.last_name) AS sender_name,
        u1.avatar AS sender_avatar,
        u2.id AS receiver_id,
        CONCAT(u2.first_name, ' ', u2.last_name) AS receiver_name,
        u2.avatar AS receiver_avatar,
        b.title AS book_title,
        b.author AS book_author,
        b.cover_url AS book_image,
        JSON_UNQUOTE(JSON_EXTRACT(l.photos, '$[0]')) AS book_main_image
      FROM messages m
      JOIN users u1 ON m.sender_id = u1.id
      JOIN users u2 ON m.receiver_id = u2.id
      JOIN listings l ON m.listing_id = l.id
      JOIN books b ON l.book_id = b.id
      WHERE m.listing_id = ?
        AND (m.sender_id = ? OR m.receiver_id = ?)
      ORDER BY m.created_at ASC
      `,
        [listingId, userId, userId]
      );
    } catch (sqlErr) {
      console.error('[getListingConversation] SQL error:', sqlErr);
      throw sqlErr;
    }

    // Mark received messages as read
    await pool.query(
      `
      UPDATE messages
      SET is_read = TRUE
      WHERE listing_id = ?
        AND receiver_id = ?
      `,
      [listingId, userId]
    );

    res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  sendMessage,
  getMyMessages,
  getListingConversation
};
