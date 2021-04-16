const Blog = require('../models/blog');
const Blogcategory = require('../models/blogcategory');
const Tag = require('../models/tag');
const formidable = require('formidable');
const slugify = require('slugify');
const { stripHtml } = require('string-strip-html');
const _ = require('lodash');
const { errorHandler } = require('../helpers/dbErrorHandler');
const fs = require('fs');
const { smartTrim } = require('../helpers/blog');
const User = require('../models/user');

/**
 * This function creates a blog.
 * @param {*} req 
 * @param {*} res 
 * @returns object
 * @reviewed NO
 */
exports.create = async (req, res) => {
	let form = new formidable.IncomingForm();
	form.keepExtensions = true;

	form.parse(req, (err, fields, files) => {
		if (err) {
			return res.json({
				error: 'Un problème est survenu'
			});
		}

		const { title, body, blogcategories, tags, image } = fields;

		if (!title || !title.length) {
			return res.json({
				error: 'Un titre est requis'
			});
		}

		if (!body || body.length < 200) {
			return res.json({
				error: `Le contenu de cet article est trop court`
			});
		}

		if (!blogcategories || blogcategories.length === 0) {
			return res.json({
				error: `Au moins une categorie est requise`
			});
		}

		if (!tags || tags.length === 0) {
			return res.json({
				error: `Au moins une étiquette est requise`
			});
		}

		if (!image || !image.length) {
			return res.json({
				error: 'Une image est requise'
			});
		}

		let blog = new Blog();
		blog.title = title;
		blog.body = body;
		blog.image = image;
		blog.excerpt = smartTrim(body, 320, ' ', ' ...');
		blog.slug = slugify(title).toLowerCase();
		blog.mtitle = `${title} | ${process.env.APP_NAME}`;
		blog.mdesc = stripHtml(body.substring(0, 160)).result;
		blog.postedBy = 'Administrateur';

		// blog categories and tags
		let arrayOfCategories = blogcategories && blogcategories.split(',');
		let arrayOfTags = tags && tags.split(',');

		blog.save((err, result) => {
			if (err) {
				return res.json({
					error: errorHandler(err)
				});
			}

			Blog.findByIdAndUpdate(
				result._id,
				{ $push: { blogcategories: arrayOfCategories } },
				{ new: true }
			).exec((err, result) => {
				if (err) {
					return res.json({
						error: errorHandler(err)
					});
				} else {
					Blog.findByIdAndUpdate(
						result._id,
						{ $push: { tags: arrayOfTags } },
						{ new: true }
					).exec((err, result) => {
						if (err) {
							return res.json({
								error: errorHandler(err) // only used for mongoose errors
							});
						} else {
							res.json(result);
						}
					});
				}
			});
		});
	});
};

/**
 * This function fetches all blogs.
 * @param {*} req 
 * @param {*} res 
 * @returns object
 * @reviewed NO
 */
exports.list = async (req, res) => {
	Blog.find({})
		.populate('blogcategories', '_id name slug')
		.populate('tags', '_id name slug')
		.select('_id title slug excerpt blogcategories tags postedBy createdAt image updatedAt')
		.exec((err, data) => {
			if (err) {
				return res.status(400).json({
					error: errorHandler(err)
				});
			}

			res.json(data);
		});
};

/**
 * This function fetches total count of blogs
 * @param {*} req 
 * @param {*} res 
 * @returns object
 * @reviewed NO
 */
exports.getTotalCount = async (req, res) => {
	try {
		const totalCount = await Blog.find({}).estimatedDocumentCount().exec();
		res.json(totalCount);
	} catch (err) {
		console.log(`====> ${err}`);
		res.status(400).json({
			error: err.message
		});
	}
};

/**
 * This function fetches blogs categories and tags
 * @param {*} req 
 * @param {*} res 
 * @returns object
 * @reviewed NO
 */
