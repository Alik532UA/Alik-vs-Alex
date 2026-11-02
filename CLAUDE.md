# CLAUDE.md

Guidelines for Claude interacting with the Alik-vs-Alex repository.

## Commands

- `npm run dev`: Start Vite development server
- `npm run check`: Check TypeScript & Svelte 5 types (`svelte-check`)
- `npm run lint`: Run Prettier and ESLint checks
- `npm run format`: Auto-format code with Prettier
- `npm run test:unit`: Run Vitest unit test suite
- `npm run build`: Build static production app & generate sitemap.xml
- `npm run check:build`: Verify build output
- `npm run audit:ci`: Check npm dependencies security

## Rules & Standards

- Always consult `PROJECT-CONTEXT.md` and `AGENTS.md` before making architectural modifications.
- Strict Svelte 5 Runes mode (`$state`, `$derived`, `$effect`, `$props`). No legacy Svelte 3/4 syntax.
- Use isolated storage facade `#lib/services/storage.ts` or `$lib/services/storage.ts` with prefix `alikvsalex_`.
- Run `npm run check`, `npm run lint`, and `npm run test:unit` before concluding changes.
