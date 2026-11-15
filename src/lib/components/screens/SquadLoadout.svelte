<script lang="ts">
	import { asset } from '$app/paths';
	import { TOWERS, HEROES } from '$lib/game/configs';
	import { getTowerAssetPath, getHeroAssetPath } from '$lib/game/sprites';
	import type { TowerId, HeroId } from '$lib/game/types';
	import { gameAudio } from '$lib/game/audio';
	import { game } from '$lib/game/state.svelte';
	import { getTranslation, getTargetDomainLabel } from '$lib/i18n/game';
	import {
		Lightning,
		Shield,
		Bomb,
		Wind,
		Trash,
		DiceFive,
		Check,
		Lock,
		Star,
		MagnifyingGlass,
		Heart,
		Sword,
		Target,
		Timer,
		X,
		Warning
	} from 'phosphor-svelte';

	import { getLocalizedTower, getLocalizedHero } from '$lib/i18n/content';

	interface Props {
		onBack: () => void;
		onNext: () => void;
	}

	let { onBack, onNext }: Props = $props();

	const t = $derived(getTranslation(game.locale));
	const towerList = $derived(
		Object.keys(TOWERS).map((id) => getLocalizedTower(id as TowerId, game.locale))
	);
	const heroList = $derived(
		Object.keys(HEROES).map((id) => getLocalizedHero(id as HeroId, game.locale))
	);

	let inspectorType = $state<'hero' | 'tower'>('hero');
	let inspectedHeroId = $state<HeroId>('fastener_hero');
	let inspectedTowerId = $state<TowerId>('drill');

	const inspectedHero = $derived(getLocalizedHero(inspectedHeroId, game.locale));
	const inspectedTower = $derived(getLocalizedTower(inspectedTowerId, game.locale));
</script>

<div
	class="max-w-6xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6"
