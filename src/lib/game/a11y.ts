import type { GameLocale } from '../i18n/game';
import { getTranslation } from '../i18n/game';

export interface GridCursor {
	x: number;
	y: number;
}

export class GameAccessibilityManager {
	private cursor: GridCursor = { x: 0, y: 0 };
	private maxX: number = 15;
	private maxY: number = 9;
	private currentAnnouncement: string = '';
	private locale: GameLocale = 'uk';

	constructor(maxX = 15, maxY = 9, locale: GameLocale = 'uk') {
		this.maxX = maxX;
		this.maxY = maxY;
		this.locale = locale;
	}

	public setLocale(locale: GameLocale): void {
		this.locale = locale;
	}

	public getCursor(): GridCursor {
		return { ...this.cursor };
	}

	public moveCursor(dx: number, dy: number): GridCursor {
		this.cursor.x = Math.max(0, Math.min(this.maxX, this.cursor.x + dx));
		this.cursor.y = Math.max(0, Math.min(this.maxY, this.cursor.y + dy));

		const t = getTranslation(this.locale);
		this.announce(`${t.gridCursor}: [${this.cursor.x}, ${this.cursor.y}]`);
		return { ...this.cursor };
	}

	public announce(message: string): void {
		this.currentAnnouncement = message;
	}

	public getAnnouncement(): string {
		return this.currentAnnouncement;
	}

	public announceWave(waveNumber: number, totalWaves: number): void {
		const t = getTranslation(this.locale);
		this.announce(`${t.waves} ${waveNumber} / ${totalWaves}`);
	}

	public announceTowerPlaced(towerName: string, x: number, y: number): void {
		const t = getTranslation(this.locale);
		this.announce(`${t.towerPlaced}: ${towerName} at [${x}, ${y}]`);
	}
}

export const gameA11y = new GameAccessibilityManager();

