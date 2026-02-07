import { NextFunction, Request, Response } from 'express';

export const responseHeaderMiddleware = (
	request: Request,
	response: Response,
	next: NextFunction
) => {
	response.setHeader('X-Environment', process.env.NODE_ENV || 'development');
	return next();
};
