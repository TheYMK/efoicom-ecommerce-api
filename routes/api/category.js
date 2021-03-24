const express = require('express');
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require('../../middlewares/auth');
// controllers
const { create, listCategories, removeCategory, updateCategory } = require('../../controllers/category');

router.post('/admin/category/create', authCheck, adminCheck, create);
router.get('/categories', listCategories);
router.delete('/admin/category/delete/:slug', authCheck, adminCheck, removeCategory);
router.put('/admin/category/update/:slug', authCheck, adminCheck, updateCategory);
module.exports = router;
