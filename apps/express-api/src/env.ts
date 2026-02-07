import { z } from 'zod';
import * as dotenv from 'dotenv'
import { APIError } from './utils/error.js';
import { Logger } from './utils/logger.js';

dotenv.config()

const logger = new Logger("setEnv")

const baseEnvSchema = z.object({
	ENV: z.enum(['development', 'uat', 'production']),
	PORT: z.string().regex(/^\d+$/).transform(Number),
	LOG_LEVEL: z.enum(['debug', 'warn', 'error', 'info']),
	DATABASE_URL: z.url()
});

const developmentEnvSchema = baseEnvSchema.extend({
	ENV: z.literal('development'),
	// DEV_USER_ID: z.string().min(1)
});

const productionEnvSchema = baseEnvSchema.extend({
	ENV: z.literal('production'),
});

type Env = z.infer<typeof developmentEnvSchema> | z.infer<typeof productionEnvSchema>;

// Validate the environment variables
const validateEnv = (): Env => {
	const nodeEnv = process.env.ENV;

	try {
		logger.debug('Parsing env');
		if (nodeEnv === 'development') {
			return developmentEnvSchema.parse(process.env);
		} else if (nodeEnv === 'production') {
			return productionEnvSchema.parse(process.env);
		} else {
			throw new APIError({
				description: 'Invalid environment type',
				isOperational: false
			});
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			const missingVars = error.issues.map((issue) => issue.path.join('.'));
			logger.error('❌ Invalid environment variables:', missingVars.join(', '));
			throw new APIError({
				description: 'Invalid environment variables',
				isOperational: false
			});
		}
		throw new APIError({
			description: 'Unknown Error',
			error: error as Error,
			isOperational: false
		});
	}
};

export const env = validateEnv() as Readonly<Env>;

logger.info('✅ Environment variables validated successfully')
