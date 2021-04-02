const Item = require('../models/item');
const slugify = require('slugify');
const User = require('../models/user');

exports.createItem = async (req, res) => {
	try {
		req.body.slug = slugify(req.body.title);
		req.body.referent_email = req.user.email;
		const newItem = await new Item(req.body).save();
		res.json(newItem);
	} catch (err) {
		console.log(`====> Failed to create an item: {Error: ${err}} `);
		res.status(400).json({
			error: 'Failed to create an item'
		});
	}
};

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

// For general use
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

exports.getAllItems = async (req, res) => {
	try {
		const allApprovedProducts = await Item.find({
			$and: [ { item_approval_status: 'approved' }, { item_type: 'product' } ]
		})
			.populate('category')
			.populate('subs')
			.exec();

		const allApprovedServices = await Item.find({
			$and: [ { item_approval_status: 'approved' }, { item_type: 'service' } ]
		})
			.populate('category')
			.populate('subs')
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

exports.getTotalItemsRequests = async (req, res) => {
	try {
		const itemsRequests = await Item.find({
			item_approval_status: 'on hold'
		})
			.populate('category')
			.populate('subs')
			.exec();

		res.json(itemsRequests);
	} catch (err) {
		console.log(`====> Failed to get items request: {Error: ${err}}`);
		res.status(400).json({
			error: 'Failed to get items request'
		});
	}
};

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
