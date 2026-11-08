import { logService } from '$lib/services/logService.svelte';
import { chunkMissing, reloadOnce } from '$lib/utils/staleBuild';

export const handleError = ({
	error,
	event
}: {
	error: unknown;
	event: { url: URL; route?: { id?: string | null } };
}) => {
	const message = error instanceof Error ? error.message : String(error);
	if (message.includes('ResizeObserver loop')) return;

	const route = event.route?.id ?? 'unknown';
	logService.error('app', 'Unhandled client error', { message, route, url: event.url.href });

	if (chunkMissing(error) && reloadOnce(event.url.href)) {
		logService.warn('app', 'stale build — reloading', { to: event.url.pathname });
	}
};
