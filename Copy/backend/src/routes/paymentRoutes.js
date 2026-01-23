const router = require('express').Router();
const { buyBook } = require('../controllers/paymentController');
const { chargilyWebhook } = require('../controllers/webhookController');
const auth = require('../middleware/auth');

router.post('/buy', auth, buyBook);
router.post('/webhook/chargily', chargilyWebhook);

module.exports = router;