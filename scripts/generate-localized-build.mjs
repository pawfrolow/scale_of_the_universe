import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const localesDir = path.join(projectRoot, 'public', 'locales');
const manifestSourcePath = path.join(projectRoot, 'public', 'manifest.webmanifest');

const APP_ORIGIN = 'https://universe.pavelfrolov.com';
const DEFAULT_LANGUAGE = 'ru';
const RTL_LANGUAGES = new Set(['ar', 'fa', 'he']);
const OG_LOCALE_MAP = {
  ar: 'ar_AR',
  de: 'de_DE',
  en: 'en_US',
  'en-GB': 'en_GB',
  eo: 'eo_EO',
  es: 'es_ES',
  et: 'et_EE',
  fa: 'fa_IR',
  fr: 'fr_FR',
  he: 'he_IL',
  ko: 'ko_KR',
  nl: 'nl_NL',
  pl: 'pl_PL',
  pt: 'pt_PT',
  ro: 'ro_RO',
  ru: 'ru_RU',
  sv: 'sv_SE',
  tr: 'tr_TR',
  uk: 'uk_UA',
  'zh-CN': 'zh_CN',
  'zh-Hant': 'zh_TW',
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const escapeJsonForHtml = (value) =>
  value.replaceAll('<', '\\u003c').replaceAll('>', '\\u003e').replaceAll('&', '\\u0026');

const getLanguagePathSegment = (language) =>
  language === DEFAULT_LANGUAGE ? '' : language.toLowerCase();

const getLanguagePath = (language) => {
  const segment = getLanguagePathSegment(language);

  return segment ? `/${segment}/` : '/';
};

const getManifestFileName = (language) => {
  const segment = getLanguagePathSegment(language);

  return segment ? `manifest.${segment}.webmanifest` : 'manifest.webmanifest';
};

const getOgImageUrl = (language) =>
  `${APP_ORIGIN}/img/${language === DEFAULT_LANGUAGE ? 'ogimage.png' : 'ogimage_en.png'}`;

const normalizeText = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

const dedupeTexts = (values) => {
  const seen = new Set();

  return values.filter((value) => {
    const normalizedValue = normalizeText(value);

    if (!normalizedValue || seen.has(normalizedValue)) {
      return false;
    }

    seen.add(normalizedValue);
    return true;
  });
};

const replaceMetaContent = (html, selector, content) => {
  const escapedContent = escapeHtml(content);

  return html.replace(
    new RegExp(`(<meta[\\s\\S]*?${selector}[\\s\\S]*?content=")([^"]*)("[\\s\\S]*?>)`),
    `$1${escapedContent}$3`,
  );
};

const replaceLinkHref = (html, rel, href) => {
  const escapedHref = escapeHtml(href);

  return html.replace(
    new RegExp(`(<link[\\s\\S]*?rel="${rel}"[\\s\\S]*?href=")([^"]*)("[\\s\\S]*?>)`),
    `$1${escapedHref}$3`,
  );
};

const buildStructuredData = (locale) => {
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: locale.appTitle,
      url: `${APP_ORIGIN}${locale.path}`,
      description: locale.metaDescription,
      inLanguage: locale.language,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: locale.appTitle,
      url: `${APP_ORIGIN}${locale.path}`,
      description: locale.metaDescription,
      inLanguage: locale.language,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      image: locale.ogImage,
      isAccessibleForFree: true,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
  ];

  return `<script type="application/ld+json">${escapeJsonForHtml(JSON.stringify(structuredData))}</script>`;
};

