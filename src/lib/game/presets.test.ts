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

	it('enforces strict limit (5) where unselected towers are locked until one is deselected', () => {
		// Start with balance: ['robot_line', 'drill', 'mining_laser', 'fastener', 'pile_driver']
		game.applyPreset('balance');
		expect(game.selectedTowers.length).toBe(5);

		// Attempting to select 6th tower 'crane' is ignored due to strict limit
		game.toggleTowerInLoadout('crane');
		expect(game.selectedTowers.length).toBe(5);
		expect(game.selectedTowers).not.toContain('crane');

		// Deselecting 'robot_line' frees a slot (down to 4)
		game.toggleTowerInLoadout('robot_line');
		expect(game.selectedTowers.length).toBe(4);
		expect(game.selectedTowers).not.toContain('robot_line');

		// Now selecting 'crane' succeeds
		game.toggleTowerInLoadout('crane');
		expect(game.selectedTowers.length).toBe(5);
		expect(game.selectedTowers).toContain('crane');
	});

	it('enforces strict limit (2) where unselected heroes are locked until one is deselected', () => {
		game.applyPreset('balance');
		expect(game.selectedHeroes).toEqual(['fastener_hero', 'exosuit_hero']);

		// Attempting to select 3rd hero 'laser_hero' is ignored due to strict limit
		game.toggleHeroInLoadout('laser_hero');
		expect(game.selectedHeroes.length).toBe(2);
		expect(game.selectedHeroes).not.toContain('laser_hero');

		// Deselecting 'fastener_hero' frees a slot (down to 1)
		game.toggleHeroInLoadout('fastener_hero');
		expect(game.selectedHeroes.length).toBe(1);
		expect(game.selectedHeroes).not.toContain('fastener_hero');

		// Now selecting 'laser_hero' succeeds
		game.toggleHeroInLoadout('laser_hero');
		expect(game.selectedHeroes.length).toBe(2);
		expect(game.selectedHeroes).toContain('laser_hero');
	});
});
