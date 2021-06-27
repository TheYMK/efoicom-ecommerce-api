import express from 'express';
const router = express.Router();

// middlewares
import { authCheck, adminCheck } from '../../middlewares/auth';
// controllers
import { create, list, remove, update } from '../../controllers/zone';

import { validateRequest } from '../../middlewares/validate-request';
import { body } from 'express-validator';

router.post(
	'/api/admin/zone/create',
	authCheck,
	adminCheck,
	[
		body('name').trim().notEmpty().withMessage('You must supply a name'),
		body('island').trim().notEmpty().withMessage('You must supply an island')
	],
	validateRequest,
	create
);
router.get('/api/zones/all', list);
router.delete('/api/zone/:slug', authCheck, adminCheck, remove);
router.put(
	'/api/zone/:slug',
	authCheck,
	adminCheck,
	[
		body('name').trim().notEmpty().withMessage('You must supply a name'),
		body('island').trim().notEmpty().withMessage('You must supply an island')
	],
	validateRequest,
	update
);

export { router as zoneRouter };
