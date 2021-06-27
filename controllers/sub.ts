import { Sub } from '../models/sub';
import slugify from 'slugify';
import { Request, Response } from 'express';
import { BadRequestError } from '../errors/bad-request-error';
import { NotFoundError } from '../errors/not-found-error';

export const create = async (req: Request, res: Response) => {
	const { name, parent } = req.body;

	try {
		const newSub = Sub.build({
			name: name,
			parent: parent,
			slug: slugify(name)
		});

		await newSub.save();

		res.json(newSub);
	} catch (err) {
		console.log(`====> Failed to create a sub-category: {Error: ${err}} `);
		throw new BadRequestError('Failed to create a sub-category');
	}
};

export const listSubs = async (req: Request, res: Response) => {
	try {
		const allSubs = await Sub.find({}).sort({ createdAt: -1 });

		if (!allSubs) {
			throw new NotFoundError('Sub categories not found');
		}

		res.json(allSubs);
	} catch (err) {
		console.log(`====> Failed to fetch all sub-categories: {Error: ${err}} `);
		throw new BadRequestError('Failed to fetch all sub-categories');
	}
};

export const removeSub = async (req: Request, res: Response) => {
	try {
		const removedSub = await Sub.findOneAndRemove({ slug: req.params.slug });

		res.json(removedSub);
	} catch (err) {
		console.log(`====> Failed to remove sub-category: {Error: ${err}} `);
		throw new BadRequestError('Failed to remove sub-category');
	}
};

export const updateSub = async (req: Request, res: Response) => {
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
		throw new BadRequestError('Failed to update sub-category');
	}
};
