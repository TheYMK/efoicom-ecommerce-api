import { Zone } from '../models/zone';
import slugify from 'slugify';
import { Request, Response } from 'express';
import { NotFoundError } from '../errors/not-found-error';
import { BadRequestError } from '../errors/bad-request-error';

export const create = async (req: Request, res: Response) => {
	const { name, island } = req.body;

	// if (!name || !island) {
	// 	throw new NotFoundError('name and/or island not found in the request body');
	// }

	const slug = slugify(name);

	try {
		const newZone = Zone.build({
			name: name,
			slug: slug,
			island: island
		});

		await newZone.save();

		res.json(newZone);
	} catch (err) {
		console.log(`====> Failed to create a zone: {Error: ${err}} `);
		throw new BadRequestError('Failed to create a zone');
	}
};

export const list = async (req: Request, res: Response) => {
	try {
		const zones = await Zone.find({}).sort({ createdAt: -1 }).exec();

		if (!zones) {
			throw new NotFoundError('Reference zones not found');
		}

		return res.json(zones);
	} catch (err) {
		console.log(`====> Failed to fetches all reference zones: {Error: ${err}} `);
		throw new BadRequestError('Failed to fetch all reference zones');
	}
};

export const remove = async (req: Request, res: Response) => {
	try {
		const deletedZone = await Zone.findOneAndRemove({ slug: req.params.slug }).exec();

		return res.json(deletedZone);
	} catch (err) {
		console.log(`====> Failed to remove a reference zone: {Error: ${err}} `);
		throw new BadRequestError('Failed to remove a reference zone');
	}
};

export const update = async (req: Request, res: Response) => {
	const { name, island } = req.body;

	// if (!name || !island) {
	// 	return res.status(400).json({
	// 		error: 'Failed to update a reference zone'
	// 	});
	// }

	const slug = slugify(name);

	try {
		const updatedZone = await Zone.findOneAndUpdate(
			{ slug: req.params.slug },
			{ name, island, slug: slug },
			{ new: true }
		).exec();

		return res.json(updatedZone);
	} catch (err) {
		console.log(`====> Failed to update a reference zone: {Error: ${err}} `);
		throw new BadRequestError('Failed to update a reference zone');
	}
};
