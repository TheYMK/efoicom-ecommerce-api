const Item = require('../models/item');
const slugify = require('slugify');
const User = require('../models/user');
const Zone = require('../models/zone');

/**
 * This function creates an item
 * @param {*} req 
 * @param {*} res
 * @returns a new item object
 * @reviewed YES
 */
exports.createItem = async (req, res) => {
	try {
		req.body.slug = slugify(req.body.title);
		req.body.referent_email = req.user.email;
		const foundReferent = await User.findOne({ email: req.user.email }).exec();

		req.body.reference_zone = foundReferent.reference_zone;

		const foundZone = await Zone.findById(foundReferent.reference_zone);

		req.body.zone_island = foundZone.island;
		req.body.zone_name = foundZone.name;

		const newItem = await new Item(req.body).save();
		res.json(newItem);
	} catch (err) {
		console.log(`====> Failed to create an item: {Error: ${err}} `);
		res.status(400).json({
			error: 'Failed to create an item'
		});
	}
};

/**
 * This function fetches the total count of on hold items, approved products and approved services
 * @param {*} req 
 * @param {*} res
 * @returns a json object with document counts
 * @reviewed YES
 */
exports.getItemsCountsForReferent = async (req, res) => {
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
		res.status(400).json({
			error: 'Failed to get items counts'
		});
	}
};

/**
 * This function fetches the total count of approved products and approved services that belongs to a particular referent
 * @param {*} req 
 * @param {*} res
 * @returns a json object with document counts
 * @reviewed YES
 */
exports.getItemsCountsByReferent = async (req, res) => {
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
		res.status(400).json({
			error: 'Failed to get items counts'
		});
	}
};

/**
 * This function fetches all items that belong to the logged in referent user
 * @param {*} req 
 * @param {*} res
 * @returns an object containing an array of approved items and their array sizes
 * @reviewed YES
 */
exports.getAllItemsForReferent = async (req, res) => {
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

		res.json({
			allApprovedProducts,
			products_size: allApprovedProducts.length,
			allApprovedServices,
			services_size: allApprovedServices.length
		});
	} catch (err) {
		console.log(`====> Failed to get all items for referent: {Error: ${err}} `);
		res.status(400).json({
			error: 'Failed to get all items for referent'
		});
	}
};

/**
 * This function fetches all approved items
 * @param {*} req 
 * @param {*} res
 * @returns an object containing an array of approved items
 * @reviewed YES
 */
exports.getAllItems = async (req, res) => {
	try {
		const allApprovedProducts = await Item.find({
			$and: [ { item_approval_status: 'approved' }, { item_type: 'product' } ]
		})
			.populate('category')
			.populate('subs')
			.populate('reference_zone')
			.exec();

		const allApprovedServices = await Item.find({
			$and: [ { item_approval_status: 'approved' }, { item_type: 'service' } ]
		})
			.populate('category')
			.populate('subs')
			.populate('reference_zone')
			.exec();

		res.json({
			allApprovedProducts,
			allApprovedServices
		});
	} catch (err) {
		console.log(`====> Failed to get all items: {Error: ${err}} `);
		res.status(400).json({
			error: 'Failed to get all items'
		});
	}
};

/**
 * This function fetches a single item
 * @param {*} req 
 * @param {*} res
 * @returns an item object
 * @reviewed YES
 */
exports.getSingleItem = async (req, res) => {
	try {
		const item = await Item.findOne({ slug: req.params.slug }).populate('category').populate('subs').exec();

		res.json(item);
	} catch (err) {
		console.log(`====> Failed to get single item: {Error: ${err}} `);
		res.status(400).json({
			error: 'Failed to get single item'
		});
	}
};

/**
 * This function updates a single item
 * @param {*} req 
 * @param {*} res
 * @returns the updated item object
 * @reviewed YES
 */
