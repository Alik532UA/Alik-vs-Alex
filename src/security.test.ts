import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function getSvelteFiles(dir: string, out: string[] = []): string[] {
	const entries = readdirSync(dir);
	for (const entry of entries) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) {
			getSvelteFiles(full, out);
		} else if (entry.endsWith('.svelte')) {
			out.push(full);
		}
	}
	return out;
}

describe('Security Invariants (SECURITY-v10)', () => {
	it('svelte files do not use unescaped raw HTML injection {@html}', () => {
		const svelteFiles = getSvelteFiles('src');
		for (const file of svelteFiles) {
			const content = readFileSync(file, 'utf-8');
			// Allow safe {@html} only with explicit comment or none
			expect(content).not.toMatch(/{@html\s+(?!vetted|sanitized)[a-zA-Z0-9_.]*}/);
		}
	});

	it('no direct localStorage or sessionStorage access outside storage facade', () => {
		const tsFiles: string[] = [];
		function getTsFiles(dir: string) {
			for (const entry of readdirSync(dir)) {
				const full = join(dir, entry);
				if (statSync(full).isDirectory()) {
					getTsFiles(full);
				} else if (
					entry.endsWith('.ts') &&
					!entry.endsWith('storage.ts') &&
					!entry.endsWith('.test.ts')
				) {
					tsFiles.push(full);
				}
			}
		}
		getTsFiles('src/lib');
		for (const file of tsFiles) {
			const content = readFileSync(file, 'utf-8');
			expect(content).not.toMatch(/\b(?:window\.)?(?:localStorage|sessionStorage)\./);
		}
	});

	it('language policy: Russian locale (ru) is strictly prohibited in source code', () => {
		const srcFiles: string[] = [];
		function getSrcFiles(dir: string) {
			for (const entry of readdirSync(dir)) {
				const full = join(dir, entry);
				if (statSync(full).isDirectory()) {
					getSrcFiles(full);
				} else if (
					(entry.endsWith('.ts') || entry.endsWith('.svelte')) &&
					!entry.endsWith('.test.ts')
				) {
					srcFiles.push(full);
				}
			}
		}
		getSrcFiles('src');
		for (const file of srcFiles) {
			const content = readFileSync(file, 'utf-8');
			expect(content).not.toMatch(/['"]ru['"]/);
			expect(content).not.toMatch(/\b(russian|русск)\b/i);
		}
	});
});
