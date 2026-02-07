import { DB } from './types/database.js'
import { Pool } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'
import { APIError } from './utils/error.js';
import { Logger } from './utils/logger.js';
import { env } from './env.js';

const logger = new Logger("database")

const dialect = new PostgresDialect({
	pool: new Pool({
		connectionString: env.DATABASE_URL, // This gets validated by the env object
	})
})

export const db = new Kysely<DB>({
	dialect,
	log(event): void {
		if (event.level === 'query' && env.ENV === 'development') {
			logger.trace(event.query.sql)
			logger.trace(event.query.parameters)
			logger.trace('Query took: ' + event.queryDurationMillis.toFixed(2) + 'ms')
		}
		if (event.level === 'error' && env.ENV === 'development') {
			logger.error(event.error)
		}
	}
})
