import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getInlineScriptHashes(): `sha256-${string}`[] {
	const htmlPath = path.resolve(__dirname, 'src/app.html');
	if (!existsSync(htmlPath)) return [];
	const html = readFileSync(htmlPath, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
	const matches = [...html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
	return matches.map((m) => {
		const body = (m[1] ?? '').replace(/\r\n?/g, '\n');
		return `sha256-${createHash('sha256').update(body).digest('base64')}` as `sha256-${string}`;
	});
}

export default defineConfig(({ mode }) => ({
	resolve: {
		alias: {
			$lib: path.resolve(__dirname, './src/lib')
		}
	},
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({
				pages: 'build',
				assets: 'build',
				fallback: '404.html',
				precompress: false,
				strict: true
			}),
			paths: {
				base: (process.env.BASE_PATH ?? (mode === 'production' ? '/Alik-vs-Alex' : '')) as
					'' | `/${string}`,
				relative: false,
				origin: 'https://alik532ua.github.io'
			},
			csp: {
				mode: 'hash',
				directives: {
					'default-src': ['self'],
					'script-src': ['self', ...getInlineScriptHashes()],
					'style-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'],
					'font-src': ['self', 'https://fonts.gstatic.com', 'data:'],
					'img-src': ['self', 'data:', 'blob:'],
					'connect-src': ['self'],
					'frame-ancestors': ['none'],
					'base-uri': ['self'],
					'form-action': ['none']
				}
			}
		})
	]
}));
