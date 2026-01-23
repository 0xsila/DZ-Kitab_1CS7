const { pool } = require('../config/database');
const { createInvoice } = require('../utils/chargily');

exports.buyBook = async (req, res) => {
  const userId = req.user.id;
  const { bookId } = req.body;

  try {
    // 1. Get book
    const [[book]] = await pool.query(
      'SELECT id, title, price FROM books WHERE id = ?',
      [bookId]
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // 2. Prevent double purchase
    const [[owned]] = await pool.query(
      'SELECT 1 FROM user_books WHERE user_id = ? AND book_id = ?',
      [userId, bookId]
    );

    if (owned) {
      return res.status(400).json({ message: 'Book already owned' });
    }

    // 3. Create order
    const [result] = await pool.query(
      'INSERT INTO orders (user_id, book_id, amount) VALUES (?, ?, ?)',
      [userId, bookId, book.price]
    );

    const orderId = result.insertId;

    // 4. Create Chargily invoice
    const invoice = await createInvoice({
      amount: book.price,
      orderId,
      title: book.title
    });

    // 5. Save invoice id
    await pool.query(
      'UPDATE orders SET chargily_invoice_id = ? WHERE id = ?',
      [invoice.id, orderId]
    );

    res.json({ checkout_url: invoice.checkout_url });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Payment error' });
  }
};
