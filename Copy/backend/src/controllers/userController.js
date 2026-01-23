const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

// Get user profile by ID (public)
exports.getUserById = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      'SELECT id, email, first_name, last_name, phone, avatar, bio, is_verified, created_at, wilaya, show_phone FROM users WHERE id = ?',
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hide phone if show_phone is not true
    const user = users[0];
    if (!user.show_phone) {
        user.phone = null;
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      'SELECT id, email, first_name, last_name, phone, wilaya, avatar, bio, is_verified, created_at, updated_at, show_phone FROM users WHERE id = ?',
      [req.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { first_name, last_name, phone, wilaya, avatar, bio, show_phone } = req.body;
    
    const updates = [];
    const values = [];

    if (first_name !== undefined) {
      updates.push('first_name = ?');
      values.push(first_name);
    }
    if (last_name !== undefined) {
      updates.push('last_name = ?');
      values.push(last_name);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (wilaya !== undefined) {
      updates.push('wilaya = ?');
      values.push(wilaya);
    }
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      values.push(avatar);
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(bio);
    }
    if (show_phone !== undefined) {
      updates.push('show_phone = ?');
      values.push(show_phone);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(req.userId);

    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated user
    const [users] = await pool.query(
      'SELECT id, email, first_name, last_name, phone, wilaya, avatar, bio, is_verified, created_at, updated_at, show_phone FROM users WHERE id = ?',
      [req.userId]
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: users[0]
    });
  } catch (error) {
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    // Get current password hash
    const [users] = await pool.query(
      'SELECT password FROM users WHERE id = ?',
      [req.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(current_password, users[0].password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, parseInt(process.env.BCRYPT_ROUNDS) || 10);

    // Update password
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.userId]
    );

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete account
exports.deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    // Get user password
    const [users] = await pool.query(
      'SELECT password FROM users WHERE id = ?',
      [req.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, users[0].password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    // Delete user (cascade will delete related records)
    await pool.query('DELETE FROM users WHERE id = ?', [req.userId]);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get all users (admin function - add auth check as needed)
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM users');
    const total = countResult[0].total;

    // Get users
    const [users] = await pool.query(
      'SELECT id, email, first_name, last_name, phone, is_verified, created_at FROM users LIMIT ? OFFSET ?',
      [limit, offset]
    );

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Upload avatar
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Construct file URL (relative path)
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Update user in database
    await pool.query(
      'UPDATE users SET avatar = ? WHERE id = ?',
      [avatarUrl, req.userId]
    );

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatar: avatarUrl
      }
    });
  } catch (error) {
    next(error);
  }
};


// Get user stats (for logged-in user)
exports.getUserStats = async (req, res, next) => {
  try {
    const userId = req.userId;

    const [activeCount] = await pool.query(
      'SELECT COUNT(*) as count FROM listings WHERE user_id = ? AND status = "active"',
      [userId]
    );

    const [soldCount] = await pool.query(
      'SELECT COUNT(*) as count FROM listings WHERE user_id = ? AND status = "sold"',
      [userId]
    );

    // For wishlist, we don't have a table yet, so return 0
    const wishlistCount = 0;

    res.status(200).json({
      success: true,
      data: {
        activeListings: activeCount[0].count,
        soldListings: soldCount[0].count,
        wishlistItems: wishlistCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user stats by userId (public)
exports.getUserStatsById = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const [activeCount] = await pool.query(
      'SELECT COUNT(*) as count FROM listings WHERE user_id = ? AND status = "active"',
      [userId]
    );

    const [soldCount] = await pool.query(
      'SELECT COUNT(*) as count FROM listings WHERE user_id = ? AND status = "sold"',
      [userId]
    );

    // For wishlist, we don't have a table yet, so return 0
    const wishlistCount = 0;

    res.status(200).json({
      success: true,
      data: {
        activeListings: activeCount[0].count,
        soldListings: soldCount[0].count,
        wishlistItems: wishlistCount
      }
    });
  } catch (error) {
    next(error);
  }
};