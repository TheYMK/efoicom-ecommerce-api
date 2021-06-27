import { Request, Response } from 'express';
import { Item } from '../models/item';
import slugify from 'slugify';
import { User } from '../models/user';
import { Zone } from '../models/zone';
import { NotAuthorizedError } from '../errors/not-authorized-error';
import { NotFoundError } from '../errors/not-found-error';
import { BadRequestError } from '../errors/bad-request-error';
import { ResourceApiResponse } from 'cloudinary';

export const createItem = async (req: Request, res: Response) => {
	if (!req.user) {
		throw new NotAuthorizedError();
	}

	try {
		req.body.slug = slugify(req.body.title);
		req.body.referent_email = req.user.email;
		const foundReferent = await User.findOne({ email: req.user.email }).exec();

		if (!foundReferent) {
			throw new NotFoundError('Referent user not found');
		}

		req.body.reference_zone = foundReferent.reference_zone;

		const foundZone = await Zone.findById(foundReferent.reference_zone);

		if (!foundZone) {
			throw new NotFoundError('Zone not found');
		}

		req.body.zone_island = foundZone.island;
		req.body.zone_name = foundZone.name;

		const newItem = Item.build(req.body);
		await newItem.save();

		res.json(newItem);
	} catch (err) {
		console.log(`====> Failed to create an item: {Error: ${err}} `);
		throw new BadRequestError('Failed to create an item');
	}
};

export const getItemsCountsForReferent = async (req: Request, res: Response) => {
	if (!req.user) {
		throw new NotAuthorizedError();
	}

	try {
		const totalOnHoldItems = await Item.find({
			$and: [ { referent_email: req.user.email }, { item_approval_status: 'on hold' } ]
		}).countDocuments();

		const totalApprovedProducts = await Item.find({
			$and: [ { referent_email: req.user.email }, { item_approval_status: 'approved' }, { item_type: 'product' } ]
		}).countDocuments();

		const totalApprovedServices = await Item.find({
			$and: [ { referent_email: req.user.email }, { item_approval_status: 'approved' }, { item_type: 'service' } ]
		}).countDocuments();

		res.json({
			totalOnHoldItems,
			totalApprovedProducts,
			totalApprovedServices
		});
	} catch (err) {
		console.log(`====> Failed to get items counts: {Error: ${err}} `);
		throw new BadRequestError('Failed to get items counts');
	}
};

export const getItemsCountsByReferent = async (req: Request, res: Response) => {
	try {
		const totalApprovedProducts = await Item.find({
			$and: [
				{ referent_email: req.body.referent_email },
				{ item_approval_status: 'approved' },
				{ item_type: 'product' }
			]
		}).countDocuments();

		const totalApprovedServices = await Item.find({
			$and: [
				{ referent_email: req.body.referent_email },
				{ item_approval_status: 'approved' },
				{ item_type: 'service' }
			]
		}).countDocuments();

		res.json({
			totalApprovedProducts,
			totalApprovedServices
		});
	} catch (err) {
		console.log(`====> Failed to get items counts: {Error: ${err}} `);
		throw new BadRequestError('Failed to get items counts');
	}
};

export const getAllItemsForReferent = async (req: Request, res: Response) => {
	if (!req.user) {
		throw new NotAuthorizedError();
	}
	let productslimit = req.body.productslimit ? parseInt(req.body.productslimit) : 10;
	let productskip = req.body.productskip ? parseInt(req.body.productskip) : 0;

	let serviceslimit = req.body.serviceslimit ? parseInt(req.body.serviceslimit) : 10;
	let serviceskip = req.body.serviceskip ? parseInt(req.body.serviceskip) : 0;

	try {
		const allApprovedProducts = await Item.find({
			$and: [ { referent_email: req.user.email }, { item_approval_status: 'approved' }, { item_type: 'product' } ]
		})
			.sort({ createdAt: -1 })
			.skip(productskip)
			.limit(productslimit)
			.exec();

		const allApprovedServices = await Item.find({
			$and: [ { referent_email: req.user.email }, { item_approval_status: 'approved' }, { item_type: 'service' } ]
		})
			.sort({ createdAt: -1 })
			.skip(serviceskip)
			.limit(serviceslimit)
			.exec();

		if (!allApprovedProducts || !allApprovedServices) {
			throw new NotFoundError('Approved products and services not found');
		}

		res.json({
			allApprovedProducts,
			products_size: allApprovedProducts.length,
			allApprovedServices,
			services_size: allApprovedServices.length
		});
	} catch (err) {
		console.log(`====> Failed to get all items for referent: {Error: ${err}} `);
		throw new BadRequestError('Failed to get all items for referent');
	}
};

