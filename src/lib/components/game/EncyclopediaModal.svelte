<script lang="ts">
	import { asset } from '$app/paths';
	import { TOWERS, ENEMIES, HEROES } from '$lib/game/configs';
	import { getTowerAssetPath, getEnemyAssetPath, getHeroAssetPath } from '$lib/game/sprites';
	import type { TowerId, EnemyId, HeroId } from '$lib/game/types';
	import { getTranslation, getTargetDomainLabel } from '$lib/i18n/game';
	import { getLocalizedTower, getLocalizedHero, getLocalizedEnemy } from '$lib/i18n/content';
	import { game } from '$lib/game/state.svelte';
	import { X, Lightning, Star, Shield, Sparkle } from 'phosphor-svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
	}

	let { open, onClose }: Props = $props();

	let encyclopediaTab = $state<'towers' | 'enemies' | 'heroes'>('towers');
	let selectedEncyclopediaTowerId = $state<TowerId>('drill');

	const towerList = $derived(
		Object.keys(TOWERS).map((id) => getLocalizedTower(id as TowerId, game.locale))
	);
	const enemyList = $derived(
		Object.keys(ENEMIES).map((id) => getLocalizedEnemy(id as EnemyId, game.locale))
	);
	const heroList = $derived(
		Object.keys(HEROES).map((id) => getLocalizedHero(id as HeroId, game.locale))
	);
	const t = $derived(getTranslation(game.locale));
</script>

{#if open}
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
						onclick={onClose}
						class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer flex items-center justify-center"
						aria-label={t.closeModal}
					>
						<X size={15} weight="bold" />
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

					{@const curTower = getLocalizedTower(selectedEncyclopediaTowerId, game.locale)}
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
											<span class="text-xs font-bold text-slate-300 flex items-center gap-0.5">
												<span>{lvl.cost}</span>
												<Lightning size={11} weight="fill" />
											</span>
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
											<span>{t.speedLabel}: {e.speed}</span>
										</div>
										<div class="flex justify-between">
											<span>{t.armorLabel}: {Math.round(e.armor * 100)}%</span>
											<span class="text-amber-400 flex items-center gap-0.5">
												<span>+{e.reward}</span>
												<Lightning size={11} weight="fill" />
											</span>
										</div>
									</div>
								</div>

								<!-- Fixed Traits Block -->
								<div
									class="h-10 flex flex-col justify-center pt-1 border-t border-slate-800/60 mt-1.5 overflow-hidden text-[10px]"
								>
									{#if e.canJump}
										<div class="text-amber-300 truncate flex items-center gap-1">
											<Sparkle size={11} weight="fill" class="shrink-0" />
											<span class="truncate">{t.jumpTrait}</span>
										</div>
									{/if}
									{#if e.spawnsOnDeath}
										<div class="text-rose-300 truncate flex items-center gap-1">
											<Sparkle size={11} weight="fill" class="shrink-0" />
											<span class="truncate">{t.spawnsOnDeathTrait}</span>
										</div>
									{/if}
									{#if e.periodicSpawn}
										<div class="text-purple-300 truncate flex items-center gap-1">
											<Sparkle size={11} weight="fill" class="shrink-0" />
											<span class="truncate">{t.periodicSpawnTrait}</span>
										</div>
									{/if}
									{#if e.shieldAuraRadius}
										<div class="text-cyan-300 truncate flex items-center gap-1">
											<Shield size={11} weight="fill" class="shrink-0" />
											<span class="truncate">{t.shieldAuraTrait}</span>
										</div>
									{/if}
									{#if !e.canJump && !e.spawnsOnDeath && !e.periodicSpawn && !e.shieldAuraRadius}
										<div class="text-slate-500 italic">{t.basicUnitTrait}</div>
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
										<span>{t.heroStatsDamage}: {h.damage}</span>
									</div>
								</div>

								<!-- Fixed Ability Card -->
								<div
									class="p-2.5 rounded-lg bg-slate-900 border border-slate-800 min-h-[96px] flex flex-col justify-between"
								>
									<div class="text-xs font-bold text-emerald-400 flex items-center gap-1">
										<Star size={11} weight="fill" class="shrink-0" />
										<span class="truncate">{h.abilityName}</span>
									</div>
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
					onclick={onClose}
					class="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow"
				>
					{t.backToGame}
				</button>
			</div>
		</div>
	</div>
{/if}
