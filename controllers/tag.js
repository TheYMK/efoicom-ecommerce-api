const Tag = require('../models/tag');
const slugify = require('slugify');
const { errorHandler } = require('../helpers/dbErrorHandler');

/**
 * This function creates a new blog tag.
 * @param {*} req 
 * @param {*} res 
 * @returns object
 * @reviewed NO
 */
exports.create = (req, res) => {
	const { name } = req.body;
	let slug = slugify(name).toLowerCase();
	let tag = new Tag({ name, slug });

	tag.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: errorHandler(err)
			});
		}

		return res.json(data);
	});
};

/**
 * This function fetches all blog tags.
 * @param {*} req 
 * @param {*} res 
 * @returns object
 * @reviewed NO
 */
exports.list = async (req, res) => {
	try {
		const tags = await Tag.find({}).exec();

		return res.json(tags);
	} catch (err) {
		console.log(`====> Failed to get all blog tags: {Error: ${err}} `);
		res.status(400).json({
			error: 'Failed to get all blog tags'
		});
	}
};

/**
 * This function fetches one blog tag.
 * @param {*} req 
 * @param {*} res 
 * @returns object
 * @reviewed NO
 */
exports.read = async (req, res) => {
	try {
		const slug = req.params.slug.toLowerCase();

		const tag = await Tag.findOne({ slug }).exec();

		return res.json(tag);
	} catch (err) {
		console.log(`====> Failed to get one blog tag: {Error: ${err}} `);
		res.status(400).json({
			error: ' Failed to get one blog tag'
		});
	}
};

/**
 * This function removes one blog tag.
 * @param {*} req 
 * @param {*} res 
 * @returns object
 * @reviewed NO
 */
exports.remove = async (req, res) => {
	try {
		const removedBlogTag = await Tag.findOneAndRemove({ slug: req.params.slug }).exec();

		return res.json({
			success: true
		});
	} catch (err) {
		console.log(`====> Failed to remove one blog tag: {Error: ${err}} `);
		res.status(400).json({
			error: ' Failed to remove one blog tag'
		});
	}
};