export const getAllItems = async (req: Request, res: Response) => {
	try {
		const allApprovedProducts = await Item.find({
			$and: [ { item_approval_status: 'approved' }, { item_type: 'product' } ]
		})
			.populate('category')
			.populate('subs')
			.populate('reference_zone')
			.sort({ createdAt: -1 })
			.exec();

		const allApprovedServices = await Item.find({
			$and: [ { item_approval_status: 'approved' }, { item_type: 'service' } ]
		})
			.populate('category')
			.populate('subs')
			.populate('reference_zone')
			.sort({ createdAt: -1 })
			.exec();

		if (!allApprovedProducts || !allApprovedServices) {
			throw new NotFoundError('All approved products and services not found');
		}

		res.json({
			allApprovedProducts,
			allApprovedServices
		});
	} catch (err) {
		console.log(`====> Failed to get all items: {Error: ${err}} `);
		throw new BadRequestError('Failed to get all items');
	}
};

export const getSingleItem = async (req: Request, res: Response) => {
	try {
		const item = await Item.findOne({ slug: req.params.slug }).populate('category').populate('subs').exec();

		if (!item) {
			throw new NotFoundError('Item not found');
		}

		res.json(item);
	} catch (err) {
		console.log(`====> Failed to get single item: {Error: ${err}} `);
		throw new BadRequestError('Failed to get single item');
	}
};

export const updateItem = async (req: Request, res: Response) => {
	try {
		if (req.body.title) {
			req.body.slug = slugify(req.body.title);
		}

		const updatedItem = await Item.findOneAndUpdate({ slug: req.params.slug }, req.body, { new: true }).exec();

		res.json(updatedItem);
	} catch (err) {
		console.log(`====> Failed to update single item: {Error: ${err}} `);
		throw new BadRequestError('Failed to update single item');
	}
};

export const removeItem = async (req: Request, res: Response) => {
	try {
		const removedItem = await Item.findOneAndRemove({ slug: req.params.slug });

		res.json(removedItem);
	} catch (err) {
		console.log(`====> Failed to delete single item: {Error: ${err}} `);
		throw new BadRequestError('Failed to delete single item');
	}
};

export const getTotalItemsRequests = async (req: Request, res: Response) => {
	try {
		const itemsRequests = await Item.find({
			item_approval_status: 'on hold'
		})
			.populate('category')
			.populate('subs')
			.populate('reference_zone')
			.sort({ createdAt: -1 })
			.exec();

		if (!itemsRequests) {
			throw new NotFoundError('Item requests not found');
		}

		res.json(itemsRequests);
	} catch (err) {
		console.log(`====> Failed to get item requests: {Error: ${err}}`);
		throw new BadRequestError('Failed to get item requests');
	}
};

export const updateItemApprovalStatus = async (req: Request, res: Response) => {
	try {
		const { item_approval_status } = req.body;

		//1. if approved, find the item using the slug parameter and updated its status
		if (item_approval_status === 'approved') {
			const updatedItem = await Item.findOneAndUpdate(
				{ slug: req.params.slug },
				{ item_approval_status: item_approval_status },
				{ new: true }
			).exec();

			return res.json({ success: true });
		}

		if (item_approval_status === 'rejected') {
			const removedItem = await Item.findOneAndRemove({ slug: req.params.slug });

			return res.json({ success: true });
		}
	} catch (err) {
		console.log(`====> Failed to updated item approval status: {Error: ${err}}`);
		throw new BadRequestError('Failed to updated item approval status');
	}
};

