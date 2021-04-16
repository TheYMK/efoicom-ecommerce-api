const express = require('express');
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require('../../middlewares/auth');

// controllers
const { create, list, read, remove } = require('../../controllers/tag');

// validators
const { runValidation } = require('../../validators/index');
const { tagCreateValidator } = require('../../validators/tag');

router.post('/admin/tag', tagCreateValidator, runValidation, authCheck, adminCheck, create);
router.get('/tags', list);
router.get('/tag/:slug', read);
router.delete('/admin/tag/:slug', authCheck, adminCheck, remove);

module.exports = router;
