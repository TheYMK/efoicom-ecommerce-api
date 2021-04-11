const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const itemSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			trim: true,
			required: true,
			maxlength: 32,
			text: true
		},
		slug: {
			type: String,
			unique: true,
			lowercase: true,
			index: true
		},
		referent_email: {
			type: String,
			lowercase: true,
			required: true
		},
		description: {
			type: String,
			required: true,
			maxlength: 2000,
			text: true
		},
		category: {
			type: ObjectId,
			ref: 'Category',
			required: true
		},
		subs: [
			{
				type: ObjectId,
				ref: 'Sub'
			}
		],
		images: {
			type: Array,
			required: true
		},
		ratings: [
			{
				star: Number,
				postedBy: { type: ObjectId, ref: 'User' },
				comment: String
			}
		],
		provider_name: {
			type: String,
			required: true
		},
		provider_phone_number: {
			type: String,
			required: true
		},
		provider_address: {
			type: String,
			required: true,
			maxlength: 2000
		},
		provider_island: {
			type: String,
			required: [ true, 'Island name is required' ],
			enum: [ 'anjouan', 'ngazidja', 'mohéli' ]
		},
		// availability: {
		// 	type: String,
		// 	required: true,
		// 	enum: [ 'en stock', 'non disponible' ]
		// },
		item_approval_status: {
			type: String,
			default: 'on hold',
			enum: [ 'on hold', 'approved', 'rejected' ]
		},
		item_type: {
			type: String,
			enum: [ 'product', 'service' ],
			required: true
		},
		isRecommended: {
			type: Boolean,
			default: false
		}
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Item', itemSchema);