export const recommendItem = async (req: Request, res: Response) => {
	try {
		const updatedItem = await Item.findOneAndUpdate(
			{ slug: req.params.slug },
			{ isRecommended: true },
			{ new: true }
		);

		if (!updateItem) {
			throw new NotFoundError('Item not found');
		}

		res.json(updatedItem);
	} catch (err) {
		console.log(`====> Failed to updated item recommendation: {Error: ${err}}`);
		throw new BadRequestError('Failed to updated item recommendation');
	}
};

export const notRecommendItem = async (req: Request, res: Response) => {
	try {
		const updatedItem = await Item.findOneAndUpdate(
			{ slug: req.params.slug },
			{ isRecommended: false },
			{ new: true }
		);

		if (!updateItem) {
			throw new NotFoundError('Item not found');
		}

		res.json(updatedItem);
	} catch (err) {
		console.log(`====> Failed to updated item recommendation: {Error: ${err}}`);
		throw new BadRequestError('Failed to updated item recommendation');
	}
};

export const getAllRecommendedItems = async (req: Request, res: Response) => {
	try {
		const allRecommendedProducts = await Item.find({
			$and: [ { item_approval_status: 'approved' }, { item_type: 'product' }, { isRecommended: true } ]
		})
			.populate('category')
			.populate('subs')
			.populate('reference_zone')
			.sort({ createdAt: -1 })
			.limit(4)
			.exec();

		const allRecommendedServices = await Item.find({
			$and: [ { item_approval_status: 'approved' }, { item_type: 'service' }, { isRecommended: true } ]
		})
			.populate('category')
			.populate('subs')
			.populate('reference_zone')
			.sort({ createdAt: -1 })
			.limit(4)
			.exec();

		if (!allRecommendedProducts || !allRecommendedServices) {
			throw new NotFoundError('All recommended products and/or services not found');
		}

		res.json({
			allRecommendedProducts,
			allRecommendedServices
		});
	} catch (err) {
		console.log(`====> Failed to get all recommended items: {Error: ${err}}`);
		throw new BadRequestError('Failed to get all recommended items');
	}
};

export const getRelatedItems = async (req: Request, res: Response) => {
	try {
		const item = await Item.findById(req.params.item_id).exec();

		if (!item) {
			throw new NotFoundError('Item not found');
		}

		const relatedItems = await Item.find({ _id: { $ne: item._id }, category: item.category })
			.limit(4)
			.populate('category')
			.populate('subs')
			.populate('reference_zone')
			.exec();

		if (!relatedItems) {
			throw new NotFoundError('Related items not found');
		}

		res.json(relatedItems);
	} catch (err) {
		console.log(`====> Failed to get all related items: {Error: ${err}}`);
		throw new BadRequestError('Failed to get all related items');
	}
};

export const getAllProductsByCount = async (req: Request, res: Response) => {
	try {
		const allApprovedProducts = await Item.find({
			$and: [ { item_approval_status: 'approved' }, { item_type: 'product' } ]
		})
			.limit(parseInt(req.params.count))
			.populate('category')
			.populate('subs')
			.populate('reference_zone')
			.exec();

		// const allApprovedServices = await Item.find({
		// 	$and: [ { item_approval_status: 'approved' }, { item_type: 'service' } ]
		// })
		// 	.populate('category')
		// 	.populate('subs')
		// 	.exec();

		if (!allApprovedProducts) {
			throw new NotFoundError('Approved products not found');
		}

		res.json({
			allApprovedProducts
		});
	} catch (err) {
		console.log(`====> Failed to get all products by count: {Error: ${err}} `);
		throw new BadRequestError('Failed to get all products by count');
	}
};

export const getAllServicesByCount = async (req: Request, res: Response) => {
	try {
		const allApprovedServices = await Item.find({
			$and: [ { item_approval_status: 'approved' }, { item_type: 'service' } ]
		})
			.limit(parseInt(req.params.count))
			.populate('category')
			.populate('subs')
			.populate('reference_zone')
			.exec();

		if (!allApprovedServices) {
			throw new NotFoundError('Approved services not found');
		}

		res.json({
			allApprovedServices
		});
	} catch (err) {
		console.log(`====> Failed to get all services by count: {Error: ${err}} `);
		throw new BadRequestError('Failed to get all services by count');
	}
};

