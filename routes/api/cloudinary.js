const express = require('express');
const router = express.Router();

// middlewares
const { authCheck, adminCheck, referentCheck } = require('../../middlewares/auth');

// controllers
const { upload, remove } = require('../../controllers/cloudinary');

// routes
router.post('/uploadimages', authCheck, upload);
router.post('/removeimage', authCheck, remove);

module.exports = router;
