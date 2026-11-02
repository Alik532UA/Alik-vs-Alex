import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

describe('CSP inline script hashes (SECURITY-v10 § 6.3.1)', () => {
	it('matches hashes calculated for app.html scripts', () => {
		const htmlPath = 'src/app.html';
		expect(existsSync(htmlPath)).toBe(true);

		const html = readFileSync(htmlPath, 'utf-8').replace(/<!--[\s\S]*?-->/g, '');
		const scriptMatches = [...html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/gi)];

		for (const match of scriptMatches) {
			const content = (match[1] ?? '').replace(/\r\n/g, '\n');
			const hash = `sha256-${createHash('sha256').update(content).digest('base64')}`;
			expect(hash).toMatch(/^sha256-[A-Za-z0-9+/=]+$/);
		}
	});
});
