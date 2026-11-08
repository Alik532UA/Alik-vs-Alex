import { storage } from '$lib/services/storage';

export const chunkMissing = (error: unknown): boolean => {
	const text = error instanceof Error ? error.message : String(error);
	return /dynamically imported module|Importing a module script failed|error loading dynamically imported|Unable to preload CSS/i.test(
		text
	);
};

const RELOAD_KEY = 'stale_reload';

export async function freshLoad(href: string): Promise<void> {
	try {
		await fetch(href, { cache: 'reload', credentials: 'same-origin' });
	} catch {
		/* offline fallback */
	}
	window.location.href = href;
}

export function reloadOnce(href: string): boolean {
	if (storage.get(RELOAD_KEY) === href) return false;
	storage.set(RELOAD_KEY, href);
	void freshLoad(href);
	return true;
}
