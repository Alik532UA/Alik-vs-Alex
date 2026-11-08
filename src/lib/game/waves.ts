import type { EnemyId } from './types';

export interface WaveComposition {
	waveNumber: number;
	enemyCounts: Record<EnemyId, number>;
	totalEnemies: number;
	spawnIntervalMs: number;
	rewardCredits: number;
}

const ENEMY_TIERS: EnemyId[] = [
	'runner',
	'broodmother',
	'armored_beetle',
	'glider',
	'spitter',
	'jumper',
	'spore_carrier',
	'pack_hound',
	'heavy_rhino',
	'shield_bearer'
];

/**
 * Calculates adaptive wave composition and scaling difficulty.
 */
export function generateWave(waveNumber: number): WaveComposition {
	const clampedWave = Math.max(1, Math.floor(waveNumber));
	const enemyCounts: Record<EnemyId, number> = {
		runner: 0,
		broodmother: 0,
		armored_beetle: 0,
		glider: 0,
		spitter: 0,
		jumper: 0,
		spore_carrier: 0,
		pack_hound: 0,
		heavy_rhino: 0,
		shield_bearer: 0
	};

	// Determine available enemy archetypes based on wave threshold
	const availableTierCount = Math.min(ENEMY_TIERS.length, Math.floor(clampedWave / 2) + 2);
	const activePool = ENEMY_TIERS.slice(0, availableTierCount);

	const baseEnemyCount = 6 + clampedWave * 3;
	let remaining = baseEnemyCount;

	for (let i = activePool.length - 1; i >= 0 && remaining > 0; i--) {
		const type = activePool[i]!;
		if (i === 0) {
			enemyCounts[type] += remaining;
			break;
		}
		const portion = Math.floor(remaining * 0.35);
		enemyCounts[type] += portion;
		remaining -= portion;
	}

	const totalEnemies = Object.values(enemyCounts).reduce((sum, n) => sum + n, 0);
	const spawnIntervalMs = Math.max(400, 1500 - clampedWave * 40);
	const rewardCredits = 100 + clampedWave * 25;

	return {
		waveNumber: clampedWave,
		enemyCounts,
		totalEnemies,
		spawnIntervalMs,
		rewardCredits
	};
}
