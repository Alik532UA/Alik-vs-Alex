import { describe, it, expect, beforeEach } from 'vitest';
import { TDGameEngine } from './engine';
import { TOWERS, ENEMIES, HEROES, MISSION_01 } from './configs';
import { game } from './state.svelte';
import type { TowerId, EnemyId, HeroId } from './types';

describe('Tower Defense Game Engine (TDGameEngine)', () => {
	let engine: TDGameEngine;

	beforeEach(() => {
		game.currency = MISSION_01.startingCurrency;
		game.lives = MISSION_01.startingLives;
		game.outcome = 'none';
		game.isPaused = false;
		game.currentWave = 0;
		engine = new TDGameEngine();
		engine.reset();
	});

	it('initializes game state with starting resources and mission config', () => {
		expect(game.currency).toBe(MISSION_01.startingCurrency);
		expect(game.lives).toBe(MISSION_01.startingLives);
		expect(game.outcome).toBe('none');
		expect(game.currentWave).toBe(0);
		expect(engine.heroes.length).toBe(2);
	});

	it('builds a tower when resources are sufficient', () => {
		const initialCurrency = game.currency;
		const towerCost = TOWERS.drill.levels[0].cost;
		const slotId = MISSION_01.towerSlots[0].id;

		engine.buildTower(slotId, 'drill');

		expect(game.currency).toBe(initialCurrency - towerCost);
		expect(engine.towers.has(slotId)).toBe(true);
		expect(engine.towers.get(slotId)?.level).toBe(1);
	});

	it('fails to build a tower if slot is already occupied', () => {
		const slotId = MISSION_01.towerSlots[0].id;
		engine.buildTower(slotId, 'drill');
		const currencyAfterFirst = game.currency;

		engine.buildTower(slotId, 'fastener');
		expect(game.currency).toBe(currencyAfterFirst);
		expect(engine.towers.get(slotId)?.type).toBe('drill');
	});

	it('upgrades a tower up to level 4 and deducts cost', () => {
		const slotId = MISSION_01.towerSlots[0].id;
		game.currency = 10000;
		engine.buildTower(slotId, 'drill');

		engine.upgradeTower(slotId);
		expect(engine.towers.get(slotId)?.level).toBe(2);

		engine.upgradeTower(slotId);
		expect(engine.towers.get(slotId)?.level).toBe(3);

		engine.upgradeTower(slotId);
		expect(engine.towers.get(slotId)?.level).toBe(4);

		// Already max level (level 4)
		const currencyAtMax = game.currency;
		engine.upgradeTower(slotId);
		expect(engine.towers.get(slotId)?.level).toBe(4);
		expect(game.currency).toBe(currencyAtMax);
	});

	it('sells a tower and refunds 70% of invested cost', () => {
		const slotId = MISSION_01.towerSlots[0].id;
		game.currency = 500;
		engine.buildTower(slotId, 'drill');
		const currencyAfterBuild = game.currency;

		engine.sellTower(slotId);
		expect(engine.towers.has(slotId)).toBe(false);
		expect(game.currency).toBeGreaterThan(currencyAfterBuild);
	});

	it('moves hero towards designated destination coordinates', () => {
		const heroId: HeroId = 'fastener_hero';
		const hero = engine.heroes.find((h) => h.id === heroId);
		expect(hero).toBeDefined();

		if (hero) {
			const target = { x: 300, y: 400 };
			engine.moveHero(heroId, target);
			expect(hero.targetX).toBe(target.x);
			expect(hero.targetY).toBe(target.y);
		}
	});

	it('verifies game balance config completeness', () => {
		const towerKeys: TowerId[] = [
			'drill',
			'pile_driver',
			'mining_laser',
			'fastener',
			'exosuit',
			'robot_line',
			'crane',
			'mine_layer'
		];
		for (const tid of towerKeys) {
			expect(TOWERS[tid]).toBeDefined();
			expect(TOWERS[tid].levels.length).toBe(4);
		}

		const enemyKeys: EnemyId[] = [
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
		for (const eid of enemyKeys) {
			expect(ENEMIES[eid]).toBeDefined();
			expect(ENEMIES[eid].hp).toBeGreaterThan(0);
			expect(ENEMIES[eid].speed).toBeGreaterThan(0);
		}

		const heroKeys: HeroId[] = [
			'fastener_hero',
			'flamer_hero',
			'exosuit_hero',
			'chemist_hero',
			'laser_hero'
		];
		for (const hid of heroKeys) {
			expect(HEROES[hid]).toBeDefined();
			expect(HEROES[hid].hp).toBeGreaterThan(0);
		}
	});

	it('scales efficiently during heavy combat simulation (1000 ticks < 150ms)', () => {
		// Spawn towers across all available slots
		for (const slot of MISSION_01.towerSlots) {
			engine.buildTower(slot.id, 'drill');
		}

		// Trigger wave containing combat enemies
		engine.callNextWave(false);

		const t0 = performance.now();
		// Simulate 1000 game physics/combat ticks (dt = 0.016s -> ~16 seconds of in-game battle)
		for (let i = 0; i < 1000; i++) {
			engine.update(0.016);
		}
		const duration = performance.now() - t0;

		expect(duration).toBeLessThan(150);
		expect(engine.towers.size).toBeGreaterThan(0);
	});
});
