const { pool } = require('../config/database');

// Add a rating
exports.addRating = async (req, res, next) => {
  try {
    const { rated_user_id, rating, comment } = req.body;
    const rater_id = req.userId;

    if (rater_id == rated_user_id) {
        return res.status(400).json({ success: false, message: 'You cannot rate yourself' });
    }

    // Check if already rated
    const [existing] = await pool.query(
      'SELECT id FROM ratings WHERE rater_id = ? AND rated_user_id = ?',
      [rater_id, rated_user_id]
    );

    if (existing.length > 0) {
      // Update existing rating
      await pool.query(
        'UPDATE ratings SET rating = ?, comment = ? WHERE id = ?',
        [rating, comment, existing[0].id]
      );
      return res.status(200).json({ success: true, message: 'Rating updated successfully' });
    }

    // Insert new rating
    await pool.query(
      'INSERT INTO ratings (rater_id, rated_user_id, rating, comment) VALUES (?, ?, ?, ?)',
      [rater_id, rated_user_id, rating, comment]
    );

    res.status(201).json({ success: true, message: 'Rating added successfully' });
  } catch (error) {
    next(error);
  }
};

// Get ratings for a user
exports.getUserRatings = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const [ratings] = await pool.query(`
      SELECT r.id, r.rating, r.comment, r.created_at,
      u.first_name, u.last_name, u.avatar
      FROM ratings r
      JOIN users u ON r.rater_id = u.id
      WHERE r.rated_user_id = ?
      ORDER BY r.created_at DESC
    `, [userId]);

    // Calculate average
    const [avgResult] = await pool.query(
      'SELECT AVG(rating) as average, COUNT(*) as count FROM ratings WHERE rated_user_id = ?',
      [userId]
    );

    res.status(200).json({
      success: true,
      data: {
        ratings,
        average: avgResult[0].average || 0,
        count: avgResult[0].count
      }
    });
  } catch (error) {
    next(error);
  }
};
