// ============================================================
//                  Importations
// ============================================================
import express from 'express';
import 'express-async-errors';

import morgan from 'morgan';
import cors from 'cors';
require('dotenv').config();
import { readdirSync } from 'fs';
import { NotFoundError } from './errors/not-found-error';
import { errorHandler } from './middlewares/error-handler';
import { userRouter } from './routes/api/user';
import { authRouter } from './routes/api/auth';
import { itemRouter } from './routes/api/item';
import { zoneRouter } from './routes/api/zone';
import { tagRouter } from './routes/api/tag';
import { subRouter } from './routes/api/sub';
import { formRouter } from './routes/api/form';
import { cloudinaryRouter } from './routes/api/cloudinary';
import { categoryRouter } from './routes/api/category';
import { blogcategoryRouter } from './routes/api/blogcategory';
import { blogRouter } from './routes/api/blog';

// app initialization
const app = express();

// ============================================================
//                   Middlewares
// ============================================================
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(cors());

// ============================================================
//                      Route Middlewares
// ============================================================
app.use(authRouter);
app.use(userRouter);
app.use(itemRouter);
app.use(zoneRouter);
app.use(tagRouter);
app.use(subRouter);
app.use(formRouter);
app.use(cloudinaryRouter);
app.use(categoryRouter);
app.use(blogcategoryRouter);
app.use(blogRouter);

// readdirSync('./routes/api').map((route) => app.use('/api', require('./routes/api/' + route))); // another way of reading all files from the routes folder

app.all('*', async (req, res) => {
	throw new NotFoundError('Route not found');
});

app.use(errorHandler);

export { app };
