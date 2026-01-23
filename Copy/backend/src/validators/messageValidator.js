const { body, validationResult } = require('express-validator');

const validateMessage = [
  body('listingId')
    .isInt()
    .withMessage('listingId must be a valid integer'),

  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content cannot be empty'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Validation error');
      err.statusCode = 400;
      err.errors = errors.array();
      return next(err);
    }
    next();
  }
];

module.exports = { validateMessage };
