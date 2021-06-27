import { User } from '../models/user';
import { Item } from '../models/item';
import admin from 'firebase-admin';
import { Request, Response } from 'express';
import { BadRequestError } from '../errors/bad-request-error';
import { NotAuthorizedError } from '../errors/not-authorized-error';
import { NotFoundError } from '../errors/not-found-error';

export const getCounts = async (req: Request, res: Response) => {
	try {
		const totalRefCount = await User.find({ role: 'referent' }).countDocuments();
		const totalCustomerCount = await User.find({ role: 'customer' }).countDocuments();
		const totalProductsCount = await Item.find({
			$and: [ { item_type: 'product' }, { item_approval_status: 'approved' } ]
		}).countDocuments();
		const totalServicesCount = await Item.find({
			$and: [ { item_type: 'service' }, { item_approval_status: 'approved' } ]
		}).countDocuments();

		const counts = {
			totalRefCount,
			totalCustomerCount,
			totalProductsCount,
			totalServicesCount
		};

		res.json(counts);
	} catch (err) {
		console.log(`====> Failed to get the total count of items: {Error: ${err}}`);
		throw new BadRequestError('Failed to get the total count of items');
	}
};

export const getTotalRefRequests = async (req: Request, res: Response) => {
	try {
		const requests = await User.find({
			$and: [ { referent_account_approval: 'on hold' }, { role: 'referent' } ]
		})
			.populate('reference_zone')
			.sort({ createdAt: -1 })
			.exec();

		if (!requests) {
			throw new NotFoundError('Failed to fetch requests');
		}

		res.json(requests);
	} catch (err) {
		console.log(`====> Failed to get referent requests: {Error: ${err}}`);
		throw new BadRequestError('Failed to get referent requests');
	}
};

export const updateReferentAccountApprovalStatus = async (req: Request, res: Response) => {
	const { referent_email, approval_status } = req.body;

	try {
		// 1. if user is approved, update the status
		if (approval_status === 'approved') {
			await User.findOneAndUpdate(
				{ email: referent_email },
				{ referent_account_approval: approval_status },
				{ new: true }
			).exec();

			return res.json({ success: true });
		}

		// 2. if the user is rejected, then we delete the account in firebase and DB
		if (approval_status === 'rejected') {
			admin.auth().getUserByEmail(referent_email).then((userData) => {
				admin.auth().deleteUser(userData.uid).then(async () => {
					await User.findOneAndRemove({ email: referent_email }).exec();
					return res.json({ success: true });
				});
			});
		}
	} catch (err) {
		console.log(`====> Failed to update referent account request status: {Error: ${err}} `);
		throw new BadRequestError('Failed to update referent account request status');
	}
};

export const getAllReferents = async (req: Request, res: Response) => {
	try {
		const referents = await User.find({ $and: [ { referent_account_approval: 'approved' }, { role: 'referent' } ] })
			.populate('reference_zone')
			.sort({ createdAt: -1 })
			.exec();

		if (!referents) {
			throw new NotFoundError('Failed to fetch referent users');
		}

		res.json(referents);
	} catch (err) {
		console.log(`====> Failed to get all approved referents: {Error: ${err}}`);
		throw new BadRequestError('Failed to get all approved referents');
	}
};

export const deleteReferentUser = async (req: Request, res: Response) => {
	const { referent_email } = req.body;
	try {
		admin.auth().getUserByEmail(referent_email).then((userData) => {
			admin.auth().deleteUser(userData.uid).then(async () => {
				console.log('===> User deleted from firebase');
				const deletedUser = await User.findByIdAndRemove(req.params.id).exec();

				// Delete all items from this user
				await Item.deleteMany({ referent_email: referent_email }).exec();
				console.log('===> User posted items deleted from firebase');

				return res.json(deletedUser);
			});
		});
	} catch (err) {
		console.log(`====> Failed to delete a referent user account from DB and/or firebase: {Error: ${err}}`);
		throw new BadRequestError('Failed to delete a referent user account from DB and/or firebase');
	}
};

export const updateAdminAccount = async (req: Request, res: Response) => {
	if (!req.user) {
		throw new NotAuthorizedError();
	}

	const { email } = req.user;
	const { newName, newEmail } = req.body;
	try {
		admin.auth().updateUser(req.user.uid, { email: newEmail }).then(async (userRecord) => {
			console.log(`====> User updated on firebase: ${userRecord}`);

			const updatedUser = await User.findOneAndUpdate(
				{ email: email },
				{ name: newName, email: newEmail },
				{ new: true }
			).exec();

			console.log('====> User udpated on DB');

			return res.json({
				success: true
			});
		});
	} catch (err) {
		console.log(`====> Failed to update admin user account: {Error: ${err}}`);
		throw new BadRequestError('Failed to update admin user account');
	}
};

export const updateAdminPassword = async (req: Request, res: Response) => {
	const { newPassword } = req.body;
	if (!req.user) {
		throw new NotAuthorizedError();
	}

	try {
		admin.auth().updateUser(req.user.uid, { password: newPassword }).then((userRecord) => {
			console.log(`====> Admin password has been changed`);

			return res.json({
				success: true
			});
		});
	} catch (err) {
		console.log(`====> Failed to update admin password: {Error: ${err}}`);
		throw new BadRequestError('Failed to update admin password');
	}
};

export const getSingleReferentByEmail = async (req: Request, res: Response) => {
	try {
		const foundReferent = await User.findOne({ email: req.params.email }).populate('reference_zone').exec();
		if (!foundReferent) {
			throw new NotFoundError('Referent user not found');
		}
		res.json(foundReferent);
	} catch (err) {
		console.log(`====> Failed to get single referent: {Error: ${err}}`);
		throw new BadRequestError('Failed to get single referent');
	}
};

