const { body, validationResult } = require('express-validator');

const validateListing = [
  body('isbn').notEmpty().withMessage('ISBN is required'),
  body('condition').isIn(['new','good','used']).withMessage('Condition must be new, good, or used'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
  // body('photos').optional().isArray().withMessage('Photos must be an array of URLs'), // Removed because photos are handled via multer now
  (req, res, next) => {
    console.log('Validating listing body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validateListingUpdate = [
  body('condition').optional().isIn(['new','good','used']).withMessage('Condition must be new, good, or used'),
  body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
  body('status').optional().isIn(['active', 'sold', 'deleted']).withMessage('Invalid status'),
  (req, res, next) => {
    console.log('Validating listing update body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { validateListing, validateListingUpdate };
