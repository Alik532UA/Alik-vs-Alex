import { describe, it, expect } from 'vitest';
import { generateWave } from './waves';

describe('Wave Generator & Scaling System', () => {
	it('generates valid composition for wave 1', () => {
		const wave = generateWave(1);
		expect(wave.waveNumber).toBe(1);
		expect(wave.totalEnemies).toBeGreaterThanOrEqual(6);
		expect(wave.spawnIntervalMs).toBeGreaterThan(1000);
		expect(wave.rewardCredits).toBe(125);
	});

	it('scales difficulty and unlocks higher tier enemies at higher waves', () => {
		const wave1 = generateWave(1);
		const wave10 = generateWave(10);
		const wave20 = generateWave(20);

		expect(wave10.totalEnemies).toBeGreaterThan(wave1.totalEnemies);
		expect(wave20.totalEnemies).toBeGreaterThan(wave10.totalEnemies);

		expect(wave20.spawnIntervalMs).toBeLessThan(wave1.spawnIntervalMs);
		expect(wave20.rewardCredits).toBeGreaterThan(wave1.rewardCredits);

		// Higher wave introduces armored units
		expect(wave20.enemyCounts.shield_bearer + wave20.enemyCounts.heavy_rhino).toBeGreaterThan(0);
	});

	it('handles invalid or fractional wave inputs safely', () => {
		const waveZero = generateWave(0);
		expect(waveZero.waveNumber).toBe(1);

		const waveNegative = generateWave(-5);
		expect(waveNegative.waveNumber).toBe(1);

		const waveFloat = generateWave(3.8);
		expect(waveFloat.waveNumber).toBe(3);
	});
});
