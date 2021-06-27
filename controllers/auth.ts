import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../errors/bad-request-error';
import { NotAuthorizedError } from '../errors/not-authorized-error';
import { NotFoundError } from '../errors/not-found-error';
import { User } from '../models/user';

export const createOrUpdateUser = async (req: Request, res: Response) => {
	if (!req.user) {
		throw new NotAuthorizedError();
	}

	const { email } = req.user;
	const { first_name, last_name, phone_number, account_type, city, island, address, reference_zone } = req.body;
	try {
		const user = await User.findOne({ email: email });

		if (user) {
			console.log(`====> Found a user (/api/create-or-update-user)`);
			res.json(user);
		} else {
			if (reference_zone === '') {
				const newUser = User.build({
					name: `${first_name} ${last_name}`,
					email: email!,
					phone_number: phone_number,
					role: account_type,
					city: city,
					island: island,
					address: address,
					wishlist: [],
					reference_zone: null,
					referent_account_approval: null
				});

				await newUser.save();

				console.log('====> Created a new user (/api/create-or-update-user)', newUser);
				return res.json(newUser);
			} else {
				const newUser = User.build({
					name: `${first_name} ${last_name}`,
					email: email!,
					phone_number: phone_number,
					role: account_type,
					city: city,
					island: island,
					address: address,
					reference_zone: reference_zone,
					wishlist: [],
					referent_account_approval: 'on hold'
				});
				await newUser.save();
				console.log('====> Created a new user (/api/create-or-update-user)', newUser);
				res.json(newUser);
			}
		}
	} catch (err) {
		console.log(err);
		throw new BadRequestError('Failed to create or update a user');
	}
};

export const currentUser = async (req: Request, res: Response) => {
	if (!req.user) {
		throw new NotAuthorizedError();
	}

	const { email } = req.user;

	try {
		const user = await User.findOne({ email: email });
		if (!user) {
			throw new NotFoundError('Failed to fetch the user');
		}
		res.json(user);
	} catch (err) {
		throw new BadRequestError('Failed to get the currently logged in user');
	}
};
