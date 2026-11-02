import { describe, it, expect, beforeEach } from 'vitest';
import { storage, sessionStore, STORAGE_PREFIX } from './storage';

describe('Safe Storage Facade (STORAGE-NAMESPACE-v10)', () => {
	const mockStore: Record<string, string> = {};

	beforeEach(() => {
		for (const k of Object.keys(mockStore)) {
			delete mockStore[k];
		}
		// Mock window and localStorage for node environment
		(globalThis as unknown as { window: unknown }).window = {
			localStorage: {
				getItem: (key: string) => mockStore[key] ?? null,
				setItem: (key: string, value: string) => {
					mockStore[key] = value;
				},
				removeItem: (key: string) => {
					delete mockStore[key];
				},
				get length() {
					return Object.keys(mockStore).length;
				},
				key: (i: number) => Object.keys(mockStore)[i] ?? null
			},
			sessionStorage: {
				getItem: () => null,
				setItem: () => {},
				removeItem: () => {},
				length: 0,
				key: () => null
			}
		};
	});

	it('namespaces keys with STORAGE_PREFIX', () => {
		expect(storage.set('highScore', '1000')).toBe(true);
		expect(mockStore[STORAGE_PREFIX + 'highScore']).toBe('1000');
		expect(storage.get('highScore')).toBe('1000');
	});

	it('returns fallback on getJSON if key does not exist or is invalid', () => {
		expect(storage.getJSON('nonexistent', { score: 0 })).toEqual({ score: 0 });
		mockStore[STORAGE_PREFIX + 'bad_json'] = 'invalid{json';
		expect(storage.getJSON('bad_json', 42)).toBe(42);
	});

	it('serializes and deserializes objects with setJSON/getJSON', () => {
		const payload = { wave: 5, credits: 350 };
		expect(storage.setJSON('gameState', payload)).toBe(true);
		expect(storage.getJSON('gameState', null)).toEqual(payload);
	});

	it('clear removes only prefixed keys without touching other origins', () => {
		mockStore[STORAGE_PREFIX + 'key1'] = 'val1';
		mockStore['other_project_key'] = 'keep_me';

		storage.clear();

		expect(mockStore[STORAGE_PREFIX + 'key1']).toBeUndefined();
		expect(mockStore['other_project_key']).toBe('keep_me');
	});

	it('sessionStore facade safely handles operations', () => {
		expect(sessionStore.get('temp')).toBeNull();
		expect(sessionStore.set('temp', '1')).toBe(true);
	});
});
