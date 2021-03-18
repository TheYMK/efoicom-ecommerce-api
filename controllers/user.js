const User = require('../models/user');
const admin = require('firebase-admin');

exports.getCounts = async (req, res) => {
	try {
		const totalRefCount = await User.find({ role: 'referent' }).countDocuments();
		const totalCustomerCount = await User.find({ role: 'customer' }).countDocuments();

		const counts = {
			totalRefCount,
			totalCustomerCount
		};

		res.json(counts);
	} catch (err) {
		console.log(`====> Failed to get the total count of referent accounts: {Error: ${err}}`);
		res.status(400).json({
			error: 'Failed to get the total count of referent accounts'
		});
	}
};

exports.getTotalRefRequests = async (req, res) => {
	try {
		const requests = await User.find({ $and: [ { referent_account_approval: 'on hold' }, { role: 'referent' } ] });

		res.json(requests);
	} catch (err) {
		console.log(`====> Failed to get referent requests: {Error: ${err}}`);
		res.status(400).json({
			error: 'Failed to get referent requests'
		});
	}
};

exports.updateReferentAccountApprovalStatus = async (req, res) => {
	const { email, approval_status } = req.body;
	try {
		// 1. update request status
		const updatedUser = await User.findOneAndUpdate(
			{ email },
			{ referent_account_approval: approval_status },
			{ new: true }
		).exec();

		// 2. if the user is rejected, then we delete the account in firebase
		if (approval_status === 'rejected') {
			admin
				.auth()
				.getUserByEmail(email)
				.then((userdata) => {
					admin
						.auth()
						.deleteUser(userdata.uid)
						.then(async () => {
							const deletedUser = await User.findOneAndRemove({ email }).exec();
						})
						.catch((err) => {
							console.log(`====> Failed to delete a user from firebase: {Error: ${err}}`);
							res.status(400).json({
								error: 'Failed to delete a user from firebase'
							});
						});
				})
				.catch((err) => {
					console.log(`===> Failed to get user by email (firebase): {Error: ${err}}`);
					res.status(400).json({
						error: 'Failed to get user by email (firebase)'
					});
				});
		}

		res.json({ success: true });
	} catch (err) {
		console.log(`====> Failed to update referent account request status: {Error: ${err}} `);
		res.status(400).json({
			error: 'Failed to update referent account request status'
		});
	}
};
