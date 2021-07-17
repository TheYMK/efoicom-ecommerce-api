import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

interface BlogAttrs {
    title: string | string[];
    slug: string;
    body: any;
    excerpt: string;
    mtitle: string;
    mdesc: any;
    photo: string | null;
    image: string | string[];
    postedBy: string;
}

export interface BlogDoc extends mongoose.Document {
    title: string;
    slug: string;
    body: any;
    excerpt: string;
    mtitle: string;
    mdesc: any;
    photo: string | null;
    image: string | string[];
    blogcategories: mongoose.ObjectId[];
    tags: mongoose.ObjectId[];
    postedBy: string;
}

interface BlogModel extends mongoose.Model<BlogDoc> {
    build(attrs: BlogAttrs): BlogDoc;
}

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            min: 3,
            max: 160,
            required: true,
        },
        slug: {
            type: String,
            unique: true,
            index: true,
        },
        body: {
            type: {},
            required: true,
            min: 200,
            max: 2000000,
        },
        excerpt: {
            type: String,
            max: 1000,
        },
        mtitle: {
            type: String,
        },
        mdesc: {
            type: {},
        },
        photo: {
            data: Buffer,
            contentType: String,
        },
        image: {
            type: String,
            // required: true
        },
        blogcategories: [
            { type: ObjectId, ref: "Blogcategory", required: true },
        ],
        tags: [{ type: ObjectId, ref: "Tag", required: true }],
        postedBy: {
            type: String,
        },
    },
    { timestamps: true }
);

blogSchema.statics.build = (attrs: BlogAttrs) => {
    return new Blog(attrs);
};

const Blog = mongoose.model<BlogDoc, BlogModel>("Blog", blogSchema);

export { Blog };
