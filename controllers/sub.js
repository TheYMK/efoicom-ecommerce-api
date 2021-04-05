const Sub = require('../models/sub');
const slugify = require('slugify');

/**
 * This function creates a new sub-category
 * @param {*} req 
 * @param {*} res
 * @returns a new sub object
 * @reviewed YES
 */
exports.create = async (req, res) => {
	const { name, parent } = req.body;

	try {
		const newSub = await new Sub({ name: name, parent: parent, slug: slugify(name) }).save();

		res.json(newSub);
	} catch (err) {
		console.log(`====> Failed to create a sub-category: {Error: ${err}} `);
		res.status(400).json({
			error: 'Failed to create a sub-category'
		});
	}
};

/**
 * This function fetches all sub-categories
 * @param {*} req 
 * @param {*} res
 * @returns an array of sub objects
 * @reviewed YES
 */
exports.listSubs = async (req, res) => {
	try {
		const allSubs = await Sub.find({}).sort({ createdAt: -1 });

		res.json(allSubs);
	} catch (err) {
		console.log(`====> Failed to fetch all sub-categories: {Error: ${err}} `);
		res.status(400).json({
			error: 'Failed to fetch all sub-categories'
		});
	}
};

/**
 * This function removes a sub-category
 * @param {*} req 
 * @param {*} res
 * @returns the removed sub object
 * @reviewed YES
 */
exports.removeSub = async (req, res) => {
	try {
		const removedSub = await Sub.findOneAndRemove({ slug: req.params.slug });

		res.json(removedSub);
	} catch (err) {
		console.log(`====> Failed to remove sub-category: {Error: ${err}} `);
		res.status(400).json({
			error: 'Failed to remove sub-category'
		});
	}
};

/**
 * This function updates a sub-category
 * @param {*} req 
 * @param {*} res
 * @returns the updated sub object
 * @reviewed YES
 */
exports.updateSub = async (req, res) => {
	const { name, parent } = req.body;

	try {
		const updatedSub = await Sub.findOneAndUpdate(
			{ slug: req.params.slug },
			{ name: name, slug: slugify(name), parent: parent },
			{ new: true }
		);

		res.json(updatedSub);
	} catch (err) {
		console.log(`====> Failed to update sub-category: {Error: ${err}} `);
		res.status(400).json({
			error: 'Failed to update sub-category'
		});
	}
};
