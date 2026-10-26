<script lang="ts">
	import { onMount } from 'svelte';
	import { game } from '$lib/game/state.svelte';
	import { TOWERS, HEROES, ENEMIES } from '$lib/game/configs';
	import { TDGameEngine } from '$lib/game/engine';
	import type { ActiveEnemy } from '$lib/game/engine';
	import type { TowerId, HeroId, TowerConfig, HeroConfig } from '$lib/game/types';

	const towerList: TowerConfig[] = Object.values(TOWERS);
	const heroList: HeroConfig[] = Object.values(HEROES);

	let canvas = $state<HTMLCanvasElement | null>(null);
	const engine = new TDGameEngine();
	let hudTick = $state(0);

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

		// Debug Path/Slot Editor mode for AI & Level tweaking
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

		// 1. Check if clicked a hero
		for (const h of engine.heroes) {
			if (Math.hypot(h.x - x, h.y - y) <= 22) {
				game.activeHeroId = h.id;
				game.activeSlotId = null;
				return;
			}
		}

		// 2. Check if clicked a tower slot
		for (const slot of game.mission.towerSlots) {
			if (Math.hypot(slot.x - x, slot.y - y) <= 28) {
				game.activeSlotId = slot.id;
				game.activeHeroId = null;
				return;
			}
		}

		// 3. If a hero is selected and game is not paused, command movement
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
			ctx.lineWidth = 44;
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

		// Draw Tower Slots & Built Towers
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

			ctx.fillStyle = built ? '#1e293b' : '#0f172a';
			ctx.strokeStyle = isSelected ? '#facc15' : '#64748b';
			ctx.lineWidth = isSelected ? 3 : 2;
			ctx.beginPath(); ctx.arc(slot.x, slot.y, 24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

			if (built) {
				const cfg = TOWERS[built.type];
				ctx.fillStyle = cfg.color;
				ctx.beginPath(); ctx.arc(slot.x, slot.y, 16, 0, Math.PI * 2); ctx.fill();
				ctx.fillStyle = '#0f172a';
				ctx.font = 'bold 12px sans-serif';
				ctx.textAlign = 'center';
				ctx.fillText(`L${built.level}`, slot.x, slot.y + 4);

				// Continuous Mining Laser Beam
				if (built.type === 'mining_laser' && built.laserTargetUid) {
					const target = engine.enemies.find((e: ActiveEnemy) => e.uid === built.laserTargetUid);
					if (target) {
						ctx.strokeStyle = '#ef4444';
						ctx.lineWidth = 2 + built.level * 1.2;
						ctx.beginPath(); ctx.moveTo(slot.x, slot.y); ctx.lineTo(target.x, target.y); ctx.stroke();
					}
				}
			} else {
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

		// Draw Allied Units (Robots & Exosuits)
		for (const u of engine.units) {
			ctx.fillStyle = u.towerType === 'robot_line' ? '#38bdf8' : '#10b981';
			ctx.beginPath(); ctx.arc(u.x, u.y, 9, 0, Math.PI * 2); ctx.fill();
			ctx.strokeStyle = '#0f172a';
			ctx.lineWidth = 2;
			ctx.stroke();

			// Battery bar for robots
			if (u.towerType === 'robot_line') {
				ctx.fillStyle = '#facc15';
				ctx.fillRect(u.x - 10, u.y - 14, 20 * (u.batteryTimer / u.maxBattery), 3);
			}
		}

		// Draw Enemies
		for (const e of engine.enemies) {
			const cfg = ENEMIES[e.type];
			ctx.fillStyle = cfg.color;
			ctx.beginPath();
			ctx.arc(e.x, e.y, cfg.radius, 0, Math.PI * 2);
			ctx.fill();

			if (cfg.domain === 'air') {
				ctx.strokeStyle = '#f8fafc';
				ctx.lineWidth = 2;
				ctx.stroke();
			}
			if (e.stunTimer > 0) {
				ctx.strokeStyle = '#38bdf8';
				ctx.lineWidth = 3;
				ctx.stroke();
			}

			// Health bar
			const hpPct = Math.max(0, e.hp / e.maxHp);
			ctx.fillStyle = '#1e293b';
			ctx.fillRect(e.x - 14, e.y - cfg.radius - 9, 28, 4);
			ctx.fillStyle = hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#eab308' : '#ef4444';
			ctx.fillRect(e.x - 14, e.y - cfg.radius - 9, 28 * hpPct, 4);
		}

		// Draw Heroes
		for (const h of engine.heroes) {
			const cfg = HEROES[h.id];
			const isSelected = game.activeHeroId === h.id;

			if (isSelected) {
				ctx.strokeStyle = '#facc15';
				ctx.lineWidth = 2;
				ctx.beginPath(); ctx.arc(h.x, h.y, 22, 0, Math.PI * 2); ctx.stroke();
			}

			ctx.fillStyle = h.respawnTimer > 0 ? '#475569' : cfg.color;
			ctx.beginPath(); ctx.arc(h.x, h.y, 15, 0, Math.PI * 2); ctx.fill();
			ctx.strokeStyle = '#ffffff';
			ctx.lineWidth = 2;
			ctx.stroke();

			const hpPct = Math.max(0, h.hp / h.maxHp);
			ctx.fillStyle = '#0f172a';
			ctx.fillRect(h.x - 18, h.y - 25, 36, 5);
			ctx.fillStyle = '#38bdf8';
			ctx.fillRect(h.x - 18, h.y - 25, 36 * hpPct, 5);
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

<div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 select-none">
	{#if game.screen === 'menu'}
		<div class="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
			<div class="flex items-center justify-between border-b border-slate-800 pb-4">
				<div>
					<span class="text-xs font-bold uppercase tracking-widest text-amber-400">Космічна Tower Defense • Прототип</span>
					<h1 class="text-4xl font-extrabold mt-1">ОСТАННІЙ КОРАБЕЛЬ КОЛОНІЇ</h1>
					<p class="text-slate-400 mt-1">Цивільні спеціалісти перетворюють промислові інструменти на зброю</p>
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
					<p class="text-xs text-slate-300 mt-1">Утримати майстерню та зібрати вцілілих робітників.</p>
				</div>
				<div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700 opacity-60">
					<div class="text-xs text-slate-400 font-bold">МІСІЇ 06–10</div>
					<div class="font-bold text-lg mt-1">2. Житловий район</div>
					<p class="text-xs text-slate-400 mt-1">Евакуація лікарні та порятунок спеціалістів.</p>
				</div>
				<div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700 opacity-60">
					<div class="text-xs text-slate-400 font-bold">МІСІЇ 11–15</div>
					<div class="font-bold text-lg mt-1">3. Видобуток і завод</div>
					<p class="text-xs text-slate-400 mt-1">Збір вузлів та палива для материнського корабля.</p>
				</div>
				<div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700 opacity-60">
					<div class="text-xs text-slate-400 font-bold">МІСІЇ 16–20</div>
					<div class="font-bold text-lg mt-1">4. Космопорт</div>
					<p class="text-xs text-slate-400 mt-1">Запуск систем корабля та фінальна евакуація.</p>
				</div>
			</div>

			<div class="flex justify-end pt-2">
				<button
					onclick={() => (game.screen = 'loadout')}
					class="px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-lg transition cursor-pointer"
				>
					Підготовка до Місії 01: Майстерня →
				</button>
			</div>
		</div>

	{:else if game.screen === 'loadout'}
		<div class="max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
			<div class="flex justify-between items-center">
				<div>
					<h2 class="text-2xl font-bold">Комплектація загону перед місією</h2>
					<p class="text-slate-400 text-sm">Оберіть до 5 промислових установок ({game.selectedTowers.length}/5) та 2 героїв ({game.selectedHeroes.length}/2)</p>
				</div>
				<button onclick={() => (game.screen = 'menu')} class="text-sm text-slate-400 hover:text-white cursor-pointer">← Назад у меню</button>
			</div>

			<div>
				<h3 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Інженерні вежі (Оберіть до 5 з 8)</h3>
				<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
					{#each towerList as t}
						{@const active = game.selectedTowers.includes(t.id)}
						<button
							onclick={() => game.toggleTowerInLoadout(t.id)}
							class="p-3 rounded-xl border text-left transition cursor-pointer {active ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400/30' : 'bg-slate-950/60 border-slate-800 opacity-70 hover:opacity-100'}"
						>
							<div class="flex items-center justify-between">
								<span class="font-bold text-sm" style="color: {t.color}">{t.name}</span>
								<span class="text-xs px-2 py-0.5 rounded bg-slate-900">{t.levels[0].cost}⚡</span>
							</div>
							<p class="text-xs text-slate-400 mt-1">{t.role}</p>
						</button>
					{/each}
				</div>
			</div>

			<div>
				<h3 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Головні спеціалісти (Оберіть 2 з 5)</h3>
				<div class="grid grid-cols-1 md:grid-cols-5 gap-3">
					{#each heroList as h}
						{@const active = game.selectedHeroes.includes(h.id)}
						<button
							onclick={() => game.toggleHeroInLoadout(h.id)}
							class="p-3 rounded-xl border text-left transition cursor-pointer {active ? 'bg-slate-800 border-emerald-400 ring-2 ring-emerald-400/30' : 'bg-slate-950/60 border-slate-800 opacity-70 hover:opacity-100'}"
						>
							<div class="font-bold text-sm" style="color: {h.color}">{h.name}</div>
							<div class="text-[11px] text-slate-400">{h.profession}</div>
							<div class="mt-2 text-xs text-emerald-300 font-semibold">★ {h.abilityName}</div>
							<div class="text-[11px] text-slate-400">{h.abilityDesc}</div>
						</button>
					{/each}
				</div>
			</div>

			<div class="flex justify-end">
				<button
					onclick={beginBriefing}
					class="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold cursor-pointer"
				>
					Далі: Вступний брифінг →
				</button>
			</div>
		</div>

	{:else if game.screen === 'briefing'}
		<div class="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
			<div class="text-xs font-bold uppercase text-amber-400">{game.mission.district}</div>
			<h2 class="text-3xl font-extrabold">{game.mission.title}</h2>
			<p class="text-slate-400 text-sm">{game.mission.subtitle}</p>

			<div class="space-y-3 py-3">
				{#each game.mission.preMissionDialogue as line}
					<div class="p-4 rounded-xl bg-slate-950 border-l-4" style="border-color: {line.color}">
						<div class="text-sm font-bold" style="color: {line.color}">{line.speaker} <span class="text-xs text-slate-500">({line.role})</span></div>
						<p class="text-slate-200 text-sm mt-1">«{line.text}»</p>
					</div>
				{/each}
			</div>

			<div class="flex justify-between items-center pt-2">
				<button onclick={() => (game.screen = 'loadout')} class="text-sm text-slate-400 hover:text-white cursor-pointer">← Змінити набір</button>
				<button onclick={launchBattle} class="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold cursor-pointer">
					До бою!
				</button>
			</div>
		</div>

	{:else if game.screen === 'playing'}
		<!-- Hidden element to subscribe HUD to hudTick -->
		<span class="hidden">{hudTick}</span>
		<div class="w-full max-w-[1120px] space-y-2">
			<!-- Top HUD Bar -->
			<div class="flex flex-wrap items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 gap-3">
				<div class="flex items-center gap-5">
					<div class="text-sm font-bold text-rose-400">❤️ Життя: <span class="text-lg">{game.lives}</span></div>
					<div class="text-sm font-bold text-amber-400">⚡ Ресурси: <span class="text-lg">{game.currency}</span></div>
					<div class="text-sm font-bold text-sky-400">🌊 Хвиля: <span class="text-lg">{game.currentWave} / {game.totalWaves}</span></div>
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
						class="px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer {game.isPaused ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-800 border-slate-700'}"
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
						onclick={() => (game.editorMode = !game.editorMode)}
						class="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-400 cursor-pointer"
						title="Клік: додати точку шляху, Shift+Клік: додати слот вежі"
					>
						{game.editorMode ? '🛠 Редактор ON' : '🛠'}
					</button>
					<button onclick={() => (game.screen = 'menu')} class="px-2.5 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-400 cursor-pointer">Меню</button>
				</div>
			</div>

			{#if game.isPaused}
				<div class="bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs px-4 py-1.5 rounded-lg text-center">
					Пауза для огляду поля: за правилами концепту будівництво, накази героям та здібності під час паузи недоступні.
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
						<div class="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center space-y-4">
							{#if game.outcome === 'victory'}
								<div class="text-4xl">⭐⭐⭐</div>
								<h3 class="text-3xl font-extrabold text-emerald-400">МАЙСТЕРНЮ ВРЯТОВАНО!</h3>
								<p class="text-slate-300 text-sm">Зірок здобуто: {game.starsEarned} / 3 (Залишок життів: {game.lives})</p>
							{:else}
								<h3 class="text-3xl font-extrabold text-rose-500">ОБОРОНУ ПРОРВАНО</h3>
								<p class="text-slate-300 text-sm">Фауна захопила майстерню. Спробуйте іншу комбінацію веж!</p>
							{/if}
							<div class="flex gap-3 justify-center pt-2">
								<button onclick={launchBattle} class="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold cursor-pointer">Зіграти знову</button>
								<button onclick={() => (game.screen = 'menu')} class="px-6 py-2.5 rounded-xl bg-slate-800 font-bold cursor-pointer">У меню</button>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Bottom Control Bar: Heroes & Selected Slot Inspector -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
				<!-- Heroes Panel -->
				<div class="bg-slate-900 border border-slate-800 rounded-xl p-3 flex gap-3">
					{#each engine.heroes as h}
						{@const cfg = HEROES[h.id]}
						<div class="flex-1 p-2.5 rounded-lg bg-slate-950 border {game.activeHeroId === h.id ? 'border-amber-400' : 'border-slate-800'}">
							<div class="flex justify-between items-center">
								<button onclick={() => (game.activeHeroId = h.id)} class="font-bold text-xs cursor-pointer" style="color: {cfg.color}">
									{cfg.name}
								</button>
								<span class="text-[11px] text-slate-400">
									{h.respawnTimer > 0 ? `Відновлення ${Math.ceil(h.respawnTimer)}с` : `${Math.ceil(h.hp)}/${h.maxHp} HP`}
								</span>
							</div>
							<button
								disabled={game.isPaused || h.respawnTimer > 0 || h.abilityCooldownTimer > 0}
								onclick={() => engine.triggerHeroAbility(h.id)}
								class="mt-2 w-full py-1.5 rounded bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold disabled:opacity-40 cursor-pointer"
							>
								{h.abilityCooldownTimer > 0 ? `${cfg.abilityName} (${Math.ceil(h.abilityCooldownTimer)}с)` : `★ ${cfg.abilityName}`}
							</button>
						</div>
					{/each}
				</div>

				<!-- Tower Build / Upgrade Contextual Inspector -->
				<div class="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-3">
					{#if game.activeSlotId}
						{@const existing = engine.towers.get(game.activeSlotId)}
						{#if !existing}
							<div class="text-xs text-slate-400 mb-2 font-bold">Оберіть установку для зведення на слоті #{game.activeSlotId}:</div>
							<div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
								{#each game.selectedTowers as tid}
									{@const t = TOWERS[tid]}
									<button
										disabled={game.isPaused || game.currency < t.levels[0].cost}
										onclick={() => engine.buildTower(game.activeSlotId!, tid)}
										class="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-400 disabled:opacity-40 text-left cursor-pointer"
									>
										<div class="font-bold text-xs" style="color: {t.color}">{t.name}</div>
										<div class="text-[11px] text-amber-400 font-bold">{t.levels[0].cost}⚡</div>
									</button>
								{/each}
							</div>
						{:else}
							{@const cfg = TOWERS[existing.type]}
							{@const currStats = cfg.levels[existing.level - 1]}
							{@const nextStats = existing.level < 4 ? cfg.levels[existing.level as 1 | 2 | 3] : null}
							<div class="flex flex-wrap items-center justify-between gap-3">
								<div>
									<div class="font-bold text-sm" style="color: {cfg.color}">
										{cfg.name} (Рівень {existing.level}/4)
									</div>
									<p class="text-xs text-slate-400">{currStats.description}</p>
								</div>
								<div class="flex gap-2">
									{#if nextStats}
										<button
											disabled={game.isPaused || game.currency < nextStats.cost}
											onclick={() => engine.upgradeTower(existing.slotId)}
											class="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs disabled:opacity-40 cursor-pointer"
										>
											Покращити до L{existing.level + 1} ({nextStats.cost}⚡)
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
							<span>💡 Клікніть на круглий будівельний слот (+), щоб звести вежу, або оберіть героя для переміщення по полю.</span>
							{#if game.editorMode}
								<button
									onclick={() => navigator.clipboard.writeText(JSON.stringify({ waypoints: game.mission.waypoints, towerSlots: game.mission.towerSlots }))}
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
</div>
