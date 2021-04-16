const Blogcategory = require('../models/blogcategory');
const slugify = require('slugify');
const { errorHandler } = require('../helpers/dbErrorHandler');

/**
 * This function creates a new blog category.
 * @param {*} req 
 * @param {*} res 
 * @returns object
 * @reviewed NO
 */
exports.create = (req, res) => {
	const { name } = req.body;
	let slug = slugify(name).toLowerCase();
	let blogcategory = new Blogcategory({ name, slug });

	blogcategory.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: errorHandler(err)
			});
		}

		return res.json(data);
	});
};

/**
 * This function fetches all blog categories.
 * @param {*} req 
 * @param {*} res 
 * @returns object
 * @reviewed NO
 */
exports.list = async (req, res) => {
	try {
		const blogcategories = await Blogcategory.find({}).exec();

		return res.json(blogcategories);
	} catch (err) {
		console.log(`====> Failed to get all blog categories: {Error: ${err}} `);
		res.status(400).json({
			error: 'Failed to get all blog categories'
		});
	}
};

/**
 * This function fetches one blog category.
 * @param {*} req 
 * @param {*} res 
 * @returns object
 * @reviewed NO
 */
exports.read = async (req, res) => {
	try {
		const slug = req.params.slug.toLowerCase();

		const blogcategory = await Blogcategory.findOne({ slug }).exec();

		return res.json(blogcategory);
	} catch (err) {
		console.log(`====> Failed to get one blog category: {Error: ${err}} `);
		res.status(400).json({
			error: ' Failed to get one blog category'
		});
	}
};

/**
 * This function removes one blog category.
 * @param {*} req 
 * @param {*} res 
 * @returns object
 * @reviewed NO
 */
exports.remove = async (req, res) => {
	try {
		const removedBlogCategory = await Blogcategory.findOneAndRemove({ slug: req.params.slug }).exec();

		return res.json({
			success: true
		});
	} catch (err) {
		console.log(`====> Failed to remove one blog category: {Error: ${err}} `);
		res.status(400).json({
			error: ' Failed to remove one blog category'
		});
	}
};
