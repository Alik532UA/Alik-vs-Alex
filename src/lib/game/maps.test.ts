import { describe, expect, it } from 'vitest';
import { MAPS, getMap, isCellBuildable } from './maps';

describe('Game Maps & Grid System (Scalability & Routing)', () => {
	it('provides multiple valid tactical maps', () => {
		const mapKeys = Object.keys(MAPS);
		expect(mapKeys.length).toBeGreaterThanOrEqual(2);
		expect(MAPS.workshop_alpha).toBeDefined();
		expect(MAPS.reactor_core).toBeDefined();
	});

	it('ensures each map has valid dimensions and waypoint chains', () => {
		for (const map of Object.values(MAPS)) {
			expect(map.gridWidth).toBeGreaterThan(5);
			expect(map.gridHeight).toBeGreaterThan(5);
			expect(map.waypoints.length).toBeGreaterThanOrEqual(4);

			// First waypoint must be an entry point at boundary or interior
			const start = map.waypoints[0];
			expect(start).toBeDefined();
		}
	});

	it('safely falls back to workshop_alpha for unknown map ids', () => {
		const fallback = getMap('unknown_sector_99');
		expect(fallback.id).toBe('workshop_alpha');
	});

	it('accurately verifies buildable cells vs blocked obstacle cells', () => {
		const map = getMap('workshop_alpha');

		// Blocked cells cannot be built on
		for (const blocked of map.blockedCells) {
			expect(isCellBuildable(map, blocked.x, blocked.y)).toBe(false);
		}

		// Coordinates outside grid boundary cannot be built on
		expect(isCellBuildable(map, -1, 0)).toBe(false);
		expect(isCellBuildable(map, map.gridWidth + 5, 0)).toBe(false);
	});
});

