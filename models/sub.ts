import mongoose from 'mongoose';
const { ObjectId } = mongoose.Schema.Types;

interface SubAttrs {
	name: string;
	slug: string;
	parent: mongoose.ObjectId;
}

interface SubDoc extends mongoose.Document {
	name: string;
	slug: string;
	parent: mongoose.ObjectId;
}

interface SubModel extends mongoose.Model<SubDoc> {
	build(attrs: SubAttrs): SubDoc;
}

const subSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: 'Name is required',
			minlength: [ 2, 'Sub name is too short' ],
			maxlength: [ 32, 'Sub name is too long' ]
		},
		slug: {
			type: String,
			unique: true,
			lowercase: true,
			index: true
		},
		parent: {
			type: ObjectId,
			ref: 'Category',
			required: true
		}
	},
	{ timestamps: true }
);

subSchema.statics.build = (attrs: SubAttrs) => {
	return new Sub(attrs);
};

const Sub = mongoose.model<SubDoc, SubModel>('Sub', subSchema);

export { Sub };
