const express = require('express');
const router = express.Router();

// middlewares
const { authCheck, adminCheck, referentCheck } = require('../../middlewares/auth');

// controllers
const { upload, remove } = require('../../controllers/cloudinary');

// routes
router.post('/uploadimages', authCheck, referentCheck, upload);
router.post('/removeimage', authCheck, referentCheck, remove);

module.exports = router;
