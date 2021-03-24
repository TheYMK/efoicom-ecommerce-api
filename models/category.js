const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: 'Category name is required',
			minlength: [ 2, 'Category name too short' ],
			maxlength: [ 32, 'Category name too long' ]
		},
		slug: {
			type: String,
			unique: true,
			lowercase: true,
			index: true
		}
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
