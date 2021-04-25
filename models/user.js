const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [ true, 'Name is required' ]
		},
		email: {
			type: String,
			unique: true,
			lowercase: true,
			required: [ true, 'Email is required' ],
			index: true
		},
		phone_number: {
			type: String,
			required: [ true, 'Phone number is required' ]
		},
		role: {
			type: String,
			default: 'customer',
			enum: [ 'customer', 'referent', 'sysadmin' ]
		},
		cart: {
			type: Array,
			default: []
		},
		wishlist: [
			{
				type: ObjectId,
				ref: 'Item'
			}
		],
		island: {
			type: String,
			lowercase: true,
			required: [ true, 'Island name is required' ],
			enum: [ 'anjouan', 'ngazidja', 'mohéli' ]
		},
		city: {
			type: String,
			required: [ true, 'City name is required' ],
			lowercase: true
		},
		address: {
			type: String,
			required: [ true, 'Address is required' ],
			lowercase: true
		},
		reference_zone: {
			type: ObjectId,
			ref: 'Zone'
		},
		referent_account_approval: {
			type: String,
			default: 'on hold',
			enum: [ 'on hold', 'approved', 'rejected' ]
		}
	},
	{ timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
