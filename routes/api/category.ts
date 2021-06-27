import express from 'express';
const router = express.Router();

// middlewares
import { authCheck, adminCheck } from '../../middlewares/auth';
// controllers
import {
	createCategory,
	listCategories,
	removeCategory,
	updateCategory,
	getCategorySubs
} from '../../controllers/category';

import { validateRequest } from '../../middlewares/validate-request';
import { body } from 'express-validator';

router.post(
	'/api/admin/category/create',
	authCheck,
	adminCheck,
	[
		body('category_name').trim().notEmpty().withMessage('You must supply a category name'),
		body('category_images').isArray({ min: 1 }).withMessage('You must supply at least one category image')
	],
	validateRequest,
	createCategory
);
router.get('/api/categories', listCategories);
router.delete('/api/admin/category/delete/:slug', authCheck, adminCheck, removeCategory);
router.put(
	'/api/admin/category/update/:slug',
	authCheck,
	adminCheck,
	[
		body('name').trim().notEmpty().withMessage('You must supply a category name'),
		body('images').isArray({ min: 1 }).withMessage('You must supply at least one category image')
	],
	validateRequest,
	updateCategory
);
router.get('/api/category/:id/subs', getCategorySubs);

export { router as categoryRouter };