exports.updateItem = async (req, res) => {
	try {
		if (req.body.title) {
			req.body.slug = slugify(req.body.title);
		}

		const updatedItem = await Item.findOneAndUpdate({ slug: req.params.slug }, req.body, { new: true }).exec();

		res.json(updatedItem);
	} catch (err) {
		console.log(`====> Failed to update single item: {Error: ${err}} `);
		res.status(400).json({
			error: 'Failed to update single item'
		});
	}
};

/**
 * This function removes a single item
 * @param {*} req 
 * @param {*} res
 * @returns the removed item object
 * @reviewed YES
 */
exports.removeItem = async (req, res) => {
	try {
		const removedItem = await Item.findOneAndRemove({ slug: req.params.slug });

		res.json(removedItem);
	} catch (err) {
		console.log(`====> Failed to delete single item: {Error: ${err}} `);
		res.status(400).json({
			error: 'Failed to delete single item'
		});
	}
};

/**
 * This function total item with approval status set to on hold
 * @param {*} req 
 * @param {*} res
 * @returns an array of item objects
 * @reviewed YES
 */
exports.getTotalItemsRequests = async (req, res) => {
	try {
		const itemsRequests = await Item.find({
			item_approval_status: 'on hold'
		})
			.populate('category')
			.populate('subs')
			.populate('reference_zone')
			.exec();

		res.json(itemsRequests);
	} catch (err) {
		console.log(`====> Failed to get items request: {Error: ${err}}`);
		res.status(400).json({
			error: 'Failed to get items request'
		});
	}
};

/**
 * This function updates an item approval status.
 * If the approval status passed on the request body is equal to 'approved' the item will be updated.
 * If the approval status passed on the request body is equal to 'rejected' the item will be removed.
 * @param {*} req 
 * @param {*} res
 * @returns an object
 * @reviewed YES
 */
exports.updateItemApprovalStatus = async (req, res) => {
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
		res.status(400).json({
			error: 'Failed to updated item approval status'
		});
	}
};

/**
 * This function sets the recommendation of an item to true.
 * @param {*} req 
 * @param {*} res
 * @returns an object
 * @reviewed NO
 */
exports.recommendItem = async (req, res) => {
	try {
		const updatedItem = await Item.findOneAndUpdate(
			{ slug: req.params.slug },
			{ isRecommended: true },
			{ new: true }
		);
		res.json(updatedItem);
	} catch (err) {
		console.log(`====> Failed to updated item recommendation: {Error: ${err}}`);
		res.status(400).json({
			error: 'Failed to updated item approval status'
		});
	}
};

/**
 * This function sets the recommendation of an item to false.
 * @param {*} req 
 * @param {*} res
 * @returns an object
 * @reviewed NO
 */
exports.notRecommendItem = async (req, res) => {
	try {
		const updatedItem = await Item.findOneAndUpdate(
			{ slug: req.params.slug },
			{ isRecommended: false },
			{ new: true }
		);
		res.json(updatedItem);
	} catch (err) {
		console.log(`====> Failed to updated item recommendation: {Error: ${err}}`);
		res.status(400).json({
			error: 'Failed to updated item approval status'
		});
	}
};

/**
 * This function fetches all recommended items.
 * @param {*} req 
 * @param {*} res
 * @returns an object
 * @reviewed NO
 */
exports.getAllRecommendedItems = async (req, res) => {
	try {
		const allRecommendedProducts = await Item.find({
			$and: [ { item_approval_status: 'approved' }, { item_type: 'product' }, { isRecommended: true } ]
		})
			.populate('category')
			.populate('subs')
			.populate('reference_zone')
			.limit(4)
			.exec();

		const allRecommendedServices = await Item.find({
			$and: [ { item_approval_status: 'approved' }, { item_type: 'service' }, { isRecommended: true } ]
		})
			.populate('category')
			.populate('subs')
			.populate('reference_zone')
			.limit(4)
			.exec();

		res.json({
			allRecommendedProducts,
			allRecommendedServices
		});
	} catch (err) {
		console.log(`====> Failed to get all recommended items: {Error: ${err}}`);
		res.status(400).json({
			error: 'Failed to get all recommended items'
		});
	}
};

