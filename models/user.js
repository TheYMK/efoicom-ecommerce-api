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
			required: [ true, 'Email is required' ],
			index: true
		},
		phone_number: {
			type: Number,
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
				ref: 'Product'
			}
		],
		island: {
			type: String,
			required: [ true, 'Island name is required' ],
			enum: [ 'anjouan', 'ngazidja', 'mohéli' ]
		},
		city: {
			type: String,
			required: [ true, 'City name is required' ]
		},
		address: {
			type: String,
			required: [ true, 'Address is required' ]
		},
		reference_zone: {
			type: String
			// enum: [ 'zone1', 'zone2', 'zone3', 'zone4', 'zone5', 'zone6', 'zone7' ]
		},
		referent_account_approval: {
			type: String,
			default: 'on hold',
			enum: [ 'on hold', 'approved', 'declined' ]
		}
	},
	{ timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
