export interface Point {
	x: number;
	y: number;
}

export interface GameMap {
	id: string;
	nameUk: string;
	nameEn: string;
	descriptionUk: string;
	descriptionEn: string;
	gridWidth: number;
	gridHeight: number;
	cellSize: number;
	waypoints: Point[];
	blockedCells: Point[];
}

export const MAPS: Record<string, GameMap> = {
	workshop_alpha: {
		id: 'workshop_alpha',
		nameUk: 'Майстерня Альфа',
		nameEn: 'Workshop Alpha',
		descriptionUk: 'Головний ремонтний ангар колонії. Прямолінійні конвеєрні коридори.',
		descriptionEn: 'Colony main maintenance hangar with straight conveyor corridors.',
		gridWidth: 16,
		gridHeight: 10,
		cellSize: 48,
		waypoints: [
			{ x: 0, y: 4 },
			{ x: 5, y: 4 },
			{ x: 5, y: 2 },
			{ x: 11, y: 2 },
			{ x: 11, y: 7 },
			{ x: 15, y: 7 }
		],
		blockedCells: [
			{ x: 3, y: 1 },
			{ x: 3, y: 2 },
			{ x: 8, y: 5 },
			{ x: 8, y: 6 }
		]
	},
	reactor_core: {
		id: 'reactor_core',
		nameUk: 'Реакторний Сектор',
		nameEn: 'Reactor Core',
		descriptionUk: 'Вузькі переходи навколо магнітної пастки плазми. Дві точки розгалуження.',
		descriptionEn: 'Choke points around the magnetic plasma trap with split patrol routes.',
		gridWidth: 16,
		gridHeight: 10,
		cellSize: 48,
		waypoints: [
			{ x: 0, y: 2 },
			{ x: 4, y: 2 },
			{ x: 4, y: 8 },
			{ x: 12, y: 8 },
			{ x: 12, y: 3 },
			{ x: 15, y: 3 }
		],
		blockedCells: [
			{ x: 7, y: 4 },
			{ x: 7, y: 5 },
			{ x: 8, y: 4 },
			{ x: 8, y: 5 }
		]
	}
};

export function getMap(id: string): GameMap {
	const map = MAPS[id];
	if (!map) {
		const fallback = MAPS.workshop_alpha;
		if (!fallback) throw new Error('Default map workshop_alpha is missing');
		return fallback;
	}
	return map;
}

export function isCellBuildable(map: GameMap, x: number, y: number): boolean {
	if (x < 0 || x >= map.gridWidth || y < 0 || y >= map.gridHeight) {
		return false;
	}
	// Cannot build on blocked environmental obstacles
	if (map.blockedCells.some((b) => b.x === x && b.y === y)) {
		return false;
	}
	// Cannot build directly on waypoint corridors
	for (let i = 0; i < map.waypoints.length - 1; i++) {
		const p1 = map.waypoints[i];
		const p2 = map.waypoints[i + 1];
		if (!p1 || !p2) continue;

		const minX = Math.min(p1.x, p2.x);
		const maxX = Math.max(p1.x, p2.x);
		const minY = Math.min(p1.y, p2.y);
		const maxY = Math.max(p1.y, p2.y);

		if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
			return false;
		}
	}
	return true;
}
