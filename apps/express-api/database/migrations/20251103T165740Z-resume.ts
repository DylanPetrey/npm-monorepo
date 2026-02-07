import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	// Migration code
	await db.schema
		.createTable('Resume')
		.addColumn("id", "uuid", (col) => col.defaultTo(sql`gen_random_uuid()`).primaryKey())
		.addColumn("created_at", "timestamptz", (col) =>
			col.defaultTo(sql`now()`).notNull()
		)
		.addColumn("updated_at", "timestamptz", (col) =>
			col.defaultTo(sql`now()`).notNull()
		)
		.addColumn("user_id", "uuid", (col) => col.notNull())
		.addForeignKeyConstraint(
			'resume_user_id_fk',
			['user_id'],
			'User',
			['id'],
			(cb) => cb.onDelete('restrict') // I will need to create an automated job to delete the resume's from s3 once I set that up
		)
		.addColumn("title", "text", (col) => col.notNull())
		.execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	// Migration code
	await db.schema.dropTable("Resume").execute()
}
