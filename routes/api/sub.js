const express = require('express');
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require('../../middlewares/auth');
// controllers
const { create, listSubs, removeSub, updateSub } = require('../../controllers/sub');

router.post('/admin/sub/create', authCheck, adminCheck, create);
router.get('/subs', listSubs);
router.delete('/admin/sub/delete/:slug', authCheck, adminCheck, removeSub);
router.put('/admin/sub/update/:slug', authCheck, adminCheck, updateSub);

module.exports = router;
