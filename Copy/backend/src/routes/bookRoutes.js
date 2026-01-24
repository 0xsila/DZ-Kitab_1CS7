const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const authMiddleware = require('../middleware/auth'); // your existing auth
const uploadBook = require('../middleware/uploadBook');
const { validateListing, validateListingUpdate } = require('../validators/bookValidator');

const photoFields = [
  { name: 'photo_0', maxCount: 1 },
  { name: 'photo_1', maxCount: 1 },
  { name: 'photo_2', maxCount: 1 },
  { name: 'photo_3', maxCount: 1 },
  { name: 'photo_4', maxCount: 1 }
];

router.post('/', authMiddleware, uploadBook.fields(photoFields), validateListing, bookController.createListing);
router.get('/cursus', bookController.getCursusList);
router.get('/my-listings', authMiddleware, bookController.getUserListings);
router.get('/user/:userId', bookController.getListingsByUserId);
router.get('/:id', bookController.getListingById);
router.get('/lookup/:isbn', bookController.lookupBookByIsbn);
router.get('/stats/:isbn', bookController.getBookStats);
router.get('/', bookController.getAllListings);
router.get('/:id', bookController.getListingById);
router.put('/:id', authMiddleware, uploadBook.fields(photoFields), validateListingUpdate, bookController.updateListing);
router.delete('/:id', authMiddleware, bookController.deleteListing);
router.delete('/:id/permanent', authMiddleware, bookController.permanentDeleteListing);

module.exports = router;
