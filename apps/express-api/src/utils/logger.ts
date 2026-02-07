import * as dotenv from 'dotenv'

// We cant use the env object in this file because the env object uses the logger
dotenv.config()

export enum LogLevel {
	INFO = "info",
	ERROR = "error",
	WARN = "warn",
	DEBUG = "debug",
	TRACE = "trace"
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
	[LogLevel.ERROR]: 0,
	[LogLevel.WARN]: 1,
	[LogLevel.INFO]: 2,
	[LogLevel.DEBUG]: 3,
	[LogLevel.TRACE]: 4,
};

export class Logger {
	private logClass: string

	constructor(logClass: string) {
		this.logClass = logClass
	}

	private getCurrentLogLevelPriority = (): number => {
		const envLogLevel = process.env.LOG_LEVEL;
		if (!envLogLevel) {
			// Default to INFO if LOG_LEVEL is not set
			return LOG_LEVEL_PRIORITY[LogLevel.INFO];
		}
		const currentLevel = envLogLevel.toLowerCase() as LogLevel;
		return LOG_LEVEL_PRIORITY[currentLevel] ?? LOG_LEVEL_PRIORITY[LogLevel.INFO];
	};

	private shouldLog = (level: LogLevel): boolean => {
		const currentPriority = this.getCurrentLogLevelPriority();
		const messagePriority = LOG_LEVEL_PRIORITY[level];
		return messagePriority <= currentPriority;
	};

	private formatTimestamp = (): string => {
		return new Date().toISOString();
	};

	private log = (level: LogLevel, ...args: unknown[]): void => {
		if (!this.shouldLog(level)) {
			return;
		}

		const timestamp = this.formatTimestamp();
		const prefix = `${timestamp} [${level.toUpperCase()}] ${this.logClass} - `;

		switch (level) {
			case LogLevel.ERROR:
				console.error(prefix, ...args);
				break;
			case LogLevel.WARN:
				console.warn(prefix, ...args);
				break;
			case LogLevel.INFO:
				console.info(prefix, ...args);
				break;
			case LogLevel.DEBUG:
				console.debug(prefix, ...args);
				break;
			case LogLevel.TRACE:
				console.debug(prefix, ...args);
				break;
			default:
				console.log(prefix, ...args);
		}
	};


	error (...args: unknown[]) {
		this.log(LogLevel.ERROR, ...args)
	}

	warn (...args: unknown[]) {
		this.log(LogLevel.WARN, ...args)
	}

	info (...args: unknown[]) {
		this.log(LogLevel.INFO, ...args)
	}

	debug (...args: unknown[]) {
		this.log(LogLevel.DEBUG, ...args)
	}

	trace (...args: unknown[]) {
		this.log(LogLevel.TRACE, ...args)
	}
}