>
	<div class="flex flex-wrap justify-between items-center gap-3">
		<div class="flex items-center gap-4">
			<button
				onclick={onBack}
				class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
			>
				<span>{t.btnBackToMenu}</span>
			</button>
			<div>
				<h2 class="text-2xl font-bold">{t.loadoutTitle}</h2>
				<p class="text-slate-400 text-sm">
					{t.loadoutSubtitle} ({t.towersCountLabel}:
					<span class="font-bold text-amber-400">{game.selectedTowers.length}/5</span>, {t.specialistsCountLabel}:
					<span class="font-bold text-emerald-400">{game.selectedHeroes.length}/2</span>)
				</p>
			</div>
		</div>
	</div>

	<!-- Quick Presets & Actions Bar (Горизонтальна панель швидких кнопок) -->
	<div
		class="flex flex-wrap items-center gap-2 p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl"
	>
		<span
			class="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1.5"
		>
			<Lightning size={14} weight="fill" class="text-amber-400" />
			<span>{t.presetsLabel}</span>
		</span>
		<button
			type="button"
			onclick={() => {
				gameAudio.playSound('click');
				game.randomizeLoadout();
				if (game.selectedHeroes.length > 0) {
					inspectedHeroId = game.selectedHeroes[0];
					inspectorType = 'hero';
				}
				if (game.selectedTowers.length > 0) {
					inspectedTowerId = game.selectedTowers[0];
				}
			}}
			class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 border border-slate-700 hover:border-amber-400 shadow-sm"
			title={t.presetRandomTooltip}
		>
			<DiceFive size={15} weight="bold" />
			<span>{t.presetRandom}</span>
		</button>
		<button
			type="button"
			onclick={() => {
				gameAudio.playSound('click');
				game.applyPreset('balance');
				if (game.selectedHeroes.length > 0) inspectedHeroId = game.selectedHeroes[0];
				if (game.selectedTowers.length > 0) inspectedTowerId = game.selectedTowers[0];
			}}
			class="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border {game.activePresetId ===
			'balance'
				? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
				: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'}"
			title={t.presetBalanceTooltip}
		>
			<Shield size={15} weight="fill" />
			<span>{t.presetBalance}</span>
		</button>
		<button
			type="button"
			onclick={() => {
				gameAudio.playSound('click');
				game.applyPreset('heavy');
				if (game.selectedHeroes.length > 0) inspectedHeroId = game.selectedHeroes[0];
				if (game.selectedTowers.length > 0) inspectedTowerId = game.selectedTowers[0];
			}}
			class="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border {game.activePresetId ===
			'heavy'
				? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
				: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'}"
			title={t.presetHeavyTooltip}
		>
			<Bomb size={15} weight="fill" />
			<span>{t.presetHeavy}</span>
		</button>
		<button
			type="button"
			onclick={() => {
				gameAudio.playSound('click');
				game.applyPreset('control');
				if (game.selectedHeroes.length > 0) inspectedHeroId = game.selectedHeroes[0];
				if (game.selectedTowers.length > 0) inspectedTowerId = game.selectedTowers[0];
			}}
			class="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border {game.activePresetId ===
			'control'
				? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
				: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'}"
			title={t.presetControlTooltip}
		>
			<Wind size={15} weight="bold" />
			<span>{t.presetControl}</span>
		</button>
		<div class="h-5 w-px bg-slate-800 mx-1"></div>
		<button
			type="button"
			onclick={() => {
				gameAudio.playSound('click');
				game.clearLoadout();
			}}
			class="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:border-rose-500/60 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
			title={t.presetClearTooltip}
		>
			<Trash size={15} weight="bold" />
			<span>{t.presetClear}</span>
		</button>
	</div>

	<!-- 2-Column Main Selection & Inspector Layout -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
		<!-- Left Column: Selection Grids (8 cols) -->
		<div class="lg:col-span-8 space-y-6">
			<!-- Towers Selection Grid (8 towers) -->
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
						{@const isInspected = inspectorType === 'tower' && inspectedTowerId === tItem.id}
						<div
							role="button"
							tabindex="0"
							onclick={() => {
								inspectedTowerId = tItem.id;
								inspectorType = 'tower';
							}}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									inspectedTowerId = tItem.id;
									inspectorType = 'tower';
								}
							}}
							class="p-2.5 rounded-xl border text-left transition flex flex-col justify-between relative group cursor-pointer {isSelected
								? 'bg-slate-800/95 border-amber-400 ring-2 ring-amber-400/30 shadow-lg shadow-amber-500/10'
								: 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'} {isInspected
								? 'ring-2 ring-sky-400 shadow-md shadow-sky-500/20'
								: ''}"
						>
							{#if isSelected}
								<button
									type="button"
									onclick={(e) => {
										e.stopPropagation();
										gameAudio.playSound('click');
										game.toggleTowerInLoadout(tItem.id);
									}}
									title={t.removeFromSquad}
									class="absolute bottom-2 right-2 z-10 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 shadow flex items-center gap-1 hover:bg-amber-400 cursor-pointer"
								>
									<Check size={11} weight="bold" />
									<span>{t.selectedBadge}</span>
								</button>
							{:else}
								<button
									type="button"
									disabled={isFull}
									onclick={(e) => {
										e.stopPropagation();
										if (!isFull) {
											gameAudio.playSound('click');
											game.toggleTowerInLoadout(tItem.id);
										}
									}}
									title={isFull ? t.squadFullTower : t.addToSquad}
									class="absolute bottom-2 right-2 z-10 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 transition cursor-pointer {isFull
										? 'bg-slate-900/90 text-slate-500 border border-slate-800 cursor-not-allowed'
										: 'bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950 border border-slate-700'}"
								>
									{#if isFull}
										<Lock size={11} weight="bold" />
										<span>5/5</span>
									{:else}
										<span>+</span>
									{/if}
								</button>
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
							<div class="pr-12">
								<div class="flex items-center justify-between gap-1">
									<span class="font-bold text-xs truncate" style="color: {tItem.color}"
										>{tItem.name}</span
									>
									<span
										class="text-[11px] px-1.5 py-0.5 rounded bg-slate-900 font-bold shrink-0 text-amber-400 flex items-center gap-0.5"
									>
										<span>{tItem.levels[0].cost}</span>
										<Lightning size={11} weight="fill" />
									</span>
								</div>
								<p class="text-[11px] text-slate-400 mt-1 line-clamp-1">{tItem.role}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Heroes Selection Grid (5 heroes) -->
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
						{@const isInspected = inspectorType === 'hero' && inspectedHeroId === h.id}
						<div
							role="button"
							tabindex="0"
							onclick={() => {
								inspectedHeroId = h.id;
								inspectorType = 'hero';
							}}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									inspectedHeroId = h.id;
									inspectorType = 'hero';
								}
							}}
							class="p-2.5 rounded-xl border text-left transition flex flex-col justify-between relative group cursor-pointer {isSelected
								? 'bg-slate-800/95 border-emerald-400 ring-2 ring-emerald-400/30 shadow-lg shadow-emerald-500/10'
								: 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'} {isInspected
								? 'ring-2 ring-sky-400 shadow-md shadow-sky-500/20'
								: ''}"
							title={h.abilityDesc}
						>
							{#if isSelected}
								<button
									type="button"
									onclick={(e) => {
										e.stopPropagation();
										gameAudio.playSound('click');
										game.toggleHeroInLoadout(h.id);
									}}
									title={t.removeFromSquad}
									class="absolute bottom-2 right-2 z-10 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 shadow flex items-center gap-1 hover:bg-emerald-400 cursor-pointer"
								>
									<Check size={11} weight="bold" />
									<span>{t.inSquad}</span>
								</button>
							{:else}
								<button
									type="button"
									disabled={isFull}
									onclick={(e) => {
										e.stopPropagation();
										if (!isFull) {
											gameAudio.playSound('click');
											game.toggleHeroInLoadout(h.id);
										}
									}}
									title={isFull ? t.squadFullHero : t.addToSquad}
									class="absolute bottom-2 right-2 z-10 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 transition cursor-pointer {isFull
										? 'bg-slate-900/90 text-slate-500 border border-slate-800 cursor-not-allowed'
										: 'bg-slate-800 hover:bg-emerald-500 text-slate-300 hover:text-slate-950 border border-slate-700'}"
								>
									{#if isFull}
										<Lock size={11} weight="bold" />
										<span>2/2</span>
									{:else}
										<span>+</span>
									{/if}
								</button>
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
							<div class="pr-12">
								<div class="font-bold text-xs truncate" style="color: {h.color}">{h.name}</div>
								<div class="text-[10px] text-slate-400 truncate">{h.profession}</div>
								<div
									class="mt-1 text-[11px] text-emerald-300 font-semibold truncate flex items-center gap-1"
								>
									<Star size={11} weight="fill" class="shrink-0 text-emerald-400" />
									<span class="truncate">{h.abilityName}</span>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Right Column: Universal Inspector Panel (4 cols) -->
		<div class="lg:col-span-4 sticky top-4">
			{#if inspectorType === 'hero'}
				{@const inSquad = game.selectedHeroes.includes(inspectedHero.id)}
				{@const squadFull = game.selectedHeroes.length >= 2}
				<div class="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
					<div class="flex items-center justify-between border-b border-slate-800/80 pb-2">
						<span
							class="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5"
						>
							<MagnifyingGlass size={15} weight="bold" />
							<span>{t.heroInspectorTitle}</span>
						</span>
						{#if inSquad}
							<span
								class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1"
							>
								<Check size={11} weight="bold" />
								<span>{t.inSquad}</span>
							</span>
						{:else if squadFull}
							<span
								class="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1"
							>
								<Lock size={11} weight="bold" />
								<span>{t.squadFullHero}</span>
							</span>
						{:else}
							<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
								{t.freeSlot}
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
							<span class="font-bold text-rose-400 flex items-center gap-1">
								<Heart size={14} weight="fill" />
								<span>{inspectedHero.hp}</span>
							</span>
						</div>
						<div class="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
							<span class="text-slate-400 text-[10px] block">{t.heroStatsDamage}</span>
							<span class="font-bold text-amber-300 flex items-center gap-1">
								<Sword size={14} weight="fill" />
								<span>{inspectedHero.damage}</span>
							</span>
						</div>
						<div class="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
							<span class="text-slate-400 text-[10px] block">{t.heroStatsRange}</span>
							<span class="font-bold text-sky-300 flex items-center gap-1">
								<Target size={14} weight="bold" />
								<span>{inspectedHero.range}px</span>
							</span>
						</div>
						<div class="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
							<span class="text-slate-400 text-[10px] block">{t.heroStatsCooldown}</span>
							<span class="font-bold text-purple-300 flex items-center gap-1">
								<Timer size={14} weight="bold" />
								<span>{inspectedHero.abilityCooldown}{t.secondsSuffix}</span>
							</span>
						</div>
					</div>

					<!-- Complete Uncut Ability Description -->
					<div class="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
						<div class="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
							<Star size={14} weight="fill" />
							<span>{inspectedHero.abilityName}</span>
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
								<X size={14} weight="bold" />
								<span>{t.removeFromSquad}</span>
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
								<span>+</span> <span>{t.addToSquad} ({game.selectedHeroes.length}/2)</span>
							</button>
						{/if}
					</div>
				</div>
			{:else}
				{@const inSquad = game.selectedTowers.includes(inspectedTower.id)}
				{@const squadFull = game.selectedTowers.length >= 5}
				<div class="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
					<div class="flex items-center justify-between border-b border-slate-800/80 pb-2">
						<span
							class="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5"
						>
							<MagnifyingGlass size={15} weight="bold" />
							<span>{t.towerInspectorTitle}</span>
						</span>
						{#if inSquad}
							<span
								class="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1"
							>
								<Check size={11} weight="bold" />
								<span>{t.selectedBadge}</span>
							</span>
						{:else if squadFull}
							<span
								class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1"
							>
								<Lock size={11} weight="bold" />
								<span>{t.squadFullTower}</span>
							</span>
						{:else}
							<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
								{t.freeSlot}
							</span>
						{/if}
					</div>

					<!-- Tower Portrait Level 1 -->
					<div
						class="w-full h-40 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-center p-3 relative overflow-hidden shadow-inner"
					>
						<img
							src={asset(getTowerAssetPath(inspectedTower.id, 1))}
							alt={inspectedTower.name}
							class="max-w-full max-h-full object-contain drop-shadow-lg"
						/>
					</div>

					<!-- Tower Name & Role -->
					<div>
						<div class="text-lg font-black tracking-wide" style="color: {inspectedTower.color}">
							{inspectedTower.name}
						</div>
						<div class="text-xs font-semibold text-slate-400">
							{inspectedTower.role}
						</div>
						<div class="text-[11px] text-slate-500 mt-1">
							{t.targetLabel}:
							<span class="font-bold text-slate-300"
								>{getTargetDomainLabel(inspectedTower.targetDomain, game.locale)}</span
							>
						</div>
					</div>

					<!-- 4 Levels Compact Progression -->
					<div class="space-y-1.5 text-xs">
						<div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
							{t.levelLabel} 1–4:
						</div>
						{#each inspectedTower.levels as lvl}
							<div
								class="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between text-[11px]"
							>
								<div class="flex items-center gap-1.5">
									<span class="font-bold text-amber-400">L{lvl.level}</span>
									<span class="text-slate-400">({lvl.cost} ⚡)</span>
								</div>
								<div class="text-slate-300 flex items-center gap-2">
									<span>{t.towerRange}: {lvl.range}</span>
									{#if lvl.damage > 0}
										<span class="text-rose-400 font-semibold">{t.towerDamage}: {lvl.damage}</span>
									{/if}
								</div>
							</div>
						{/each}
					</div>

					<!-- Action Button in Inspector -->
					<div>
						{#if inSquad}
							<button
								type="button"
								onclick={() => {
									gameAudio.playSound('click');
									game.toggleTowerInLoadout(inspectedTower.id);
								}}
								class="w-full py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
							>
								<X size={14} weight="bold" />
								<span>{t.removeFromSquad}</span>
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
									game.toggleTowerInLoadout(inspectedTower.id);
								}}
								class="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5"
							>
								<span>+</span> <span>{t.addToSquad} ({game.selectedTowers.length}/5)</span>
							</button>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Bottom Actions & Readiness State (Гнучкий мінімум) -->
	<div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
		<div class="text-xs">
			{#if game.selectedTowers.length === 0 || game.selectedHeroes.length === 0}
				<span class="text-rose-400 font-semibold flex items-center gap-1.5">
					<Warning size={16} weight="fill" />
					{#if game.selectedTowers.length === 0 && game.selectedHeroes.length === 0}
						{t.needMoreUnits}
					{:else if game.selectedTowers.length === 0}
						{t.selectMinTowerWarning}
					{:else}
						{t.selectMinHeroWarning}
					{/if}
				</span>
			{:else if game.selectedTowers.length < 5 || game.selectedHeroes.length < 2}
				<span class="text-amber-300 font-semibold flex items-center gap-1.5">
					<Lightning size={16} weight="fill" />
					<span>
						{t.challengeSquadNotice
							.replace('{towers}', String(game.selectedTowers.length))
							.replace('{heroes}', String(game.selectedHeroes.length))}
					</span>
				</span>
			{:else}
				<span class="text-emerald-400 font-semibold flex items-center gap-1.5">
					<Check size={16} weight="bold" />
					<span>{t.readyToDeploy}</span>
				</span>
			{/if}
		</div>

		<button
			disabled={!game.canStartMission()}
			onclick={onNext}
			class="px-8 py-3 rounded-xl font-extrabold text-sm transition cursor-pointer flex items-center gap-2 {game.canStartMission()
				? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
				: 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-50'}"
		>
			{t.btnBriefing}
		</button>
	</div>
</div>
