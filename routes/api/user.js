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
	updateAdminPassword
} = require('../../controllers/user');

router.get('/admin/get-counts', authCheck, adminCheck, getCounts);
router.get('/admin/referents/requests', authCheck, adminCheck, getTotalRefRequests);
router.put(
	'/admin/referent/update-account-approval-status',
	authCheck,
	adminCheck,
	updateReferentAccountApprovalStatus
);
router.get('/admin/referents/all-approved', authCheck, adminCheck, getAllReferents);
router.delete('/admin/referent/:id', authCheck, adminCheck, deleteReferentUser);
router.put('/admin/account-update', authCheck, adminCheck, updateAdminAccount);
router.put('/admin/password-update', authCheck, adminCheck, updateAdminPassword);

module.exports = router;
