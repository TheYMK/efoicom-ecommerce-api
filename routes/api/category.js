const express = require('express');
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require('../../middlewares/auth');
// controllers
const {
	createCategory,
	listCategories,
	removeCategory,
	updateCategory,
	getCategorySubs
} = require('../../controllers/category');

router.post('/admin/category/create', authCheck, adminCheck, createCategory);
router.get('/categories', listCategories);
router.delete('/admin/category/delete/:slug', authCheck, adminCheck, removeCategory);
router.put('/admin/category/update/:slug', authCheck, adminCheck, updateCategory);
router.get('/category/:id/subs', getCategorySubs);
module.exports = router;
