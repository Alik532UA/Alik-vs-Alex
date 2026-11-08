<script lang="ts">
	interface Props {
		onretry: () => void;
	}

	let { onretry }: Props = $props();
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
	role="alert"
>
	<div
		class="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-2xl text-center text-slate-100"
	>
		<div
			class="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-2xl font-bold"
		>
			⚠️
		</div>
		<h2 class="text-xl font-bold mb-2">Системний збій колонії</h2>
		<p class="text-sm text-slate-300 mb-6">
			Виникла помилка візуалізації тактичного інтерфейсу. Ви можете перезавантажити підсистеми або
			повернутися до головного штабу.
		</p>
		<div class="flex gap-3 justify-center">
			<button
				type="button"
				class="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition"
				onclick={onretry}
			>
				Перезапустити
			</button>
			<a
				href="./"
				class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition"
			>
				До штабу
			</a>
		</div>
	</div>
</div>