export const itemRating = async (req: Request, res: Response) => {
	if (!req.user) {
		throw new NotAuthorizedError();
	}
	const { star, comment } = req.body;
	try {
		const item = await Item.findById(req.params.item_id).exec();

		if (!item) {
			throw new NotFoundError('Item not found');
		}

		const user = await User.findOne({ email: req.user.email }).exec();

		if (!user) {
			throw new NotFoundError('User not found');
		}

		// check if currently logged in user have already added rating to this item
		let existingRatingObject = item.ratings.find((rating) => rating.postedBy.toString() === user._id.toString());

		if (!existingRatingObject) {
			throw new NotFoundError('Existing rating object not found');
		}

		// if user haven't left rating yet push new one
		if (existingRatingObject === undefined) {
			const addedRating = await Item.findByIdAndUpdate(
				item._id,
				{
					$push: { ratings: { star: star, comment: comment, postedBy: user._id } }
				},
				{ new: true }
			).exec();

			res.json(addedRating);
		} else {
			// if user have already left rating, update existing one
			const updatedRating = await Item.updateOne(
				{ ratings: { $elemMatch: existingRatingObject } },
				{ $set: { 'ratings.$.star': star, 'ratings.$.comment': comment } },
				{ new: true }
			).exec();

			res.json(updatedRating);
		}
	} catch (err) {
		console.log(`====> Failed to update the rating of an item: {Error: ${err}}`);
		throw new BadRequestError('Failed to update the rating of an item');
	}
};

// Search / Filters

const handleSearchQuery = async (req: Request, res: Response, query: any) => {
	try {
		// $text because in our model title and description have text set to true
		if (query.island_choice === 'all') {
			const items = await Item.find({ $text: { $search: query.text } })
				.populate('category', '_id name')
				.populate('subs', '_id name')
				.populate('reference_zone')
				.exec();

			if (!items) {
				throw new NotFoundError('Items not found');
			}

			return res.json(items);
		} else {
			const items = await Item.find({
				$and: [ { $text: { $search: query.text } }, { zone_island: query.island_choice } ]
			})
				.populate('category', '_id name')
				.populate('subs', '_id name')
				.populate('reference_zone')
				.exec();

			if (!items) {
				throw new NotFoundError('Items not found');
			}

			return res.json(items);
		}
	} catch (err) {
		console.log(`====> Failed to fetch items based on query search: {Error: ${err}}`);
		throw new BadRequestError('Failed to fetch items based on query search');
	}
};

const handleIslandQuery = async (req: Request, res: Response, island: any) => {
	try {
		if (island === 'allIslands') {
			const items = await Item.find({})
				.populate('category', '_id name')
				.populate('subs', '_id name')
				.populate('reference_zone')
				.sort({ createdAt: -1 })
				.exec();

			if (!items) {
				throw new NotFoundError('Items not found');
			}

			return res.json(items);
		} else {
			const items = await Item.find({ zone_island: island })
				.populate('category', '_id name')
				.populate('subs', '_id name')
				.populate('reference_zone')
				.sort({ createdAt: -1 })
				.exec();

			if (!items) {
				throw new NotFoundError('Items not found');
			}

			return res.json(items);
		}
	} catch (err) {
		console.log(`====> Failed to fetch items based on island selection: {Error: ${err}}`);
		throw new BadRequestError('Failed to fetch items based on island selection');
	}
};

const handleCategoryQuery = async (req: Request, res: Response, category: any) => {
	try {
		const items = await Item.find({ category: category })
			.populate('category', '_id name')
			.populate('subs', '_id name')
			.populate('reference_zone')
			.sort({ createdAt: -1 })
			.exec();

		if (!items) {
			throw new NotFoundError('Items not found');
		}

		return res.json(items);
	} catch (err) {
		console.log(`====> Failed to fetch items based on categories selection: {Error: ${err}}`);
		throw new BadRequestError('Failed to fetch items based on categories selection');
	}
};

