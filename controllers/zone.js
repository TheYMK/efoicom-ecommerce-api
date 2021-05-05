const Zone = require('../models/zone');
const slugify = require('slugify');

/**
 * This function creates a new reference zone
 * @param {*} req 
 * @param {*} res
 * @returns a new zone object
 * @reviewed NO
 */
exports.create = async (req, res) => {
	const { name, island } = req.body;
	const slug = slugify(name);
	try {
		const newZone = await new Zone({
			name: name,
			slug: slug,
			island: island
		}).save();

		res.json(newZone);
	} catch (err) {
		console.log(`====> Failed to create a zone: {Error: ${err}} `);
		res.status(400).json({
			error: 'Failed to create a zone'
		});
	}
};

/**
 * This function fetches all reference zones
 * @param {*} req 
 * @param {*} res
 * @returns an array of object
 * @reviewed NO
 */
exports.list = async (req, res) => {
	try {
		const zones = await Zone.find({}).sort({ createdAt: -1 }).exec();

		return res.json(zones);
	} catch (err) {
		console.log(`====> Failed to fetches all reference zones: {Error: ${err}} `);
		res.status(400).json({
			error: 'Failed to fetches all reference zones'
		});
	}
};

/**
 * This function removes a reference zone
 * @param {*} req 
 * @param {*} res
 * @returns an object
 * @reviewed NO
 */
exports.remove = async (req, res) => {
	try {
		const deletedZone = await Zone.findOneAndRemove({ slug: req.params.slug }).exec();

		return res.json(deletedZone);
	} catch (err) {
		console.log(`====> Failed to removes a reference zone: {Error: ${err}} `);
		res.status(400).json({
			error: 'Failed to fetch removes a reference zone'
		});
	}
};

/**
 * This function updates a reference zone
 * @param {*} req 
 * @param {*} res
 * @returns an object
 * @reviewed NO
 */
exports.update = async (req, res) => {
	const { name, island } = req.body;
	const slug = slugify(name);

	try {
		const updatedZone = await Zone.findOneAndUpdate(
			{ slug: req.params.slug },
			{ name, island, slug: slug },
			{ new: true }
		).exec();

		return res.json(updatedZone);
	} catch (err) {
		console.log(`====> Failed to updates a reference zone: {Error: ${err}} `);
		res.status(400).json({
			error: 'Failed to fetch updates a reference zone'
		});
	}
};
