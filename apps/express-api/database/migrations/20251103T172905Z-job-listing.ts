import { Kysely, sql } from 'kysely'
export async function up(db: Kysely<any>): Promise<void> {
	// Migration code
	await db.schema
		.createType('job_type_enum')
		.asEnum(['full-time', 'part-time', 'contract', 'internship', 'unknown'])
		.execute();

	await db.schema
		.createType('remote_policy_enum')
		.asEnum(['on-site', 'hybrid', 'remote', 'unknown'])
		.execute();

	await db.schema
		.createType('experience_level_enum')
		.asEnum(['entry', 'mid', 'senior', 'lead', 'principal', 'unknown'])
		.execute();

	await db.schema
		.createTable('JobListing')
		.addColumn("id", "uuid", (col) => col.defaultTo(sql`gen_random_uuid()`).primaryKey())
		.addColumn("created_at", "timestamptz", (col) =>
			col.defaultTo(sql`now()`).notNull()
		)
		.addColumn("updated_at", "timestamptz", (col) =>
			col.defaultTo(sql`now()`).notNull()
		)
		.addColumn("user_id", "uuid", (col) => col.notNull())
		.addForeignKeyConstraint(
			'job_listing_user_id_fk',
			['user_id'],
			'User',
			['id'],
			(cb) => cb.onDelete('restrict') 
		)
		.addColumn("title", "varchar(64)", (col) => col.notNull())
		.addColumn("description", "text")
		.addColumn("company", "varchar(64)", (col) => col.notNull())
		.addColumn("salary_range", "varchar(64)", (col) => col.notNull())
		.addColumn("city", "varchar(64)", (col) => col.notNull())
		.addColumn("state", "varchar(64)", (col) => col.notNull())
		.addColumn("country", "varchar(64)", (col) => col.notNull())
		.addColumn("job_type", sql`job_type_enum`, (col) => col.defaultTo('unknown').notNull())
		.addColumn("remote_policy", sql`remote_policy_enum`, (col) => col.defaultTo('unknown').notNull())
		.addColumn("experience_level", sql`experience_level_enum`, (col) => col.defaultTo('unknown').notNull())
		.addColumn("note", "text")
		.addColumn("url", "text")
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	// Migration code
	await db.schema.dropTable("JobListing").execute()
	await db.schema.dropType("job_type_enum").execute()
	await db.schema.dropType("remote_policy_enum").execute()
	await db.schema.dropType("experience_level_enum").execute()
}