const handleRatingQuery = async (req: Request, res: Response, rating: any) => {
	try {
		if (rating === '0') {
			const items = await Item.find({})
				.populate('category', '_id name')
				.populate('subs', '_id name')
				.populate('reference_zone')
				.sort({ createdAt: -1 })
				.exec();

			if (!items) {
				throw new NotFoundError('Items not found');
			}

			return res.json(items);
		} else {
			Item.aggregate([
				{
					$project: {
						document: '$$ROOT',
						floorAverage: {
							$floor: { $avg: '$ratings.star' }
						}
					}
				},
				{ $match: { floorAverage: parseInt(rating) } }
			]).exec((err, aggregate) => {
				if (err) {
					console.log(`====> AGGREGATE ERROR (Rating query): ${err}`);
					return res.status(400).json({
						error: 'AGGREGATE ERROR (Rating query)'
					});
				}
				console.log(aggregate);
				Item.find({ _id: aggregate })
					.populate('category', '_id name')
					.populate('subs', '_id name')
					.exec((err, items) => {
						if (err) {
							console.log(`====> ITEM AGGREGATE ERROR: ${err}`);
							throw new BadRequestError('ITEM AGGREGATE ERROR');
						}

						if (!items) {
							throw new NotFoundError('Items not found');
						}

						return res.json(items);
					});
			});
		}
	} catch (err) {
		console.log(`====> Failed to fetches items based on rating selection: {Error: ${err}}`);
		throw new BadRequestError('Failed to fetches items based on rating selection');
	}
};

const handleSubQuery = async (req: Request, res: Response, sub: any) => {
	try {
		const items = await Item.find({ subs: sub })
			.populate('category', '_id name')
			.populate('subs', '_id name')
			.populate('reference_zone')
			.sort({ createdAt: -1 })
			.exec();

		if (!items) {
			throw new NotFoundError('Items not found');
		}

		return res.json(items);
	} catch (err) {
		console.log(`====> Failed to fetches items based on categories selection: {Error: ${err}}`);
		throw new BadRequestError('Failed to fetches items based on categories selection');
	}
};

const handleTypeQuery = async (req: Request, res: Response, type: any) => {
	try {
		if (type === 'all') {
			const items = await Item.find({})
				.populate('category', '_id name')
				.populate('subs', '_id name')
				.populate('reference_zone')
				.sort({ createdAt: -1 })
				.exec();

			if (!items) {
				throw new NotFoundError('Items not found');
			}

			return res.json(items);
		} else {
			const items = await Item.find({ item_type: type })
				.populate('category', '_id name')
				.populate('subs', '_id name')
				.populate('reference_zone')
				.sort({ createdAt: -1 })
				.exec();

			if (!items) {
				throw new NotFoundError('Items not found');
			}

			return res.json(items);
		}
	} catch (err) {
		console.log(`====> Failed to fetches items based on item type selection: {Error: ${err}}`);
		throw new BadRequestError('Failed to fetches items based on item type selection');
	}
};

const handleZoneQuery = async (req: Request, res: Response, zone: any) => {
	try {
		if (zone === 'allzones') {
			const items = await Item.find({})
				.populate('category', '_id name')
				.populate('subs', '_id name')
				.populate('reference_zone')
				.sort({ createdAt: -1 })
				.exec();

			if (!items) {
				throw new NotFoundError('Items not found');
			}

			return res.json(items);
		} else {
			const items = await Item.find({ reference_zone: zone })
				.populate('category', '_id name')
				.populate('subs', '_id name')
				.populate('reference_zone')
				.sort({ createdAt: -1 })
				.exec();

			if (!items) {
				throw new NotFoundError('Items not found');
			}

			return res.json(items);
		}
	} catch (err) {
		console.log(`====> Failed to fetches items based on item zone selection: {Error: ${err}}`);
		throw new BadRequestError('Failed to fetches items based on item zone selection');
	}
};

export const searchFilters = async (req: Request, res: Response) => {
	const { query, island, category, rating, sub, type, zone } = req.body;

	if (query) {
		await handleSearchQuery(req, res, query);
	}

	if (island) {
		await handleIslandQuery(req, res, island);
	}

	if (category) {
		console.log(category);
		await handleCategoryQuery(req, res, category);
	}

	if (rating) {
		await handleRatingQuery(req, res, rating);
	}

	if (sub) {
		await handleSubQuery(req, res, sub);
	}

	if (type) {
		await handleTypeQuery(req, res, type);
	}

	if (zone) {
		await handleZoneQuery(req, res, zone);
	}
};
