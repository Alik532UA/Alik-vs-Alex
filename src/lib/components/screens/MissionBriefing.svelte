<script lang="ts">
	import { asset } from '$app/paths';
	import { HEROES, TOWERS } from '$lib/game/configs';
	import { getHeroAssetPath, getTowerAssetPath } from '$lib/game/sprites';
	import type { HeroId } from '$lib/game/types';
	import { game } from '$lib/game/state.svelte';
	import { getTranslation } from '$lib/i18n/game';
	import { Shield, Star, Lightning } from 'phosphor-svelte';

	interface Props {
		onBack: () => void;
		onBattle: () => void;
	}

	let { onBack, onBattle }: Props = $props();

	const t = $derived(getTranslation(game.locale));

	function getSpeakerHeroId(speaker: string): HeroId | null {
		if (speaker.includes('Макс')) return 'fastener_hero';
		if (speaker.includes('Борг')) return 'exosuit_hero';
		if (speaker.includes('Ірина')) return 'laser_hero';
		if (speaker.includes('Влад')) return 'flamer_hero';
		if (speaker.includes('Док')) return 'chemist_hero';
		return null;
	}
</script>

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

	<!-- Selected Squad Summary Roster -->
	<div class="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
		<div class="flex items-center justify-between">
			<h4
				class="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5"
			>
				<Shield size={15} weight="fill" />
				<span
					>{t.missionSquad} ({game.selectedTowers.length}/5, {game.selectedHeroes.length}/2)</span
				>
			</h4>
		</div>

		<!-- Selected Heroes Roster -->
		<div>
			<div class="text-[11px] font-bold text-slate-400 mb-1.5 uppercase">
				{t.specialistsSquad}
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
							<div class="text-[11px] text-emerald-400 truncate flex items-center gap-1">
								<Star size={11} weight="fill" class="shrink-0" />
								<span class="truncate">{hero.abilityName}</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Selected Towers Roster -->
		<div>
			<div class="text-[11px] font-bold text-slate-400 mb-1.5 uppercase">
				{t.towersSquad}
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
						<div
							class="text-[10px] text-amber-400 font-semibold flex items-center justify-center gap-0.5"
						>
							<span>{twr.levels[0].cost}</span>
							<Lightning size={10} weight="fill" />
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<div class="flex justify-between items-center pt-2">
		<button
			onclick={onBack}
			class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
		>
			{t.btnChangeLoadout}
		</button>
		<button
			onclick={onBattle}
			class="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold cursor-pointer shadow-lg shadow-amber-500/20"
		>
			{t.btnToBattle}
		</button>
	</div>
</div>
