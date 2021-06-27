import mongoose from 'mongoose';

interface ZoneAttrs {
	name: string;
	slug: string;
	island: string;
}

interface ZoneDoc extends mongoose.Document {
	name: string;
	slug: string;
	island: string;
}

interface ZoneModel extends mongoose.Model<ZoneDoc> {
	build(attrs: ZoneAttrs): ZoneDoc;
}

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
			enum: [ 'ndzuwani', 'ngazidja', 'mwali' ]
		}
	},
	{ timestamps: true }
);

zoneSchema.statics.build = (attrs: ZoneAttrs) => {
	return new Zone(attrs);
};

const Zone = mongoose.model<ZoneDoc, ZoneModel>('Zone', zoneSchema);

export { Zone };
