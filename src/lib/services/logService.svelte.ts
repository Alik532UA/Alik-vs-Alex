/**
 * Ring-buffer diagnostic logger for Alik vs Alex (DEBUGGING-v10 § 1).
 */

export interface LogEntry {
	id: string;
	timestamp: string;
	level: 'info' | 'warn' | 'error';
	scope: string;
	message: string;
	details?: unknown;
}

class LogService {
	entries = $state<LogEntry[]>([]);
	readonly maxEntries = 500;

	log(level: 'info' | 'warn' | 'error', scope: string, message: string, details?: unknown): void {
		const entry: LogEntry = {
			id: Math.random().toString(36).slice(2, 9),
			timestamp: new Date().toISOString(),
			level,
			scope,
			message,
			details
		};

		if (this.entries.length >= this.maxEntries) {
			this.entries = [...this.entries.slice(1), entry];
		} else {
			this.entries = [...this.entries, entry];
		}

		if (level === 'error') {
			console.error(`[${scope}] ${message}`, details ?? '');
		} else if (level === 'warn') {
			console.warn(`[${scope}] ${message}`, details ?? '');
		}
	}

	info(scope: string, message: string, details?: unknown): void {
		this.log('info', scope, message, details);
	}

	warn(scope: string, message: string, details?: unknown): void {
		this.log('warn', scope, message, details);
	}

	error(scope: string, message: string, details?: unknown): void {
		this.log('error', scope, message, details);
	}

	clear(): void {
		this.entries = [];
	}
}

export const logService = new LogService();
