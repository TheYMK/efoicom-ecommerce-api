import { Category } from '../models/category';
import slugify from 'slugify';
import { Sub } from '../models/sub';
import { Request, Response } from 'express';
import { BadRequestError } from '../errors/bad-request-error';
import { NotFoundError } from '../errors/not-found-error';
import mongoose from 'mongoose';

export const createCategory = async (req: Request, res: Response) => {
	const { category_name, category_images } = req.body;
	try {
		const newCategory = Category.build({
			name: category_name,
			slug: slugify(category_name),
			images: category_images
		});

		await newCategory.save();

		res.json(newCategory);
	} catch (err) {
		console.log(`====> Failed to create a category: {Error: ${err}} `);
		throw new BadRequestError('Failed to create a category');
	}
};

export const listCategories = async (req: Request, res: Response) => {
	try {
		const categories = await Category.find({}).sort({ createdAt: -1 });

		if (!categories) {
			throw new NotFoundError('Categories not found');
		}

		res.json(categories);
	} catch (err) {
		console.log(`====> Failed to get all categories: {Error: ${err}} `);
		res.status(400).json({
			error: 'Failed to get all categories'
		});
	}
};

export const removeCategory = async (req: Request, res: Response) => {
	try {
		const removedCategory = await Category.findOneAndRemove({ slug: req.params.slug }).exec();

		if (!removedCategory) {
			throw new NotFoundError('No category found');
		}

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

export const updateCategory = async (req: Request, res: Response) => {
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
		throw new BadRequestError('Failed to update category');
	}
};

export const getCategorySubs = async (req: Request, res: Response) => {
	try {
		const id: any = req.params.id;

		const allCatSubs = await Sub.find({ parent: id });

		res.json(allCatSubs);
	} catch (err) {
		console.log(`====> Failed to get category subs: {Error: ${err}} `);
		throw new BadRequestError('Failed to get category subs');
	}
};
