declare namespace NodeJS {
	interface ProcessEnv {
		TZ: 'UTC'
		ENV: 'development' | 'uat' | 'production';
		LOG_LEVEL: 'debug' | 'warn' | 'error' | 'info';
		PORT: string;
		DATABASE_URL: string;
		DEV_USER_ID?: string;
	}
}
