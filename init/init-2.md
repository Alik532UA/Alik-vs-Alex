Оскільки всі 6 прикріплених концепт-артів («Планер», «Панцирник», герой з кріпильним метальником, гірничодобувний лазер, бурова установка та складальна лінія роботів) є `.jpg` файлами на суцільному чорному фоні (`#000000`), у код додано **автоматичний Chroma-Key шейдер на Offscreen Canvas**. Він під час завантаження у браузері сам вирізає чорний фон у прозорість, визначає напрямок руху (дзеркально розвертає спрайти вліво/вправо) і плавно відмальовує їх поверх карти (а для об'єктів, чиї ілюстрації ще в роботі, залишає стилізований векторний рендер).

Скопіюй блок нижче і передай агенту як друге завдання.

```markdown
# TASK FOR AI AGENT (STEP 2): Integrate Concept Art Sprites with Auto-ChromaKey & Directional Flipping

1. Copy the 6 provided concept images into `static/assets/sprites/` (or map them from their current filenames):
   - `photo_1_2026-10-26_22-45-32.jpg` -> `static/assets/sprites/glider.jpg` (Планер)
   - `photo_2_2026-10-26_22-45-32.jpg` -> `static/assets/sprites/armored_beetle.jpg` (Панцирник)
   - `photo_3_2026-10-26_22-45-32.jpg` -> `static/assets/sprites/fastener_hero.jpg` (Монтажник)
   - `photo_4_2026-10-26_22-45-32.jpg` -> `static/assets/sprites/mining_laser.jpg` (Гірничодобувний лазер)
   - `photo_5_2026-10-26_22-45-32.jpg` -> `static/assets/sprites/drill.jpg` (Бурова установка)
   - `photo_6_2026-10-26_22-45-32.jpg` -> `static/assets/sprites/robot_line.jpg` (Складальна лінія роботів)

2. Create `src/lib/game/sprites.ts` and update `src/routes/+page.svelte` with the code below.

---

## 1. Create `src/lib/game/sprites.ts`

```typescript
import { base } from '$app/paths';

export type SpriteKey =
	| 'glider'
	| 'armored_beetle'
	| 'fastener_hero'
	| 'mining_laser'
	| 'drill'
	| 'robot_line'
	| 'robot_unit';

const SPRITE_PATHS: Record<Exclude<SpriteKey, 'robot_unit'>, string> = {
	glider: '/assets/sprites/glider.jpg',
	armored_beetle: '/assets/sprites/armored_beetle.jpg',
	fastener_hero: '/assets/sprites/fastener_hero.jpg',
	mining_laser: '/assets/sprites/mining_laser.jpg',
	drill: '/assets/sprites/drill.jpg',
	robot_line: '/assets/sprites/robot_line.jpg'
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

		const entries = Object.entries(SPRITE_PATHS) as [Exclude<SpriteKey, 'robot_unit'>, string][];
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
						img.src = `${base}${relPath}`;
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

```

---

## 2. Update `renderCanvas` & `onMount` in `src/routes/+page.svelte`

Replace the `<script lang="ts">` block in `src/routes/+page.svelte` with this updated version that preloads `sprites.loadAll()` and renders the 6 concept art sprites (plus the cropped spawned robot unit) with directional orientation and shadows:

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { game } from '$lib/game/state.svelte';
	import { TOWERS, HEROES, ENEMIES } from '$lib/game/configs';
	import { TDGameEngine } from '$lib/game/engine';
	import { sprites, type SpriteKey } from '$lib/game/sprites';

	let canvas = $state<HTMLCanvasElement null |>(null);
	const engine = new TDGameEngine();

	function beginBriefing() {
		game.screen = 'briefing';
	}

	function launchBattle() {
		game.startMission();
		engine.reset();
	}

	function handleCanvasClick(ev: MouseEvent) {
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		const scaleX = 1100 / rect.width;
		const scaleY = 600 / rect.height;
		const x = (ev.clientX - rect.left) * scaleX;
		const y = (ev.clientY - rect.top) * scaleY;

		if (game.editorMode) {
			if (ev.shiftKey) {
				game.mission.towerSlots = [
					...game.mission.towerSlots,
					{ id: `s${game.mission.towerSlots.length + 1}`, x: Math.round(x), y: Math.round(y) }
				];
			} else {
				game.mission.waypoints = [...game.mission.waypoints, { x: Math.round(x), y: Math.round(y) }];
			}
			return;
		}

		for (const h of engine.heroes) {
			if (Math.hypot(h.x - x, h.y - y) <= 26) {
				game.activeHeroId = h.id;
				game.activeSlotId = null;
				return;
			}
		}

		for (const slot of game.mission.towerSlots) {
			if (Math.hypot(slot.x - x, slot.y - y) <= 32) {
				game.activeSlotId = slot.id;
				game.activeHeroId = null;
				return;
			}
		}

		if (game.activeHeroId && !game.isPaused) {
			engine.moveHero(game.activeHeroId, { x, y });
			return;
		}

		game.activeSlotId = null;
	}

	function renderCanvas(ctx: CanvasRenderingContext2D) {
		ctx.clearRect(0, 0, 1100, 600);

		// Workshop Industrial Background Grid
		ctx.fillStyle = '#0f172a';
		ctx.fillRect(0, 0, 1100, 600);
		ctx.strokeStyle = '#1e293b';
		ctx.lineWidth = 1;
		for (let gx = 0; gx < 1100; gx += 50) {
			ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, 600); ctx.stroke();
		}
		for (let gy = 0; gy < 600; gy += 50) {
			ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(1100, gy); ctx.stroke();
		}

		// Draw Enemy Route
		const wps = game.mission.waypoints;
		if (wps.length > 1) {
			ctx.strokeStyle = '#334155';
			ctx.lineWidth = 48;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.beginPath();
			ctx.moveTo(wps[0].x, wps[0].y);
			for (let i = 1; i < wps.length; i++) ctx.lineTo(wps[i].x, wps[i].y);
			ctx.stroke();

			ctx.strokeStyle = '#475569';
			ctx.lineWidth = 2;
			ctx.setLineDash([10, 10]);
			ctx.beginPath();
			ctx.moveTo(wps[0].x, wps[0].y);
			for (let i = 1; i < wps.length; i++) ctx.lineTo(wps[i].x, wps[i].y);
			ctx.stroke();
			ctx.setLineDash([]);

			// Breach Entry & Exit Portals
			ctx.fillStyle = '#ef4444';
			ctx.beginPath(); ctx.arc(wps[0].x, wps[0].y, 20, 0, Math.PI * 2); ctx.fill();
			ctx.fillStyle = '#38bdf8';
			const exit = wps[wps.length - 1];
			ctx.beginPath(); ctx.arc(exit.x, exit.y, 22, 0, Math.PI * 2); ctx.fill();
		}

		// Draw Tower Slots & Built Towers (with Concept Art Sprites!)
		for (const slot of game.mission.towerSlots) {
			const built = engine.towers.get(slot.id);
			const isSelected = game.activeSlotId === slot.id;

			if (isSelected && built) {
				const range = TOWERS[built.type].levels[built.level - 1].range;
				ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
				ctx.strokeStyle = '#38bdf8';
				ctx.lineWidth = 1.5;
				ctx.beginPath(); ctx.arc(slot.x, slot.y, range, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
			}

			if (built) {
				const cfg = TOWERS[built.type];
				let drawnSprite = false;

				// Determine if laser has a target to orient toward
				let faceRight = false;
				if (built.type === 'mining_laser' && built.laserTargetUid) {
					const t = engine.enemies.find((e) => e.uid === built.laserTargetUid);
					if (t && t.x > slot.x) faceRight = true;
				}

				if (built.type === 'mining_laser' || built.type === 'drill' || built.type === 'robot_line') {
					const scale = 1 + (built.level - 1) * 0.06;
					drawnSprite = sprites.drawCentered(
						ctx,
						built.type as SpriteKey,
						slot.x,
						slot.y - 6,
						78 * scale,
						64 * scale,
						faceRight
					);
				}

				if (!drawnSprite) {
					ctx.fillStyle = '#1e293b';
					ctx.strokeStyle = isSelected ? '#facc15' : '#64748b';
					ctx.lineWidth = isSelected ? 3 : 2;
					ctx.beginPath(); ctx.arc(slot.x, slot.y, 24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

					ctx.fillStyle = cfg.color;
					ctx.beginPath(); ctx.arc(slot.x, slot.y, 16, 0, Math.PI * 2); ctx.fill();
				} else if (isSelected) {
					ctx.strokeStyle = '#facc15';
					ctx.lineWidth = 2;
					ctx.beginPath(); ctx.arc(slot.x, slot.y, 34, 0, Math.PI * 2); ctx.stroke();
				}

				// Level badge
				ctx.fillStyle = '#0f172a';
				ctx.fillRect(slot.x + 14, slot.y + 12, 22, 15);
				ctx.strokeStyle = cfg.color;
				ctx.lineWidth = 1.5;
				ctx.strokeRect(slot.x + 14, slot.y + 12, 22, 15);
				ctx.fillStyle = '#f8fafc';
				ctx.font = 'bold 10px sans-serif';
				ctx.textAlign = 'center';
				ctx.fillText(`L${built.level}`, slot.x + 25, slot.y + 23);

				// Continuous Mining Laser Beam
				if (built.type === 'mining_laser' && built.laserTargetUid) {
					const target = engine.enemies.find((e) => e.uid === built.laserTargetUid);
					if (target) {
						const muzzleX = slot.x + (faceRight ? 26 : -26);
						const muzzleY = slot.y - 10;
						ctx.strokeStyle = '#ef4444';
						ctx.lineWidth = 2.5 + built.level * 1.3;
						ctx.beginPath(); ctx.moveTo(muzzleX, muzzleY); ctx.lineTo(target.x, target.y); ctx.stroke();
						ctx.strokeStyle = '#fef08a';
						ctx.lineWidth = 1.2;
						ctx.beginPath(); ctx.moveTo(muzzleX, muzzleY); ctx.lineTo(target.x, target.y); ctx.stroke();
					}
				}
			} else {
				ctx.fillStyle = '#0f172a';
				ctx.strokeStyle = isSelected ? '#facc15' : '#64748b';
				ctx.lineWidth = isSelected ? 3 : 2;
				ctx.beginPath(); ctx.arc(slot.x, slot.y, 24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
				ctx.fillStyle = '#64748b';
				ctx.font = 'bold 16px sans-serif';
				ctx.textAlign = 'center';
				ctx.fillText('+', slot.x, slot.y + 5);
			}
		}

		// Draw Mines
		for (const m of engine.mines) {
			ctx.fillStyle = m.armingTimer > 0 ? '#64748b' : '#a855f7';
			ctx.beginPath(); ctx.arc(m.x, m.y, 7, 0, Math.PI * 2); ctx.fill();
		}

		// Draw Allied Units (Cropped Robot Sprite for robot_line units!)
		for (const u of engine.units) {
			let drawn = false;
			if (u.towerType === 'robot_line') {
				drawn = sprites.drawCentered(ctx, 'robot_unit', u.x, u.y - 4, 30, 34, true);
			}
			if (!drawn) {
				ctx.fillStyle = u.towerType === 'robot_line' ? '#38bdf8' : '#10b981';
				ctx.beginPath(); ctx.arc(u.x, u.y, 9, 0, Math.PI * 2); ctx.fill();
				ctx.strokeStyle = '#0f172a';
				ctx.lineWidth = 2;
				ctx.stroke();
			}

			if (u.towerType === 'robot_line') {
				ctx.fillStyle = '#facc15';
				ctx.fillRect(u.x - 10, u.y - 22, 20 * (u.batteryTimer / u.maxBattery), 3);
			}
		}

		// Draw Enemies (Glider & Armored Beetle use Concept Art Sprites!)
		for (const e of engine.enemies) {
			const cfg = ENEMIES[e.type];
			const nextWp = wps[e.waypointIndex + 1];
			const movingRight = nextWp ? nextWp.x >= e.x : true;

			let drawn = false;
			if (e.type === 'glider') {
				// Air unit shadow
				ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
				ctx.beginPath(); ctx.ellipse(e.x, e.y + 18, 16, 6, 0, 0, Math.PI * 2); ctx.fill();
				drawn = sprites.drawCentered(ctx, 'glider', e.x, e.y - 6, 58, 42, movingRight);
			} else if (e.type === 'armored_beetle') {
				drawn = sprites.drawCentered(ctx, 'armored_beetle', e.x, e.y - 4, 54, 40, movingRight);
			}

			if (!drawn) {
				ctx.fillStyle = cfg.color;
				ctx.beginPath();
				ctx.arc(e.x, e.y, cfg.radius, 0, Math.PI * 2);
				ctx.fill();

				if (cfg.domain === 'air') {
					ctx.strokeStyle = '#f8fafc';
					ctx.lineWidth = 2;
					ctx.stroke();
				}
			}

			if (e.stunTimer > 0) {
				ctx.strokeStyle = '#38bdf8';
				ctx.lineWidth = 2.5;
				ctx.beginPath(); ctx.arc(e.x, e.y, cfg.radius + 6, 0, Math.PI * 2); ctx.stroke();
			}

			// Health bar
			const hpPct = Math.max(0, e.hp / e.maxHp);
			const barY = e.y - (drawn ? 28 : cfg.radius + 9);
			ctx.fillStyle = '#0f172a';
			ctx.fillRect(e.x - 16, barY, 32, 4);
			ctx.fillStyle = hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#eab308' : '#ef4444';
			ctx.fillRect(e.x - 16, barY, 32 * hpPct, 4);
		}

		// Draw Heroes (Fastener Specialist uses Concept Art Sprite!)
		for (const h of engine.heroes) {
			const cfg = HEROES[h.id];
			const isSelected = game.activeHeroId === h.id;

			if (isSelected) {
				ctx.strokeStyle = '#facc15';
				ctx.lineWidth = 2;
				ctx.beginPath(); ctx.ellipse(h.x, h.y + 12, 22, 10, 0, 0, Math.PI * 2); ctx.stroke();
			}

			let drawn = false;
			if (h.id === 'fastener_hero') {
				ctx.save();
				if (h.respawnTimer > 0) ctx.globalAlpha = 0.4;
				drawn = sprites.drawCentered(ctx, 'fastener_hero', h.x, h.y - 10, 56, 52, h.targetX >= h.x);
				ctx.restore();
			}

			if (!drawn) {
				ctx.fillStyle = h.respawnTimer > 0 ? '#475569' : cfg.color;
				ctx.beginPath(); ctx.arc(h.x, h.y, 15, 0, Math.PI * 2); ctx.fill();
				ctx.strokeStyle = '#ffffff';
				ctx.lineWidth = 2;
				ctx.stroke();
			}

			const hpPct = Math.max(0, h.hp / h.maxHp);
			const barY = h.y - (drawn ? 38 : 25);
			ctx.fillStyle = '#0f172a';
			ctx.fillRect(h.x - 18, barY, 36, 5);
			ctx.fillStyle = '#38bdf8';
			ctx.fillRect(h.x - 18, barY, 36 * hpPct, 5);
		}

		// Draw Visual Effects
		for (const fx of engine.effects) {
			const alpha = Math.max(0, fx.ttl / fx.maxTtl);
			ctx.save();
			ctx.globalAlpha = alpha;
			if (fx.kind === 'circle' && fx.radius) {
				ctx.strokeStyle = fx.color;
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.arc(fx.x, fx.y, fx.radius * (1.1 - alpha * 0.3), 0, Math.PI * 2);
				ctx.stroke();
			} else if (fx.kind === 'beam' && fx.targetX !== undefined && fx.targetY !== undefined) {
				ctx.strokeStyle = fx.color;
				ctx.lineWidth = 3;
				ctx.beginPath(); ctx.moveTo(fx.x, fx.y); ctx.lineTo(fx.targetX, fx.targetY); ctx.stroke();
			} else if (fx.kind === 'text' && fx.text) {
				ctx.fillStyle = fx.color;
				ctx.font = 'bold 14px sans-serif';
				ctx.fillText(fx.text, fx.x, fx.y - (1 - alpha) * 20);
			}
			ctx.restore();
		}
	}

	onMount(() => {
		sprites.loadAll();
		let last = performance.now();
		let raf: number;
		const loop = (now: number) => {
			const dt = (now - last) / 1000;
			last = now;
			if (game.screen === 'playing') {
				engine.update(dt);
				if (canvas) {
					const ctx = canvas.getContext('2d');
					if (ctx) renderCanvas(ctx);
				}
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	});
</script>

```

```

### Що робить цей модуль `sprites.ts`:
* **Автоматичне вирізання чорного фону (BFS Flood-Fill Chroma-Key):** Оскільки концепт-арти збережені в `.jpg` на чорному тлі[cite: 2, 3, 4, 5, 6, 7], скрипт при старті гри проходить алгоритмом заливки від країв зображення і робить зовнішній чорний фон повністю прозорим (`alpha = 0`), зберігаючи при цьому темний фірмовий контур у стилі *Kingdom Rush* та темні деталі всередині самих персонажів і машин[cite: 1].
* **Бонусний 7-й спрайт з ілюстрації конвеєра:** На ілюстрації складальної лінії (`photo_6`[cite: 7]) праворуч від конвеєра стоїть готовий робот із блакитними очима та молотком[cite: 7]. Менеджер спрайтів автоматично вирізає цей фрагмент (`robot_unit`) і використовує його для всіх роботів, які виходять на дорогу затримувати ворогів[cite: 1, 7].
* **Орієнтація за рухом та прицілюванням:** Усі концепти намальовані з розворотом вліво[cite: 2, 3, 4, 5, 6, 7]. Коли «Панцирник»[cite: 1, 3] або «Планер»[cite: 1, 2] рухаються по маршруту вправо, або коли «Гірничодобувний лазер»[cite: 1, 5] наводиться на ціль праворуч від себе, спрайт автоматично віддзеркалюється, а промінь лазера виходить точно з дула гармати[cite: 1, 5].

```