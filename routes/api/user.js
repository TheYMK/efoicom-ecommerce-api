const express = require('express');
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require('../../middlewares/auth');
// controllers
const {
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
	getUserWishlistCount
} = require('../../controllers/user');

router.get('/get-counts', getCounts);
router.get('/admin/referents/requests', authCheck, adminCheck, getTotalRefRequests);
router.put(
	'/admin/referent/update-account-approval-status',
	authCheck,
	adminCheck,
	updateReferentAccountApprovalStatus
);
router.get('/referents/all-approved', getAllReferents);
router.put('/admin/referent/:id', authCheck, adminCheck, deleteReferentUser);
router.put('/admin/account-update', authCheck, adminCheck, updateAdminAccount);
router.put('/admin/password-update', authCheck, adminCheck, updateAdminPassword);
router.get('/referent/:email', getSingleReferentByEmail);
// wishlist
router.post('/wishlist/add', authCheck, addItemToWishlist);
router.get('/user/wishlist/get', authCheck, getUserWishlist);
router.put('/user/wishlist/remove/:id', authCheck, removeFromWishlist);
router.get('/user/wishlist/count', authCheck, getUserWishlistCount);
module.exports = router;
