/**
 * Safe Storage Facade (STORAGE-NAMESPACE-v10 § 2 & § 5).
 * Never throws on SecurityError or QuotaExceededError. Namespaces keys with STORAGE_PREFIX.
 */
import { STORAGE_PREFIX } from './storagePrefix';

export { STORAGE_PREFIX };

function createStore(area: 'localStorage' | 'sessionStorage') {
	let available = true;

	function open(): Storage | null {
		if (typeof window === 'undefined' || !available) return null;
		try {
			return window[area];
		} catch {
			available = false;
			return null;
		}
	}

	return {
		get(key: string): string | null {
			const s = open();
			if (!s) return null;
			try {
				return s.getItem(STORAGE_PREFIX + key);
			} catch {
				return null;
			}
		},

		set(key: string, value: string): boolean {
			const s = open();
			if (!s) return false;
			try {
				s.setItem(STORAGE_PREFIX + key, value);
				return true;
			} catch {
				return false;
			}
		},

		remove(key: string): boolean {
			const s = open();
			if (!s) return false;
			try {
				s.removeItem(STORAGE_PREFIX + key);
				return true;
			} catch {
				return false;
			}
		},

		getJSON<T>(key: string, fallback: T): T {
			const raw = this.get(key);
			if (raw === null) return fallback;
			try {
				return JSON.parse(raw) as T;
			} catch {
				return fallback;
			}
		},

		setJSON<T>(key: string, value: T): boolean {
			try {
				return this.set(key, JSON.stringify(value));
			} catch {
				return false;
			}
		},

		clear(): void {
			const s = open();
			if (!s) return;
			try {
				const keysToRemove: string[] = [];
				for (let i = 0; i < s.length; i++) {
					const k = s.key(i);
					if (k?.startsWith(STORAGE_PREFIX)) {
						keysToRemove.push(k);
					}
				}
				for (const k of keysToRemove) {
					s.removeItem(k);
				}
			} catch {
				// ignore errors during cleanup
			}
		}
	};
}

export const storage = createStore('localStorage');
export const sessionStore = createStore('sessionStorage');

