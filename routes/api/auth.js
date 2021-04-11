const express = require('express');
const router = express.Router();

// middlewares
const { authCheck, adminCheck, referentCheck, customerCheck } = require('../../middlewares/auth');
// controllers
const { createOrUpdateUser, currentUser } = require('../../controllers/auth');

router.post('/create-or-update-user', authCheck, createOrUpdateUser);
router.post('/current-user', authCheck, currentUser);
router.post('/current-admin', authCheck, adminCheck, currentUser);
router.post('/current-referent', authCheck, referentCheck, currentUser);
router.post('/current-customer', authCheck, customerCheck, currentUser);

module.exports = router;
