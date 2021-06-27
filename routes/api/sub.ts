import express from 'express';
const router = express.Router();

// middlewares
import { authCheck, adminCheck } from '../../middlewares/auth';
// controllers
import { create, listSubs, removeSub, updateSub } from '../../controllers/sub';

import { validateRequest } from '../../middlewares/validate-request';
import { body } from 'express-validator';

router.post(
	'/api/admin/sub/create',
	authCheck,
	adminCheck,
	[
		body('name').trim().notEmpty().withMessage('You must supply a name'),
		body('parent').trim().notEmpty().withMessage('You must supply a parent category')
	],
	validateRequest,
	create
);
router.get('/api/subs', listSubs);
router.delete('/api/admin/sub/delete/:slug', authCheck, adminCheck, removeSub);
router.put(
	'/api/admin/sub/update/:slug',
	authCheck,
	adminCheck,
	[
		body('name').trim().notEmpty().withMessage('You must supply a name'),
		body('parent').trim().notEmpty().withMessage('You must supply a parent category')
	],
	validateRequest,
	updateSub
);

export { router as subRouter };
