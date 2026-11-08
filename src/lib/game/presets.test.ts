import { describe, it, expect, beforeEach } from 'vitest';
import { game } from './state.svelte';
import { LOADOUT_PRESETS, ALL_TOWERS, ALL_HEROES, getRandomLoadout } from './presets';

describe('Loadout Presets and Selection Logic', () => {
	beforeEach(() => {
		game.applyPreset('balance');
	});

	it('initializes with the balanced preset by default', () => {
		expect(game.selectedTowers.length).toBe(5);
		expect(game.selectedHeroes.length).toBe(2);
		expect(game.activePresetId).toBe('balance');
		expect(game.selectedHeroes).toEqual(['fastener_hero', 'exosuit_hero']);
		expect(game.canStartMission()).toBe(true);
	});

	it('applies the heavy preset correctly', () => {
		game.applyPreset('heavy');
		expect(game.selectedTowers).toEqual(LOADOUT_PRESETS.heavy.towers);
		expect(game.selectedHeroes).toEqual(LOADOUT_PRESETS.heavy.heroes);
		expect(game.activePresetId).toBe('heavy');
		expect(game.canStartMission()).toBe(true);
	});

	it('applies the control preset correctly', () => {
		game.applyPreset('control');
		expect(game.selectedTowers).toEqual(LOADOUT_PRESETS.control.towers);
		expect(game.selectedHeroes).toEqual(LOADOUT_PRESETS.control.heroes);
		expect(game.activePresetId).toBe('control');
		expect(game.canStartMission()).toBe(true);
	});

	it('generates a valid random loadout with 5 unique towers and 2 unique heroes', () => {
		const random = getRandomLoadout();
		expect(random.towers.length).toBe(5);
		expect(random.heroes.length).toBe(2);
		expect(new Set(random.towers).size).toBe(5);
		expect(new Set(random.heroes).size).toBe(2);

		for (const t of random.towers) {
			expect(ALL_TOWERS).toContain(t);
		}
		for (const h of random.heroes) {
			expect(ALL_HEROES).toContain(h);
		}

		game.randomizeLoadout();
		expect(game.selectedTowers.length).toBe(5);
		expect(game.selectedHeroes.length).toBe(2);
		expect(game.canStartMission()).toBe(true);
	});

	it('clears the loadout completely', () => {
		game.clearLoadout();
		expect(game.selectedTowers.length).toBe(0);
		expect(game.selectedHeroes.length).toBe(0);
		expect(game.canStartMission()).toBe(false);
	});

	it('supports flexible minimum / challenge mode', () => {
		game.clearLoadout();
		expect(game.canStartMission()).toBe(false);

		// Only 1 tower: not enough (needs hero)
		game.toggleTowerInLoadout('drill');
		expect(game.canStartMission()).toBe(false);

		// 1 tower and 1 hero: valid challenge mode!
		game.toggleHeroInLoadout('fastener_hero');
		expect(game.canStartMission()).toBe(true);
		expect(game.selectedTowers.length).toBe(1);
		expect(game.selectedHeroes.length).toBe(1);
	});

	it('allows deselecting any tower down to 0', () => {
		game.applyPreset('balance');
		const originalTowers = [...game.selectedTowers];

		for (const t of originalTowers) {
			game.toggleTowerInLoadout(t);
		}
		expect(game.selectedTowers.length).toBe(0);
	});

	it('allows deselecting any hero down to 0', () => {
		game.applyPreset('balance');
		const originalHeroes = [...game.selectedHeroes];

		for (const h of originalHeroes) {
			game.toggleHeroInLoadout(h);
		}
		expect(game.selectedHeroes.length).toBe(0);
	});

	it('replaces the oldest selection (FIFO) when at maximum limit without requiring prior deselect', () => {
		// Start with balance: ['robot_line', 'drill', 'mining_laser', 'fastener', 'pile_driver']
		game.applyPreset('balance');
		expect(game.selectedTowers).toEqual([
			'robot_line',
			'drill',
			'mining_laser',
			'fastener',
			'pile_driver'
		]);

		// Add 6th tower 'crane' -> 'robot_line' is dropped, 'crane' is appended
		game.toggleTowerInLoadout('crane');
		expect(game.selectedTowers.length).toBe(5);
		expect(game.selectedTowers).toEqual([
			'drill',
			'mining_laser',
			'fastener',
			'pile_driver',
			'crane'
		]);

		// Add 7th tower 'exosuit' -> 'drill' is dropped, 'exosuit' is appended
		game.toggleTowerInLoadout('exosuit');
		expect(game.selectedTowers.length).toBe(5);
		expect(game.selectedTowers).toEqual([
			'mining_laser',
			'fastener',
			'pile_driver',
			'crane',
			'exosuit'
		]);
	});

	it('replaces the oldest hero (FIFO) when at maximum limit (2) without requiring prior deselect', () => {
		game.applyPreset('balance');
		expect(game.selectedHeroes).toEqual(['fastener_hero', 'exosuit_hero']);

		// Add 3rd hero 'laser_hero' -> 'fastener_hero' is dropped, 'laser_hero' is appended
		game.toggleHeroInLoadout('laser_hero');
		expect(game.selectedHeroes.length).toBe(2);
		expect(game.selectedHeroes).toEqual(['exosuit_hero', 'laser_hero']);

		// Add 4th hero 'chemist_hero' -> 'exosuit_hero' is dropped, 'chemist_hero' is appended
		game.toggleHeroInLoadout('chemist_hero');
		expect(game.selectedHeroes.length).toBe(2);
		expect(game.selectedHeroes).toEqual(['laser_hero', 'chemist_hero']);
	});
});
