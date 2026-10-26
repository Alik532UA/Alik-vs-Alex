import { asset } from '$app/paths';
import type { AssetPath } from '$app/types';

export type SpriteKey =
	| 'glider'
	| 'armored_beetle'
	| 'fastener_hero'
	| 'mining_laser'
	| 'drill'
	| 'robot_line'
	| 'robot_unit';

const SPRITE_PATHS: Record<Exclude<SpriteKey, 'robot_unit'>, AssetPath> = {
	glider: 'assets/sprites/glider.jpg',
	armored_beetle: 'assets/sprites/armored_beetle.jpg',
	fastener_hero: 'assets/sprites/fastener_hero.jpg',
	mining_laser: 'assets/sprites/mining_laser.jpg',
	drill: 'assets/sprites/drill.jpg',
	robot_line: 'assets/sprites/robot_line.jpg'
};

class SpriteManager {
	private cache = new Map<SpriteKey, HTMLCanvasElement>();
	loaded = false;

	/**
	 * Loads a JPG on a black background and strips near-black pixels (#000000)
	 * outside the character silhouette using flood-fill / luminance threshold
	 * so sprites render cleanly with alpha transparency on Canvas.
	 */
	private removeBlackBackground(img: HTMLImageElement, cropRegion?: { x: number; y: number; w: number; h: number }): HTMLCanvasElement {
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

		// Edge-seeded BFS flood fill to strip pure black background without eating dark outlines
		const visited = new Uint8Array(sw * sh);
		const queue: number[] = [];

		const pushIfBg = (px: number, py: number) => {
			if (px < 0 || px >= sw || py < 0 || py >= sh) return;
			const idx = py * sw + px;
			if (visited[idx]) return;
			const p = idx * 4;
			const r = d[p], g = d[p + 1], b = d[p + 2];
			if (r < 18 && g < 18 && b < 18) {
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
			d[p + 3] = 0; // Make transparent

			pushIfBg(cx + 1, cy);
			pushIfBg(cx - 1, cy);
			pushIfBg(cx, cy + 1);
			pushIfBg(cx, cy - 1);
		}

		// Soften 1px border halo
		for (let i = 0; i < sw * sh; i++) {
			if (!visited[i]) {
				const p = i * 4;
				const maxC = Math.max(d[p], d[p + 1], d[p + 2]);
				if (maxC < 12) d[p + 3] = 0;
			}
		}

		ctx.putImageData(imgData, 0, 0);
		return offscreen;
	}

	async loadAll(): Promise<void> {
		if (typeof window === 'undefined' || this.loaded) return;

		const entries = Object.entries(SPRITE_PATHS) as [Exclude<SpriteKey, 'robot_unit'>, AssetPath][];
		await Promise.allSettled(
			entries.map(
				([key, relPath]) =>
					new Promise<void>((resolve) => {
						const img = new Image();
						img.crossOrigin = 'anonymous';
						img.onload = () => {
							this.cache.set(key, this.removeBlackBackground(img));
							// Also extract the little robot on the right side of robot_line.jpg as the spawned robot unit sprite!
							if (key === 'robot_line') {
								this.cache.set(
									'robot_unit',
									this.removeBlackBackground(img, { x: 0.81, y: 0.36, w: 0.19, h: 0.56 })
								);
							}
							resolve();
						};
						img.onerror = () => resolve(); // Graceful fallback to vector if file not placed yet
						img.src = asset(relPath);
					})
			)
		);
		this.loaded = true;
	}

	get(key: SpriteKey): HTMLCanvasElement | undefined {
		return this.cache.get(key);
	}

	/**
	 * Draws a centered sprite with optional horizontal flip.
	 * Note: Concept art sprites natively face LEFT. If moving right (vx > 0), flip horizontally.
	 */
	drawCentered(
		ctx: CanvasRenderingContext2D,
		key: SpriteKey,
		x: number,
		y: number,
		width: number,
		height: number,
		faceRight = false
	): boolean {
		const sprite = this.cache.get(key);
		if (!sprite) return false;

		ctx.save();
		ctx.translate(x, y);
		if (faceRight) {
			ctx.scale(-1, 1);
		}
		ctx.drawImage(sprite, -width / 2, -height / 2, width, height);
		ctx.restore();
		return true;
	}
}

export const sprites = new SpriteManager();
