const express = require('express');
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require('../../middlewares/auth');
// controllers
const { create, list, remove, update } = require('../../controllers/zone');

router.post('/admin/zone/create', authCheck, adminCheck, create);
router.get('/zones/all', list);
router.delete('/zone/:slug', authCheck, adminCheck, remove);
router.put('/zone/:slug', authCheck, adminCheck, update);

module.exports = router;
