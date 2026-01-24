const { pool } = require('../config/database');
const jwt = require('jsonwebtoken');
const { sendAdminPromotionRequest } = require('../utils/emailService');

// Get Dashboard Stats
exports.getStats = async (req, res, next) => {
  try {
    const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [listingCount] = await pool.query('SELECT COUNT(*) as count FROM listings');
    const [soldCount] = await pool.query("SELECT COUNT(*) as count FROM listings WHERE status = 'sold'");

    res.status(200).json({
      success: true,
      data: {
        users: userCount[0].count,
        listings: listingCount[0].count,
        sold: soldCount[0].count,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Stats History for Graphs
exports.getStatsHistory = async (req, res, next) => {
  try {
    // Get user registrations per month (last 6 months)
    const [userHistory] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as date, COUNT(*) as count
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY date ASC
    `);

    // Get listings created per month (last 6 months)
    const [listingHistory] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as date, COUNT(*) as count
      FROM listings
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY date ASC
    `);

    res.status(200).json({
      success: true,
      data: {
        users: userHistory,
        listings: listingHistory
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get All Users
exports.getUsers = async (req, res, next) => {
  try {
    const [users] = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.avatar,
      (SELECT COUNT(*) FROM listings l WHERE l.user_id = u.id) as listings_count,
      (SELECT COUNT(*) FROM listings l WHERE l.user_id = u.id AND l.status = 'sold') as sold_count
      FROM users u
    `);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// Delete User
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get All Listings
exports.getListings = async (req, res, next) => {
  try {
    const [listings] = await pool.query(`
      SELECT l.id, l.price, l.created_at, l.status, l.accept_exchange,
      b.title as book_title,
      u.first_name as seller_first_name, u.last_name as seller_last_name,
      l.photos
      FROM listings l
      JOIN books b ON l.book_id = b.id
      JOIN users u ON l.user_id = u.id
    `);
    res.status(200).json({ success: true, data: listings });
  } catch (error) {
    next(error);
  }
};

// Delete Listing
exports.deleteListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM listings WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Listing deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Update User Role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // 'admin' or 'user'
    
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    // Special flow for ADMIN promotion
    if (role === 'admin') {
      // 1. Get info about user being promoted
      const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
      if (users.length === 0) return res.status(404).json({ message: 'User not found' });
      const targetUser = users[0];

      // 2. Generate Approval Token
      const token = jwt.sign(
        { targetUserId: id, action: 'promote_admin' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // 3. Send Email to "Owner" (We assume it's the environment variable EMAIL_USER for now, or a specific SUPER_ADMIN_EMAIL)
      const ownerEmail = process.env.SUPER_ADMIN_EMAIL || process.env.EMAIL_USER;
      
      await sendAdminPromotionRequest(ownerEmail, targetUser, token);

      return res.status(200).json({ 
        success: true, 
        message: `Request to promote ${targetUser.first_name} to Admin has been sent to the Owner for approval.` 
      });
    }

    // Normal flow for demotion or other roles
    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    
    res.status(200).json({ 
      success: true, 
      message: `User role updated to ${role}` 
    });
  } catch (error) {
    next(error);
  }
};

// Handle Promotion Approval/Denial
exports.approvePromotion = async (req, res) => {
  try {
    const { token, decision } = req.query;
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.action !== 'promote_admin') throw new Error('Invalid token action');

    if (decision === 'approve') {
       await pool.query('UPDATE users SET role = ? WHERE id = ?', ['admin', decoded.targetUserId]);
       res.send(`<h1>Approved!</h1><p>User ID ${decoded.targetUserId} is now an Admin.</p>`);
    } else {
       res.send(`<h1>Denied.</h1><p>No changes were made.</p>`);
    }

  } catch (error) {
    res.status(400).send(`<h1>Error</h1><p>${error.message}</p>`);
  }
};
