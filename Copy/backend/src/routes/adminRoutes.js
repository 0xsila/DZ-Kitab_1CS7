const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const protect = require('../middleware/auth');
const { pool } = require('../config/database');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const [users] = await pool.query('SELECT role FROM users WHERE id = ?', [req.userId]);
    
    if (users.length > 0 && users[0].role === 'admin') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Not authorized as admin' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error checking admin status' });
  }
};

// Apply protection and admin check to all routes
// For development, you might want to comment out isAdmin if you haven't set up an admin user yet
// router.use(protect, isAdmin); 
// Or just protect for now if you want to test easily
router.use(protect); 

router.get('/stats', adminController.getStats);
router.get('/stats/history', adminController.getStatsHistory);
router.get('/users', adminController.getUsers);
router.delete('/users/:id', adminController.deleteUser);
router.get('/listings', adminController.getListings);
router.delete('/listings/:id', adminController.deleteListing);
router.put('/users/:id/role', adminController.updateUserRole);

module.exports = router;