const buildStaticSeoContent = (locale) => {
  const introParagraphs = locale.startScreen.introParagraphs
    .map(
      (paragraph) =>
        `    <p style="margin:0 0 14px;font-size:1.0625rem;line-height:1.7;color:#1f2937;">${escapeHtml(paragraph)}</p>`,
    )
    .join('\n');

  return `<main data-seo-static="true" style="max-width:1120px;margin:0 auto;padding:24px 24px 40px;font-family:Roboto,system-ui,sans-serif;color:#0f172a;box-sizing:border-box;">
  <section style="margin:0 0 20px;">
    <h1 style="margin:0 0 16px;font-size:clamp(2rem,5vw,3.5rem);line-height:1.05;font-weight:800;letter-spacing:-0.02em;color:#0f172a;">${escapeHtml(locale.startScreen.title)}</h1>
${introParagraphs}
  </section>
  <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin:0 0 16px;">
    <article style="padding:20px;border:1px solid rgba(15,23,42,0.08);border-radius:24px;background:rgba(255,255,255,0.88);box-sizing:border-box;">
      <p style="margin:0;font-size:1rem;line-height:1.6;color:#1f2937;">${escapeHtml(locale.startScreen.zoomHint)}</p>
    </article>
    <article style="padding:20px;border:1px solid rgba(15,23,42,0.08);border-radius:24px;background:rgba(255,255,255,0.88);box-sizing:border-box;">
      <p style="margin:0;font-size:1rem;line-height:1.6;color:#1f2937;">${escapeHtml(locale.startScreen.objectHint)}</p>
    </article>
  </section>
</main>`;
};

const buildSeoLocaleDataScript = (locale) => {
  const payload = {
    language: locale.language,
    dir: locale.dir,
    ui: locale.ui,
    startScreen: locale.startScreen,
  };

  return `<script id="seo-locale-data" type="application/json">${escapeJsonForHtml(JSON.stringify(payload))}</script>`;
};

const loadLocales = async () => {
  const entries = await readdir(localesDir, { withFileTypes: true });
  const localeDirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => {
      if (left === DEFAULT_LANGUAGE) {
        return -1;
      }

      if (right === DEFAULT_LANGUAGE) {
        return 1;
      }

      return left.localeCompare(right);
    });

  return Promise.all(
    localeDirs.map(async (language) => {
      const uiPath = path.join(localesDir, language, 'ui.json');
      const ui = JSON.parse(await readFile(uiPath, 'utf8'));
      const appTitle = normalizeText(ui.app?.title ?? ui.html?.modal?.title ?? 'Universe Scale');
      const title = normalizeText(ui.html?.meta?.title ?? ui.html?.meta?.ogTitle ?? appTitle);
      const description = normalizeText(ui.html?.meta?.description ?? ui.html?.meta?.ogDescription ?? '');
      const ogTitle = normalizeText(ui.html?.meta?.ogTitle ?? title);
      const ogDescription = normalizeText(ui.html?.meta?.ogDescription ?? description);
      const introParagraphs = dedupeTexts([normalizeText(ui.html?.meta?.intro ?? description)]);
      return {
        language,
        path: getLanguagePath(language),
        dir: RTL_LANGUAGES.has(language) ? 'rtl' : 'ltr',
        title,
        description,
        ogTitle,
        ogDescription,
        metaDescription: description,
        ogImage: getOgImageUrl(language),
        appTitle,
        manifestFileName: getManifestFileName(language),
        ogLocale: OG_LOCALE_MAP[language] ?? 'en_US',
        ui,
        startScreen: {
          title: normalizeText(ui.html?.modal?.title ?? appTitle),
          startText: normalizeText(ui.html?.modal?.startButton ?? ui.app?.start ?? 'Start'),
          startLoadingText: normalizeText(ui.html?.modal?.startLoading ?? 'Loading...'),
          introParagraphs,
          zoomHint: normalizeText(ui.html?.modal?.zoomHint ?? ui.app?.zoomHint ?? ''),
          objectHint: normalizeText(ui.html?.modal?.objectHint ?? ui.app?.objectHint ?? ''),
          credits: {
            createdBy: normalizeText(ui.html?.credits?.createdBy ?? ''),
            webDev: normalizeText(ui.html?.credits?.webDev ?? ''),
            copyright: normalizeText(ui.html?.credits?.copyright ?? ''),
            translationAndDev: normalizeText(ui.html?.credits?.translationAndDev ?? ''),
          },
        },
      };
    }),
  );
};

const buildAlternateLinks = (locales) =>
  [
    ...locales.map(
      (locale) => `<link rel="alternate" hreflang="${locale.language}" href="${APP_ORIGIN}${locale.path}" />`,
    ),
    `<link rel="alternate" hreflang="x-default" href="${APP_ORIGIN}/" />`,
  ].join('\n    ');

