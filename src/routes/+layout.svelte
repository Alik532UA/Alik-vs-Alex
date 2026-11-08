<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import { beforeNavigate } from '$app/navigation';
	import { updated } from '$app/state';
	import { logService } from '$lib/services/logService.svelte';
	import { freshLoad } from '$lib/utils/staleBuild';
	import ErrorFallback from '$lib/components/ErrorFallback.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	beforeNavigate((navigation) => {
		if (!updated.current || navigation.willUnload || !navigation.to?.url) return;
		logService.info('app', 'new build - full navigation', { to: navigation.to.url.pathname });
		navigation.cancel();
		void freshLoad(navigation.to.url.href);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<svelte:boundary
	onerror={(error) =>
		logService.error('app', 'Render boundary caught error', { error: String(error) })}
>
	{@render children()}

	{#snippet failed(_, reset)}
		<ErrorFallback onretry={reset} />
	{/snippet}
</svelte:boundary>