exports.listAllBlogsCategoriesTags = (req, res) => {
	let limit = req.body.limit ? parseInt(req.body.limit) : 10;
	let skip = req.body.skip ? parseInt(req.body.skip) : 0;

	let blogs;
	let blogcategories;
	let tags;

	Blog.find({})
		.populate('blogcategories', '_id name slug')
		.populate('tags', '_id name slug')
		.sort({ createdAt: -1 })
		.skip(skip)
		.limit(limit)
		.select('_id title slug excerpt blogcategories tags postedBy image createdAt updatedAt')
		.exec((err, data) => {
			if (err) {
				return res.json({
					error: errorHandler(err)
				});
			}
			blogs = data; // blogs
			// get all categories
			Blogcategory.find({}).exec((err, c) => {
				if (err) {
					return res.json({
						error: errorHandler(err)
					});
				}
				blogcategories = c; // categories
				// get all tags
				Tag.find({}).exec((err, t) => {
					if (err) {
						return res.json({
							error: errorHandler(err)
						});
					}
					tags = t;
					// return all blogs categories tags
					res.json({ blogs, blogcategories, tags, size: blogs.length });
				});
			});
		});
};

/**
 * This function fetches one blog
 * @param {*} req 
 * @param {*} res 
 * @returns object
 * @reviewed NO
 */
exports.read = (req, res) => {
	const slug = req.params.slug.toLowerCase();

	Blog.findOne({ slug })
		.populate('blogcategories', '_id name slug')
		.populate('tags', '_id name slug')
		.select('_id title body slug mtitle mdesc blogcategories tags postedBy image createdAt updatedAt')
		.exec((err, data) => {
			if (err) {
				return res.json({
					error: errorHandler(err)
				});
			}
			res.json(data);
		});
};

/**
 * This function removes one blog
 * @param {*} req 
 * @param {*} res 
 * @returns object
 * @reviewed NO
 */

exports.remove = (req, res) => {
	const slug = req.params.slug.toLowerCase();

	Blog.findOneAndRemove({ slug }).exec((err, data) => {
		if (err) {
			return res.json({
				error: errorHandler(err)
			});
		}

		res.json({
			sucess: true
		});
	});
};

/**
 * This function updates one blog
 * @param {*} req 
 * @param {*} res 
 * @returns object
 * @reviewed NO
 */
exports.update = (req, res) => {
	const slug = req.params.slug.toLowerCase();

	Blog.findOne({ slug }).exec((err, oldBlog) => {
		if (err) {
			return res.status(400).json({
				error: errorHandler(err)
			});
		}

		let form = new formidable.IncomingForm();

		form.keepExtensions = true;

		form.parse(req, (err, fields, files) => {
			if (err) {
				return res.json({
					error:
						'Un problème est survenu. Assurez vous de remplir tous les champs et de selectionner au moins une catégorie et une étiquette pour votre article'
				});
			}

			// slug shouldn't change because of the previous slug will be indexed by google and we don't want to change that. So no generation of new slug
			let slugBeforeMerge = oldBlog.slug;
			oldBlog = _.merge(oldBlog, fields);
			oldBlog.slug = slugBeforeMerge;

			const { body, mdesc, blogcategories, tags } = fields;

			if (body) {
				oldBlog.excerpt = smartTrim(body, 320, ' ', ' ...');
				oldBlog.mdesc = stripHtml(body.substring(0, 160)).result;
			}
			if (blogcategories) {
				oldBlog.blogcategories = blogcategories.split(',');
			}

			if (tags) {
				oldBlog.tags = tags.split(',');
			}

			oldBlog.save((err, result) => {
				if (err) {
					return res.status(400).json({
						error: errorHandler(err)
					});
				}

				res.json(result);
			});
		});
	});
};

/**
 * This function fetches all related blogs
 * @param {*} req 
 * @param {*} res 
 * @returns object
 * @reviewed NO
 */
exports.listRelated = (req, res) => {
	let limit = req.body.limit ? parseInt(req.body.limit) : 4;

	const { _id, blogcategories } = req.body.blog;

	Blog.find({ _id: { $ne: _id }, blogcategories: { $in: blogcategories } })
		.limit(limit)
		.populate('blogcategories', '_id name slug')
		.populate('tags', '_id name slug')
		.select('title slug excerpt blogcategories tags image createdAt updatedAt')
		.exec((err, blogs) => {
			if (err) {
				return res.status(400).json({
					error: 'Aucun blog trouvé'
				});
			}

			res.json(blogs);
		});
};
