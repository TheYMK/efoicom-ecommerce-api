import mongoose from 'mongoose';

interface CategoryAttrs {
	name: string;
	slug: string;
	images: Array<string>;
}

interface CategoryDoc extends mongoose.Document {
	name: string;
	slug: string;
	images: Array<string>;
}

interface CategoryModel extends mongoose.Model<CategoryDoc> {
	build(attrs: CategoryAttrs): CategoryDoc;
}

const categorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: 'Category name is required',
			minlength: [ 2, 'Category name too short' ],
			maxlength: [ 32, 'Category name too long' ]
		},
		images: {
			type: Array,
			required: true
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

categorySchema.statics.build = (attrs: CategoryAttrs) => {
	return new Category(attrs);
};

const Category = mongoose.model<CategoryDoc, CategoryModel>('Category', categorySchema);

export { Category };
