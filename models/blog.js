const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const blogSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			trim: true,
			min: 3,
			max: 160,
			required: true
		},
		slug: {
			type: String,
			unique: true,
			index: true
		},
		body: {
			type: {},
			required: true,
			min: 200,
			max: 2000000
		},
		excerpt: {
			type: String,
			max: 1000
		},
		mtitle: {
			type: String
		},
		mdesc: {
			type: {}
		},
		photo: {
			data: Buffer,
			contentType: String
		},
		image: {
			type: String
			// required: true
		},
		blogcategories: [ { type: ObjectId, ref: 'Blogcategory', required: true } ],
		tags: [ { type: ObjectId, ref: 'Tag', required: true } ],
		postedBy: {
			type: String
		}
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);
