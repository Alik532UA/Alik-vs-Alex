import { storage } from '$lib/services/storage';

export interface GameSaveData {
	version: number;
	highScore: number;
	wavesCompletedMax: number;
	unlockedHeroes: string[];
	totalCreditsEarned: number;
	settings: {
		sfxVolume: number;
		highContrast: boolean;
		fastForward: boolean;
	};
	updatedAt: string;
}

const SAVE_KEY = 'save_state';
const CURRENT_SAVE_VERSION = 1;

export const defaultSaveData: GameSaveData = {
	version: CURRENT_SAVE_VERSION,
	highScore: 0,
	wavesCompletedMax: 0,
	unlockedHeroes: ['fastener_hero'],
	totalCreditsEarned: 0,
	settings: {
		sfxVolume: 0.8,
		highContrast: false,
		fastForward: false
	},
	updatedAt: new Date().toISOString()
};

/**
 * Manages game persistence under the strict namespace 'alikvsalex_'.
 */
export class GameSaveManager {
	public load(): GameSaveData {
		const raw = storage.get(SAVE_KEY);
		if (!raw) return { ...defaultSaveData };

		try {
			const parsed = JSON.parse(raw) as Partial<GameSaveData>;
			return {
				...defaultSaveData,
				...parsed,
				settings: {
					...defaultSaveData.settings,
					...(parsed.settings ?? {})
				}
			};
		} catch {
			return { ...defaultSaveData };
		}
	}

	public save(data: Partial<GameSaveData>): boolean {
		const current = this.load();
		const merged: GameSaveData = {
			...current,
			...data,
			version: CURRENT_SAVE_VERSION,
			updatedAt: new Date().toISOString()
		};

		return storage.set(SAVE_KEY, JSON.stringify(merged));
	}

	public reset(): boolean {
		return storage.set(SAVE_KEY, JSON.stringify(defaultSaveData));
	}
}

export const saveManager = new GameSaveManager();
