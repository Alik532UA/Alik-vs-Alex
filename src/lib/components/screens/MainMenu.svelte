<script lang="ts">
	import { getTranslation } from '$lib/i18n/game';
	import { game } from '$lib/game/state.svelte';

	interface Props {
		onStartLoadout: () => void;
	}

	let { onStartLoadout }: Props = $props();

	const t = $derived(getTranslation(game.locale));
</script>

<div
	class="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6"
>
	<div class="flex items-center justify-between border-b border-slate-800 pb-4">
		<div>
			<span class="text-xs font-bold uppercase tracking-widest text-amber-400">{t.menuBadge}</span>
			<h1 class="text-4xl font-extrabold mt-1">{t.menuTitle}</h1>
			<p class="text-slate-400 mt-1">
				{t.menuSubtitle}
			</p>
		</div>
		<div class="text-right text-sm text-slate-400">
			<div>{t.campaignOverview}</div>
			<div class="text-emerald-400 font-semibold">{t.availableDistrict}</div>
		</div>
	</div>

	<!-- 4 Campaign Districts Overview -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-3">
		<div class="p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500">
			<div class="text-xs text-amber-400 font-bold">{t.missionsLabel} 01–05</div>
			<div class="font-bold text-lg mt-1">{t.district1Name}</div>
			<p class="text-xs text-slate-300 mt-1">
				{t.district1Desc}
			</p>
		</div>
		<div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700 opacity-60">
			<div class="text-xs text-slate-400 font-bold">{t.missionsLabel} 06–10</div>
			<div class="font-bold text-lg mt-1">{t.district2Name}</div>
			<p class="text-xs text-slate-400 mt-1">{t.district2Desc}</p>
		</div>
		<div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700 opacity-60">
			<div class="text-xs text-slate-400 font-bold">{t.missionsLabel} 11–15</div>
			<div class="font-bold text-lg mt-1">{t.district3Name}</div>
			<p class="text-xs text-slate-400 mt-1">
				{t.district3Desc}
			</p>
		</div>
		<div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700 opacity-60">
			<div class="text-xs text-slate-400 font-bold">{t.missionsLabel} 16–20</div>
			<div class="font-bold text-lg mt-1">{t.district4Name}</div>
			<p class="text-xs text-slate-400 mt-1">{t.district4Desc}</p>
		</div>
	</div>

	<div class="flex flex-wrap items-center justify-end gap-3 pt-2">
		<button
			onclick={onStartLoadout}
			class="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-lg transition cursor-pointer text-center"
		>
			{t.btnPrepareMission}
		</button>
	</div>
</div>
