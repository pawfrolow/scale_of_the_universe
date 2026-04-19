# AGENTS.md

## Project Overview

- `scale_of_the_universe` is a client-side React + TypeScript + Vite app.
- Rendering is built around PixiJS (`src/classes/universe.ts`, `src/components/UniverseCanvas/UniverseCanvas.tsx`).
- Main content data lives in `public/data/items.json`.
- Translations are loaded at runtime from `public/locales/<lang>/*.json` via `src/i18n.ts`.
- Locale-specific object overrides live in `public/data/overrides/<locale>/items.override.json`.

## Key Directories

- `src/` — React UI, Pixi scene classes, hooks, helpers, services.
- `public/data/` — base manifest and locale overrides for scale objects.
- `public/locales/` — translation namespaces `objects`, `ui`, `units`.
- `public/img/` — textures, icons, OG images, favicon assets.
- `docs/` — manual content workflow docs for objects and locale overrides.
- `scripts/` — one-off maintenance scripts for build, translations, sorting, and data cleanup.

## Docs

- `docs/add-new-object.md`
  Describes how to add a new scale object: prepare a texture, add an entry to `public/data/items.json`, configure `layout` / `size` / `visualLocation`, and add translations for the same object id.

- `docs/override-objects.md`
  Describes locale-specific overrides through `public/data/overrides/<locale>/items.override.json`, including `remove`, `replace`, `add`, and `textures`.

## Scripts

- `scripts/generate-localized-build.mjs`
  Post-build localization step used by `npm run build` and `npm run build:prod`. It expands the Vite `dist/` output into per-locale routes, manifest files, canonical URLs, alternate links, RTL handling, and localized SEO metadata.

- `scripts/bump-version.js`
  Interactive CLI helper that bumps `package.json` / `package-lock.json` with `npm version <patch|minor|major> --no-git-tag-version` and stages both files.

- `scripts/merge-locale-namespace.js`
  Merges a translation patch file into a chosen namespace under `public/locales/<lang>/<namespace>.json`.
  Example: `node scripts/merge-locale-namespace.js ui scripts/some-translations.json`

- `scripts/sort-frames-items.mjs`
  Rewrites `public/data/items.json`, normalizes frame ids to 3-digit strings, and sorts `frames` numerically.

- `scripts/remove-fields-from-items.js`
  Removes legacy `spriteSourceSize` and `sourceSize` fields from every frame in `public/data/items.json`.

- `scripts/objects-329.translations.json`
  Example translation payload used as input for bulk translation scripts. Despite the filename, the current payload contains translations for object `331`.

- `scripts/distribute-object-translations.mjs`
  Bulk-adds new object entries into `objects.json` across locales from `scripts/objects-329.translations.json`.
  Note: this script currently points to `src/i18n/locales`, but the app now loads locales from `public/locales`, so it likely needs updating before use.

- `scripts/sort-object-translations.mjs`
  Sorts object translation entries numerically inside each locale `objects.json`.
  Note: this script also points to `src/i18n/locales` and appears stale relative to the current project layout.

## NPM Commands

- `npm run dev` — start Vite dev server.
- `npm run build` — build app and run `scripts/generate-localized-build.mjs`.
- `npm run build:prod` — production-mode build plus localized post-processing.
- `npm run preview` — preview the built app locally.
- `npm run ts:check` — run TypeScript without emitting files.
- `npm run lint` / `npm run lint:fix` — run ESLint.
- `npm run format` / `npm run format:check` — run Prettier.

## Notes For Future Edits

- When changing object content, keep ids aligned across:
  `public/data/items.json`,
  `public/locales/*/objects.json`,
  `public/img/textures/items/`,
  and any locale override files.
- `public/locales/` is the current source of truth for translations; scripts that still reference `src/i18n/locales` should be treated as outdated until fixed.
