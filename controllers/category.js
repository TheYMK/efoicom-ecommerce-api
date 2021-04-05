const Category = require('../models/category');
const slugify = require('slugify');
const Sub = require('../models/sub');

/**
 * This function creates a new category
 * @param {*} req 
 * @param {*} res
 * @returns a new category object
 * @reviewed YES
 */
exports.createCategory = async (req, res) => {
	const { category_name, category_images } = req.body;
	try {
		const newCategory = await new Category({
			name: category_name,
			slug: slugify(category_name),
			images: category_images
		}).save();

		res.json(newCategory);
	} catch (err) {
		console.log(`====> Failed to create a category: {Error: ${err}} `);
		res.status(400).json({
			error: 'Failed to create a category'
		});
	}
};

/**
 * This function fetches all categories
 * @param {*} req 
 * @param {*} res
 * @returns an array of categorie objects
 * @reviewed YES
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

/**
 * This function removes one category and subs related to that category
 * @param {*} req 
 * @param {*} res
 * @returns the removed category object
 * @reviewed YES
 */
exports.removeCategory = async (req, res) => {
	try {
		const removedCategory = await Category.findOneAndRemove({ slug: req.params.slug }).exec();
		const removedSubs = await Sub.deleteMany({ parent: removedCategory._id }).exec();
		console.log(`All subs related to ${removedCategory.name} have been deleted`);

		res.json(removedCategory);
	} catch (err) {
		console.log(`====> Failed to remove category: {Error: ${err}} `);
		res.status(400).json({
			error: 'Failed to remove category'
		});
	}
};

/**
 * This function updates one category
 * @param {*} req 
 * @param {*} res
 * @returns the updated category object
 * @reviewed YES
 */
exports.updateCategory = async (req, res) => {
	const { name, images } = req.body;

	try {
		const updated = await Category.findOneAndUpdate(
			{ slug: req.params.slug },
			{ name: name, slug: slugify(name), images: images },
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

/**
 * This function fetches all category subs
 * @param {*} req 
 * @param {*} res
 * @returns an array of subs
 * @reviewed YES
 */
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
