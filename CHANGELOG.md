# Changelog

## 1.9.2

- Refreshed the site shell with a Space Indigo, Ocean Deep, Cornflower Blue, Baby Blue Ice, and Soft Periwinkle color theme.
- Added shared theme color and font tokens with local Inter and branded display font loading.
- Updated static SEO pages, header, footer, modals, controls, overlays, loader, and fallback pages to use the refreshed theme.
- Switched Pixi text styles from hardcoded Roboto to a shared Inter font-family constant.
- Fixed header language and support modals so their backdrop and dialog positioning cover the full page above main content.

## 1.9.1

- Added a shared static modal style system for header and footer dialogs.
- Changed the header and footer support action to open an in-page support modal instead of navigating away immediately.
- Shortened the support navigation label from "Support project" to "Support" in Russian UI copy.
- Refined the objects index page heading and intro copy.
- Improved maximum-scale slider behavior so the slider reaches the final scale exactly at the end of the track.
- Fixed the maximum-scale label formatting so integer powers are displayed without a trailing decimal.
- Adjusted the Universe object placement at the largest scale.
- Removed the legacy Vite localized post-build script after the Astro SEO pipeline replacement.

## 1.9.0

- Migrated the SEO layer from Vite post-build generation to Astro static pages and endpoints.
- Kept the interactive React/Pixi universe as a client-side runtime while rendering crawlable HTML for SEO routes.
- Added static localized pages for home, about, objects, and object detail routes.
- Added Astro-generated `sitemap.xml`, `robots.txt`, canonical links, `hreflang`, Open Graph, Twitter metadata, and JSON-LD structured data.
- Added static header and footer components shared by SEO pages.
- Added breadcrumbs and `BreadcrumbList` structured data for about, objects, and object detail pages.
- Added images to object cards on the objects index pages.
- Changed object SEO URLs from numeric ids to slug-based paths generated from English object titles.
- Added slug validation with `npm run slugs:check`.
- Added a multilingual static `404.html` page with lightweight inline localization and `noindex,follow`.
- Split the first screen from the heavy Pixi runtime so the home page can render critical HTML and CSS before loading the interactive universe.
- Added early texture preloading without pulling Pixi or React into the initial page load.
- Improved fullscreen handling by keeping top controls visible and recalculating the renderer size on fullscreen changes.
- Fixed Astro dev-mode styling and React preamble issues encountered during page navigation and lazy runtime loading.

## 1.8.0

- Added static SEO pages for the about page, objects index, and object detail routes to the localized post-build pipeline.
- Added a site header and footer around the SEO fallback pages.
- Added localized object listing and object detail content for search engines and no-JS crawlers.
- Expanded generated SEO metadata with richer canonical, alternate, social preview, and structured data output.
- Added a production SEO smoke-check script.
- Improved the start screen layout and mobile header behavior.

## 1.7.3

- Added the Patu digua object and placed it on the scale with translations for all supported locales.
- Added the Paedophryne amauensis object and placed it on the scale with translations for all supported locales.

## 1.7.2

- Fixed localized canonical and `hreflang` SEO signals so locale pages no longer conflict with each other in search indexing.
- Added localized crawlable intro content and structured data to strengthen page understanding for search engines.

## 1.7.1

- Added the Gluon object and translations for all supported locales.

## 1.7.0

- Added the Starship object and translations for all supported locales.
- Added the RATAN-600 object and translations for all supported locales.
- Added the Phagocyte object and translations for all supported locales.
- Added the Platelet object and translations for all supported locales.

## 1.6.0

- Added the Laniakea object.

## 1.5.2

- Fixed reopening an object after closing its details modal on mobile.

## 1.5.1

- Improved mobile touch scrolling and slider responsiveness.

## 1.5.0

- Added the Human Neuron object.

## 1.4.0

- Added the Higgs Boson object.

## 1.3.4

- Improved SEO metadata and social sharing previews.

## 1.3.3

- Fixed translation issues in several locales.

## 1.3.2

- Fixed translation issues in several locales.

## 1.3.1

- Added a Content Security Policy header.

## 1.3.0

- Added localized pages and improved multilingual SEO.

## 1.2.0

- Updated locale keys and language code handling.

## 1.1.0

- Improved SEO configuration and metadata handling.

## 1.0.1

- Refreshed UI icons and controls.
- Added version display in the interface.

## 1.0.0

- Rewrote the project in React with a modernized application structure.
- Updated core libraries and dependencies.
- Optimized rendering performance and improved rendering quality.
- Added fullscreen mode.
- Removed the unnecessary HQ button.
- Moved translations to i18n instead of loading them line by line from txt files.
- Added support for locale-specific item overrides.
- Prepared the project for future multilingual support while keeping a single language in the first release of the new version.
- Included a broader round of cleanup, modernization, and UX improvements across the project.
