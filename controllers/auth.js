const User = require('../models/user');

exports.createOrUpdateUser = async (req, res) => {
	const { email, picture } = req.user;
	const { first_name, last_name, phone_number, account_type, city, island, address } = req.body;

	const user = await User.findOne({ email: email });

	if (user) {
		console.log('====> User Found', user);
		res.json(user);
	} else {
		const newUser = await new User({
			name: `${first_name} ${last_name}`,
			email: email,
			phone_number: phone_number,
			role: account_type,
			city: city,
			island: island.toLowerCase(),
			address: address,
			picture
		}).save();
		console.log('====> New User', newUser);
		res.json(newUser);
	}
};

exports.currentUser = async (req, res) => {
	const { email } = req.user;

	try {
		const user = await User.findOne({ email: email });

		res.json(user);
	} catch (err) {
		console.log(`====> ${err}`);
		res.status(400).json({
			error: 'Failed to get the currently logged in user'
		});
	}
};
