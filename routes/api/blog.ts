import express from 'express';
const router = express.Router();

// controllers
import {
	create,
	list,
	getTotalCount,
	listAllBlogsCategoriesTags,
	read,
	remove,
	update,
	listRelated,
	blogSearchFilters
} from '../../controllers/blog';
// middlewares
import { authCheck, adminCheck } from '../../middlewares/auth';

import { validateRequest } from '../../middlewares/validate-request';
import { body } from 'express-validator';

// routes
router.post('/api/admin/blog', authCheck, adminCheck, create);
router.get('/api/blogs', list);
router.get('/api/blogs/total', getTotalCount);
router.post('/api/blogs-categories-tags', listAllBlogsCategoriesTags);
router.get('/api/blog/:slug', read);
router.delete('/api/admin/blog/:slug', authCheck, adminCheck, remove);
router.put('/api/admin/blog/:slug', authCheck, adminCheck, update);
router.post('/api/blog/related', listRelated);
router.post('/api/blog/search/filters', blogSearchFilters);

export { router as blogRouter };
