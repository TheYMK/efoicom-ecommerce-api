import mongoose from 'mongoose';

interface TagAttrs {
	name: string;
	slug: string;
}

interface TagDoc extends mongoose.Document {
	name: string;
	slug: string;
}

interface TagModel extends mongoose.Model<TagDoc> {
	build(attrs: TagAttrs): TagDoc;
}

const tagSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: true,
			max: 32
		},
		slug: {
			type: String,
			unique: true,
			index: true
		}
	},
	{ timestamps: true }
);

tagSchema.statics.build = (attrs: TagAttrs) => {
	return new Tag(attrs);
};

const Tag = mongoose.model<TagDoc, TagModel>('Tag', tagSchema);

export { Tag };
