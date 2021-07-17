import { Request, Response } from "express";
import { Blog, BlogDoc } from "../models/blog";
import { Blogcategory } from "../models/blogcategory";
import { Tag } from "../models/tag";
import formidable, { IncomingForm } from "formidable";
import slugify from "slugify";
import { stripHtml } from "string-strip-html";
import _, { AnyKindOfDictionary } from "lodash";
import fs from "fs";
import { smartTrim } from "../helpers/blog";
import { User } from "../models/user";
import { BadRequestError } from "../errors/bad-request-error";
import { NotFoundError } from "../errors/not-found-error";
import { getJSDocImplementsTags } from "typescript";

export const create = async (req: Request, res: Response) => {
    const form = new IncomingForm({ keepExtensions: true });

    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.json({
                error: "Un problème est survenu",
            });
        }

        const { title, blogcategories, body, tags, image }: any = fields;
        console.log("blogcategories", blogcategories);
        console.log("tags", tags);

        if (!title || !title.length) {
            return res.json({
                error: "Un titre est requis",
            });
        }

        if (!body || body.length < 100) {
            return res.json({
                error: `Le contenu de cet article est trop court`,
            });
        }

        if (!blogcategories || blogcategories.length === 0) {
            return res.json({
                error: `Au moins une categorie est requise`,
            });
        }

        if (!tags || tags.length === 0) {
            return res.json({
                error: `Au moins une étiquette est requise`,
            });
        }

        if (!image || !image.length) {
            return res.json({
                error: "Une image est requise",
            });
        }

        const blog = Blog.build({
            title: title,
            body: body,
            image: image,
            excerpt: smartTrim(body, 320, " ", " ..."),
            slug: slugify(title as string).toLowerCase(),
            mtitle: `${title} | ${process.env.APP_NAME}`,
            mdesc: stripHtml(body.substring(0, 160)).result,
            postedBy: "Administrateur",
            photo: null,
        });

        // const blog = new Blog();
        // blog.title = title as string;
        // blog.body = body;
        // blog.image = image as string;
        // blog.excerpt = smartTrim(body, 320, ' ', ' ...');
        // blog.slug = slugify(title as string).toLowerCase();
        // blog.mtitle = `${title} | ${process.env.APP_NAME}`;
        // blog.mdesc = stripHtml(body.substring(0, 160) as any).result;
        // blog.postedBy = 'Administrateur';

        // blog categories and tags
        let arrayOfCategories = blogcategories && blogcategories.split(",");
        let arrayOfTags = tags && tags.split(",");

        blog.save((err, result) => {
            if (err) {
                console.log(err);
                throw new BadRequestError(
                    "Error occured during attempt to save a new blog"
                );
            }

            Blog.findByIdAndUpdate(
                result._id,
                { $push: { blogcategories: arrayOfCategories } },
                { new: true }
            ).exec((err, result) => {
                if (err) {
                    console.log(err);
                    throw new BadRequestError(
                        "Error occured during attempt to save a new blog here"
                    );
                } else {
                    if (!result) {
                        throw new NotFoundError("No result was found");
                    }

                    Blog.findByIdAndUpdate(
                        result._id,
                        { $push: { tags: arrayOfTags } },
                        { new: true }
                    ).exec((err, result) => {
                        if (err) {
                            console.log(err);
                            throw new BadRequestError(
                                "Error occured during attempt to save a new blog"
                            );
                        } else {
                            res.json(result);
                        }
                    });
                }
            });
        });
    });
};

export const list = async (req: Request, res: Response) => {
    Blog.find({})
        .populate("blogcategories", "_id name slug")
        .populate("tags", "_id name slug")
        .select(
            "_id title slug excerpt blogcategories tags postedBy createdAt image updatedAt"
        )
        .sort({ createdAt: -1 })
        .exec((err, data) => {
            if (!data) {
                throw new NotFoundError("No blog was found");
            }

            if (err) {
                throw new BadRequestError("Failed to find all blogs");
            }

            res.json(data);
        });
};

export const getTotalCount = async (req: Request, res: Response) => {
    try {
        const totalCount = await Blog.find({}).estimatedDocumentCount().exec();

        res.json(totalCount);
    } catch (err) {
        console.log(`====> ${err}`);
        throw new BadRequestError("Failed to get total count of blog");
    }
};

