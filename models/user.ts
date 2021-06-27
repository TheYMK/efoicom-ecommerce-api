import mongoose from 'mongoose';
const { ObjectId } = mongoose.Schema.Types;

interface UserAttrs {
	name: string;
	email: string;
	phone_number: string;
	role: string;
	wishlist: mongoose.ObjectId[];
	island: string;
	city: string;
	address: string;
	reference_zone: mongoose.ObjectId | null;
	referent_account_approval: string | null;
}

interface UserDoc extends mongoose.Document {
	name: string;
	email: string;
	phone_number: string;
	role: string;
	wishlist: mongoose.ObjectId[];
	island: string;
	city: string;
	address: string;
	reference_zone: mongoose.ObjectId;
	referent_account_approval: string;
}

interface UserModel extends mongoose.Model<UserDoc> {
	build(attrs: UserAttrs): UserDoc;
}

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [ true, 'Name is required' ]
		},
		email: {
			type: String,
			unique: true,
			lowercase: true,
			required: [ true, 'Email is required' ],
			index: true
		},
		phone_number: {
			type: String,
			required: [ true, 'Phone number is required' ]
		},
		role: {
			type: String,
			default: 'customer',
			enum: [ 'customer', 'referent', 'sysadmin' ]
		},
		wishlist: [
			{
				type: ObjectId,
				ref: 'Item'
			}
		],
		island: {
			type: String,
			lowercase: true,
			required: [ true, 'Island name is required' ],
			enum: [ 'ndzuwani', 'ngazidja', 'mwali' ]
		},
		city: {
			type: String,
			required: [ true, 'City name is required' ],
			lowercase: true
		},
		address: {
			type: String,
			required: [ true, 'Address is required' ],
			lowercase: true
		},
		reference_zone: {
			type: ObjectId,
			ref: 'Zone'
		},
		referent_account_approval: {
			type: String,
			default: 'on hold',
			enum: [ 'on hold', 'approved', 'rejected', null ]
		}
	},
	{ timestamps: true }
);

userSchema.statics.build = (attrs: UserAttrs) => {
	return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
