import { describe, it, expect, beforeEach } from 'vitest';
import { GameSaveManager } from './saveState';
import { validateCustomLevel, type CustomLevelDefinition } from './levelSchema';

describe('Game Scalability & Save Manager (STORAGE-NAMESPACE-v10)', () => {
	let manager: GameSaveManager;
	const mockStore: Record<string, string> = {};

	beforeEach(() => {
		for (const k of Object.keys(mockStore)) {
			delete mockStore[k];
		}
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

		manager = new GameSaveManager();
		manager.reset();
	});

	it('loads default save data when storage is empty', () => {
		const state = manager.load();
		expect(state.version).toBe(1);
		expect(state.highScore).toBe(0);
		expect(state.unlockedHeroes).toContain('fastener_hero');
	});

	it('persists and retrieves updated high score and unlocked heroes', () => {
		manager.save({
			highScore: 12500,
			unlockedHeroes: ['fastener_hero', 'laser_hero']
		});

		const loaded = manager.load();
		expect(loaded.highScore).toBe(12500);
		expect(loaded.unlockedHeroes).toEqual(['fastener_hero', 'laser_hero']);
	});

	it('validates custom level payloads correctly', () => {
		const validLevel: CustomLevelDefinition = {
			id: 'sector-7',
			title: 'Asteroid Belt Outpost',
			difficulty: 'hard',
			gridWidth: 16,
			gridHeight: 10,
			pathWaypoints: [
				{ x: 0, y: 2 },
				{ x: 8, y: 2 },
				{ x: 8, y: 8 },
				{ x: 15, y: 8 }
			],
			waves: [
				{
					waveNumber: 1,
					enemies: [{ type: 'runner', count: 5, intervalMs: 1000 }],
					rewardCredits: 100
				}
			],
			startingCredits: 350,
			startingLives: 20
		};

		expect(validateCustomLevel(validLevel)).toBe(true);

		const invalidLevel = { id: 'corrupt', title: 'Missing Waypoints' };
		expect(validateCustomLevel(invalidLevel)).toBe(false);
	});
});