const localizeHtml = (html, locale, locales) => {
  let localizedHtml = html.replace(
    /<html[^>]*lang="[^"]*"[^>]*>/,
    `<html lang="${locale.language}" dir="${locale.dir}">`,
  );

  localizedHtml = localizedHtml.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(locale.title)}</title>`);
  localizedHtml = replaceMetaContent(localizedHtml, 'name="description"', locale.description);
  localizedHtml = replaceMetaContent(localizedHtml, 'property="og:title"', locale.ogTitle);
  localizedHtml = replaceMetaContent(localizedHtml, 'property="og:description"', locale.ogDescription);
  localizedHtml = replaceMetaContent(localizedHtml, 'property="og:url"', `${APP_ORIGIN}${locale.path}`);
  localizedHtml = replaceMetaContent(localizedHtml, 'property="og:image"', locale.ogImage);
  localizedHtml = replaceMetaContent(localizedHtml, 'property="og:locale"', locale.ogLocale);
  localizedHtml = replaceMetaContent(localizedHtml, 'name="twitter:title"', locale.ogTitle);
  localizedHtml = replaceMetaContent(localizedHtml, 'name="twitter:description"', locale.ogDescription);
  localizedHtml = replaceMetaContent(localizedHtml, 'name="twitter:image"', locale.ogImage);
  localizedHtml = replaceLinkHref(localizedHtml, 'canonical', `${APP_ORIGIN}${locale.path}`);
  localizedHtml = replaceLinkHref(localizedHtml, 'manifest', `/${locale.manifestFileName}`);
  localizedHtml = localizedHtml.replace('<!-- SEO_ALTERNATES -->', buildAlternateLinks(locales));
  localizedHtml = localizedHtml.replace('<!-- SEO_STRUCTURED_DATA -->', buildStructuredData(locale));
  localizedHtml = localizedHtml.replace('<!-- SEO_STATIC_CONTENT -->', buildStaticSeoContent(locale));
  localizedHtml = localizedHtml.replace('<!-- SEO_LOCALE_DATA -->', buildSeoLocaleDataScript(locale));

  return localizedHtml;
};

const writeLocalizedPages = async (template, locales) => {
  for (const locale of locales) {
    const localizedHtml = localizeHtml(template, locale, locales);
    const targetPath =
      locale.language === DEFAULT_LANGUAGE
        ? path.join(distDir, 'index.html')
        : path.join(distDir, getLanguagePathSegment(locale.language), 'index.html');

    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, localizedHtml);
  }
};

const writeManifests = async (locales) => {
  const baseManifest = JSON.parse(await readFile(manifestSourcePath, 'utf8'));

  for (const locale of locales) {
    const localizedManifest = {
      ...baseManifest,
      name: locale.appTitle,
      lang: locale.language,
      start_url: locale.path,
      scope: locale.path,
    };

    const outputPath = path.join(distDir, locale.manifestFileName);
    await writeFile(outputPath, `${JSON.stringify(localizedManifest)}\n`);
  }
};

const writeSitemap = async (locales) => {
  const urls = locales
    .map((locale) => {
      const alternates = locales
        .map(
          (alternateLocale) =>
            `    <xhtml:link rel="alternate" hreflang="${alternateLocale.language}" href="${APP_ORIGIN}${alternateLocale.path}" />`,
        )
        .join('\n');

      return `  <url>\n    <loc>${APP_ORIGIN}${locale.path}</loc>\n${alternates}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${APP_ORIGIN}/" />\n  </url>`;
    })
    .join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;

  await writeFile(path.join(distDir, 'sitemap.xml'), sitemap);
};

const writeRobots = async () => {
  const robots = `User-agent: *
Allow: /

Sitemap: ${APP_ORIGIN}/sitemap.xml
`;

  await writeFile(path.join(distDir, 'robots.txt'), robots);
};

const main = async () => {
  const locales = await loadLocales();
  const template = await readFile(path.join(distDir, 'index.html'), 'utf8');

  await writeLocalizedPages(template, locales);
  await writeManifests(locales);
  await writeSitemap(locales);
  await writeRobots();
};

await main();
