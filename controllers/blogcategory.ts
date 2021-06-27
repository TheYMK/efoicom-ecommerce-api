import { Blogcategory } from '../models/blogcategory';
import slugify from 'slugify';
import { Request, Response } from 'express';
import { BadRequestError } from '../errors/bad-request-error';
import { NotFoundError } from '../errors/not-found-error';

export const create = (req: Request, res: Response) => {
	const { name } = req.body;
	const slug = slugify(name).toLowerCase();

	const blogcategory = Blogcategory.build({ name, slug });

	blogcategory.save((err, data) => {
		if (err) {
			throw new BadRequestError('Failed to create a blog category');
		}

		return res.json(data);
	});
};

export const list = async (req: Request, res: Response) => {
	try {
		const blogcategories = await Blogcategory.find({}).exec();

		if (!blogcategories) {
			throw new NotFoundError('Blog categories not found');
		}

		return res.json(blogcategories);
	} catch (err) {
		console.log(`====> Failed to get all blog categories: {Error: ${err}} `);
		throw new BadRequestError('Failed to get all blog categories');
	}
};

export const read = async (req: Request, res: Response) => {
	try {
		const slug = req.params.slug.toLowerCase();

		const blogcategory = await Blogcategory.findOne({ slug }).exec();

		if (!blogcategory) {
			throw new NotFoundError('Blog category not found');
		}

		return res.json(blogcategory);
	} catch (err) {
		console.log(`====> Failed to get one blog category: {Error: ${err}} `);
		throw new BadRequestError('Failed to get one blog category');
	}
};

export const remove = async (req: Request, res: Response) => {
	try {
		const removedBlogCategory = await Blogcategory.findOneAndRemove({ slug: req.params.slug }).exec();

		return res.json({
			success: true
		});
	} catch (err) {
		console.log(`====> Failed to remove one blog category: {Error: ${err}} `);
		throw new BadRequestError('Failed to remove one blog category');
	}
};
