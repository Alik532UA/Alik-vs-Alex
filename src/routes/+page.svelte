<script lang="ts">
	import { onMount } from 'svelte';
	import { game } from '$lib/game/state.svelte';
	import { TOWERS, HEROES, ENEMIES } from '$lib/game/configs';
	import { TDGameEngine } from '$lib/game/engine';
	import type { ActiveEnemy } from '$lib/game/engine';
	import { sprites, getTowerAssetPath, getHeroAssetPath } from '$lib/game/sprites';
	import { asset } from '$app/paths';
	import { getTranslation } from '$lib/i18n/game';
	import { getLocalizedTower, getLocalizedHero } from '$lib/i18n/content';
	import { gameA11y } from '$lib/game/a11y';
	import {
		BookOpen,
		Lightning,
		Star,
		Heart,
		Waves,
		Bell,
		Play,
		Pause,
		Wrench,
		Lightbulb,
		Globe
	} from 'phosphor-svelte';
	import EncyclopediaModal from '$lib/components/game/EncyclopediaModal.svelte';
	import MissionBriefing from '$lib/components/screens/MissionBriefing.svelte';
	import MainMenu from '$lib/components/screens/MainMenu.svelte';
	import SquadLoadout from '$lib/components/screens/SquadLoadout.svelte';

	const t = $derived(getTranslation(game.locale));

	let canvas = $state<HTMLCanvasElement | null>(null);
	const engine = new TDGameEngine();
	let hudTick = $state(0);

	let encyclopediaOpen = $state(false);

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
	<!-- Global Top Utility Bar with Language Switcher (UA / EN) -->
	<header class="w-full max-w-6xl flex items-center justify-between py-2 px-1 mb-2 text-xs">
		<div class="flex items-center gap-2">
			<span class="font-extrabold text-amber-400 tracking-wider uppercase text-sm"
				>Alik vs Alex</span
			>
			<span class="text-slate-500 hidden sm:inline">•</span>
			<span class="text-slate-400 hidden sm:inline">{t.subtitle}</span>
		</div>
		<div class="flex items-center gap-2.5">
			<!-- Language Switcher (UA / EN) -->
			<div
				class="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 shadow-sm"
				role="group"
				aria-label="Language selection"
			>
				<button
					type="button"
					onclick={() => game.setLocale('uk')}
					class="px-2.5 py-1 rounded-md font-bold text-xs transition cursor-pointer flex items-center gap-1 {game.locale ===
					'uk'
						? 'bg-amber-500 text-slate-950 shadow'
						: 'text-slate-400 hover:text-white'}"
					title="Українська"
				>
					<Globe size={13} weight={game.locale === 'uk' ? 'fill' : 'regular'} />
					<span>UA</span>
				</button>
				<button
					type="button"
					onclick={() => game.setLocale('en')}
					class="px-2.5 py-1 rounded-md font-bold text-xs transition cursor-pointer flex items-center gap-1 {game.locale ===
					'en'
						? 'bg-amber-500 text-slate-950 shadow'
						: 'text-slate-400 hover:text-white'}"
					title="English"
				>
					<Globe size={13} weight={game.locale === 'en' ? 'fill' : 'regular'} />
					<span>EN</span>
				</button>
			</div>

			<button
				type="button"
				onclick={() => (encyclopediaOpen = true)}
				class="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
			>
				<BookOpen size={16} weight="bold" />
				<span class="hidden sm:inline">{t.manualBtn}</span>
			</button>
		</div>
	</header>

	{#if game.screen === 'menu'}
		<MainMenu onStartLoadout={() => (game.screen = 'loadout')} />
	{:else if game.screen === 'loadout'}
		<SquadLoadout onBack={() => (game.screen = 'menu')} onNext={() => (game.screen = 'briefing')} />
	{:else if game.screen === 'briefing'}
		<MissionBriefing onBack={() => (game.screen = 'loadout')} onBattle={launchBattle} />
	{:else if game.screen === 'playing'}
		<!-- Hidden element to subscribe HUD to hudTick -->
		<span class="hidden">{hudTick}</span>
		<div class="w-full max-w-[1120px] space-y-2">
			<!-- Top HUD Bar -->
			<div
				class="flex flex-wrap items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 gap-3"
			>
				<div class="flex items-center gap-5">
					<div class="text-sm font-bold text-rose-400 flex items-center gap-1.5">
						<Heart size={18} weight="fill" />
						<span>{t.hudLives}: <span class="text-lg">{game.lives}</span></span>
					</div>
					<div class="text-sm font-bold text-amber-400 flex items-center gap-1.5">
						<Lightning size={18} weight="fill" />
						<span>{t.hudScrap}: <span class="text-lg">{game.currency}</span></span>
					</div>
					<div class="text-sm font-bold text-sky-400 flex items-center gap-1.5">
						<Waves size={18} weight="bold" />
						<span
							>{t.hudWave}:
							<span class="text-lg">{game.currentWave} / {game.totalWaves}</span></span
						>
					</div>
				</div>

				{#if !game.isPaused && game.currentWave < game.totalWaves}
					<button
						onclick={() => engine.callNextWave(true)}
						class="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500 text-amber-300 hover:bg-amber-500/30 text-xs font-bold cursor-pointer flex items-center gap-1.5"
					>
						<Bell size={14} weight="fill" />
						<span
							>{t.earlyWaveBtn} (+{game.mission.waves[game.currentWave]?.earlyCallBonus ?? 0}</span
						>
						<Lightning size={11} weight="fill" />
						<span>)</span>
						{#if !game.waveActive}<span>({Math.ceil(game.nextWaveCountdown)}{t.secondsSuffix})</span
							>{/if}
					</button>
				{/if}

				<div class="flex items-center gap-2">
					<button
						onclick={() => (game.isPaused = !game.isPaused)}
						class="px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer flex items-center gap-1.5 {game.isPaused
							? 'bg-amber-500 text-slate-950 border-amber-400'
							: 'bg-slate-800 border-slate-700'}"
					>
						{#if game.isPaused}
							<Play size={13} weight="fill" />
							<span>{t.resume}</span>
						{:else}
							<Pause size={13} weight="fill" />
							<span>{t.tacticalPause}</span>
						{/if}
					</button>
					<button
						onclick={() => (game.gameSpeed = game.gameSpeed === 1 ? 2 : 1)}
						class="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold cursor-pointer"
					>
						{t.speed} ×{game.gameSpeed}
					</button>
					<button
						onclick={() => (encyclopediaOpen = true)}
						class="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-amber-300 cursor-pointer flex items-center justify-center"
						title={t.encyclopediaTitle}
					>
						<BookOpen size={15} weight="bold" />
					</button>
					<button
						onclick={() => (game.editorMode = !game.editorMode)}
						class="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-400 cursor-pointer flex items-center gap-1"
						title={t.editorTooltip}
					>
						<Wrench size={14} weight="bold" />
						{#if game.editorMode}
							<span>{t.editorOn}</span>
						{/if}
					</button>
					<button
						onclick={() => (game.screen = 'menu')}
						class="px-2.5 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-400 cursor-pointer"
						>{t.menuBtn}</button
					>
				</div>
			</div>

			{#if game.isPaused}
				<div
					class="bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs px-4 py-1.5 rounded-lg text-center"
				>
					{t.pauseOverlayNotice}
				</div>
			{/if}

			<!-- Main Interactive Battle Arena -->
			<div class="relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
				<div class="sr-only" aria-live="polite" aria-atomic="true">
					{gameA11y.getAnnouncement() ||
						(game.locale === 'en'
							? `Wave ${game.currentWave} of ${game.totalWaves}, lives ${game.lives}, scrap ${game.currency}`
							: `Хвиля ${game.currentWave} з ${game.totalWaves}, життів ${game.lives}, кредитів ${game.currency}`)}
				</div>
				<canvas
					bind:this={canvas}
					width="1100"
					height="600"
					tabindex="0"
					aria-label={t.canvasAriaLabel}
					onclick={handleCanvasClick}
					class="w-full h-auto block cursor-crosshair focus:outline-none focus:ring-2 focus:ring-cyan-400"
				></canvas>

				<!-- Victory / Defeat Modal -->
				{#if game.outcome !== 'none'}
					<div class="absolute inset-0 bg-slate-950/85 flex items-center justify-center p-6">
						<div
							class="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center space-y-4"
						>
							{#if game.outcome === 'victory'}
								<div class="flex justify-center items-center gap-2 text-amber-400">
									<Star size={36} weight="fill" />
									<Star size={44} weight="fill" />
									<Star size={36} weight="fill" />
								</div>
								<h3 class="text-3xl font-extrabold text-emerald-400">{t.victoryTitle}</h3>
								<p class="text-slate-300 text-sm">
									{t.victoryStars}: {game.starsEarned} / 3 ({t.remainingLives}: {game.lives})
								</p>
							{:else}
								<h3 class="text-3xl font-extrabold text-rose-500">{t.defeatTitle}</h3>
								<p class="text-slate-300 text-sm">
									{t.defeatSubtitle}
								</p>
							{/if}
							<div class="flex gap-3 justify-center pt-2">
								<button
									onclick={launchBattle}
									class="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold cursor-pointer"
									>{t.restart}</button
								>
								<button
									onclick={() => (game.screen = 'menu')}
									class="px-6 py-2.5 rounded-xl bg-slate-800 font-bold cursor-pointer"
									>{t.toMenuBtn}</button
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
						{@const cfg = getLocalizedHero(h.id, game.locale)}
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
												? `${Math.ceil(h.respawnTimer)}${t.secondsSuffix}`
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
								class="mt-2 w-full py-1 rounded bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-[11px] font-bold disabled:opacity-40 cursor-pointer truncate flex items-center justify-center gap-1"
							>
								{#if h.abilityCooldownTimer > 0}
									<span
										>{cfg.abilityName} ({Math.ceil(h.abilityCooldownTimer)}{t.secondsSuffix})</span
									>
								{:else}
									<Star size={11} weight="fill" />
									<span>{cfg.abilityName}</span>
								{/if}
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
								{t.selectTowerBuildSlot} #{game.activeSlotId}:
							</div>
							<div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
								{#each game.selectedTowers as tid}
									{@const twr = getLocalizedTower(tid, game.locale)}
									<button
										disabled={game.isPaused || game.currency < twr.levels[0].cost}
										onclick={() => engine.buildTower(game.activeSlotId!, tid)}
										class="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-400 disabled:opacity-40 flex items-center gap-2 text-left cursor-pointer"
									>
										<div
											class="w-10 h-10 shrink-0 rounded bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden p-0.5"
										>
											<img
												src={asset(getTowerAssetPath(tid, 1))}
												alt={twr.name}
												class="max-w-full max-h-full object-contain"
											/>
										</div>
										<div class="min-w-0 flex-1">
											<div class="font-bold text-xs truncate" style="color: {twr.color}">
												{twr.name}
											</div>
											<div class="text-[11px] text-amber-400 font-bold flex items-center gap-0.5">
												<span>{twr.levels[0].cost}</span>
												<Lightning size={11} weight="fill" />
											</div>
										</div>
									</button>
								{/each}
							</div>
						{:else}
							{@const cfg = getLocalizedTower(existing.type, game.locale)}
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
												>{t.levelLabel} {existing.level}/4</span
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
											<span class="flex items-center gap-1">
												<span>{t.upgradeTowerTo} L{existing.level + 1} ({nextStats.cost}</span>
												<Lightning size={11} weight="fill" />
												<span>)</span>
											</span>
										</button>
									{/if}
									<button
										disabled={game.isPaused}
										onclick={() => engine.sellTower(existing.slotId)}
										class="px-3 py-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold cursor-pointer"
									>
										{t.demolishTower}
									</button>
								</div>
							</div>
						{/if}
					{:else}
						<div class="text-xs text-slate-400 flex items-center justify-between h-full gap-2">
							<div class="flex items-center gap-1.5">
								<Lightbulb size={16} weight="fill" class="text-amber-400 shrink-0" />
								<span>{t.slotInstructionHint}</span>
							</div>
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
									{t.copyMapJsonBtn}
								</button>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- Encyclopedia / Bestiary Modal (Showcasing all 47 artworks!) -->
	<EncyclopediaModal open={encyclopediaOpen} onClose={() => (encyclopediaOpen = false)} />
</div>
