<script lang="ts">
	import { onMount } from 'svelte';
	import { game } from '$lib/game/state.svelte';
	import { TOWERS, HEROES, ENEMIES } from '$lib/game/configs';
	import { TDGameEngine } from '$lib/game/engine';
	import type { ActiveEnemy } from '$lib/game/engine';
	import { gameAudio } from '$lib/game/audio';
	import {
		sprites,
		getTowerAssetPath,
		getEnemyAssetPath,
		getHeroAssetPath
	} from '$lib/game/sprites';
	import type { TowerId, HeroId, TowerConfig, HeroConfig, EnemyConfig } from '$lib/game/types';
	import { asset } from '$app/paths';
	import { getTranslation, getTargetDomainLabel } from '$lib/i18n/game';

	const towerList: TowerConfig[] = Object.values(TOWERS);
	const heroList: HeroConfig[] = Object.values(HEROES);
	const enemyList: EnemyConfig[] = Object.values(ENEMIES);

	const t = $derived(getTranslation(game.locale));
	let inspectedHeroId = $state<HeroId>('fastener_hero');
	const inspectedHero = $derived(HEROES[inspectedHeroId]);

	let canvas = $state<HTMLCanvasElement | null>(null);
	const engine = new TDGameEngine();
	let hudTick = $state(0);

	let encyclopediaOpen = $state(false);
	let encyclopediaTab = $state<'towers' | 'enemies' | 'heroes'>('towers');
	let selectedEncyclopediaTowerId = $state<TowerId>('drill');

	function getSpeakerHeroId(speaker: string): HeroId | null {
		if (speaker.includes('Макс')) return 'fastener_hero';
		if (speaker.includes('Борг')) return 'exosuit_hero';
		if (speaker.includes('Ірина')) return 'laser_hero';
		if (speaker.includes('Влад')) return 'flamer_hero';
		if (speaker.includes('Док')) return 'chemist_hero';
		return null;
	}

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
				game.mission.waypoints = [
					...game.mission.waypoints,
					{ x: Math.round(x), y: Math.round(y) }
				];
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
			ctx.beginPath();
			ctx.moveTo(gx, 0);
			ctx.lineTo(gx, 600);
			ctx.stroke();
		}
		for (let gy = 0; gy < 600; gy += 50) {
			ctx.beginPath();
			ctx.moveTo(0, gy);
			ctx.lineTo(1100, gy);
			ctx.stroke();
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
			ctx.beginPath();
			ctx.arc(wps[0].x, wps[0].y, 20, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = '#38bdf8';
			const exit = wps[wps.length - 1];
			ctx.beginPath();
			ctx.arc(exit.x, exit.y, 22, 0, Math.PI * 2);
			ctx.fill();
		}

		// Draw Tower Slots & Built Towers (with Level 1..4 Sprites!)
		for (const slot of game.mission.towerSlots) {
			const built = engine.towers.get(slot.id);
			const isSelected = game.activeSlotId === slot.id;

			if (isSelected && built) {
				const range = TOWERS[built.type].levels[built.level - 1].range;
				ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
				ctx.strokeStyle = '#38bdf8';
				ctx.lineWidth = 1.5;
				ctx.beginPath();
				ctx.arc(slot.x, slot.y, range, 0, Math.PI * 2);
				ctx.fill();
				ctx.stroke();
			}

			if (built) {
				const cfg = TOWERS[built.type];

				// Determine if laser has a target to orient toward
				let faceRight = false;
				if (built.type === 'mining_laser' && built.laserTargetUid) {
					const t = engine.enemies.find((e: ActiveEnemy) => e.uid === built.laserTargetUid);
					if (t && t.x > slot.x) faceRight = true;
				}

				// Look for level-specific sprite: e.g. "drill_1", "drill_2", etc.
				const levelKey = `${built.type}_${built.level}`;
				const scale = 1 + (built.level - 1) * 0.05;
				let drawnSprite = sprites.drawCentered(
					ctx,
					levelKey,
					slot.x,
					slot.y - 8,
					80 * scale,
					72 * scale,
					faceRight
				);

				// Fallback to base tower sprite if level sprite missing
				if (!drawnSprite) {
					drawnSprite = sprites.drawCentered(
						ctx,
						built.type,
						slot.x,
						slot.y - 8,
						80 * scale,
						72 * scale,
						faceRight
					);
				}

				if (!drawnSprite) {
					ctx.fillStyle = '#1e293b';
					ctx.strokeStyle = isSelected ? '#facc15' : '#64748b';
					ctx.lineWidth = isSelected ? 3 : 2;
					ctx.beginPath();
					ctx.arc(slot.x, slot.y, 24, 0, Math.PI * 2);
					ctx.fill();
					ctx.stroke();

					ctx.fillStyle = cfg.color;
					ctx.beginPath();
					ctx.arc(slot.x, slot.y, 16, 0, Math.PI * 2);
					ctx.fill();
				} else if (isSelected) {
					ctx.strokeStyle = '#facc15';
					ctx.lineWidth = 2;
					ctx.beginPath();
					ctx.arc(slot.x, slot.y, 34, 0, Math.PI * 2);
					ctx.stroke();
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
					const target = engine.enemies.find((e: ActiveEnemy) => e.uid === built.laserTargetUid);
					if (target) {
						const muzzleX = slot.x + (faceRight ? 26 : -26);
						const muzzleY = slot.y - 12;
						ctx.strokeStyle = '#ef4444';
						ctx.lineWidth = 2.5 + built.level * 1.3;
						ctx.beginPath();
						ctx.moveTo(muzzleX, muzzleY);
						ctx.lineTo(target.x, target.y);
						ctx.stroke();
						ctx.strokeStyle = '#fef08a';
						ctx.lineWidth = 1.2;
						ctx.beginPath();
						ctx.moveTo(muzzleX, muzzleY);
						ctx.lineTo(target.x, target.y);
						ctx.stroke();
					}
				}
			} else {
				ctx.fillStyle = '#0f172a';
				ctx.strokeStyle = isSelected ? '#facc15' : '#64748b';
				ctx.lineWidth = isSelected ? 3 : 2;
				ctx.beginPath();
				ctx.arc(slot.x, slot.y, 24, 0, Math.PI * 2);
				ctx.fill();
				ctx.stroke();
				ctx.fillStyle = '#64748b';
				ctx.font = 'bold 16px sans-serif';
				ctx.textAlign = 'center';
				ctx.fillText('+', slot.x, slot.y + 5);
			}
		}

		// Draw Mines
		for (const m of engine.mines) {
			ctx.fillStyle = m.armingTimer > 0 ? '#64748b' : '#a855f7';
			ctx.beginPath();
			ctx.arc(m.x, m.y, 7, 0, Math.PI * 2);
			ctx.fill();
		}

		// Draw Allied Units (Robots & Exosuits)
		for (const u of engine.units) {
			let drawn = false;
			if (u.towerType === 'robot_line') {
				drawn = sprites.drawCentered(ctx, 'robot_unit', u.x, u.y - 4, 32, 36, true);
			} else if (u.towerType === 'exosuit') {
				drawn = sprites.drawCentered(ctx, 'exosuit_unit', u.x, u.y - 6, 38, 42, true);
			}

			if (!drawn) {
				ctx.fillStyle = u.towerType === 'robot_line' ? '#38bdf8' : '#10b981';
				ctx.beginPath();
				ctx.arc(u.x, u.y, 9, 0, Math.PI * 2);
				ctx.fill();
				ctx.strokeStyle = '#0f172a';
				ctx.lineWidth = 2;
				ctx.stroke();
			}

			if (u.towerType === 'robot_line') {
				ctx.fillStyle = '#facc15';
				ctx.fillRect(u.x - 10, u.y - 22, 20 * (u.batteryTimer / u.maxBattery), 3);
			}
		}

		// Draw Enemies (All 10 Colony Fauna types with Authentic Sprites!)
		for (const e of engine.enemies) {
			const cfg = ENEMIES[e.type];
			const nextWp = wps[e.waypointIndex + 1];
			const movingRight = nextWp ? nextWp.x >= e.x : true;

			// Air unit shadow
			if (cfg.domain === 'air') {
				ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
				ctx.beginPath();
				ctx.ellipse(e.x, e.y + 18, cfg.radius * 1.1, cfg.radius * 0.45, 0, 0, Math.PI * 2);
				ctx.fill();
			}

			// Size dimensions scaled to unit radius
			const spriteW = Math.max(44, cfg.radius * 3.4);
			const spriteH = Math.max(36, cfg.radius * 2.8);
			const offsetY = cfg.domain === 'air' ? -8 : -4;

			const drawn = sprites.drawCentered(
				ctx,
				e.type,
				e.x,
				e.y + offsetY,
				spriteW,
				spriteH,
				movingRight
			);

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

			// Shield aura for shield bearer
			if (cfg.shieldAuraRadius) {
				ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
				ctx.lineWidth = 2;
				ctx.setLineDash([4, 4]);
				ctx.beginPath();
				ctx.arc(e.x, e.y, cfg.shieldAuraRadius, 0, Math.PI * 2);
				ctx.stroke();
				ctx.setLineDash([]);
			}

			if (e.stunTimer > 0) {
				ctx.strokeStyle = '#38bdf8';
				ctx.lineWidth = 2.5;
				ctx.beginPath();
				ctx.arc(e.x, e.y, cfg.radius + 6, 0, Math.PI * 2);
				ctx.stroke();
			}

			// Health bar
			const hpPct = Math.max(0, e.hp / e.maxHp);
			const barY = e.y - (drawn ? (cfg.domain === 'air' ? 30 : 26) : cfg.radius + 9);
			ctx.fillStyle = '#0f172a';
			ctx.fillRect(e.x - 16, barY, 32, 4);
			ctx.fillStyle = hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#eab308' : '#ef4444';
			ctx.fillRect(e.x - 16, barY, 32 * hpPct, 4);
		}

		// Draw Heroes (All 5 Specialists with Authentic Sprites!)
		for (const h of engine.heroes) {
			const cfg = HEROES[h.id];
			const isSelected = game.activeHeroId === h.id;

			if (isSelected) {
				ctx.strokeStyle = '#facc15';
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.ellipse(h.x, h.y + 12, 22, 10, 0, 0, Math.PI * 2);
				ctx.stroke();
			}

			ctx.save();
			if (h.respawnTimer > 0) ctx.globalAlpha = 0.4;
			const drawn = sprites.drawCentered(ctx, h.id, h.x, h.y - 10, 58, 54, h.targetX >= h.x);
			ctx.restore();

			if (!drawn) {
				ctx.fillStyle = h.respawnTimer > 0 ? '#475569' : cfg.color;
				ctx.beginPath();
				ctx.arc(h.x, h.y, 15, 0, Math.PI * 2);
				ctx.fill();
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
				ctx.beginPath();
				ctx.moveTo(fx.x, fx.y);
				ctx.lineTo(fx.targetX, fx.targetY);
				ctx.stroke();
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
		game.loadSavedLoadout();
		let last = performance.now();
		let raf: number;
		let lastHudUpdate = performance.now();
		const loop = (now: number) => {
			const dt = (now - last) / 1000;
			last = now;
			if (game.screen === 'playing') {
				engine.update(dt);
				if (now - lastHudUpdate > 100) {
					hudTick++;
					lastHudUpdate = now;
				}
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

<div
	class="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 select-none"
>
	<!-- Global Top Utility Bar with Language Switcher (UA / EN / RU) -->
	<header class="w-full max-w-6xl flex items-center justify-between py-2 px-1 mb-2 text-xs">
		<div class="flex items-center gap-2">
			<span class="font-extrabold text-amber-400 tracking-wider uppercase text-sm"
				>Alik vs Sahko</span
			>
			<span class="text-slate-500 hidden sm:inline">•</span>
			<span class="text-slate-400 hidden sm:inline">{t.subtitle}</span>
		</div>
		<div class="flex items-center gap-2.5">
			<!-- Language Switcher (UA / EN / RU) -->
			<div
				class="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 shadow-sm"
				role="group"
				aria-label="Language selection"
			>
				<button
					type="button"
					onclick={() => game.setLocale('uk')}
					class="px-2.5 py-1 rounded-md font-bold text-xs transition cursor-pointer {game.locale ===
					'uk'
						? 'bg-amber-500 text-slate-950 shadow'
						: 'text-slate-400 hover:text-white'}"
					title="Українська"
				>
					🇺🇦 UA
				</button>
				<button
					type="button"
					onclick={() => game.setLocale('en')}
					class="px-2.5 py-1 rounded-md font-bold text-xs transition cursor-pointer {game.locale ===
					'en'
						? 'bg-amber-500 text-slate-950 shadow'
						: 'text-slate-400 hover:text-white'}"
					title="English"
				>
					🇬🇧 EN
				</button>
				<button
					type="button"
					onclick={() => game.setLocale('ru')}
					class="px-2.5 py-1 rounded-md font-bold text-xs transition cursor-pointer {game.locale ===
					'ru'
						? 'bg-amber-500 text-slate-950 shadow'
						: 'text-slate-400 hover:text-white'}"
					title="Русский"
				>
					🏳️ RU
				</button>
			</div>

			<button
				type="button"
				onclick={() => (encyclopediaOpen = true)}
				class="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
			>
				<span>📖</span>
				<span class="hidden sm:inline">Довідник</span>
			</button>
		</div>
	</header>

	{#if game.screen === 'menu'}
		<div
			class="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6"
		>
			<div class="flex items-center justify-between border-b border-slate-800 pb-4">
				<div>
					<span class="text-xs font-bold uppercase tracking-widest text-amber-400"
						>Космічна Tower Defense • Повна графіка</span
					>
					<h1 class="text-4xl font-extrabold mt-1">ОСТАННІЙ КОРАБЕЛЬ КОЛОНІЇ</h1>
					<p class="text-slate-400 mt-1">
						Цивільні спеціалісти перетворюють промислові інструменти на зброю
					</p>
				</div>
				<div class="text-right text-sm text-slate-400">
					<div>Кампанія: 4 райони / 20 місій</div>
					<div class="text-emerald-400 font-semibold">Доступно: Район 1 (Місія 01)</div>
				</div>
			</div>

			<!-- 4 Campaign Districts Overview -->
			<div class="grid grid-cols-1 md:grid-cols-4 gap-3">
				<div class="p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500">
					<div class="text-xs text-amber-400 font-bold">МІСІЇ 01–05</div>
					<div class="font-bold text-lg mt-1">1. Промислова околиця</div>
					<p class="text-xs text-slate-300 mt-1">
						Утримати майстерню та зібрати вцілілих робітників.
					</p>
				</div>
				<div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700 opacity-60">
					<div class="text-xs text-slate-400 font-bold">МІСІЇ 06–10</div>
					<div class="font-bold text-lg mt-1">2. Житловий район</div>
					<p class="text-xs text-slate-400 mt-1">Евакуація лікарні та порятунок спеціалістів.</p>
				</div>
				<div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700 opacity-60">
					<div class="text-xs text-slate-400 font-bold">МІСІЇ 11–15</div>
					<div class="font-bold text-lg mt-1">3. Видобуток і завод</div>
					<p class="text-xs text-slate-400 mt-1">
						Збір вузлів та палива для материнського корабля.
					</p>
				</div>
				<div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700 opacity-60">
					<div class="text-xs text-slate-400 font-bold">МІСІЇ 16–20</div>
					<div class="font-bold text-lg mt-1">4. Космопорт</div>
					<p class="text-xs text-slate-400 mt-1">Запуск систем корабля та фінальна евакуація.</p>
				</div>
			</div>

			<div class="flex flex-wrap items-center justify-between gap-3 pt-2">
				<button
					onclick={() => (encyclopediaOpen = true)}
					class="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-bold text-sm transition cursor-pointer flex items-center gap-2"
				>
					<span>📖 Довідник обладнання та фауни (47 артів)</span>
				</button>
				<button
					onclick={() => (game.screen = 'loadout')}
					class="px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-lg transition cursor-pointer"
				>
					Підготовка до Місії 01: Майстерня →
				</button>
			</div>
		</div>
	{:else if game.screen === 'loadout'}
		<div
			class="max-w-6xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6"
		>
			<div class="flex flex-wrap justify-between items-center gap-3">
				<div>
					<h2 class="text-2xl font-bold">Комплектація загону перед місією</h2>
					<p class="text-slate-400 text-sm">
						Оберіть установки (1–5, зараз: <span class="font-bold text-amber-400"
							>{game.selectedTowers.length}/5</span
						>) та спеціалістів (1–2, зараз:
						<span class="font-bold text-emerald-400">{game.selectedHeroes.length}/2</span>)
					</p>
				</div>
				<div class="flex items-center gap-3">
					<button
						onclick={() => (encyclopediaOpen = true)}
						class="text-xs text-amber-400 hover:underline cursor-pointer">📖 Довідник</button
					>
					<button
						onclick={() => (game.screen = 'menu')}
						class="text-sm text-slate-400 hover:text-white cursor-pointer">← Назад у меню</button
					>
				</div>
			</div>

			<!-- Quick Presets & Actions Bar (Горизонтальна панель швидких кнопок) -->
			<div
				class="flex flex-wrap items-center gap-2 p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl"
			>
				<span
					class="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1.5"
				>
					<span>⚡</span> Пресети:
				</span>
				<button
					type="button"
					onclick={() => {
						gameAudio.playSound('click');
						game.randomizeLoadout();
					}}
					class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 border border-slate-700 hover:border-amber-400 shadow-sm"
					title="Згенерувати 5 випадкових веж та 2 випадкових героїв"
				>
					<span>🎲</span> <span>Випадковий</span>
				</button>
				<button
					type="button"
					onclick={() => {
						gameAudio.playSound('click');
						game.applyPreset('balance');
					}}
					class="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border {game.activePresetId ===
					'balance'
						? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
						: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'}"
					title="Універсальний набір: затримка, лазер, пробиття та монтаж"
				>
					<span>🛡️</span> <span>Баланс</span>
				</button>
				<button
					type="button"
					onclick={() => {
						gameAudio.playSound('click');
						game.applyPreset('heavy');
					}}
					class="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border {game.activePresetId ===
					'heavy'
						? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
						: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'}"
					title="Бронебійні знаряддя, важкі крани та штурмові екзокостюми"
				>
					<span>💥</span> <span>Важкий</span>
				</button>
				<button
					type="button"
					onclick={() => {
						gameAudio.playSound('click');
						game.applyPreset('control');
					}}
					class="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border {game.activePresetId ===
					'control'
						? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
						: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'}"
					title="Сповільнення сейсмікою, мінні загородження та зачистка"
				>
					<span>🌪️</span> <span>Контроль</span>
				</button>
				<div class="h-5 w-px bg-slate-800 mx-1"></div>
				<button
					type="button"
					onclick={() => {
						gameAudio.playSound('click');
						game.clearLoadout();
					}}
					class="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:border-rose-500/60 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
					title="Скинути весь вибір (0 веж, 0 героїв)"
				>
					<span>🗑️</span> <span>Очистити</span>
				</button>
			</div>

			<!-- 2-Column Main Selection & Inspector Layout -->
			<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
				<!-- Left Column: Selection Grids (8 cols) -->
				<div class="lg:col-span-8 space-y-6">
					<!-- Towers Selection Grid (8 towers) with Strict Dimming -->
					<div>
						<div class="flex items-center justify-between mb-2">
							<h3 class="text-sm font-bold uppercase tracking-wider text-slate-400">
								{t.selectTowersHelp}
							</h3>
							<span
								class="text-xs px-2 py-0.5 rounded font-bold {game.selectedTowers.length === 5
									? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
									: game.selectedTowers.length > 0
										? 'bg-slate-800 text-slate-300'
										: 'bg-rose-500/20 text-rose-300 border border-rose-500/40'}"
							>
								{game.selectedTowers.length}/5
							</span>
						</div>
						<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
							{#each towerList as tItem}
								{@const isSelected = game.selectedTowers.includes(tItem.id)}
								{@const isFull = game.selectedTowers.length >= 5}
								{@const isDimmed = !isSelected && isFull}
								<button
									type="button"
									disabled={isDimmed}
									onclick={() => {
										gameAudio.playSound('click');
										game.toggleTowerInLoadout(tItem.id);
									}}
									class="p-2.5 rounded-xl border text-left transition flex flex-col justify-between relative group {isSelected
										? 'bg-slate-800/95 border-amber-400 ring-2 ring-amber-400/30 shadow-lg shadow-amber-500/10 opacity-100 scale-[1.01] cursor-pointer'
										: isDimmed
											? 'bg-slate-950/30 border-slate-900/60 opacity-30 grayscale-[75%] cursor-not-allowed shadow-none'
											: 'bg-slate-950/70 border-slate-800/90 opacity-85 hover:opacity-100 hover:border-slate-700 cursor-pointer'}"
								>
									{#if isSelected}
										<span
											class="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 shadow"
										>
											✓ {t.selectedBadge}
										</span>
									{:else if isDimmed}
										<span
											class="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900/90 text-slate-400 border border-slate-800"
										>
											🔒 5/5
										</span>
									{/if}
									<div
										class="w-full h-24 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-center p-1.5 mb-2 overflow-hidden"
									>
										<img
											src={asset(getTowerAssetPath(tItem.id, 1))}
											alt={tItem.name}
											class="max-w-full max-h-full object-contain drop-shadow"
										/>
									</div>
									<div>
										<div class="flex items-center justify-between gap-1">
											<span class="font-bold text-xs truncate" style="color: {tItem.color}"
												>{tItem.name}</span
											>
											<span
												class="text-[11px] px-1.5 py-0.5 rounded bg-slate-900 font-bold shrink-0 text-amber-400"
												>{tItem.levels[0].cost}⚡</span
											>
										</div>
										<p class="text-[11px] text-slate-400 mt-1 line-clamp-2">{tItem.role}</p>
									</div>
								</button>
							{/each}
						</div>
					</div>

					<!-- Heroes Selection Grid (5 heroes) with Strict Dimming -->
					<div>
						<div class="flex items-center justify-between mb-2">
							<h3 class="text-sm font-bold uppercase tracking-wider text-slate-400">
								{t.selectHeroesHelp}
							</h3>
							<span
								class="text-xs px-2 py-0.5 rounded font-bold {game.selectedHeroes.length === 2
									? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
									: game.selectedHeroes.length > 0
										? 'bg-slate-800 text-slate-300'
										: 'bg-rose-500/20 text-rose-300 border border-rose-500/40'}"
							>
								{game.selectedHeroes.length}/2
							</span>
						</div>
						<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
							{#each heroList as h}
								{@const isSelected = game.selectedHeroes.includes(h.id)}
								{@const isFull = game.selectedHeroes.length >= 2}
								{@const isDimmed = !isSelected && isFull}
								{@const isInspected = inspectedHeroId === h.id}
								<div
									role="button"
									tabindex="0"
									onclick={() => {
										inspectedHeroId = h.id;
										if (isSelected) {
											gameAudio.playSound('click');
											game.toggleHeroInLoadout(h.id);
										} else if (!isFull) {
											gameAudio.playSound('click');
											game.toggleHeroInLoadout(h.id);
										}
									}}
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											inspectedHeroId = h.id;
											if (isSelected || !isFull) game.toggleHeroInLoadout(h.id);
										}
									}}
									class="p-2.5 rounded-xl border text-left transition flex flex-col justify-between relative group cursor-pointer {isSelected
										? 'bg-slate-800/95 border-emerald-400 ring-2 ring-emerald-400/30 shadow-lg shadow-emerald-500/10 opacity-100 scale-[1.01]'
										: isDimmed
											? 'bg-slate-950/30 border-slate-900/60 opacity-35 grayscale-[70%] hover:opacity-75 hover:grayscale-0'
											: 'bg-slate-950/70 border-slate-800/90 opacity-85 hover:opacity-100 hover:border-slate-700'} {isInspected
										? 'ring-2 ring-sky-400 shadow-md shadow-sky-500/20'
										: ''}"
									title={h.abilityDesc}
								>
									{#if isSelected}
										<span
											class="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 shadow"
										>
											★ {t.inSquad}
										</span>
									{:else if isDimmed}
										<span
											class="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900/90 text-slate-400 border border-slate-800"
										>
											🔒 2/2
										</span>
									{/if}
									<div
										class="w-full h-24 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-center p-1 mb-2 overflow-hidden"
									>
										<img
											src={asset(getHeroAssetPath(h.id))}
											alt={h.name}
											class="max-w-full max-h-full object-contain drop-shadow"
										/>
									</div>
									<div>
										<div class="font-bold text-xs truncate" style="color: {h.color}">{h.name}</div>
										<div class="text-[10px] text-slate-400 truncate">{h.profession}</div>
										<div class="mt-1 text-[11px] text-emerald-300 font-semibold truncate">
											★ {h.abilityName}
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Right Column: Hero Inspector Panel (4 cols) (Point 8) -->
				<div class="lg:col-span-4 sticky top-4">
					{#snippet heroInspector()}
						{@const inSquad = game.selectedHeroes.includes(inspectedHero.id)}
						{@const squadFull = game.selectedHeroes.length >= 2}
						<div
							class="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4"
						>
							<div class="flex items-center justify-between border-b border-slate-800/80 pb-2">
								<span
									class="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5"
								>
									<span>🔎</span> <span>{t.heroInspectorTitle}</span>
								</span>
								{#if inSquad}
									<span
										class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
									>
										✓ {t.inSquad}
									</span>
								{:else if squadFull}
									<span
										class="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40"
									>
										🔒 2/2 Ліміт
									</span>
								{:else}
									<span
										class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400"
									>
										Вільний слот
									</span>
								{/if}
							</div>

							<!-- Large Hero Portrait -->
							<div
								class="w-full h-44 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-center p-3 relative overflow-hidden shadow-inner"
							>
								<img
									src={asset(getHeroAssetPath(inspectedHero.id))}
									alt={inspectedHero.name}
									class="max-w-full max-h-full object-contain drop-shadow-lg"
								/>
							</div>

							<!-- Hero Name & Title -->
							<div>
								<div class="text-lg font-black tracking-wide" style="color: {inspectedHero.color}">
									{inspectedHero.name}
								</div>
								<div class="text-xs font-semibold text-slate-400">
									{inspectedHero.profession}
								</div>
							</div>

							<!-- Tactical Combat Stats -->
							<div class="grid grid-cols-2 gap-2 text-xs">
								<div class="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
									<span class="text-slate-400 text-[10px] block">{t.heroStatsHp}</span>
									<span class="font-bold text-rose-400">❤️ {inspectedHero.hp}</span>
								</div>
								<div class="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
									<span class="text-slate-400 text-[10px] block">{t.heroStatsDamage}</span>
									<span class="font-bold text-amber-300">⚔️ {inspectedHero.damage}</span>
								</div>
								<div class="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
									<span class="text-slate-400 text-[10px] block">{t.heroStatsRange}</span>
									<span class="font-bold text-sky-300">🎯 {inspectedHero.range}px</span>
								</div>
								<div class="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
									<span class="text-slate-400 text-[10px] block">{t.heroStatsCooldown}</span>
									<span class="font-bold text-purple-300">⏱️ {inspectedHero.abilityCooldown}с</span>
								</div>
							</div>

							<!-- Complete Uncut Ability Description -->
							<div class="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
								<div class="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
									<span>★</span> <span>{inspectedHero.abilityName}</span>
								</div>
								<p class="text-xs text-slate-300 leading-relaxed">
									{inspectedHero.abilityDesc}
								</p>
							</div>

							<!-- Action Button in Inspector -->
							<div>
								{#if inSquad}
									<button
										type="button"
										onclick={() => {
											gameAudio.playSound('click');
											game.toggleHeroInLoadout(inspectedHero.id);
										}}
										class="w-full py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
									>
										<span>✕</span> <span>Вилучити із загону</span>
									</button>
								{:else if squadFull}
									<div
										class="text-center p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-amber-300"
									>
										{t.limitReached}
									</div>
								{:else}
									<button
										type="button"
										onclick={() => {
											gameAudio.playSound('click');
											game.toggleHeroInLoadout(inspectedHero.id);
										}}
										class="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
									>
										<span>+</span> <span>Додати до загону ({game.selectedHeroes.length}/2)</span>
									</button>
								{/if}
							</div>
						</div>
					{/snippet}
					{@render heroInspector()}
				</div>
			</div>

			<!-- Bottom Actions & Readiness State (Гнучкий мінімум) -->
			<div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
				<div class="text-xs">
					{#if game.selectedTowers.length === 0 || game.selectedHeroes.length === 0}
						<span class="text-rose-400 font-semibold flex items-center gap-1.5">
							<span>⚠️</span>
							{#if game.selectedTowers.length === 0 && game.selectedHeroes.length === 0}
								Оберіть щонайменше 1 інженерну вежу та 1 спеціаліста для виходу на місію.
							{:else if game.selectedTowers.length === 0}
								Оберіть щонайменше 1 інженерну вежу для захисту.
							{:else}
								Оберіть щонайменше 1 спеціаліста (героя).
							{/if}
						</span>
					{:else if game.selectedTowers.length < 5 || game.selectedHeroes.length < 2}
						<span class="text-amber-300 font-semibold flex items-center gap-1.5">
							<span>⚡</span>
							<span
								>Челендж-склад ({game.selectedTowers.length}/5 веж, {game.selectedHeroes.length}/2
								героїв). Гра буде складнішою!</span
							>
						</span>
					{:else}
						<span class="text-emerald-400 font-semibold flex items-center gap-1.5">
							<span>✓</span>
							<span>Повний бойовий склад: 5 веж та 2 спеціалісти готові до бою.</span>
						</span>
					{/if}
				</div>

				<button
					disabled={!game.canStartMission()}
					onclick={beginBriefing}
					class="px-8 py-3 rounded-xl font-extrabold text-sm transition cursor-pointer flex items-center gap-2 {game.canStartMission()
						? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
						: 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-50'}"
				>
					{t.btnBriefing}
				</button>
			</div>
		</div>
	{:else if game.screen === 'briefing'}
		<div class="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
			<div class="text-xs font-bold uppercase text-amber-400">{game.mission.district}</div>
			<h2 class="text-3xl font-extrabold">{game.mission.title}</h2>
			<p class="text-slate-400 text-sm">{game.mission.subtitle}</p>

			<!-- Dialogue lines -->
			<div class="space-y-3 py-2">
				{#each game.mission.preMissionDialogue as line}
					{@const hid = getSpeakerHeroId(line.speaker)}
					<div
						class="p-4 rounded-xl bg-slate-950 border-l-4 flex gap-4 items-center"
						style="border-color: {line.color}"
					>
						{#if hid}
							<div
								class="w-14 h-14 shrink-0 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center p-1 shadow-md"
							>
								<img
									src={asset(getHeroAssetPath(hid))}
									alt={line.speaker}
									class="max-w-full max-h-full object-contain"
								/>
							</div>
						{/if}
						<div class="flex-1 min-w-0">
							<div class="text-sm font-bold" style="color: {line.color}">
								{line.speaker} <span class="text-xs text-slate-500">({line.role})</span>
							</div>
							<p class="text-slate-200 text-sm mt-1">«{line.text}»</p>
						</div>
					</div>
				{/each}
			</div>

			<!-- Selected Squad Summary Roster (Point 10) -->
			<div class="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
				<div class="flex items-center justify-between">
					<h4
						class="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5"
					>
						<span>🛡️</span>
						<span
							>{t.missionSquad} ({game.selectedTowers.length}/5 веж, {game.selectedHeroes.length}/2
							спеціалісти)</span
						>
					</h4>
					<button
						type="button"
						onclick={() => (game.screen = 'loadout')}
						class="text-xs text-slate-400 hover:text-white underline cursor-pointer"
					>
						{t.btnChangeLoadout}
					</button>
				</div>

				<!-- Selected Heroes Roster -->
				<div>
					<div class="text-[11px] font-bold text-slate-400 mb-1.5 uppercase">
						Спеціалісти загону:
					</div>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
						{#each game.selectedHeroes as hid}
							{@const hero = HEROES[hid]}
							<div
								class="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900 border border-slate-800"
							>
								<div
									class="w-11 h-11 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center p-0.5 shrink-0"
								>
									<img
										src={asset(getHeroAssetPath(hero.id))}
										alt={hero.name}
										class="max-w-full max-h-full object-contain"
									/>
								</div>
								<div class="min-w-0">
									<div class="font-bold text-xs truncate" style="color: {hero.color}">
										{hero.name}
									</div>
									<div class="text-[11px] text-emerald-400 truncate">★ {hero.abilityName}</div>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Selected Towers Roster -->
				<div>
					<div class="text-[11px] font-bold text-slate-400 mb-1.5 uppercase">
						Інженерні установки:
					</div>
					<div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
						{#each game.selectedTowers as tid}
							{@const twr = TOWERS[tid]}
							<div
								class="flex flex-col items-center p-2 rounded-lg bg-slate-900 border border-slate-800 text-center"
							>
								<div
									class="w-11 h-11 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center p-0.5 shrink-0 mb-1"
								>
									<img
										src={asset(getTowerAssetPath(twr.id, 1))}
										alt={twr.name}
										class="max-w-full max-h-full object-contain"
									/>
								</div>
								<div class="font-bold text-[11px] truncate w-full" style="color: {twr.color}">
									{twr.name}
								</div>
								<div class="text-[10px] text-amber-400 font-semibold">{twr.levels[0].cost}⚡</div>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<div class="flex justify-between items-center pt-2">
				<button
					onclick={() => (game.screen = 'loadout')}
					class="text-sm text-slate-400 hover:text-white cursor-pointer"
					>{t.btnChangeLoadout}</button
				>
				<button
					onclick={launchBattle}
					class="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold cursor-pointer shadow-lg shadow-amber-500/20"
				>
					{t.btnToBattle}
				</button>
			</div>
		</div>
	{:else if game.screen === 'playing'}
		<!-- Hidden element to subscribe HUD to hudTick -->
		<span class="hidden">{hudTick}</span>
		<div class="w-full max-w-[1120px] space-y-2">
			<!-- Top HUD Bar -->
			<div
				class="flex flex-wrap items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 gap-3"
			>
				<div class="flex items-center gap-5">
					<div class="text-sm font-bold text-rose-400">
						❤️ Життя: <span class="text-lg">{game.lives}</span>
					</div>
					<div class="text-sm font-bold text-amber-400">
						⚡ Ресурси: <span class="text-lg">{game.currency}</span>
					</div>
					<div class="text-sm font-bold text-sky-400">
						🌊 Хвиля: <span class="text-lg">{game.currentWave} / {game.totalWaves}</span>
					</div>
				</div>

				{#if !game.isPaused && game.currentWave < game.totalWaves}
					<button
						onclick={() => engine.callNextWave(true)}
						class="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500 text-amber-300 hover:bg-amber-500/30 text-xs font-bold cursor-pointer"
					>
						🔔 Дострокова хвиля (+{game.mission.waves[game.currentWave]?.earlyCallBonus ?? 0}⚡)
						{#if !game.waveActive}({Math.ceil(game.nextWaveCountdown)}с){/if}
					</button>
				{/if}

				<div class="flex items-center gap-2">
					<button
						onclick={() => (game.isPaused = !game.isPaused)}
						class="px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer {game.isPaused
							? 'bg-amber-500 text-slate-950 border-amber-400'
							: 'bg-slate-800 border-slate-700'}"
					>
						{game.isPaused ? '▶ Зняти з паузи' : '⏸ Пауза огляду'}
					</button>
					<button
						onclick={() => (game.gameSpeed = game.gameSpeed === 1 ? 2 : 1)}
						class="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold cursor-pointer"
					>
						Швидкість ×{game.gameSpeed}
					</button>
					<button
						onclick={() => (encyclopediaOpen = true)}
						class="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-amber-300 cursor-pointer"
						title="Довідник веж та фауни"
					>
						📖
					</button>
					<button
						onclick={() => (game.editorMode = !game.editorMode)}
						class="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-400 cursor-pointer"
						title="Клік: додати точку шляху, Shift+Клік: додати слот вежі"
					>
						{game.editorMode ? '🛠 Редактор ON' : '🛠'}
					</button>
					<button
						onclick={() => (game.screen = 'menu')}
						class="px-2.5 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-400 cursor-pointer"
						>Меню</button
					>
				</div>
			</div>

			{#if game.isPaused}
				<div
					class="bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs px-4 py-1.5 rounded-lg text-center"
				>
					Пауза для огляду поля: за правилами концепту будівництво, накази героям та здібності під
					час паузи недоступні.
				</div>
			{/if}

			<!-- Main Interactive Battle Arena -->
			<div class="relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
				<canvas
					bind:this={canvas}
					width="1100"
					height="600"
					onclick={handleCanvasClick}
					class="w-full h-auto block cursor-crosshair"
				></canvas>

				<!-- Victory / Defeat Modal -->
				{#if game.outcome !== 'none'}
					<div class="absolute inset-0 bg-slate-950/85 flex items-center justify-center p-6">
						<div
							class="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center space-y-4"
						>
							{#if game.outcome === 'victory'}
								<div class="text-4xl">⭐⭐⭐</div>
								<h3 class="text-3xl font-extrabold text-emerald-400">МАЙСТЕРНЮ ВРЯТОВАНО!</h3>
								<p class="text-slate-300 text-sm">
									Зірок здобуто: {game.starsEarned} / 3 (Залишок життів: {game.lives})
								</p>
							{:else}
								<h3 class="text-3xl font-extrabold text-rose-500">ОБОРОНУ ПРОРВАНО</h3>
								<p class="text-slate-300 text-sm">
									Фауна захопила майстерню. Спробуйте іншу комбінацію веж!
								</p>
							{/if}
							<div class="flex gap-3 justify-center pt-2">
								<button
									onclick={launchBattle}
									class="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold cursor-pointer"
									>Зіграти знову</button
								>
								<button
									onclick={() => (game.screen = 'menu')}
									class="px-6 py-2.5 rounded-xl bg-slate-800 font-bold cursor-pointer"
									>У меню</button
								>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Bottom Control Bar: Heroes & Selected Slot Inspector -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
				<!-- Heroes Panel with Portraits -->
				<div class="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex gap-2.5">
					{#each engine.heroes as h}
						{@const cfg = HEROES[h.id]}
						<div
							class="flex-1 p-2 rounded-lg bg-slate-950 border flex flex-col justify-between {game.activeHeroId ===
							h.id
								? 'border-amber-400 ring-1 ring-amber-400/40'
								: 'border-slate-800'}"
						>
							<div class="flex items-center gap-2">
								<div
									class="w-10 h-10 shrink-0 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center p-0.5"
								>
									<img
										src={asset(getHeroAssetPath(h.id))}
										alt={cfg.name}
										class="max-w-full max-h-full object-contain"
									/>
								</div>
								<div class="flex-1 min-w-0">
									<div class="flex justify-between items-center">
										<button
											onclick={() => (game.activeHeroId = h.id)}
											class="font-bold text-xs truncate cursor-pointer"
											style="color: {cfg.color}"
										>
											{cfg.name}
										</button>
										<span class="text-[10px] text-slate-400 shrink-0">
											{h.respawnTimer > 0
												? `${Math.ceil(h.respawnTimer)}с`
												: `${Math.ceil(h.hp)}/${h.maxHp}`}
										</span>
									</div>
									<div class="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1">
										<div
											class="bg-sky-400 h-full"
											style="width: {Math.max(0, (h.hp / h.maxHp) * 100)}%"
										></div>
									</div>
								</div>
							</div>
							<button
								disabled={game.isPaused || h.respawnTimer > 0 || h.abilityCooldownTimer > 0}
								onclick={() => engine.triggerHeroAbility(h.id)}
								class="mt-2 w-full py-1 rounded bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-[11px] font-bold disabled:opacity-40 cursor-pointer truncate"
							>
								{h.abilityCooldownTimer > 0
									? `${cfg.abilityName} (${Math.ceil(h.abilityCooldownTimer)}с)`
									: `★ ${cfg.abilityName}`}
							</button>
						</div>
					{/each}
				</div>

				<!-- Tower Build / Upgrade Contextual Inspector with Artwork -->
				<div class="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-3">
					{#if game.activeSlotId}
						{@const existing = engine.towers.get(game.activeSlotId)}
						{#if !existing}
							<div class="text-xs text-slate-400 mb-2 font-bold">
								Оберіть установку для зведення на слоті #{game.activeSlotId}:
							</div>
							<div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
								{#each game.selectedTowers as tid}
									{@const t = TOWERS[tid]}
									<button
										disabled={game.isPaused || game.currency < t.levels[0].cost}
										onclick={() => engine.buildTower(game.activeSlotId!, tid)}
										class="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-400 disabled:opacity-40 flex items-center gap-2 text-left cursor-pointer"
									>
										<div
											class="w-10 h-10 shrink-0 rounded bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden p-0.5"
										>
											<img
												src={asset(getTowerAssetPath(tid, 1))}
												alt={t.name}
												class="max-w-full max-h-full object-contain"
											/>
										</div>
										<div class="min-w-0 flex-1">
											<div class="font-bold text-xs truncate" style="color: {t.color}">
												{t.name}
											</div>
											<div class="text-[11px] text-amber-400 font-bold">{t.levels[0].cost}⚡</div>
										</div>
									</button>
								{/each}
							</div>
						{:else}
							{@const cfg = TOWERS[existing.type]}
							{@const currStats = cfg.levels[existing.level - 1]}
							{@const nextStats =
								existing.level < 4 ? cfg.levels[existing.level as 1 | 2 | 3] : null}
							<div class="flex flex-wrap items-center justify-between gap-3">
								<div class="flex items-center gap-3">
									<div
										class="w-14 h-14 shrink-0 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center p-1 overflow-hidden shadow-inner"
									>
										<img
											src={asset(getTowerAssetPath(existing.type, existing.level))}
											alt={cfg.name}
											class="max-w-full max-h-full object-contain"
										/>
									</div>
									<div>
										<div
											class="font-bold text-sm flex items-center gap-2"
											style="color: {cfg.color}"
										>
											<span>{cfg.name}</span>
											<span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-200"
												>Рівень {existing.level}/4</span
											>
										</div>
										<p class="text-xs text-slate-400 mt-0.5">{currStats.description}</p>
									</div>
								</div>
								<div class="flex gap-2 items-center">
									{#if nextStats}
										<button
											disabled={game.isPaused || game.currency < nextStats.cost}
											onclick={() => engine.upgradeTower(existing.slotId)}
											class="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs disabled:opacity-40 cursor-pointer flex items-center gap-2 shadow"
										>
											<img
												src={asset(
													getTowerAssetPath(existing.type, (existing.level + 1) as 1 | 2 | 3 | 4)
												)}
												alt="Next"
												class="w-5 h-5 object-contain"
											/>
											<span>Покращити до L{existing.level + 1} ({nextStats.cost}⚡)</span>
										</button>
									{/if}
									<button
										disabled={game.isPaused}
										onclick={() => engine.sellTower(existing.slotId)}
										class="px-3 py-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold cursor-pointer"
									>
										Демонтаж
									</button>
								</div>
							</div>
						{/if}
					{:else}
						<div class="text-xs text-slate-400 flex items-center justify-between h-full">
							<span
								>💡 Клікніть на круглий будівельний слот (+), щоб звести вежу, або оберіть героя для
								переміщення по полю.</span
							>
							{#if game.editorMode}
								<button
									onclick={() =>
										navigator.clipboard.writeText(
											JSON.stringify({
												waypoints: game.mission.waypoints,
												towerSlots: game.mission.towerSlots
											})
										)}
									class="px-3 py-1 rounded bg-sky-500 text-slate-950 font-bold cursor-pointer"
								>
									Копіювати JSON мапи
								</button>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- Encyclopedia / Bestiary Modal (Showcasing all 47 artworks!) -->
	{#if encyclopediaOpen}
		<div
			class="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
		>
			<div
				class="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full h-[85vh] min-h-[580px] max-h-[820px] flex flex-col overflow-hidden shadow-2xl"
			>
				<!-- Header with Tabs (Fixed) -->
				<div
					class="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/50 shrink-0"
				>
					<div>
						<h3 class="text-lg font-bold text-amber-400">{t.encyclopediaTitle}</h3>
						<p class="text-xs text-slate-400">
							{t.encyclopediaSubtitle}
						</p>
					</div>
					<div class="flex items-center gap-2">
						<div class="bg-slate-800 rounded-lg p-1 flex gap-1">
							<button
								onclick={() => (encyclopediaTab = 'towers')}
								class="px-3 py-1 rounded text-xs font-bold transition cursor-pointer {encyclopediaTab ===
								'towers'
									? 'bg-amber-500 text-slate-950'
									: 'text-slate-300 hover:text-white'}"
							>
								{t.tabTowers}
							</button>
							<button
								onclick={() => (encyclopediaTab = 'enemies')}
								class="px-3 py-1 rounded text-xs font-bold transition cursor-pointer {encyclopediaTab ===
								'enemies'
									? 'bg-amber-500 text-slate-950'
									: 'text-slate-300 hover:text-white'}"
							>
								{t.tabEnemies}
							</button>
							<button
								onclick={() => (encyclopediaTab = 'heroes')}
								class="px-3 py-1 rounded text-xs font-bold transition cursor-pointer {encyclopediaTab ===
								'heroes'
									? 'bg-amber-500 text-slate-950'
									: 'text-slate-300 hover:text-white'}"
							>
								{t.tabHeroes}
							</button>
						</div>
						<button
							onclick={() => (encyclopediaOpen = false)}
							class="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
						>
							✕
						</button>
					</div>
				</div>

				<!-- Content Area (Scrollable with fixed container height) -->
				<div class="p-4 overflow-y-auto flex-1 space-y-4">
					{#if encyclopediaTab === 'towers'}
						<!-- Tower Selector Pills with Fixed Icon Size (Point 1) -->
						<div class="flex flex-wrap gap-1.5 pb-2 border-b border-slate-800">
							{#each towerList as tItem}
								<button
									onclick={() => (selectedEncyclopediaTowerId = tItem.id)}
									class="px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer flex items-center gap-2 {selectedEncyclopediaTowerId ===
									tItem.id
										? 'bg-amber-500 text-slate-950 border-amber-400'
										: 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600'}"
								>
									<div
										class="w-7 h-7 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-center justify-center p-0.5 shrink-0"
									>
										<img
											src={asset(getTowerAssetPath(tItem.id, 1))}
											alt={tItem.name}
											class="max-w-full max-h-full object-contain"
										/>
									</div>
									<span>{tItem.name}</span>
								</button>
							{/each}
						</div>

						{@const curTower = TOWERS[selectedEncyclopediaTowerId]}
						<div>
							<div class="flex justify-between items-start mb-3">
								<div>
									<h4 class="text-xl font-bold" style="color: {curTower.color}">{curTower.name}</h4>
									<p class="text-xs text-slate-400">
										{curTower.role} • {t.targetLabel}:
										<span class="text-amber-300 font-semibold"
											>{getTargetDomainLabel(curTower.targetDomain, game.locale)}</span
										>
									</p>
								</div>
							</div>

							<!-- 4 Levels showcase with Uniform Alignment (Point 4 & 5) -->
							<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
								{#each curTower.levels as lvl}
									<div
										class="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between h-full"
									>
										<div>
											<!-- Fixed Image Container -->
											<div
												class="w-full h-32 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center p-2 mb-2 overflow-hidden shadow-inner"
											>
												<img
													src={asset(getTowerAssetPath(curTower.id, lvl.level))}
													alt="{t.levelLabel} {lvl.level}"
													class="max-w-full max-h-full object-contain"
												/>
											</div>

											<!-- Fixed Level Header -->
											<div class="flex justify-between items-center h-6 mb-1">
												<span class="text-xs font-bold text-amber-400"
													>{t.levelLabel} {lvl.level}</span
												>
												<span class="text-xs font-bold text-slate-300">{lvl.cost}⚡</span>
											</div>

											<!-- Fixed Stats Block (with Robot Damage & Unit Stats) -->
											<div
												class="text-[11px] text-slate-300 min-h-[38px] flex flex-col justify-center space-y-0.5"
											>
												<div class="flex justify-between">
													<span>{t.towerRange}: {lvl.range}px</span>
													{#if lvl.damage > 0}
														<span>{t.towerDamage}: {lvl.damage}</span>
													{:else if lvl.unitDamage !== undefined && lvl.unitDamage > 0}
														<span class="text-sky-300 font-bold"
															>{t.robotDamage}: {lvl.unitDamage}</span
														>
													{/if}
												</div>
												{#if lvl.unitHp !== undefined && lvl.unitHp > 1}
													<div class="flex justify-between text-[10px] text-emerald-400">
														<span>{t.robotHp}: {lvl.unitHp}</span>
														{#if lvl.maxUnits}<span>{t.robotCount}: {lvl.maxUnits}</span>{/if}
													</div>
												{/if}
											</div>
										</div>

										<!-- Fixed Description Block -->
										<p
											class="text-[11px] text-slate-400 leading-tight pt-1.5 border-t border-slate-800/60 mt-2 min-h-[52px]"
										>
											{lvl.description}
										</p>
									</div>
								{/each}
							</div>
						</div>
					{:else if encyclopediaTab === 'enemies'}
						<!-- Enemies with Uniform Alignment (Point 6) -->
						<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
							{#each enemyList as e}
								<div
									class="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between h-full"
								>
									<div>
										<!-- Fixed Image Container -->
										<div
											class="w-full h-28 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center p-2 mb-2 overflow-hidden shadow-inner"
										>
											<img
												src={asset(getEnemyAssetPath(e.id))}
												alt={e.name}
												class="max-w-full max-h-full object-contain"
											/>
										</div>

										<!-- Fixed Name & Domain Badge -->
										<div class="flex justify-between items-center h-6 mb-1">
											<span class="font-bold text-xs truncate mr-1" style="color: {e.color}"
												>{e.name}</span
											>
											<span
												class="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 shrink-0"
											>
												{e.domain === 'air' ? t.targetAir : t.targetGround}
											</span>
										</div>

										<!-- Fixed Stats Block -->
										<div class="text-[11px] text-slate-400 h-10 flex flex-col justify-between">
											<div class="flex justify-between">
												<span>HP: {e.hp}</span>
												<span>Швидкість: {e.speed}</span>
											</div>
											<div class="flex justify-between">
												<span>Броня: {Math.round(e.armor * 100)}%</span>
												<span class="text-amber-400">+{e.reward}⚡</span>
											</div>
										</div>
									</div>

									<!-- Fixed Traits Block -->
									<div
										class="h-10 flex flex-col justify-center pt-1 border-t border-slate-800/60 mt-1.5 overflow-hidden text-[10px]"
									>
										{#if e.canJump}
											<div class="text-amber-300 truncate">★ Стрибок через перешкоди</div>
										{/if}
										{#if e.spawnsOnDeath}
											<div class="text-rose-300 truncate">★ Розпадається при смерті</div>
										{/if}
										{#if e.periodicSpawn}
											<div class="text-purple-300 truncate">★ Породжує зграю в польоті</div>
										{/if}
										{#if e.shieldAuraRadius}
											<div class="text-cyan-300 truncate">★ Аура щита союзникам</div>
										{/if}
										{#if !e.canJump && !e.spawnsOnDeath && !e.periodicSpawn && !e.shieldAuraRadius}
											<div class="text-slate-500 italic">— Базовий штурмовик —</div>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					{:else if encyclopediaTab === 'heroes'}
						<!-- Heroes with Uniform Alignment (Point 7) -->
						<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
							{#each heroList as h}
								<div
									class="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between h-full"
								>
									<div>
										<!-- Fixed Portrait Container -->
										<div
											class="w-full h-36 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center p-2 mb-2 overflow-hidden shadow-inner"
										>
											<img
												src={asset(getHeroAssetPath(h.id))}
												alt={h.name}
												class="max-w-full max-h-full object-contain"
											/>
										</div>

										<!-- Fixed Name & Profession -->
										<div class="h-10 mb-1">
											<div class="font-bold text-sm truncate" style="color: {h.color}">
												{h.name}
											</div>
											<div class="text-xs text-slate-400 truncate">{h.profession}</div>
										</div>

										<!-- Fixed Stats -->
										<div class="text-xs text-slate-300 flex justify-between h-5 mb-2">
											<span>HP: {h.hp}</span>
											<span>Шкода: {h.damage}</span>
										</div>
									</div>

									<!-- Fixed Ability Card -->
									<div
										class="p-2.5 rounded-lg bg-slate-900 border border-slate-800 min-h-[96px] flex flex-col justify-between"
									>
										<div class="text-xs font-bold text-emerald-400">★ {h.abilityName}</div>
										<p class="text-[11px] text-slate-400 leading-tight mt-1">{h.abilityDesc}</p>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Fixed Footer -->
				<div class="p-3 border-t border-slate-800 flex justify-end bg-slate-950/40 shrink-0">
					<button
						onclick={() => (encyclopediaOpen = false)}
						class="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow"
					>
						{t.backToGame}
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
