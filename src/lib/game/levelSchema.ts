import type { TowerId, EnemyId } from './types';

export interface LevelWaveConfig {
	waveNumber: number;
	enemies: Array<{
		type: EnemyId;
		count: number;
		intervalMs: number;
	}>;
	rewardCredits: number;
}

export interface CustomLevelDefinition {
	id: string;
	title: string;
	author?: string;
	difficulty: 'easy' | 'normal' | 'hard' | 'nightmare';
	gridWidth: number;
	gridHeight: number;
	pathWaypoints: Array<{ x: number; y: number }>;
	waves: LevelWaveConfig[];
	startingCredits: number;
	startingLives: number;
	allowedTowers?: TowerId[];
}

/**
 * Validates external custom level payloads to ensure safe scaling of level content.
 */
export function validateCustomLevel(level: unknown): level is CustomLevelDefinition {
	if (!level || typeof level !== 'object') return false;
	const l = level as Record<string, unknown>;

	if (typeof l.id !== 'string' || typeof l.title !== 'string') return false;
	if (typeof l.gridWidth !== 'number' || typeof l.gridHeight !== 'number') return false;
	if (!Array.isArray(l.pathWaypoints) || l.pathWaypoints.length < 2) return false;
	if (!Array.isArray(l.waves) || l.waves.length === 0) return false;

	return true;
}
