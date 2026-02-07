import * as dotenv from 'dotenv'
import express from "express"
import type { Express } from "express"
import morgan from "morgan"
import { APIError } from './utils/error.js'
import { Logger } from './utils/logger.js';
import { errorHandler } from './utils/error-handler.js'
import './env';

dotenv.config();

const logger = new Logger("initializeApp")

const app: Express = express()
	.use(morgan('dev'))
	.use(express.json())
	.get('/status', (req, res) => {
		return res.json({ ok: true }); })

process.on('unhandledRejection', async (reason: Error) => {
	if (reason instanceof APIError && !reason.isOperational) {
		logger.error('Critical Error in unhandledRejection Handling:', reason);
		await errorHandler(reason).finally(() => process.exit(1)); // Exit since it's an unhandled rejection and we can't recover.
	}

	await errorHandler(reason).catch((error) => {
		logger.error('Error in unhandledRejection Handling:', error);
		throw new APIError({
			description: 'Error in unhandledRejection Handling',
			error: error,
			isOperational: false
		});
	});
});

process.on('uncaughtException', async (error: Error) => {
	logger.error('Error in uncaughtException Handling:', error);
	if (error instanceof APIError && !error.isOperational) {
		logger.error('Critical Error in unhandledRejection Handling:', error);
		await errorHandler(error).finally(() => process.exit(1)); // Exit since it's an unhandled rejection and we can't recover.
	}

	await errorHandler(error).catch((error) => {
		logger.error('Error in unhandledRejection Handling:', error);
		throw new APIError({
			description: 'Error in unhandledRejection Handling',
			error: error,
			isOperational: false
		});
	});

	if (error instanceof APIError && !error.isOperational) {
		logger.error('Critical Error in uncaughtException Handling:', error);
		process.exit(1);
	}
});

export default app
