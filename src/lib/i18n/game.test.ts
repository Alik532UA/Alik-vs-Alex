import { describe, expect, it } from 'vitest';
import { GAME_I18N, getTranslation, getTargetDomainLabel } from './game';

describe('Game Internationalization (i18n Parity & Scalability)', () => {
	it('supports uk, en, and ru locales with complete key parity and non-empty strings', () => {
		const uk = getTranslation('uk');
		const en = getTranslation('en');
		const ru = getTranslation('ru');

		expect(uk.title).toBe('Алік проти Сахка');
		expect(en.title).toBe('Alik vs Sahko');
		expect(ru.title).toBe('Алик против Сахко');

		const ukKeys = Object.keys(uk).sort();
		const enKeys = Object.keys(en).sort();
		const ruKeys = Object.keys(ru).sort();

		expect(ukKeys).toEqual(enKeys);
		expect(ukKeys).toEqual(ruKeys);

		for (const key of ukKeys as (keyof typeof uk)[]) {
			expect(uk[key].trim().length).toBeGreaterThan(0);
			expect(en[key].trim().length).toBeGreaterThan(0);
			expect(ru[key].trim().length).toBeGreaterThan(0);
		}
	});

	it('properly formats target domains in uk, en, and ru', () => {
		expect(getTargetDomainLabel('ground', 'uk')).toBe('земля');
		expect(getTargetDomainLabel('air', 'uk')).toBe('повітря');
		expect(getTargetDomainLabel('both', 'uk')).toBe('земля + повітря');

		expect(getTargetDomainLabel('ground', 'en')).toBe('ground');
		expect(getTargetDomainLabel('air', 'en')).toBe('air');
		expect(getTargetDomainLabel('both', 'en')).toBe('ground + air');

		expect(getTargetDomainLabel('ground', 'ru')).toBe('земля');
		expect(getTargetDomainLabel('air', 'ru')).toBe('воздух');
		expect(getTargetDomainLabel('both', 'ru')).toBe('земля + воздух');
	});

	it('falls back to uk when given an unsupported locale', () => {
		const fallback = getTranslation('de' as unknown as 'uk');
		expect(fallback.title).toBe(GAME_I18N.uk.title);
	});
});
