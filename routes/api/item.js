const express = require('express');
const router = express.Router();

// middlewares
const { authCheck, referentCheck } = require('../../middlewares/auth');

// controllers
const {
	createItem,
	getItemsCounts,
	getAllItems,
	getSingleItem,
	updateItem,
	removeItem
} = require('../../controllers/item');

router.post('/referent/item/create', authCheck, referentCheck, createItem);
router.get('/referent/items/get-counts', authCheck, referentCheck, getItemsCounts);
router.post('/referent/items/get-all', authCheck, referentCheck, getAllItems);
router.get('/item/:slug', getSingleItem);
router.put('/referent/item/:slug', authCheck, referentCheck, updateItem);
router.delete('/referent/item/:slug', authCheck, referentCheck, removeItem);

module.exports = router;
