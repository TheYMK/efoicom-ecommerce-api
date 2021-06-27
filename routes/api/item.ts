import express from 'express';
const router = express.Router();

// middlewares
import { authCheck, referentCheck, adminCheck, adminAndReferentCheck } from '../../middlewares/auth';

// controllers
import {
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
	getAllRecommendedItems,
	getRelatedItems,
	getAllProductsByCount,
	getAllServicesByCount,
	itemRating,
	searchFilters
} from '../../controllers/item';

import { validateRequest } from '../../middlewares/validate-request';
import { body } from 'express-validator';

router.post(
	'/api/referent/item/create',
	authCheck,
	referentCheck,
	[
		body('title').trim().notEmpty().withMessage('You must supply a title'),
		body('description').notEmpty().withMessage('You must supply a description'),
		body('category').notEmpty().withMessage('You must supply a category'),
		body('subs').isArray({ min: 1 }).withMessage('You must supply a sub categories'),
		body('images').isArray({ min: 1 }).withMessage('You must supply images'),
		body('provider_name').trim().notEmpty().withMessage('You must supply a provider name'),
		body('provider_phone_number').trim().notEmpty().withMessage('You must supply a phone number'),
		body('provider_address').trim().notEmpty().withMessage('You must supply a provider address'),
		body('item_type').trim().notEmpty().withMessage('You must supply an item type')
	],
	validateRequest,
	createItem
);
router.get('/api/referent/items/get-counts', authCheck, referentCheck, getItemsCountsForReferent);
router.post('/api/referent/items/get-all', authCheck, referentCheck, getAllItemsForReferent);
router.get('/api/item/:slug', getSingleItem);
router.put(
	'/api/item/:slug',
	authCheck,
	adminAndReferentCheck,
	[
		body('title').trim().notEmpty().withMessage('You must supply a title'),
		body('description').notEmpty().withMessage('You must supply a description'),
		body('category').notEmpty().withMessage('You must supply a category'),
		body('subs').isArray({ min: 1 }).withMessage('You must supply a sub categories'),
		body('images').isArray({ min: 1 }).withMessage('You must supply images'),
		body('provider_name').trim().notEmpty().withMessage('You must supply a provider name'),
		body('provider_phone_number').trim().notEmpty().withMessage('You must supply a phone number'),
		body('provider_address').trim().notEmpty().withMessage('You must supply a provider address'),
		body('item_type').trim().notEmpty().withMessage('You must supply an item type')
	],
	validateRequest,
	updateItem
);
router.delete('/api/item/:slug', authCheck, adminAndReferentCheck, removeItem);
router.get('/api/admin/items/requests', authCheck, adminCheck, getTotalItemsRequests);
router.put(
	'/api/admin/item/:slug/update-item-approval-status',
	authCheck,
	adminCheck,
	[ body('item_approval_status').trim().notEmpty().withMessage('You must supply an item approval status') ],
	validateRequest,
	updateItemApprovalStatus
);
router.get('/api/items/get-all', getAllItems);
router.post(
	'/api/items/get-counts-by-referents',
	[ body('referent_email').isEmail().withMessage('Email must be valid') ],
	validateRequest,
	getItemsCountsByReferent
);
router.put('/api/admin/items/:slug/recommend/yes', authCheck, adminCheck, recommendItem);
router.put('/api/admin/items/:slug/recommend/no', authCheck, adminCheck, notRecommendItem);
router.get('/api/items/get-all/recommended', getAllRecommendedItems);
router.get('/api/items/related/:item_id', getRelatedItems);
router.get('/api/items/products/:count', getAllProductsByCount);
router.get('/api/items/services/:count', getAllServicesByCount);
router.put(
	'/api/item/star/:item_id',
	authCheck,
	[
		body('star').isNumeric().withMessage('You must supply a star'),
		body('comment').trim().notEmpty().withMessage('Email must be valid')
	],
	validateRequest,
	itemRating
);
router.post('/api/search/filters', searchFilters);

export { router as itemRouter };
