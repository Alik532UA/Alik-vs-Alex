import { describe, expect, it } from 'vitest';
import { GAME_I18N, getTranslation } from './game';

describe('Game Internationalization (i18n Parity & Scalability)', () => {
	it('supports both uk and en locales with non-empty strings', () => {
		const uk = getTranslation('uk');
		const en = getTranslation('en');

		expect(uk.title).toBe('Алік проти Сахка');
		expect(en.title).toBe('Alik vs Sahko');

		const ukKeys = Object.keys(uk);
		const enKeys = Object.keys(en);

		expect(ukKeys.sort()).toEqual(enKeys.sort());

		for (const key of ukKeys as (keyof typeof uk)[]) {
			expect(uk[key].trim().length).toBeGreaterThan(0);
			expect(en[key].trim().length).toBeGreaterThan(0);
		}
	});

	it('falls back to uk when given an unsupported locale', () => {
		const fallback = getTranslation('de' as unknown as 'uk');
		expect(fallback.title).toBe(GAME_I18N.uk.title);
	});
});
