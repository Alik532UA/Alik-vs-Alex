// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { MAPS, getMap } from './maps.js';
import { generateWave } from './waves.js';
import { TOWERS, ENEMIES } from './configs.js';

describe('Level & Balancing Scalability (MAPS & WAVES SCALABILITY)', () => {
	it('усі зареєстровані мапи мають валідну сітку та не менше 3 вейпоінтів для руху', () => {
		const mapKeys = Object.keys(MAPS);
		expect(mapKeys.length).toBeGreaterThanOrEqual(2);

		for (const key of mapKeys) {
			const map = getMap(key);
			expect(map.id).toBe(key);
			expect(map.waypoints.length).toBeGreaterThanOrEqual(3);
			expect(map.gridWidth).toBeGreaterThanOrEqual(10);
			expect(map.gridHeight).toBeGreaterThanOrEqual(10);
		}
	});

	it('генератор хвиль генерує збалансовані хвилі до 50+ хвиль без переповнення або NaN', () => {
		for (let waveNumber = 1; waveNumber <= 50; waveNumber++) {
			const wave = generateWave(waveNumber);
			expect(wave.waveNumber).toBe(waveNumber);
			expect(wave.totalEnemies).toBeGreaterThan(0);
			expect(wave.rewardCredits).toBeGreaterThan(0);
			expect(Number.isFinite(wave.rewardCredits)).toBe(true);
			expect(wave.spawnIntervalMs).toBeGreaterThan(0);
		}
	});

	it('усі вежі мають коректні рівні прокачки, збалансовану вартість та радіус дії', () => {
		const towerKeys = Object.keys(TOWERS);
		expect(towerKeys.length).toBeGreaterThanOrEqual(8);

		for (const tId of towerKeys) {
			const tower = TOWERS[tId as keyof typeof TOWERS];
			expect(tower.levels.length).toBe(4);
			for (const lvl of tower.levels) {
				expect(lvl.cost).toBeGreaterThan(0);
				expect(lvl.range).toBeGreaterThan(0);
				expect(lvl.damage).toBeGreaterThanOrEqual(0);
			}
		}

		const enemyKeys = Object.keys(ENEMIES);
		expect(enemyKeys.length).toBeGreaterThanOrEqual(10);
	});
});
