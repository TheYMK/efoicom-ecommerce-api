import mongoose from 'mongoose';

interface BlogcategoryAttrs {
	name: string;
	slug: string;
}

interface BlogcategoryDoc extends mongoose.Document {
	name: string;
	slug: string;
}

interface BlogcategoryModel extends mongoose.Model<BlogcategoryDoc> {
	build(attrs: BlogcategoryAttrs): BlogcategoryDoc;
}

const blogcategorySchema = new mongoose.Schema(
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

blogcategorySchema.statics.build = (attrs: BlogcategoryAttrs) => {
	return new Blogcategory(attrs);
};

const Blogcategory = mongoose.model<BlogcategoryDoc, BlogcategoryModel>('Blogcategory', blogcategorySchema);

export { Blogcategory };
