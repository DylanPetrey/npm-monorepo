import { Pool } from 'pg'
import { promises as fs } from 'fs'
import {
	Kysely,
	Migrator,
	PostgresDialect,
	FileMigrationProvider,
} from 'kysely'
import { DB } from '../src/types/database.js'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { Logger } from '../src/utils/logger.js'
import { env } from "../src/env.js"

const logger = new Logger("migrateUp")

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Get the migration folder path - handles both source and compiled locations
// When running from dist, go up to project root, then into database/migrations
const migrationFolder = __dirname.includes('dist')
	? path.join(__dirname, '..', '..', 'database', 'migrations')
	: path.join(__dirname, 'migrations')

async function migrateUp() {
	if (!env.DATABASE_URL) {
		throw new Error('DATABASE_URL environment variable is not set')
	}

	const db = new Kysely<DB>({
		dialect: new PostgresDialect({
			pool: new Pool({
				connectionString: env.DATABASE_URL,
			}),
		}),
	})

	const migrator = new Migrator({
		db,
		provider: new FileMigrationProvider({
			fs,
			path,
			// This needs to be an absolute path.
			migrationFolder: path.resolve(migrationFolder),
		}),
	})

	const { error, results } = await migrator.migrateUp()

	results?.forEach((it) => {
		if (it.status === 'Success') {
			logger.info(`migration "${it.migrationName}" was executed successfully`)
		} else if (it.status === 'Error') {
			logger.error(`failed to execute migration "${it.migrationName}"`)
		}
	})

	if (error) {
		logger.error('failed to migrate')
		logger.error(error)
		process.exit(1)
	}

	await db.destroy()
}

migrateUp()
