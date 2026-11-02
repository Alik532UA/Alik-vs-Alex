import { asset } from '$app/paths';
import type { AssetPath } from '$app/types';
import type { TowerId, EnemyId, HeroId } from './types';

export type TowerSpriteKey = `${TowerId}_${1 | 2 | 3 | 4}`;
export type EnemySpriteKey = EnemyId;
export type HeroSpriteKey = HeroId;
export type UnitSpriteKey = 'robot_unit' | 'exosuit_unit';

export type SpriteKey = TowerSpriteKey | EnemySpriteKey | HeroSpriteKey | UnitSpriteKey | TowerId;

export function getTowerAssetPath(id: TowerId, level: number = 1): AssetPath {
	const clampedLevel = Math.max(1, Math.min(4, Math.round(level))) as 1 | 2 | 3 | 4;
	return `assets/sprites/towers/${id}_${clampedLevel}.png` as AssetPath;
}

export function getEnemyAssetPath(id: EnemyId): AssetPath {
	if (id === 'armored_beetle') {
		return 'assets/sprites/enemies/armored_beetle.jpg' as AssetPath;
	}
	return `assets/sprites/enemies/${id}.png` as AssetPath;
}

export function getHeroAssetPath(id: HeroId): AssetPath {
	if (id === 'fastener_hero') {
		return 'assets/sprites/heroes/fastener_hero.jpg' as AssetPath;
	}
	return `assets/sprites/heroes/${id}.png` as AssetPath;
}

const ALL_TOWER_IDS: TowerId[] = [
	'robot_line',
	'drill',
	'mining_laser',
	'crane',
	'fastener',
	'exosuit',
	'mine_layer',
	'pile_driver'
];

const ALL_ENEMY_IDS: EnemyId[] = [
	'pack_hound',
	'runner',
	'armored_beetle',
	'heavy_rhino',
	'jumper',
	'glider',
	'spore_carrier',
	'spitter',
	'shield_bearer',
	'broodmother'
];

const ALL_HERO_IDS: HeroId[] = [
	'fastener_hero',
	'exosuit_hero',
	'laser_hero',
	'flamer_hero',
	'chemist_hero'
];

class SpriteManager {
	private cache = new Map<string, HTMLCanvasElement>();
	loaded = false;