export const addItemToWishlist = async (req: Request, res: Response) => {
	if (!req.user) {
		throw new NotAuthorizedError();
	}
	try {
		const { item_id } = req.body;

		const user = await User.findOneAndUpdate(
			{ email: req.user.email },
			{ $addToSet: { wishlist: item_id } },
			{ new: true }
		).exec();

		res.json({
			success: true
		});
	} catch (err) {
		console.log(`====> Failed to add item to wishlist: {Error: ${err}}`);
		throw new BadRequestError('Failed to add item to wishlist');
	}
};

export const getUserWishlist = async (req: Request, res: Response) => {
	if (!req.user) {
		throw new NotAuthorizedError();
	}
	try {
		const wishlist = await User.findOne({ email: req.user.email }).select('wishlist').populate('wishlist').exec();
		if (!wishlist) {
			throw new NotFoundError('Failed to fetch wishlist');
		}
		res.json(wishlist);
	} catch (err) {
		console.log(`====> Failed to fetch items on the wishlist: {Error: ${err}}`);
		throw new BadRequestError('Failed to fetch items on the wishlist');
	}
};

export const removeFromWishlist = async (req: Request, res: Response) => {
	if (!req.user) {
		throw new NotAuthorizedError();
	}

	try {
		const { id } = req.params;
		const user = await User.findOneAndUpdate({ email: req.user.email }, { $pull: { wishlist: id } }).exec();

		res.json({
			success: true
		});
	} catch (err) {
		console.log(`====> Failed to remove item from the wishlist: {Error: ${err}}`);
		throw new BadRequestError('Failed to remove item from the wishlist');
	}
};

export const getUserWishlistCount = async (req: Request, res: Response) => {
	if (!req.user) {
		throw new NotAuthorizedError();
	}
	try {
		const result = await User.findOne({ email: req.user.email }).select('wishlist').populate('wishlist').exec();
		if (!result) {
			throw new NotFoundError('Failed to fetch items');
		}
		res.json({
			count: result.wishlist.length
		});
	} catch (err) {
		console.log(`====> Failed to fetch items on the wishlist: {Error: ${err}}`);
		throw new BadRequestError('Failed to fetch items on the wishlist');
	}
};

export const getAllCustomers = async (req: Request, res: Response) => {
	try {
		const customers = await User.find({ role: 'customer' }).sort({ createdAt: -1 }).exec();

		if (!customers) {
			throw new NotFoundError('Failed to fetch customers');
		}

		res.json(customers);
	} catch (err) {
		console.log(`====> Failed to get all customers: {Error: ${err}}`);
		throw new BadRequestError('Failed to get all customers');
	}
};

const handleIslandSearch = async (req: Request, res: Response, island: string) => {
	try {
		if (island === 'allIslands') {
			const referents = await User.find({
				$and: [ { referent_account_approval: 'approved' }, { role: 'referent' } ]
			})
				.populate('reference_zone')
				.sort({ createdAt: -1 })
				.exec();

			if (!referents) {
				throw new NotFoundError('No referent was account found');
			}

			return res.json(referents);
		} else {
			const referents: any = await User.find({
				$and: [ { referent_account_approval: 'approved' }, { role: 'referent' } ]
			})
				.populate('reference_zone')
				.sort({ createdAt: -1 })
				.exec();

			if (!referents) {
				throw new NotFoundError('No referent was account found');
			}

			const results = [];

			for (let i = 0; i < referents.length; i++) {
				if (referents[i].reference_zone.island === island) {
					results.push(referents[i]);
				}
			}
			// const results = referents.find(({ reference_zone }) => reference_zone.island === island);
			return res.json(results);
		}
	} catch (err) {
		console.log(`====> Failed to fetch referents based on island selection: {Error: ${err}}`);
		throw new BadRequestError('Failed to fetch referents based on island selection');
	}
};

const handleZoneNameSearch = async (req: Request, res: Response, zone_name: string) => {
	try {
		if (zone_name === 'allZones') {
			const referents = await User.find({
				$and: [ { referent_account_approval: 'approved' }, { role: 'referent' } ]
			})
				.populate('reference_zone')
				.sort({ createdAt: -1 })
				.exec();

			if (!referents) {
				throw new NotFoundError('No referent was account found');
			}

			return res.json(referents);
		} else {
			const referents: any = await User.find({
				$and: [ { referent_account_approval: 'approved' }, { role: 'referent' } ]
			})
				.populate('reference_zone')
				.sort({ createdAt: -1 })
				.exec();

			if (!referents) {
				throw new NotFoundError('No referent was account found');
			}

			const results = [];

			for (let i = 0; i < referents.length; i++) {
				if (referents[i].reference_zone.name === zone_name) {
					results.push(referents[i]);
				}
			}
			// const results = referents.find(({ reference_zone }) => reference_zone.island === island);
			return res.json(results);
		}
	} catch (err) {
		console.log(`====> Failed to fetch referents based on zone name selection: {Error: ${err}}`);
		throw new BadRequestError('Failed to fetch referents based on zone name selection');
	}
};

export const referentSearchFilters = async (req: Request, res: Response) => {
	const { island, zone_name } = req.body;

	if (island) {
		await handleIslandSearch(req, res, island);
	}

	if (zone_name) {
		await handleZoneNameSearch(req, res, zone_name);
	}
};
