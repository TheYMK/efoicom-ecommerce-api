import { Request, Response } from 'express';

import cloudinary from 'cloudinary';

// config
cloudinary.v2.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log(`The config: ${cloudinary}`);

// image is sent in JSON format
export const upload = async (req: Request, res: Response) => {
	let result = await cloudinary.v2.uploader.upload(req.body.image, {
		public_id: `${Date.now()}`,
		resource_type: 'auto' // jpeg, png
	});

	res.json({
		public_id: result.public_id,
		url: result.secure_url
	});
};

export const remove = (req: Request, res: Response) => {
	let image_id = req.body.public_id;

	cloudinary.v2.uploader.destroy(image_id, (err: any, result: any) => {
		if (err) {
			console.log(err);
			return res.json({
				success: false
			});
		}

		res.json({
			success: true
		});
	});
};
