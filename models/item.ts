import mongoose from 'mongoose';
const { ObjectId } = mongoose.Schema.Types;

interface ItemAttrs {
	title: string;
	slug: string;
	reference_email: string;
	description: string;
	category: mongoose.ObjectId;
	subs: mongoose.ObjectId[];
	images: Array<any>;
	ratings: Array<any>;
	provider_name: string;
	provider_phone_number: string;
	provider_address: string;
	zone_island: string;
	zone_name: string;
	reference_zone: mongoose.ObjectId;
	item_approval_status: string;
	item_type: string;
	isRecommended: boolean;
}

interface ItemDoc extends mongoose.Document {
	title: string;
	slug: string;
	reference_email: string;
	description: string;
	category: mongoose.ObjectId;
	subs: mongoose.ObjectId[];
	images: Array<string>;
	ratings: Array<any>;
	provider_name: string;
	provider_phone_number: string;
	provider_address: string;
	zone_island: string;
	zone_name: string;
	reference_zone: mongoose.ObjectId;
	item_approval_status: string;
	item_type: string;
	isRecommended: boolean;
}

interface ItemModel extends mongoose.Model<ItemDoc> {
	build(attrs: ItemAttrs): ItemDoc;
}

const itemSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			trim: true,
			required: true,
			maxlength: 32,
			text: true
		},
		slug: {
			type: String,
			unique: true,
			lowercase: true,
			index: true
		},
		referent_email: {
			type: String,
			lowercase: true,
			required: true
		},
		description: {
			type: String,
			required: true,
			maxlength: 2000,
			text: true
		},
		category: {
			type: ObjectId,
			ref: 'Category',
			required: true
		},
		subs: [
			{
				type: ObjectId,
				ref: 'Sub'
			}
		],
		images: {
			type: Array,
			required: true
		},
		ratings: [
			{
				star: Number,
				postedBy: { type: ObjectId, ref: 'User' },
				comment: String
			}
		],
		provider_name: {
			type: String,
			required: true
		},
		provider_phone_number: {
			type: String,
			required: true
		},
		provider_address: {
			type: String,
			required: true,
			lowercase: true,
			maxlength: 2000
		},
		zone_island: {
			type: String,
			required: [ true, 'Island name is required' ],
			enum: [ 'ndzuwani', 'ngazidja', 'mwali' ]
		},
		zone_name: {
			type: String,
			required: true
		},
		reference_zone: {
			type: ObjectId,
			ref: 'Zone',
			required: true
		},
		item_approval_status: {
			type: String,
			default: 'on hold',
			enum: [ 'on hold', 'approved', 'rejected' ]
		},
		item_type: {
			type: String,
			enum: [ 'product', 'service' ],
			required: true
		},
		isRecommended: {
			type: Boolean,
			default: false
		}
	},
	{ timestamps: true }
);

itemSchema.statics.build = (attrs: ItemAttrs) => {
	return new Item(attrs);
};

const Item = mongoose.model<ItemDoc, ItemModel>('Item', itemSchema);

export { Item };
