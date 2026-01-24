const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const protect = require('../middleware/auth');

router.post('/', protect, ratingController.addRating);
router.get('/:userId', ratingController.getUserRatings);

module.exports = router;
