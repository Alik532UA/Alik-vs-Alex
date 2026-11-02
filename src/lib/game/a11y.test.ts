import { describe, expect, it } from 'vitest';
import { GameAccessibilityManager } from './a11y';

describe('Game Accessibility (a11y & Grid Navigation)', () => {
	it('initializes cursor at origin and clamps navigation within grid boundaries', () => {
		const a11y = new GameAccessibilityManager(15, 9, 'uk');
		expect(a11y.getCursor()).toEqual({ x: 0, y: 0 });

		// Attempt moving beyond negative boundary
		a11y.moveCursor(-5, -5);
		expect(a11y.getCursor()).toEqual({ x: 0, y: 0 });

		// Move within boundary
		a11y.moveCursor(3, 4);
		expect(a11y.getCursor()).toEqual({ x: 3, y: 4 });

		// Attempt moving beyond positive boundary
		a11y.moveCursor(20, 20);
		expect(a11y.getCursor()).toEqual({ x: 15, y: 9 });
	});

	it('dispatches ARIA announcements for cursor moves and game events', () => {
		const a11y = new GameAccessibilityManager(15, 9, 'uk');
		a11y.announceWave(3, 10);
		expect(a11y.getAnnouncement()).toContain('Хвиля 3 / 10');

		a11y.announceTowerPlaced('Шахтний різак', 4, 2);
		expect(a11y.getAnnouncement()).toContain('Вежу збудовано: Шахтний різак at [4, 2]');

		// English locale announcement
		a11y.setLocale('en');
		a11y.announceWave(5, 10);
		expect(a11y.getAnnouncement()).toContain('Wave 5 / 10');
	});
});

