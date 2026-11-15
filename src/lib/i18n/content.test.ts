import { describe, expect, it } from 'vitest';
import {
	CONTENT_I18N,
	getLocalizedTower,
	getLocalizedHero,
	getLocalizedEnemy,
	getLocalizedMission
} from './content';
import { TOWERS, HEROES, ENEMIES } from '$lib/game/configs';
import type { TowerId, HeroId, EnemyId } from '$lib/game/types';

describe('Content Internationalization (Towers, Heroes, Enemies, Missions)', () => {
	it('supports uk and en with full key parity and non-empty translations', () => {
		const uk = CONTENT_I18N.uk;
		const en = CONTENT_I18N.en;

		expect(Object.keys(uk.towers).sort()).toEqual(Object.keys(en.towers).sort());
		expect(Object.keys(uk.heroes).sort()).toEqual(Object.keys(en.heroes).sort());
		expect(Object.keys(uk.enemies).sort()).toEqual(Object.keys(en.enemies).sort());
		expect(Object.keys(uk.missions).sort()).toEqual(Object.keys(en.missions).sort());

		// Verify every tower
		for (const [id, tUk] of Object.entries(uk.towers)) {
			const tEn = en.towers[id as TowerId];
			expect(tUk.name.trim().length).toBeGreaterThan(0);
			expect(tEn.name.trim().length).toBeGreaterThan(0);
			expect(tUk.role.trim().length).toBeGreaterThan(0);
			expect(tEn.role.trim().length).toBeGreaterThan(0);
			expect(tUk.levels.length).toBe(4);
			expect(tEn.levels.length).toBe(4);
			for (let i = 0; i < 4; i++) {
				expect(tUk.levels[i].trim().length).toBeGreaterThan(0);
				expect(tEn.levels[i].trim().length).toBeGreaterThan(0);
			}
		}

		// Verify every hero
		for (const [id, hUk] of Object.entries(uk.heroes)) {
			const hEn = en.heroes[id as HeroId];
			expect(hUk.name.trim().length).toBeGreaterThan(0);
			expect(hEn.name.trim().length).toBeGreaterThan(0);
			expect(hUk.profession.trim().length).toBeGreaterThan(0);
			expect(hEn.profession.trim().length).toBeGreaterThan(0);
			expect(hUk.abilityName.trim().length).toBeGreaterThan(0);
			expect(hEn.abilityName.trim().length).toBeGreaterThan(0);
			expect(hUk.abilityDesc.trim().length).toBeGreaterThan(0);
			expect(hEn.abilityDesc.trim().length).toBeGreaterThan(0);
		}

		// Verify every enemy
		for (const [id, eUk] of Object.entries(uk.enemies)) {
			const eEn = en.enemies[id as EnemyId];
			expect(eUk.name.trim().length).toBeGreaterThan(0);
			expect(eEn.name.trim().length).toBeGreaterThan(0);
		}

		// Verify missions
		for (const [id, mUk] of Object.entries(uk.missions)) {
			const mEn = en.missions[id];
			expect(mUk.title.trim().length).toBeGreaterThan(0);
			expect(mEn.title.trim().length).toBeGreaterThan(0);
			expect(mUk.dialogue.length).toBe(mEn.dialogue.length);
		}
	});

	it('returns localized tower without mutating base numerical stats', () => {
		const base = TOWERS.drill;
		const ukTower = getLocalizedTower('drill', 'uk');
		const enTower = getLocalizedTower('drill', 'en');

		expect(ukTower.name).toBe('Бурова установка');
		expect(enTower.name).toBe('Seismic Mining Drill');

		// Numerical stats should match base
		expect(ukTower.levels[0].cost).toBe(base.levels[0].cost);
		expect(enTower.levels[0].cost).toBe(base.levels[0].cost);
		expect(ukTower.levels[0].range).toBe(base.levels[0].range);
		expect(enTower.levels[0].range).toBe(base.levels[0].range);
	});

	it('returns localized hero without mutating base numerical stats', () => {
		const base = HEROES.fastener_hero;
		const ukHero = getLocalizedHero('fastener_hero', 'uk');
		const enHero = getLocalizedHero('fastener_hero', 'en');

		expect(ukHero.name).toBe('Макс (Монтажник)');
		expect(enHero.name).toBe('Max (Fitter)');

		expect(ukHero.hp).toBe(base.hp);
		expect(enHero.hp).toBe(base.hp);
		expect(ukHero.damage).toBe(base.damage);
		expect(enHero.damage).toBe(base.damage);
	});

	it('returns localized enemy without mutating base numerical stats', () => {
		const base = ENEMIES.pack_hound;
		const ukEnemy = getLocalizedEnemy('pack_hound', 'uk');
		const enEnemy = getLocalizedEnemy('pack_hound', 'en');

		expect(ukEnemy.name).toBe('Стайник');
		expect(enEnemy.name).toBe('Pack Hound');

		expect(ukEnemy.hp).toBe(base.hp);
		expect(enEnemy.hp).toBe(base.hp);
	});

	it('returns localized mission 01', () => {
		const ukMission = getLocalizedMission('mission_01', 'uk');
		const enMission = getLocalizedMission('mission_01', 'en');

		expect(ukMission.title).toBe('Місія 01: Майстерня');
		expect(enMission.title).toBe('Mission 01: Workshop');
		expect(enMission.preMissionDialogue[0].speaker).toBe('Max (Fitter)');
	});

	it('strictly forbids Russian language in content dictionary', () => {
		const locales = Object.keys(CONTENT_I18N);
		expect(locales).toEqual(['uk', 'en']);
		expect(locales).not.toContain('ru');
	});
});
