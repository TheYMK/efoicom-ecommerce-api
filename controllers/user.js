const User = require('../models/user');
const Item = require('../models/item');
const admin = require('firebase-admin');

/**
 * This account fetches the total count of referent and customer accounts and total count of approved products and services.
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns an object with total counts of referent, customer, products and services
 * @reviewed YES
 */
exports.getCounts = async (req, res) => {
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
		res.status(400).json({
			error: 'Failed to get the total count of items'
		});
	}
};

/**
 * 
 * This functions checks for the total number of referents account with account approval status on hold
 * @param {*} req 
 * @param {*} res 
 * @returns an array of referent accounts with account approval status of on hold
 * @reviewed YES
 */
exports.getTotalRefRequests = async (req, res) => {
	try {
		const requests = await User.find({
			$and: [ { referent_account_approval: 'on hold' }, { role: 'referent' } ]
		})
			.populate('reference_zone')
			.exec();

		res.json(requests);
	} catch (err) {
		console.log(`====> Failed to get referents request: {Error: ${err}}`);
		res.status(400).json({
			error: 'Failed to get referents request'
		});
	}
};

/**
 * This function checks if approval status that was passed from the front end is equal to approved. If yes we go ahead and update the status in the database
 * If approval status that was passed from the front end is equal to rejected. If yest we first try to delete the user account from firebase, then try to delete the user in the database also.
 * @param {*} req 
 * @param {*} res 
 * @returns a boolean
 * @reviewed YES
 */
exports.updateReferentAccountApprovalStatus = async (req, res) => {
	const { referent_email, approval_status } = req.body;
	console.log(referent_email);
	console.log(approval_status);
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
		res.status(400).json({
			error: 'Failed to update referent account request status'
		});
	}
};

/**
 * This function fetches all approved referent accounts
 * @param {*} req 
 * @param {*} res 
 */
exports.getAllReferents = async (req, res) => {
	try {
		const requests = await User.find({ $and: [ { referent_account_approval: 'approved' }, { role: 'referent' } ] })
			.populate('reference_zone')
			.exec();

		res.json(requests);
	} catch (err) {
		console.log(`====> Failed to get all approved referents: {Error: ${err}}`);
		res.status(400).json({
			error: 'Failed to get all approved referents'
		});
	}
};

/**
 * This function deletes a referent user
 * @param {*} req 
 * @param {*} res 
 * @returns the delete user object
 * @reviewed YES
 */
exports.deleteReferentUser = async (req, res) => {
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
		res.status(400).json({
			error: 'Failed to delete a referent user account from DB and/or firebase'
		});
	}
};

/**
 * This function updates the user email in firebase, and then updates the name and email in DB
 * @param {*} req 
 * @param {*} res 
 * @returns a boolean
 * @reviewed YES
 */
exports.updateAdminAccount = async (req, res) => {
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
		return res.status(400).json({
			error: 'Failed to update admin user account'
		});
	}
};

/**
 * This function updates the user password in firebase
 * @param {*} req 
 * @param {*} res 
 * @returns a boolean
 * @reviewed YES
 */
exports.updateAdminPassword = async (req, res) => {
	const { newPassword } = req.body;
	try {
		admin.auth().updateUser(req.user.uid, { password: newPassword }).then((userRecord) => {
			console.log(`====> Admin password has been changed`);

			return res.json({
				success: true
			});
		});
	} catch (err) {
		console.log(`====> Failed to update admin password: {Error: ${err}}`);
		return res.status(400).json({
			error: 'Failed to update admin password'
		});
	}
};

/**
 * This function fetches a referent user
 * @param {*} req 
 * @param {*} res 
 * @returns a user object
 * @reviewed No
 */
exports.getSingleReferentByEmail = async (req, res) => {
	try {
		const foundReferent = await User.findOne({ email: req.params.email }).populate('reference_zone').exec();

		res.json(foundReferent);
	} catch (err) {
		console.log(`====> Failed to get single referent: {Error: ${err}}`);
		return res.status(400).json({
			error: 'Failed to get single referent'
		});
	}
};

/**
 * This function adds an item to wishlist
 * @param {*} req 
 * @param {*} res 
 * @returns an object
 * @reviewed No
 */
exports.addItemToWishlist = async (req, res) => {
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
		return res.status(400).json({
			error: 'Failed to add item to wishlist'
		});
	}
};

/**
 * This function fetches items on the users' wishlist
 * @param {*} req 
 * @param {*} res 
 * @returns an array of objects
 * @reviewed No
 */
exports.getUserWishlist = async (req, res) => {
	try {
		const wishlist = await User.findOne({ email: req.user.email }).select('wishlist').populate('wishlist').exec();

		res.json(wishlist);
	} catch (err) {
		console.log(`====> Failed to fetch items on the wishlist: {Error: ${err}}`);
		return res.status(400).json({
			error: 'Failed to fetch items on the wishlist'
		});
	}
};

/**
 * This function removes an items from the wishlist
 * @param {*} req 
 * @param {*} res 
 * @returns an object
 * @reviewed No
 */
exports.removeFromWishlist = async (req, res) => {
	try {
		const { id } = req.params;
		const user = await User.findOneAndUpdate({ email: req.user.email }, { $pull: { wishlist: id } }).exec();

		res.json({
			success: true
		});
	} catch (err) {
		console.log(`====> Failed to remove item from the wishlist: {Error: ${err}}`);
		return res.status(400).json({
			error: 'Failed to remove item from the wishlist'
		});
	}
};

/**
 * This function gets the total count of items on the users' wishlist
 * @param {*} req 
 * @param {*} res 
 * @returns an object
 * @reviewed No
 */
exports.getUserWishlistCount = async (req, res) => {
	try {
		const result = await User.findOne({ email: req.user.email }).select('wishlist').populate('wishlist').exec();

		res.json({
			count: result.wishlist.length
		});
	} catch (err) {
		console.log(`====> Failed to fetch items on the wishlist: {Error: ${err}}`);
		return res.status(400).json({
			error: 'Failed to fetch items on the wishlist'
		});
	}
};
