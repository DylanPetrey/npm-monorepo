import { Request } from 'express';

export enum HttpErrorCodes {
	BAD_REQUEST = 400,
	UNAUTHORIZED = 401,
	FORBIDDEN = 403,
	NOT_FOUND = 404,
	METHOD_NOT_ALLOWED = 405,
	METHOD_NOT_ACCEPTABLE = 406,
	REQUEST_TIMEOUT = 408,
	PRECONDITION_FAILED = 412,
	UNPROCESSABLE_ENTITY = 422,
	TOO_MANY_REQUESTS = 429,
	INTERNAL_SERVER_ERROR = 500,
	BAD_GATEWAY = 502,
	SERVICE_UNAVAILABLE = 503,
	GATEWAY_TIMEOUT = 504
}

export interface ErrorModel {
	description: string;
	error?: Error;
}

export interface RequestErrorModel<Code extends keyof typeof HttpErrorCodes> extends ErrorModel {
	code: HttpErrorCodes;
	message: Code;
	request?: {
		method: Request['method'];
		url: Request['url'];
		headers: Request['headers'];
		params: Request['params'];
		query: Request['query'];
		body: Request['body'];
	};
}

export abstract class CustomError<
	T extends ErrorModel | RequestErrorModel<keyof typeof HttpErrorCodes>
> extends Error {
	protected abstract error: T;
	protected abstract isOperational: boolean; // Shuts down the server if false

	protected constructor(message?: string) {
		super(message);
		Object.setPrototypeOf(this, new.target.prototype);
		this.name = this.constructor.name;
		Error.captureStackTrace(this);
	}

	abstract getError(): T;
}

export interface CreateErrorParams {
	description: string;
	error?: Error;
	log?: boolean;
	isOperational?: boolean;
}

export class APIError extends CustomError<ErrorModel> {
	error: ErrorModel;
	isOperational: boolean;
	log: boolean;

	constructor(params: CreateErrorParams) {
		super(params.description);

		this.log = params.log ?? true;
		this.isOperational = params.isOperational ?? true;

		this.error = {
			description: params.description,
			error: params.error
		};
	}

	getError(): ErrorModel {
		return this.error;
	}

	protected setError(error: ErrorModel): void {
		this.error = error;
	}
}

export interface RequestErrorConstructorParams<Code extends keyof typeof HttpErrorCodes>
	extends CreateErrorParams {
	type: Code;
}

interface RequestErrorInternalParams<Code extends keyof typeof HttpErrorCodes> {
	type: Code;
}

export class RequestError<Code extends keyof typeof HttpErrorCodes> extends APIError {
	protected request?: {
		method: Request['method'];
		url: Request['url'];
		headers: Request['headers'];
		params: Request['params'];
		query: Request['query'];
		body: Request['body'];
	};

	constructor(params: RequestErrorConstructorParams<Code>) {
		super(params);

		const newError: RequestErrorModel<Code> = {
			code: HttpErrorCodes[params.type],
			message: params.type,
			description: this.error.description,
			error: this.error.error
		};

		this.setError(newError);
	}

	static fromAPIError<Code extends keyof typeof HttpErrorCodes>(
		apiError: APIError,
		params: RequestErrorInternalParams<Code>
	): RequestError<Code> {
		const newParams: RequestErrorConstructorParams<Code> = {
			type: params.type,
			description: apiError.getError().description,
			error: apiError.getError().error
		};

		return new RequestError(newParams);
	}

	getError(): RequestErrorModel<Code> {
		return this.error as RequestErrorModel<Code>;
	}

	setRequest(request: Request) {
		const currentError = this.getError();
		const newError: RequestErrorModel<Code> = {
			...currentError,
			request: {
				method: request.method,
				url: request.url,
				headers: {
					...request.headers,
					'x-gateway-key': undefined
				},
				params: request.params,
				query: request.query,
				body: request.body
			}
		};

		this.setError(newError);
	}

	protected setError(error: ErrorModel) {
		super.setError(error);
	}
}
