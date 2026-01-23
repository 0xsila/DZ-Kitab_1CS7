const { pool } = require('../config/database');

exports.chargilyWebhook = async (req, res) => {
  const event = req.body;

  if (event.type !== 'invoice.paid') {
    return res.sendStatus(200);
  }

  const orderId = event.data.metadata.order_id;

  try {
    // Mark order as paid
    await pool.query(
      'UPDATE orders SET status = "paid" WHERE id = ?',
      [orderId]
    );

    // Give book to user
    await pool.query(`
      INSERT IGNORE INTO user_books (user_id, book_id)
      SELECT user_id, book_id FROM orders WHERE id = ?
    `, [orderId]);

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};
