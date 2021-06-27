import express from 'express';
const router = express.Router();

// middlewares
import { authCheck, adminCheck } from '../../middlewares/auth';

// controllers
import { create, list, read, remove } from '../../controllers/blogcategory';

import { validateRequest } from '../../middlewares/validate-request';
import { check } from 'express-validator';

router.post(
	'/api/admin/blogcategory',
	authCheck,
	adminCheck,
	[ check('name').not().isEmpty().withMessage('You must supply a name') ],
	validateRequest,
	create
);
router.get('/api/blogcategories', list);
router.get('/api/blogcategory/:slug', read);
router.delete('/api/admin/blogcategory/:slug', authCheck, adminCheck, remove);

export { router as blogcategoryRouter };
