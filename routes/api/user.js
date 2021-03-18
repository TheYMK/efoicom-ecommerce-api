const express = require('express');
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require('../../middlewares/auth');
// controllers
const { getCounts, getTotalRefRequests, updateReferentAccountApprovalStatus } = require('../../controllers/user');

router.get('/get-counts', authCheck, adminCheck, getCounts);
router.get('/referents/requests', authCheck, adminCheck, getTotalRefRequests);
router.put('/referent/update-account-approval-status', authCheck, adminCheck, updateReferentAccountApprovalStatus);

module.exports = router;
