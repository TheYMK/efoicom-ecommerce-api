import express from 'express';
const router = express.Router();

// middlewares
import { authCheck, adminCheck } from '../../middlewares/auth';

// controllers
import { create, list, read, remove } from '../../controllers/tag';

import { validateRequest } from '../../middlewares/validate-request';
import { body } from 'express-validator';

// // validators
// import { runValidation } from '../../validators/index';
// import { tagCreateValidator } from '../../validators/tag';

router.post(
	'/api/admin/tag',
	authCheck,
	adminCheck,
	[ body('name').trim().notEmpty().withMessage('You must supply a name') ],
	validateRequest,
	create
);
router.get('/api/tags', list);
router.get('/api/tag/:slug', read);
router.delete('/api/admin/tag/:slug', authCheck, adminCheck, remove);

export { router as tagRouter };
