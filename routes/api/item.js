const express = require('express');
const router = express.Router();

// middlewares
const { authCheck, referentCheck, adminCheck, adminAndReferentCheck } = require('../../middlewares/auth');

// controllers
const {
	createItem,
	getItemsCountsForReferent,
	getAllItemsForReferent,
	getAllItems,
	getSingleItem,
	updateItem,
	removeItem,
	getTotalItemsRequests,
	updateItemApprovalStatus,
	getItemsCountsByReferent,
	recommendItem,
	notRecommendItem,
	getAllRecommendedItems
} = require('../../controllers/item');

router.post('/referent/item/create', authCheck, referentCheck, createItem);
router.get('/referent/items/get-counts', authCheck, referentCheck, getItemsCountsForReferent);
router.post('/referent/items/get-all', authCheck, referentCheck, getAllItemsForReferent);
router.get('/item/:slug', getSingleItem);
router.put('/item/:slug', authCheck, adminAndReferentCheck, updateItem);
router.delete('/item/:slug', authCheck, adminAndReferentCheck, removeItem);
router.get('/admin/items/requests', authCheck, adminCheck, getTotalItemsRequests);
router.put('/admin/item/:slug/update-item-approval-status', authCheck, adminCheck, updateItemApprovalStatus);
router.get('/items/get-all', getAllItems);
router.post('/items/get-counts-by-referents', getItemsCountsByReferent);
router.put('/admin/items/:slug/recommend/yes', authCheck, adminCheck, recommendItem);
router.put('/admin/items/:slug/recommend/no', authCheck, adminCheck, notRecommendItem);
router.get('/items/get-all/recommended', getAllRecommendedItems);
module.exports = router;
