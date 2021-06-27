import { Tag } from '../models/tag';
import slugify from 'slugify';
import { Request, Response } from 'express';
import { BadRequestError } from '../errors/bad-request-error';
import { NotFoundError } from '../errors/not-found-error';

export const create = async (req: Request, res: Response) => {
	const { name } = req.body;
	const slug = slugify(name).toLowerCase();

	const tag = Tag.build({
		name,
		slug
	});

	tag.save((err, data) => {
		if (err) {
			throw new BadRequestError('Failed to create a tag');
		}

		return res.json(data);
	});
};

export const list = async (req: Request, res: Response) => {
	try {
		const tags = await Tag.find({}).exec();

		if (!tags) {
			throw new NotFoundError('Tags not found');
		}

		return res.json(tags);
	} catch (err) {
		console.log(`====> Failed to get all blog tags: {Error: ${err}} `);
		throw new BadRequestError('Failed to get all blog tags');
	}
};

export const read = async (req: Request, res: Response) => {
	try {
		const slug = req.params.slug.toLowerCase();

		const tag = await Tag.findOne({ slug }).exec();
		if (!tag) {
			throw new NotFoundError('Tag not found');
		}
		return res.json(tag);
	} catch (err) {
		console.log(`====> Failed to get one blog tag: {Error: ${err}} `);
		throw new BadRequestError('Failed to get one blog tag');
	}
};

export const remove = async (req: Request, res: Response) => {
	try {
		const removedBlogTag = await Tag.findOneAndRemove({ slug: req.params.slug }).exec();

		return res.json({
			success: true
		});
	} catch (err) {
		console.log(`====> Failed to remove one blog tag: {Error: ${err}} `);
		throw new BadRequestError('Failed to remove one blog tag');
	}
};
