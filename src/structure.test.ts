// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

describe('Project Structure & Canon Gates (PROJECT-STRUCTURE-v10 & CI-CD-AND-TOOLS-v10)', () => {
	const requiredDocs = [
		'PROJECT-CONTEXT.md',
		'AGENTS.md',
		'CLAUDE.md',
		'GEMINI.md',
		'static/llms.txt',
		'README.md',
		'scripts/check-audit.mjs',
		'scripts/check-build.mjs'
	];

	it('усі обовʼязкові файли та скрипти канону існують у репозиторії', () => {
		for (const doc of requiredDocs) {
			expect(existsSync(doc), `Файл ${doc} обовʼязковий`).toBe(true);
		}
	});

	it('package.json містить обовʼязкові гейти канону', () => {
		const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
		expect(pkg.scripts.check).toBeDefined();
		expect(pkg.scripts.lint).toBeDefined();
		expect(pkg.scripts['test:unit']).toBeDefined();
		expect(pkg.scripts['test:e2e']).toBeDefined();
		expect(pkg.scripts['audit:ci']).toBeDefined();
		expect(pkg.scripts['check:build']).toBeDefined();
	});

	it('PROJECT-CONTEXT.md містить префікс сховища alikvsalex_ та реєстр рішень', () => {
		const context = readFileSync('PROJECT-CONTEXT.md', 'utf8');
		expect(context).toContain('alikvsalex_');
		expect(context).toContain('STORAGE-NAMESPACE-v10');
		expect(context).toContain('Прийняті рішення');
	});
});
