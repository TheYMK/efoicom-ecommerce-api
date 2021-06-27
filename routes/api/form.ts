import express from 'express';
const router = express.Router();

// controllers
import { contactReferent, contactForm } from '../../controllers/form';

import { validateRequest } from '../../middlewares/validate-request';
import { body, check } from 'express-validator';

router.post(
	'/api/contact/referent',
	[
		check('usr_name').not().isEmpty().withMessage(`You must supply a user name`),
		check('subject').not().isEmpty().withMessage(`You must supply a subject`),
		check('ref_email').isEmail().withMessage(`You must supply a referent name`),
		check('usr_email').isEmail().withMessage(`You must supply a user email`),
		check('usr_phone').not().isEmpty().withMessage(`You must supply a user phone number`),
		check('message')
			.not()
			.isEmpty()
			.isLength({ min: 20 })
			.withMessage('The message should have at least 20 characters')
	],
	validateRequest,
	contactReferent
);
router.post(
	'/api/contact',
	[
		check('name').not().isEmpty().withMessage(`You must supply a name`),
		check('email').isEmail().withMessage(`Email must be valid`),
		check('subject').not().isEmpty().withMessage(`You must supply a subject`),
		check('message')
			.not()
			.isEmpty()
			.isLength({ min: 20 })
			.withMessage('The message should have at least 20 characters')
	],
	validateRequest,
	contactForm
);

export { router as formRouter };
