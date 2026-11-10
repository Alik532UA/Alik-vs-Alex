import { describe, expect, it } from 'vitest';
import { GAME_I18N, getTranslation, getTargetDomainLabel } from './game';

describe('Game Internationalization (i18n Parity & Language Policy)', () => {
	it('supports uk and en locales with complete key parity and non-empty strings', () => {
		const uk = getTranslation('uk');
		const en = getTranslation('en');

		expect(uk.title).toBe('Алік проти Сахка');
		expect(en.title).toBe('Alik vs Sahko');

		const ukKeys = Object.keys(uk).sort();
		const enKeys = Object.keys(en).sort();

		expect(ukKeys).toEqual(enKeys);

		for (const key of ukKeys as (keyof typeof uk)[]) {
			expect(uk[key].trim().length).toBeGreaterThan(0);
			expect(en[key].trim().length).toBeGreaterThan(0);
		}
	});

	it('properly formats target domains in uk and en', () => {
		expect(getTargetDomainLabel('ground', 'uk')).toBe('земля');
		expect(getTargetDomainLabel('air', 'uk')).toBe('повітря');
		expect(getTargetDomainLabel('both', 'uk')).toBe('земля + повітря');

		expect(getTargetDomainLabel('ground', 'en')).toBe('ground');
		expect(getTargetDomainLabel('air', 'en')).toBe('air');
		expect(getTargetDomainLabel('both', 'en')).toBe('ground + air');
	});

	it('strictly excludes Russian locale and falls back to uk', () => {
		const supportedLocales = Object.keys(GAME_I18N);
		expect(supportedLocales).toEqual(['uk', 'en']);
		expect(supportedLocales).not.toContain('ru');

		// Explicit check that attempting to request ru returns uk fallback
		const fallbackRu = getTranslation('ru' as unknown as 'uk');
		expect(fallbackRu.title).toBe(GAME_I18N.uk.title);

		const fallbackOther = getTranslation('de' as unknown as 'uk');
		expect(fallbackOther.title).toBe(GAME_I18N.uk.title);
	});
});