/**
 * This function fetches all related items.
 * @param {*} req 
 * @param {*} res
 * @returns an object
 * @reviewed NO
 */
exports.getRelatedItems = async (req, res) => {
	try {
		const item = await Item.findById(req.params.item_id).exec();

		const relatedItems = await Item.find({ _id: { $ne: item._id }, category: item.category })
			.limit(4)
			.populate('category')
			.populate('subs')
			.populate('reference_zone')
			.exec();

		res.json(relatedItems);
	} catch (err) {
		console.log(`====> Failed to get all related items: {Error: ${err}}`);
		res.status(400).json({
			error: 'Failed to get all related items'
		});
	}
};

/**
 * This function fetches all approved products by count
 * @param {*} req 
 * @param {*} res
 * @returns an object containing an array of approved products
 * @reviewed No
 */
exports.getAllProductsByCount = async (req, res) => {
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

		res.json({
			allApprovedProducts
		});
	} catch (err) {
		console.log(`====> Failed to get all products by count: {Error: ${err}} `);
		res.status(400).json({
			error: 'Failed to get all products by count'
		});
	}
};

/**
 * This function fetches all approved services by count
 * @param {*} req 
 * @param {*} res
 * @returns an object containing an array of approved services
 * @reviewed No
 */
exports.getAllServicesByCount = async (req, res) => {
	try {
		const allApprovedServices = await Item.find({
			$and: [ { item_approval_status: 'approved' }, { item_type: 'service' } ]
		})
			.limit(parseInt(req.params.count))
			.populate('category')
			.populate('subs')
			.populate('reference_zone')
			.exec();

		res.json({
			allApprovedServices
		});
	} catch (err) {
		console.log(`====> Failed to get all services by count: {Error: ${err}} `);
		res.status(400).json({
			error: 'Failed to get all services by count'
		});
	}
};

/**
 * This function updates the rating of an item
 * @param {*} req 
 * @param {*} res 
 * @returns an object
 * @reviewed No
 */
exports.itemRating = async (req, res) => {
	const { star, comment } = req.body;
	try {
		const item = await Item.findById(req.params.item_id).exec();
		const user = await User.findOne({ email: req.user.email }).exec();
		// check if currently logged in user have already added rating to this item
		let existingRatingObject = item.ratings.find((rating) => rating.postedBy.toString() === user._id.toString());

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
		console.log(`====> Failed to updates the rating of an item: {Error: ${err}}`);
		return res.status(400).json({
			error: 'Failed to updates the rating of an item'
		});
	}
};

// Search / Filters

const handleSearchQuery = async (req, res, query) => {
	try {
		// $text because in our model title and description have text set to true
		if (query.island_choice === 'all') {
			const items = await Item.find({ $text: { $search: query.text } })
				.populate('category', '_id name')
				.populate('subs', '_id name')
				.populate('reference_zone')
				.exec();

			return res.json(items);
		} else {
			const items = await Item.find({
				$and: [ { $text: { $search: query.text } }, { zone_island: query.island_choice } ]
			})
				.populate('category', '_id name')
				.populate('subs', '_id name')
				.populate('reference_zone')
				.exec();

			return res.json(items);
		}
	} catch (err) {
		console.log(`====> Failed to fetches items based on query search: {Error: ${err}}`);
		return res.status(400).json({
			error: 'Failed to fetches items based on query search'
		});
	}
};

