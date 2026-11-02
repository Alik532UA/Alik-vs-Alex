/**
 * Підняття patch-версії (+0.0.1) та синхронізація static/app-version.json і src/lib/config/version.ts.
 * Чистий ESM без виклику дочірніх процесів npm.
 * Відповідає моделі «бамп на коміт» (VERSIONING-v10 § 1).
 */
import { readFileSync, writeFileSync, existsSync, utimesSync } from 'node:fs';
import { resolve } from 'node:path';

const rootDir = process.cwd();
const packageJsonPath = resolve(rootDir, 'package.json');
const packageLockPath = resolve(rootDir, 'package-lock.json');
const staticVersionPath = resolve(rootDir, 'static/app-version.json');
const tsVersionPath = resolve(rootDir, 'src/lib/config/version.ts');
const viteConfigPath = resolve(rootDir, 'vite.config.ts');

const syncOnly = process.argv.includes('--sync-only');

const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const [major, minor, patch] = pkg.version.split('.');
const newVersion = syncOnly ? pkg.version : [major, minor, String(Number(patch) + 1)].join('.');

if (!syncOnly) {
	pkg.version = newVersion;
	writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, '\t')}\n`);

	if (existsSync(packageLockPath)) {
		try {
			const lock = JSON.parse(readFileSync(packageLockPath, 'utf-8'));
			lock.version = newVersion;
			if (lock.packages && lock.packages['']) {
				lock.packages[''].version = newVersion;
			}
			writeFileSync(packageLockPath, `${JSON.stringify(lock, null, '\t')}\n`);
		} catch {
			// ігноруємо помилки оновлення lock-файлу
		}
	}
}

// 1. static/app-version.json
writeFileSync(staticVersionPath, `${JSON.stringify({ version: newVersion }, null, '\t')}\n`);

// 2. src/lib/config/version.ts
const tsContent = `/**
 * Single source of truth for runtime application version.
 * Complies with VERSIONING-v10 § 1 & § 2.
 */
export const APP_VERSION = '${newVersion}';
`;
writeFileSync(tsVersionPath, tsContent);

// 3. Оновлюємо timestamp vite.config.ts для HMR
if (existsSync(viteConfigPath)) {
	const now = new Date();
	try {
		utimesSync(viteConfigPath, now, now);
	} catch {
		// ігноруємо помилку файлової системи
	}
}

console.log(`[bump-version] Version synchronized: ${newVersion}`);
