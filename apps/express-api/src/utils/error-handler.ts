import { Logger } from "./logger";
import { APIError } from "./error";


const logger = new Logger("initializeApp")

export const errorHandler = async (error: Error) => {
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
