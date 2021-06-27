import express from 'express';
const router = express.Router();

// middlewares
import { authCheck } from '../../middlewares/auth';

// controllers
import { upload, remove } from '../../controllers/cloudinary';

// routes
router.post('/api/uploadimages', authCheck, upload);
router.post('/api/removeimage', authCheck, remove);

export { router as cloudinaryRouter };
