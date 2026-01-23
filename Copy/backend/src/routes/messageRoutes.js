const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const { validateMessage } = require('../validators/messageValidator');
const messageController = require('../controllers/messageController');

router.post('/', auth, validateMessage, messageController.sendMessage);
router.get('/', auth, messageController.getMyMessages);
router.get('/listing/:listingId', auth, messageController.getListingConversation);

module.exports = router;