export const listAllBlogsCategoriesTags = (req: Request, res: Response) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 10;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    let blogs: any;
    let blogcategories: any;
    let tags: any;

    Blog.find({})
        .populate("blogcategories", "_id name slug")
        .populate("tags", "_id name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
            "_id title slug excerpt blogcategories tags postedBy image createdAt updatedAt"
        )
        .exec((err, data) => {
            if (err) {
                throw new BadRequestError("Failed to fetch blogs");
            }
            blogs = data; // blogs
            // get all categories
            Blogcategory.find({}).exec((err, c) => {
                if (err) {
                    throw new BadRequestError(
                        `Failed to fetch blog categories`
                    );
                }
                blogcategories = c; // categories
                // get all tags
                Tag.find({}).exec((err, t) => {
                    if (err) {
                        throw new BadRequestError(`Failed to fetch tags`);
                    }
                    tags = t;
                    // return all blogs categories tags
                    res.json({
                        blogs,
                        blogcategories,
                        tags,
                        size: blogs.length,
                    });
                });
            });
        });
};

export const read = (req: Request, res: Response) => {
    const slug = req.params.slug.toLowerCase();

    Blog.findOne({ slug })
        .populate("blogcategories", "_id name slug")
        .populate("tags", "_id name slug")
        .select(
            "_id title body slug mtitle mdesc blogcategories tags postedBy image createdAt updatedAt"
        )
        .exec((err, data) => {
            if (err) {
                throw new BadRequestError(`Failed to fetch a blog`);
            }
            res.json(data);
        });
};

export const remove = (req: Request, res: Response) => {
    const slug = req.params.slug.toLowerCase();

    Blog.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            throw new BadRequestError(`Failed to remove a blog`);
        }

        res.json({
            sucess: true,
        });
    });
};

export const update = (req: Request, res: Response) => {
    const slug = req.params.slug.toLowerCase();

    Blog.findOne({ slug }).exec((err, oldBlog) => {
        if (err) {
            throw new BadRequestError(`Failed to fetch a blog`);
        }

        let form = new formidable.IncomingForm({ keepExtensions: true });

        form.parse(req, (err, fields, files) => {
            if (err) {
                return res.json({
                    error: "Un problème est survenu. Assurez vous de remplir tous les champs et de selectionner au moins une catégorie et une étiquette pour votre article",
                });
            }

            if (!oldBlog) {
                throw new NotFoundError("Blog not found");
            }

            // slug shouldn't change because of the previous slug will be indexed by google and we don't want to change that. So no generation of new slug
            let slugBeforeMerge = oldBlog.slug;
            oldBlog = _.merge(oldBlog, fields) as any;

            if (!oldBlog) {
                throw new NotFoundError("Blog not found");
            }
            oldBlog.slug = slugBeforeMerge;

            const { body, mdesc, blogcategories, tags } = fields as any;

            if (body) {
                oldBlog.excerpt = smartTrim(body, 320, " ", " ...");
                oldBlog.mdesc = stripHtml(body.substring(0, 160)).result;
            }
            if (blogcategories) {
                oldBlog.blogcategories = blogcategories.split(",");
            }

            if (tags) {
                oldBlog.tags = tags.split(",");
            }

            oldBlog.save((err, result) => {
                if (err) {
                    throw new BadRequestError("Failed to save updated blog");
                }

                res.json(result);
            });
        });
    });
};

export const listRelated = (req: Request, res: Response) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 4;

    const { _id, blogcategories } = req.body.blog;

    Blog.find({ _id: { $ne: _id }, blogcategories: { $in: blogcategories } })
        .limit(limit)
        .populate("blogcategories", "_id name slug")
        .populate("tags", "_id name slug")
        .select(
            "title slug excerpt blogcategories tags image createdAt updatedAt"
        )
        .exec((err, blogs) => {
            if (err) {
                throw new BadRequestError("Failed to fetch a blog");
            }

            res.json(blogs);
        });
};

const handleBlogCategoryQuery = async (
    req: Request,
    res: Response,
    blogcategory: any
) => {
    try {
        if (blogcategory === "all") {
            const blogs = await Blog.find()
                .populate("blogcategories", "_id name slug")
                .populate("tags", "_id name slug")
                .sort({ createdAt: -1 })
                .exec();

            if (!blogs) {
                throw new NotFoundError("Blogs not found");
            }

            return res.json(blogs);
        } else {
            const blogs = await Blog.find({ blogcategories: blogcategory })
                .populate("blogcategories", "_id name slug")
                .populate("tags", "_id name slug")
                .sort({ createdAt: -1 })
                .exec();

            if (!blogs) {
                throw new NotFoundError("Blogs not found");
            }

            return res.json(blogs);
        }
    } catch (err) {
        console.log(
            `====> Failed to fetch blogs based on categories selection: {Error: ${err}}`
        );
        throw new BadRequestError(
            "Failed to fetch blogs based on categories selection"
        );
    }
};

export const blogSearchFilters = async (req: Request, res: Response) => {
    const { blogcategory } = req.body;

    if (blogcategory) {
        await handleBlogCategoryQuery(req, res, blogcategory);
    }
};
