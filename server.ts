import { app } from './app';

import mongoose from 'mongoose';

const start = async () => {
	if (!process.env.DATABASE_CLOUD) {
		throw new Error('DATABASE_CLOUD uri must be defined');
	}

	try {
		await mongoose.connect(process.env.DATABASE_CLOUD!, {
			useNewUrlParser: true,
			useCreateIndex: true,
			useFindAndModify: false,
			useUnifiedTopology: true
		});

		console.log('====> EFOICOM DATABASE CONNECTED');
	} catch (err) {
		console.log(`====> DATABASE ERROR: ${err}`);
	}

	const port = process.env.PORT || 8000;

	app.listen(port, () => {
		console.log(`====> EFOICOM server running on port ${port}...`);
	});
};

start();
