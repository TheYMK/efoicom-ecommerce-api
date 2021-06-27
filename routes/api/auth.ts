import express from 'express';
const router = express.Router();

// middlewares
import { authCheck, adminCheck, referentCheck, customerCheck } from '../../middlewares/auth';
// controllers
import { createOrUpdateUser, currentUser } from '../../controllers/auth';

import { validateRequest } from '../../middlewares/validate-request';
import { body } from 'express-validator';

router.post(
	'/api/create-or-update-user',
	authCheck,
	[
		body('first_name').trim().notEmpty().withMessage('You must supply a first name'),
		body('last_name').trim().notEmpty().withMessage('You must supply a last name'),
		body('phone_number').trim().notEmpty().withMessage('You must supply a phone number'),
		body('account_type').trim().notEmpty().withMessage('You must supply an account type'),
		body('city').trim().notEmpty().withMessage('You must supply a city'),
		body('island').trim().notEmpty().withMessage('You must supply an island'),
		body('address').trim().notEmpty().withMessage('You must supply an address')
	],
	validateRequest,
	createOrUpdateUser
);
router.post('/api/current-user', authCheck, currentUser);
router.post('/api/current-admin', authCheck, adminCheck, currentUser);
router.post('/api/current-referent', authCheck, referentCheck, currentUser);
router.post('/api/current-customer', authCheck, customerCheck, currentUser);

export { router as authRouter };
