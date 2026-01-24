const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { generateToken } = require('../utils/tokenService');
const { sendPasswordResetEmail, sendWelcomeEmail,sendOtpEmail, sendAdminRequestEmail } = require('../utils/emailService');
const jwt = require('jsonwebtoken'); // Import JWT
const crypto = require('crypto');

// Send Admin Request Email
exports.requestAdminAccess = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // 1. Check if user exists in DB
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found. You must be registered first.' });
    }
    
    const user = users[0];
    
    // 2. Generate Approval Token (Same structure as adminController)
    const token = jwt.sign(
      { targetUserId: user.id, action: 'promote_admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || process.env.EMAIL_USER;
    
    // 3. Send Email with links
    await sendAdminRequestEmail(email, name, message, superAdminEmail, token, user);

    res.status(200).json({ success: true, message: 'Request sent successfully' });
  } catch (error) {
    next(error);
  }
};

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { email, password, first_name, last_name, phone } = req.body;

    // 1. Check if user exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);

    // 3. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log('🔐 GENERATED OTP:', otp); // Log OTP for testing
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // 4. Insert user
    const [result] = await pool.query(
      'INSERT INTO users (email, password, first_name, last_name, phone, otp, otp_expires, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, first_name, last_name, phone, otp, otpExpires, 0]
    );

    // 5. Send OTP email
  try {
    await sendOtpEmail(email, first_name, otp);
  } catch (error) {
    console.error('Send OTP error in register:', error);
    // ROLLBACK: Delete the user if email sending fails so they can try again
    await pool.query('DELETE FROM users WHERE id = ?', [result.insertId]);
    return res.status(500).json({ success: false, message: 'Failed to send OTP. Please check your email address and try again.' });
  }


    // 6. Send welcome email (optional)
    sendWelcomeEmail(email, first_name);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email with the OTP sent.',
      data: { user_id: result.insertId, email, first_name, last_name }
    });
  } catch (error) {
    next(error);
  }
};

// Verify OTP
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const [users] = await pool.query(
      'SELECT id, otp, otp_expires, is_verified FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];

     console.log('Database OTP:', user.otp);
    console.log('Sent OTP:', otp);
    console.log('OTP expires at:', user.otp_expires);
    console.log('Current time:', new Date());

    if (user.is_verified) {
      return res.status(400).json({ success: false, message: 'User already verified' });
    }

    if (!user.otp || !user.otp_expires || new Date() > new Date(user.otp_expires)) {
      return res.status(400).json({ success: false, message: 'OTP expired or invalid' });
    }

   if (otp.toString() !== user.otp.toString()) {
  return res.status(400).json({ success: false, message: 'Incorrect OTP' });
}


    // Mark user as verified and clear OTP
    await pool.query(
      'UPDATE users SET is_verified = 1, otp = NULL, otp_expires = NULL WHERE id = ?',
      [user.id]
    );

    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.query(
      'SELECT id, email, password, first_name, last_name, avatar, is_verified, role FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = users[0];

    if (!user.is_verified) {
      return res.status(403).json({ success: false, message: 'Please verify your email first' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { 
        user_id: user.id, 
        email: user.email, 
        first_name: user.first_name, 
        last_name: user.last_name,
        avatar: user.avatar,
        role: user.role
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const [users] = await pool.query(
      'SELECT id, email, first_name FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'No user found with this email' });
    }

    const user = users[0];

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query('DELETE FROM password_reset_tokens WHERE user_id = ?', [user.id]);

    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, hashedToken, expiresAt]
    );

    const resetUrl = `${process.env.FRONTEND_URL}/changer-mot-de-passe?token=${resetToken}`;
    await sendPasswordResetEmail(user.email, user.first_name, resetUrl);

    res.status(200).json({ success: true, message: 'Password reset email sent successfully' });
  } catch (error) {
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, new_password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const [tokens] = await pool.query(
      'SELECT user_id FROM password_reset_tokens WHERE token = ? AND expires_at > NOW()',
      [hashedToken]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const userId = tokens[0].user_id;

    const hashedPassword = await bcrypt.hash(new_password, parseInt(process.env.BCRYPT_ROUNDS) || 10);

    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

    await pool.query('DELETE FROM password_reset_tokens WHERE user_id = ?', [userId]);

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

// Get current user info
exports.getCurrentUser = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      'SELECT id, email, first_name, last_name, phone, avatar, is_verified, created_at FROM users WHERE id = ?',
      [req.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: users[0] });
  } catch (error) {
    next(error);
  }
};


