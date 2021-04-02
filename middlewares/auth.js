const admin = require('../firebase');
const User = require('../models/user');

exports.authCheck = async (req, res, next) => {
	try {
		const firebaseUser = await admin.auth().verifyIdToken(req.headers.authtoken);
		req.user = firebaseUser;
		next();
	} catch (err) {
		console.log(`====> Error occured in the authCheck middleware: ${err}`);
		res.status(401).json({
			error: 'Invalid or expired token'
		});
	}
};

// the above middleware will be apply before this one. So we will already have the user under req.user
exports.adminCheck = async (req, res, next) => {
	const { email } = req.user;

	const adminUser = await User.findOne({ email: email });

	if (adminUser.role !== 'sysadmin') {
		res.status(403).json({
			err: 'Admin resource. Access denied'
		});
	} else {
		next();
	}
};

exports.adminAndReferentCheck = async (req, res, next) => {
	const { email } = req.user;

	const user = await User.findOne({ email: email });

	if (user.role === 'sysadmin' || user.role === 'referent') {
		next();
	} else {
		res.status(403).json({
			err: 'Access denied'
		});
	}
};

exports.referentCheck = async (req, res, next) => {
	const { email } = req.user;

	const referentUser = await User.findOne({ email: email });

	if (referentUser.role !== 'referent') {
		res.status(403).json({
			err: 'Referent resource. Access denied'
		});
	} else {
		next();
	}
};

// might be suse
exports.customerCheck = async (req, res, next) => {
	const { email } = req.user;

	const customerUser = await User.findOne({ email: email });

	if (customerUser.role !== 'customer') {
		res.status(403).json({
			err: 'Customer resource. Access denied'
		});
	} else {
		next();
	}
};
