import { NextFunction, Request, Response } from 'express';
import { APIError, RequestError } from '../utils/error.js';
import { Logger } from '../utils/logger.js';

const logger = new Logger("errorMiddleware")

export const ErrorMiddleware = async (
	error: Error,
	request: Request,
	response: Response,
	next: NextFunction
) => {
	let apiError;
	if (error instanceof RequestError) {
		apiError = error;
	} else if (error instanceof APIError) {
		apiError = RequestError.fromAPIError(error, { type: 'INTERNAL_SERVER_ERROR' });
	} else {
		apiError = new RequestError({
			type: 'INTERNAL_SERVER_ERROR',
			description: 'Unknown error',
			error: error
		});
	}

	if (process.env.NODE_ENV !== 'production') {
		apiError.setRequest(request);
	}

	response.status(apiError.getError().code).json(apiError.getError());

	if (process.env.NODE_ENV === 'production') {
		apiError.setRequest(request);
	}

	if (!apiError.isOperational) {
		logger.error('Error Handler: Restarting Server', apiError.getError());
		return next(error);
	}

	if (apiError.log) {
		await errorHandler(apiError);
	}
	return;
};


const errorHandler = async (error: Error) => {
	let currentError;
	if (error instanceof APIError) currentError = error;
	else
		currentError = new APIError({
			description: 'Unknown error',
			error: error
		});

	if (currentError.log)
		logger.error(currentError.getError().description, currentError.getError());
};
