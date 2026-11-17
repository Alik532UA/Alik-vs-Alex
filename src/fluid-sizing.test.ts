import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SRC = join(process.cwd(), 'src');

function walk(dir: string, out: string[] = []): string[] {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) walk(full, out);
		else if (/\.(svelte|css)$/.test(entry)) out.push(full.replace(/\\/g, '/'));
	}
	return out;
}

const files = walk(SRC);

describe('FLUID-SIZING-v10 canon in Alik-vs-Alex', () => {
	it('scans style files', () => {
		expect(files.length).toBeGreaterThan(5);
	});

	it('no repeat() uses bare 1fr (FLUID-SIZING-v10 § 1)', () => {
		const offenders: string[] = [];
		const BARE_1FR = /repeat\(\s*\d+\s*,\s*1fr\s*\)/g;
		for (const file of files) {
			const text = readFileSync(file, 'utf8');
			for (const m of text.matchAll(BARE_1FR)) {
				offenders.push(`${file}: ${m[0]}`);
			}
		}
		expect(offenders, 'Use repeat(N, minmax(0, 1fr)) instead of bare 1fr').toEqual([]);
	});

	it('no minmax() has an unwrapped pixel floor (FLUID-SIZING-v10 § 1)', () => {
		const offenders: string[] = [];
		const HARD_FLOOR = /minmax\(\s*(?!min\()[\d.]+(?:px|rem|em|ch)\s*,/g;
		for (const file of files) {
			const text = readFileSync(file, 'utf8');
			for (const m of text.matchAll(HARD_FLOOR)) {
				offenders.push(`${file}: ${m[0]}`);
			}
		}
		expect(offenders, 'Wrap rigid floors in min(Npx, 100%)').toEqual([]);
	});

	it('prefers dvh over bare vh in CSS/Tailwind (FLUID-SIZING-v10 § 3)', () => {
		const offenders: string[] = [];
		const BARE_VH = /(?<![a-zA-Z0-9_\-])(?<![dls])vh\b/;
		for (const file of files) {
			const text = readFileSync(file, 'utf8');
			text.split('\n').forEach((line, idx) => {
				// Ignore fallback patterns like `min-height: 100vh;\n min-height: 100dvh;`
				if (BARE_VH.test(line) && !line.includes('100vh;\n') && !text.includes('100dvh;')) {
					offenders.push(`${file}:${idx + 1} ${line.trim()}`);
				}
			});
		}
		expect(offenders, 'Use dvh instead of bare vh').toEqual([]);
	});
});
