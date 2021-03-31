const Category = require('../models/category');
const slugify = require('slugify');
const Sub = require('../models/sub');

/**
 * Create a new category
 * @param {*} req 
 * @param {*} res 
 */
exports.create = async (req, res) => {
	const { category_name } = req.body;
	try {
		const newCategory = await new Category({ name: category_name, slug: slugify(category_name) }).save();

		res.json(newCategory);
	} catch (err) {
		console.log(`====> Failed to create a category: {Error: ${err}} `);
		res.status(400).json({
			error: 'Failed to create a category'
		});
	}
};

/**
 * Fetch all categories
 * @param {*} req 
 * @param {*} res 
 */
exports.listCategories = async (req, res) => {
	try {
		const categories = await Category.find({}).sort({ createdAt: -1 });
		res.json(categories);
	} catch (err) {
		console.log(`====> Failed to get all categories: {Error: ${err}} `);
		res.status(400).json({
			error: 'Failed to get all categories'
		});
	}
};

exports.removeCategory = async (req, res) => {
	try {
		const removedCategory = await Category.findOneAndRemove({ slug: req.params.slug }).exec();
		res.json(removedCategory);
	} catch (err) {
		console.log(`====> Failed to remove category: {Error: ${err}} `);
		res.status(400).json({
			error: 'Failed to remove category'
		});
	}
};

exports.updateCategory = async (req, res) => {
	const { name } = req.body;

	try {
		const updated = await Category.findOneAndUpdate(
			{ slug: req.params.slug },
			{ name: name, slug: slugify(name) },
			{ new: true }
		);

		res.json(updated);
	} catch (err) {
		console.log(`====> Failed to update category: {Error: ${err}} `);
		res.status(400).json({
			error: 'Failed to update category'
		});
	}
};

exports.getCategorySubs = async (req, res) => {
	Sub.find({ parent: req.params.id }).exec((err, subs) => {
		if (err) {
			console.log(`====> Failed to get category subs: {Error: ${err}} `);
			res.status(400).json({
				error: 'Failed to get category subs'
			});
		}

		res.json(subs);
	});
};
