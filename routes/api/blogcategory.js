const express = require('express');
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require('../../middlewares/auth');

// controllers
const { create, list, read, remove } = require('../../controllers/blogcategory');

// validators
const { runValidation } = require('../../validators/index');
const { blogcategoryCreateValidator } = require('../../validators/blogcategory');

router.post('/admin/blogcategory', blogcategoryCreateValidator, runValidation, authCheck, adminCheck, create);
router.get('/blogcategories', list);
router.get('/blogcategory/:slug', read);
router.delete('/admin/blogcategory/:slug', authCheck, adminCheck, remove);

module.exports = router;
