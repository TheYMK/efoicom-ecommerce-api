const express = require('express');
const router = express.Router();

// middlewares
const { authCheck, referentCheck, adminCheck } = require('../../middlewares/auth');

// controllers
const {
	createItem,
	getItemsCounts,
	getAllItems,
	getSingleItem,
	updateItem,
	removeItem,
	getTotalItemsRequests,
	updateItemApprovalStatus
} = require('../../controllers/item');

router.post('/referent/item/create', authCheck, referentCheck, createItem);
router.get('/referent/items/get-counts', authCheck, referentCheck, getItemsCounts);
router.post('/referent/items/get-all', authCheck, referentCheck, getAllItems);
router.get('/item/:slug', getSingleItem);
router.put('/referent/item/:slug', authCheck, referentCheck, updateItem);
router.delete('/referent/item/:slug', authCheck, referentCheck, removeItem);
router.get('/admin/items/requests', authCheck, adminCheck, getTotalItemsRequests);
router.put('/admin/item/:slug/update-item-approval-status', authCheck, adminCheck, updateItemApprovalStatus);

module.exports = router;
