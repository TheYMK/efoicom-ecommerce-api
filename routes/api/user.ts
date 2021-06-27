import express from 'express';
const router = express.Router();

// middlewares
import { authCheck, adminCheck } from '../../middlewares/auth';
// controllers
import {
	getCounts,
	getTotalRefRequests,
	updateReferentAccountApprovalStatus,
	getAllReferents,
	deleteReferentUser,
	updateAdminAccount,
	updateAdminPassword,
	getSingleReferentByEmail,
	addItemToWishlist,
	getUserWishlist,
	removeFromWishlist,
	getUserWishlistCount,
	getAllCustomers,
	referentSearchFilters
} from '../../controllers/user';

import { validateRequest } from '../../middlewares/validate-request';
import { body } from 'express-validator';

router.get('/api/get-counts', getCounts);
router.get('/api/admin/referents/requests', authCheck, adminCheck, getTotalRefRequests);
router.put(
	'/api/admin/referent/update-account-approval-status',
	authCheck,
	adminCheck,
	[
		body('referent_email').isEmail().withMessage('Email must be valid'),
		body('approval_status').trim().notEmpty().withMessage('You must supply an approval status')
	],
	validateRequest,
	updateReferentAccountApprovalStatus
);
router.get('/api/referents/all-approved', getAllReferents);
router.put(
	'/api/admin/referent/:id',
	authCheck,
	adminCheck,
	[ body('referent_email').isEmail().withMessage('Email must be valid') ],
	validateRequest,
	deleteReferentUser
);
// newName, newEmail
router.put(
	'/api/admin/account-update',
	authCheck,
	adminCheck,
	[
		body('newEmail').isEmail().withMessage('Email must be valid'),
		body('newName').trim().notEmpty().withMessage('You must supply a new name')
	],
	validateRequest,
	updateAdminAccount
);
router.put(
	'/api/admin/password-update',
	authCheck,
	adminCheck,
	[ body('newPassword').trim().notEmpty().withMessage('You must supply a password') ],
	validateRequest,
	updateAdminPassword
);
router.get('/api/referent/:email', getSingleReferentByEmail);
router.get('/api/customer/all', getAllCustomers);
// wishlist
router.post(
	'/api/wishlist/add',
	authCheck,
	[ body('item_id').trim().notEmpty().withMessage('You must supply an item id') ],
	validateRequest,
	addItemToWishlist
);
router.get('/api/user/wishlist/get', authCheck, getUserWishlist);
router.put('/api/user/wishlist/remove/:id', authCheck, removeFromWishlist);
router.get('/api/user/wishlist/count', authCheck, getUserWishlistCount);
router.post('/api/referent/search/filters', referentSearchFilters);

export { router as userRouter };
