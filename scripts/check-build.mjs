/**
 * Перевірка артефактів збірки build/
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const rootDir = process.cwd();
const buildIndex = resolve(rootDir, 'build/index.html');
const sitemap = resolve(rootDir, 'build/sitemap.xml');

if (!existsSync(buildIndex)) {
	console.error('❌ build/index.html not found! Run npm run build first.');
	process.exit(1);
}

if (!existsSync(sitemap)) {
	console.warn('⚠️ build/sitemap.xml not found.');
}

const html = readFileSync(buildIndex, 'utf8');
if (!html.includes('<title>')) {
	console.error('❌ build/index.html is missing <title> tag.');
	process.exit(1);
}

console.log('✅ check-build passed: build directory valid.');
