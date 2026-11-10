# GEMINI.md

Guidelines for Gemini models working in the Alik-vs-Alex codebase.

- **Source of Truth**: [PROJECT-CONTEXT.md](PROJECT-CONTEXT.md) and [AGENTS.md](AGENTS.md).
- **Architecture**: SvelteKit 3 + Svelte 5 (Runes) + Tailwind CSS v4 + TypeScript.
- **Safety**: Do not bypass CSP or storage isolation (`alikvsalex_`).
- **Language Policy**: Strictly only Ukrainian (`uk`) and English (`en`) are supported. Russian (`ru`) is strictly prohibited across the codebase, UI, i18n, configs, and documentation.
- **Workflow**:
  1. Read `PROJECT-CONTEXT.md` for conventions.
  2. Implement cleanly with TypeScript types.
  3. Verify with `npm run check && npm run lint && npm run test:unit`.
