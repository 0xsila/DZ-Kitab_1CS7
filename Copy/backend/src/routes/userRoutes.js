const express = require('express');

const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  updateProfileValidation,
  changePasswordValidation,
  deleteAccountValidation
} = require('../validators/userValidator');


// Profile routes (Specific routes first)
router.get('/profile', authMiddleware, userController.getProfile);
router.get('/stats', authMiddleware, userController.getUserStats);

// Public route to get user stats by userId
router.get('/:id/stats', userController.getUserStatsById);
// Public route to get user by ID
router.get('/:id', userController.getUserById);

// All subsequent routes are protected
router.use(authMiddleware);

router.put('/profile', updateProfileValidation, userController.updateProfile);
router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);
router.put('/change-password', changePasswordValidation, userController.changePassword);
router.delete('/account', deleteAccountValidation, userController.deleteAccount);

// Admin routes (add role-based auth middleware as needed)
router.get('/', userController.getAllUsers);

module.exports = router;