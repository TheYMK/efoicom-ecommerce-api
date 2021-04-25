const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const zoneSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			lowercase: true,
			required: 'Name is required',
			minlength: [ 2, 'Zone name is too short' ],
			maxlength: [ 100, 'Zone name is too long' ]
		},
		slug: {
			type: String,
			unique: true,
			lowercase: true,
			index: true
		},
		island: {
			type: String,
			required: [ true, 'Island name is required' ],
			enum: [ 'anjouan', 'ngazidja', 'mohéli' ]
		}
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Zone', zoneSchema);
