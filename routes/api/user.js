const express = require('express');
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require('../../middlewares/auth');
// controllers
const {
	getCounts,
	getTotalRefRequests,
	updateReferentAccountApprovalStatus,
	getAllReferents
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

module.exports = router;