const handleIslandQuery = async (req, res, island) => {
	try {
		if (island === 'allIslands') {
			const items = await Item.find({})
				.populate('category', '_id name')
				.populate('subs', '_id name')
				.populate('reference_zone')
				.sort({ createdAt: -1 })
				.exec();
			return res.json(items);
		} else {
			const items = await Item.find({ zone_island: island })
				.populate('category', '_id name')
				.populate('subs', '_id name')
				.populate('reference_zone')
				.sort({ createdAt: -1 })
				.exec();
			return res.json(items);
		}
	} catch (err) {
		console.log(`====> Failed to fetches items based on island selection: {Error: ${err}}`);
		return res.status(400).json({
			error: 'Failed to fetches items based on island selection'
		});
	}
};

const handleCategoryQuery = async (req, res, category) => {
	try {
		const items = await Item.find({ category: category })
			.populate('category', '_id name')
			.populate('subs', '_id name')
			.populate('reference_zone')
			.sort({ createdAt: -1 })
			.exec();

		return res.json(items);
	} catch (err) {
		console.log(`====> Failed to fetch items based on categories selection: {Error: ${err}}`);
		return res.status(400).json({
			error: 'Failed to fetch items based on categories selection'
		});
	}
};

const handleRatingQuery = async (req, res, rating) => {
	try {
		if (rating === '0') {
			const items = await Item.find({})
				.populate('category', '_id name')
				.populate('subs', '_id name')
				.populate('reference_zone')
				.sort({ createdAt: -1 })
				.exec();
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
							return res.status(400).json({
								error: 'ITEM AGGREGATE ERROR'
							});
						}

						return res.json(items);
					});
			});
		}
	} catch (err) {
		console.log(`====> Failed to fetches items based on island selection: {Error: ${err}}`);
		return res.status(400).json({
			error: 'Failed to fetches items based on island selection'
		});
	}
};

const handleSubQuery = async (req, res, sub) => {
	try {
		const items = await Item.find({ subs: sub })
			.populate('category', '_id name')
			.populate('subs', '_id name')
			.populate('reference_zone')
			.sort({ createdAt: -1 })
			.exec();

		return res.json(items);
	} catch (err) {
		console.log(`====> Failed to fetches items based on categories selection: {Error: ${err}}`);
		return res.status(400).json({
			error: 'Failed to fetches items based on categories selection'
		});
	}
};

const handleTypeQuery = async (req, res, type) => {
	try {
		if (type === 'all') {
			const items = await Item.find({})
				.populate('category', '_id name')
				.populate('subs', '_id name')
				.populate('reference_zone')
				.sort({ createdAt: -1 })
				.exec();
			return res.json(items);
		} else {
			const items = await Item.find({ item_type: type })
				.populate('category', '_id name')
				.populate('subs', '_id name')
				.populate('reference_zone')
				.sort({ createdAt: -1 })
				.exec();
			return res.json(items);
		}
	} catch (err) {
		console.log(`====> Failed to fetches items based on item type selection: {Error: ${err}}`);
		return res.status(400).json({
			error: 'Failed to fetches items based on item type selection'
		});
	}
};

const handleZoneQuery = async (req, res, zone) => {
	try {
		if (zone === 'allzones') {
			const items = await Item.find({})
				.populate('category', '_id name')
				.populate('subs', '_id name')
				.populate('reference_zone')
				.sort({ createdAt: -1 })
				.exec();
			return res.json(items);
		} else {
			const items = await Item.find({ reference_zone: zone })
				.populate('category', '_id name')
				.populate('subs', '_id name')
				.populate('reference_zone')
				.sort({ createdAt: -1 })
				.exec();
			return res.json(items);
		}
	} catch (err) {
		console.log(`====> Failed to fetches items based on item zone selection: {Error: ${err}}`);
		return res.status(400).json({
			error: 'Failed to fetches items based on item zone selection'
		});
	}
};

/**
 * This function fetches items based on filters
 * @param {*} req 
 * @param {*} res
 * @returns an array of item object
 * @reviewed NO
 */
exports.searchFilters = async (req, res) => {
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
