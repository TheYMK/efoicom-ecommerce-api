const express = require('express');
const router = express.Router();

// controllers
const { contactReferent, contactForm } = require('../../controllers/form');

// validators
const { runValidation } = require('../../validators');
const { contactReferentFormValidator, contactFormValidator } = require('../../validators/form');

router.post('/contact/referent', contactReferentFormValidator, runValidation, contactReferent);
router.post('/contact', contactFormValidator, runValidation, contactForm);

module.exports = router;
