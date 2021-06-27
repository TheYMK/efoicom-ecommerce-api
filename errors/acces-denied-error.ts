import { CustomError } from './custom-error';

export class AccessDeniedError extends CustomError {
	statusCode = 403;

	constructor(public message: string) {
		super(message);

		Object.setPrototypeOf(this, AccessDeniedError.prototype);
	}

	serializeErrors() {
		return [ { message: this.message } ];
	}
}
