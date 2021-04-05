const User = require('../models/user');

/**
 * This function checks if a user with the email passed to the body already exists in the DB or not.
 * If yes, it returns the user found.
 * If no, it creates a new user with the information passed to the body.
 * @param {*} req 
 * @param {*} res 
 * @returns user object
 * @reviewed YES
 */
exports.createOrUpdateUser = async (req, res) => {
	const { email, picture } = req.user;
	const { first_name, last_name, phone_number, account_type, city, island, address, reference_zone } = req.body;
	try {
		const user = await User.findOne({ email: email });

		if (user) {
			console.log(`====> Found a user (/api/create-or-update-user)`);
			res.json(user);
		} else {
			const newUser = await new User({
				name: `${first_name} ${last_name}`,
				email: email,
				phone_number: phone_number,
				role: account_type,
				city: city,
				island: island,
				address: address,
				reference_zone: reference_zone,
				picture
			}).save();
			console.log('====> Created a new user (/api/create-or-update-user)', newUser);
			res.json(newUser);
		}
	} catch (err) {
		console.log(`====> Failed to create or update a user: {Error: ${err}}`);
		res.status(400).json({
			error: 'Failed to create or update a user'
		});
	}
};

/**
 * This function find a user using the logged in user's email and returns the user
 * @param {*} req 
 * @param {*} res 
 * @returns user object
 * @reviewed YES
 */
exports.currentUser = async (req, res) => {
	const { email } = req.user;

	try {
		const user = await User.findOne({ email: email });
		res.json(user);
	} catch (err) {
		console.log(`====> Failed to get the currently logged in user: {Error: ${err}}`);
		res.status(400).json({
			error: 'Failed to get the currently logged in user'
		});
	}
};
