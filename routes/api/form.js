const express = require('express');
const router = express.Router();

// controllers
const { contactReferent } = require('../../controllers/form');

// validators
const { runValidation } = require('../../validators');
const { contactReferentFormValidator } = require('../../validators/form');

router.post('/contact/referent', contactReferentFormValidator, runValidation, contactReferent);

module.exports = router;