	/**
	 * Strips pure black backgrounds (for JPEGs) and trims transparent margins
	 * so all sprites have crisp bounds and accurate centering.
	 */
	private processImage(
		img: HTMLImageElement,
		cropRegion?: { x: number; y: number; w: number; h: number },
		forceBlackRemoval = false
	): HTMLCanvasElement {
		const sx = cropRegion ? Math.floor(img.width * cropRegion.x) : 0;
		const sy = cropRegion ? Math.floor(img.height * cropRegion.y) : 0;
		const sw = cropRegion ? Math.floor(img.width * cropRegion.w) : img.width;
		const sh = cropRegion ? Math.floor(img.height * cropRegion.h) : img.height;

		const offscreen = document.createElement('canvas');
		offscreen.width = sw;
		offscreen.height = sh;
		const ctx = offscreen.getContext('2d', { willReadFrequently: true })!;
		ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

		const imgData = ctx.getImageData(0, 0, sw, sh);
		const d = imgData.data;

		// Check if corners have opaque black pixels that require flood-fill background removal
		const checkCornerBlack = (px: number, py: number) => {
			const p = (py * sw + px) * 4;
			return d[p + 3] > 200 && d[p] < 22 && d[p + 1] < 22 && d[p + 2] < 22;
		};

		const needsFloodFill =
			forceBlackRemoval ||
			checkCornerBlack(0, 0) ||
			checkCornerBlack(sw - 1, 0) ||
			checkCornerBlack(0, sh - 1) ||
			checkCornerBlack(sw - 1, sh - 1);

		if (needsFloodFill) {
			const visited = new Uint8Array(sw * sh);
			const queue: number[] = [];

			const pushIfBg = (px: number, py: number) => {
				if (px < 0 || px >= sw || py < 0 || py >= sh) return;
				const idx = py * sw + px;
				if (visited[idx]) return;
				const p = idx * 4;
				const r = d[p],
					g = d[p + 1],
					b = d[p + 2],
					a = d[p + 3];
				if (a === 0 || (r < 22 && g < 22 && b < 22)) {
					visited[idx] = 1;
					queue.push(idx);
				}
			};

			for (let x = 0; x < sw; x++) {
				pushIfBg(x, 0);
				pushIfBg(x, sh - 1);
			}
			for (let y = 0; y < sh; y++) {
				pushIfBg(0, y);
				pushIfBg(sw - 1, y);
			}

			let head = 0;
			while (head < queue.length) {
				const curr = queue[head++];
				const cx = curr % sw;
				const cy = (curr / sw) | 0;
				const p = curr * 4;
				d[p + 3] = 0; // Transparent

				pushIfBg(cx + 1, cy);
				pushIfBg(cx - 1, cy);
				pushIfBg(cx, cy + 1);
				pushIfBg(cx, cy - 1);
			}

			// Soften halo
			for (let i = 0; i < sw * sh; i++) {
				if (!visited[i]) {
					const p = i * 4;
					const maxC = Math.max(d[p], d[p + 1], d[p + 2]);
					if (maxC < 14) d[p + 3] = 0;
				}
			}
			ctx.putImageData(imgData, 0, 0);
		}

		// Calculate content bounding box to auto-crop transparent margins
		let minX = sw,
			maxX = -1,
			minY = sh,
			maxY = -1;
		for (let y = 0; y < sh; y++) {
			for (let x = 0; x < sw; x++) {
				const a = d[(y * sw + x) * 4 + 3];
				if (a > 15) {
					if (x < minX) minX = x;
					if (x > maxX) maxX = x;
					if (y < minY) minY = y;
					if (y > maxY) maxY = y;
				}
			}
		}

		if (minX <= maxX && minY <= maxY) {
			const cropW = maxX - minX + 1;
			const cropH = maxY - minY + 1;
			const trimmed = document.createElement('canvas');
			trimmed.width = cropW;
			trimmed.height = cropH;
			const tctx = trimmed.getContext('2d')!;
			tctx.drawImage(offscreen, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
			return trimmed;
		}

		return offscreen;
	}

	async loadAll(): Promise<void> {
		if (typeof window === 'undefined' || this.loaded) return;

		const loadPromises: Promise<void>[] = [];

		// 1. Load Towers (all 8 towers, 4 levels each)
		for (const tid of ALL_TOWER_IDS) {
			for (let lvl = 1; lvl <= 4; lvl++) {
				const key = `${tid}_${lvl}`;
				const relPath = getTowerAssetPath(tid, lvl);
				loadPromises.push(
					new Promise<void>((resolve) => {
						const img = new Image();
						img.crossOrigin = 'anonymous';
						img.onload = () => {
							const processed = this.processImage(img);
							this.cache.set(key, processed);
							// Default level 1 sprite alias for tower ID
							if (lvl === 1) {
								this.cache.set(tid, processed);
								// Also crop robot unit from robot_line_1
								if (tid === 'robot_line') {
									this.cache.set(
										'robot_unit',
										this.processImage(img, { x: 0.81, y: 0.36, w: 0.19, h: 0.56 })
									);
								}
							}
							resolve();
						};
						img.onerror = () => resolve();
						img.src = asset(relPath);
					})
				);
			}
		}

		// 2. Load Enemies (all 10 enemies)
		for (const eid of ALL_ENEMY_IDS) {
			const relPath = getEnemyAssetPath(eid);
			loadPromises.push(
				new Promise<void>((resolve) => {
					const img = new Image();
					img.crossOrigin = 'anonymous';
					img.onload = () => {
						this.cache.set(eid, this.processImage(img));
						resolve();
					};
					img.onerror = () => resolve();
					img.src = asset(relPath);
				})
			);
		}

		// 3. Load Heroes (all 5 heroes)
		for (const hid of ALL_HERO_IDS) {
			const relPath = getHeroAssetPath(hid);
			loadPromises.push(
				new Promise<void>((resolve) => {
					const img = new Image();
					img.crossOrigin = 'anonymous';
					img.onload = () => {
						const processed = this.processImage(img);
						this.cache.set(hid, processed);
						if (hid === 'exosuit_hero') {
							// Exosuit unit spawned by platform
							this.cache.set('exosuit_unit', processed);
						}
						resolve();
					};
					img.onerror = () => resolve();
					img.src = asset(relPath);
				})
			);
		}

		await Promise.allSettled(loadPromises);
		this.loaded = true;
	}

	get(key: string): HTMLCanvasElement | undefined {
		return this.cache.get(key);
	}

	/**
	 * Draws a centered sprite with optional horizontal flip.
	 * Concept art sprites natively face LEFT. If moving right, flip horizontally.
	 */
	drawCentered(
		ctx: CanvasRenderingContext2D,
		key: string,
		x: number,
		y: number,
		width: number,
		height: number,
		faceRight = false
	): boolean {
		const sprite = this.cache.get(key);
		if (!sprite || sprite.width === 0 || sprite.height === 0) return false;

		ctx.save();
		ctx.translate(x, y);
		if (faceRight) {
			ctx.scale(-1, 1);
		}

		// Maintain aspect ratio within target dimensions
		const scale = Math.min(width / sprite.width, height / sprite.height);
		const drawW = sprite.width * scale;
		const drawH = sprite.height * scale;

		ctx.drawImage(sprite, -drawW / 2, -drawH / 2, drawW, drawH);
		ctx.restore();
		return true;
	}
}

export const sprites = new SpriteManager();
