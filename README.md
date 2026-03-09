# Scale of the Universe 3.0

Interactive HTML5/WebGL visualization of the size scale of the Universe — from the smallest particles to the largest cosmic structures.

Built with React, TypeScript, Vite and PixiJS.

<https://user-images.githubusercontent.com/1207483/145275912-5ce3a399-1116-4265-a056-324612291a81.mp4>

## Features

- smooth zoom across many orders of magnitude
- object cards with descriptions
- multilingual interface
- WebGL/canvas rendering via PixiJS
- Vite-based development and production build

## Tech stack

- React
- TypeScript
- Vite
- PixiJS Legacy
- i18next

## Installation

```bash
npm install
````

## Development

Start the local development server:

```bash
npm run dev
```

Then open the local URL shown by Vite in the terminal.

## Production build

Create a production build:

```bash
npm run build
```

Build with explicit production mode:

```bash
npm run build:prod
```

Preview the built app locally:

```bash
npm run preview
```

## Type checking

```bash
npm run ts:check
```

## Project structure

```text
public/
  data/                  # object sizes, visual positions and other static data
  img/                   # textures and other static assets

src/
  classes/               # PixiJS universe, slider, items, rings
  helpers/               # utility functions
  hooks/                 # React hooks, including scene bootstrap
  i18n/                  # translations and i18n setup
  services/              # app services
```

## Adding a new object

Instructions for adding a new object to the scale are available here:

[docs/add-new-object.md](docs/add-new-object.md)

## Scripts

- `npm run dev` — start development server
- `npm run build` — create production build
- `npm run build:prod` — create production build in production mode
- `npm run preview` — preview production build locally
- `npm run ts:check` — run TypeScript type checking

## Notes

- Object textures are loaded from individual PNG files in `public/img/textures/items/`
- Object metadata and placement are configured through JSON files in `public/data/`
- Localization strings are stored in the i18n locale files

## License

ISC
