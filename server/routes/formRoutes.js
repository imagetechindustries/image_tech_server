const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { submitQuote, submitContact } = require('../controllers/formController');

// Rate Limiter: Max 5 submissions per 15 minutes per IP to prevent spam flood
const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please try again after 15 minutes.'
  }
});

// Validation rules
const formValidation = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required.')
    .isLength({ min: 2, max: 80 }).withMessage('Full name must be between 2 and 80 characters.'),
  body('email')
    .trim()
    .isEmail().withMessage('A valid email address is required.')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required.')
    .isLength({ min: 8, max: 20 }).withMessage('Phone number must be between 8 and 20 digits.'),
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required.')
    .isLength({ min: 4, max: 3000 }).withMessage('Message must be at least 4 characters long.'),
];

// Form routes with rate limiter and validation
router.post('/quote', inquiryLimiter, formValidation, submitQuote);
router.post('/contact', inquiryLimiter, formValidation, submitContact);

module.exports = router;
