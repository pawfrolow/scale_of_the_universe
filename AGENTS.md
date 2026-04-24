# AGENTS.md

## Project Overview

- `scale_of_the_universe` is a client-side React + TypeScript + Vite app.
- Rendering is built around PixiJS (`src/classes/universe.ts`, `src/components/UniverseCanvas/UniverseCanvas.tsx`).
- Main content data lives in `public/data/items.json`.
- Translations are loaded at runtime from `public/locales/<lang>/*.json` via `src/i18n.ts`.
- Locale-specific object overrides live in `public/data/overrides/<locale>/items.override.json`.

## Key Directories

- `src/` - React UI, Pixi scene classes, hooks, helpers, services.
- `public/data/` - base manifest and locale overrides for scale objects.
- `public/locales/` - translation namespaces `objects`, `ui`, `units`.
- `public/img/` - textures, icons, OG images, favicon assets.
- `docs/` - manual content workflow docs for objects and locale overrides.
- `scripts/` - one-off maintenance scripts for build, translations, sorting, and data cleanup.

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

- `scripts/new-object.translations.json`
  Working bulk translation payload used as input for object translation scripts. Update its contents for the object id you are currently adding.

- `scripts/distribute-object-translations.mjs`
  Bulk-adds new object entries into `objects.json` across locales from `scripts/new-object.translations.json`.
  Uses `public/locales`, which is the current source of truth for runtime translations.

- `scripts/sort-object-translations.mjs`
  Sorts object translation entries numerically inside each locale `objects.json`.
  Uses `public/locales` and should be run after bulk translation merge so object ids stay ordered.

## Adding Objects

When adding a new scale object, use this workflow:

1. Add the texture file to `public/img/textures/items/<id>.webp` or `.png`.
2. Add or update the primary object text in `public/locales/ru/objects.json`.
3. Fill `scripts/new-object.translations.json` with the new object id and translations for all supported locales.
4. Run `node scripts/distribute-object-translations.mjs` to merge the new object into every `public/locales/*/objects.json`.
5. Run `node scripts/sort-object-translations.mjs` so keys remain numerically ordered after the merge.
6. Add the frame entry to `public/data/items.json` with `size`, `visualLocation`, and `layout`.
7. If needed, run `node scripts/sort-frames-items.mjs` to keep `frames` ordered.

Practical rules from recent object additions:

- `public/locales/` is the only valid locale source for bulk object translation scripts.
- After bulk merge, verify that the new id exists in every `public/locales/*/objects.json`.
- `size` in `public/data/items.json` should be stored as `coeff × 10^exponent` meters.
- Match `layout.width` / `layout.height` to the actual texture proportions. For example, a `256x256` texture can start with a square `layout`.
- Keep the same id aligned across:
  `public/img/textures/items/`,
  `public/data/items.json`,
  `public/locales/*/objects.json`,
  and any locale override files.
- If the object size is given as a range like `60-70 × 10^-6`, use a representative value inside that range such as `6.5 × 10^-5`.
- After bulk translation distribution, the expected validation is:
  the merge script reports each locale processed successfully,
  the new key is present in all locale `objects.json` files,
  and the object appears in `public/data/items.json` with a valid frame entry.

## NPM Commands

- `npm run dev` - start Vite dev server.
- `npm run build` - build app and run `scripts/generate-localized-build.mjs`.
- `npm run build:prod` - production-mode build plus localized post-processing.
- `npm run preview` - preview the built app locally.
- `npm run ts:check` - run TypeScript without emitting files.
- `npm run lint` / `npm run lint:fix` - run ESLint.
- `npm run format` / `npm run format:check` - run Prettier.

## Notes For Future Edits

- When changing object content, keep ids aligned across:
  `public/data/items.json`,
  `public/locales/*/objects.json`,
  `public/img/textures/items/`,
  and any locale override files.
