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
			default: 'Customer'
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
			required: [ true, 'Island name is required' ]
		},
		city: {
			type: String,
			required: [ true, 'City name is required' ]
		},
		address: {
			type: String,
			required: [ true, 'Address is required' ]
		}
	},
	{ timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
