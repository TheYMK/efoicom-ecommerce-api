import { Request, Response, NextFunction } from 'express';
import { AccessDeniedError } from '../errors/acces-denied-error';
import { NotAuthorizedError } from '../errors/not-authorized-error';
import { NotFoundError } from '../errors/not-found-error';
import { admin } from '../firebase';
import { User } from '../models/user';

declare global {
	namespace Express {
		interface Request {
			user?: admin.auth.DecodedIdToken;
		}
	}
}

export const authCheck = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const firebaseUser = await admin.auth().verifyIdToken(`${req.headers.authtoken}`);
		req.user = firebaseUser;
		next();
	} catch (err) {
		throw new NotAuthorizedError();
	}
};

// the above middleware will be apply before this one. So we will already have the user under req.user
export const adminCheck = async (req: Request, res: Response, next: NextFunction) => {
	if (!req.user) {
		throw new NotAuthorizedError();
	}

	const { email } = req.user;

	const adminUser = await User.findOne({ email: email });

	if (!adminUser) {
		throw new NotFoundError('Admin user not found');
	}

	if (adminUser.role !== 'sysadmin') {
		throw new AccessDeniedError('Access denied. Admin resource.');
	} else {
		next();
	}
};

export const adminAndReferentCheck = async (req: Request, res: Response, next: NextFunction) => {
	if (!req.user) {
		throw new NotAuthorizedError();
	}
	const { email } = req.user;

	const user = await User.findOne({ email: email });

	if (!user) {
		throw new NotFoundError('Admin/Referent user not found');
	}

	if (user.role === 'sysadmin' || user.role === 'referent') {
		next();
	} else {
		throw new AccessDeniedError('Access denied. Admin and Referent resource');
	}
};

export const referentCheck = async (req: Request, res: Response, next: NextFunction) => {
	if (!req.user) {
		throw new NotAuthorizedError();
	}

	const { email } = req.user;

	const referentUser = await User.findOne({ email: email });

	if (!referentUser) {
		throw new NotFoundError('Referent user not found');
	}

	if (referentUser.role !== 'referent') {
		res.status(403).json({
			err: 'Referent resource. Access denied'
		});
	} else {
		next();
	}
};

// might be suse
export const customerCheck = async (req: Request, res: Response, next: NextFunction) => {
	if (!req.user) {
		throw new NotAuthorizedError();
	}

	const { email } = req.user;

	const customerUser = await User.findOne({ email: email });

	if (!customerUser) {
		throw new NotFoundError('Customer user not found');
	}

	if (customerUser.role !== 'customer') {
		res.status(403).json({
			err: 'Customer resource. Access denied'
		});
	} else {
		next();
	}
};
