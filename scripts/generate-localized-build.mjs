import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
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
const CANONICAL_LANGUAGE_MAP = {
  'en-GB': 'en',
};
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

const getLanguagePathSegment = (language) =>
  language === DEFAULT_LANGUAGE ? '' : language.toLowerCase();

const getLanguagePath = (language) => {
  const segment = getLanguagePathSegment(language);

  return segment ? `/${segment}/` : '/';
};

const getCanonicalLanguage = (language) => CANONICAL_LANGUAGE_MAP[language] ?? language;

const getCanonicalPath = (language) => getLanguagePath(getCanonicalLanguage(language));

const getManifestFileName = (language) => {
  const segment = getLanguagePathSegment(language);

  return segment ? `manifest.${segment}.webmanifest` : 'manifest.webmanifest';
};

const getOgImageUrl = (language) =>
  `${APP_ORIGIN}/img/${language === DEFAULT_LANGUAGE ? 'ogimage.png' : 'ogimage_en.png'}`;

const normalizeText = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

const trimToLength = (value, maxLength) => {
  const normalizedValue = normalizeText(value);

  if (normalizedValue.length <= maxLength) {
    return normalizedValue;
  }

  const targetLength = Math.max(maxLength - 3, 1);
  const trimmedValue = normalizedValue.slice(0, targetLength + 1);
  const lastSpaceIndex = trimmedValue.lastIndexOf(' ');
  const safeValue =
    lastSpaceIndex > Math.floor(targetLength * 0.6)
      ? trimmedValue.slice(0, lastSpaceIndex)
      : trimmedValue.slice(0, targetLength);

  return `${safeValue.trim().replace(/[.,;:!?-]+$/u, '')}...`;
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildSeoTitle = ({ appTitle, ogTitle, description }) => {
  const baseTitle = normalizeText(ogTitle || appTitle || 'Universe Scale');

  if (baseTitle.length >= 45 && baseTitle.length <= 60) {
    return baseTitle;
  }

  const normalizedDescription = normalizeText(description);
  const descriptionWithoutTitle = normalizedDescription.replace(
    new RegExp(`^${escapeRegExp(baseTitle)}[.:\u2014\\-\\s]*`, 'iu'),
    '',
  );
  const combinedTitle = `${baseTitle} — ${descriptionWithoutTitle}`;

  return trimToLength(combinedTitle, 60);
};

const buildSeoDescription = ({ description, ogDescription, objectHint, zoomHint }) => {
  const parts = [description, ogDescription, objectHint, zoomHint]
    .map((part) => normalizeText(part))
    .filter(Boolean);
  const uniqueParts = [...new Set(parts)];
  const combinedDescription = uniqueParts.join(' ');

  if (combinedDescription.length >= 110 && combinedDescription.length <= 160) {
    return combinedDescription;
  }

  return trimToLength(combinedDescription, 155);
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

      return {
        language,
        path: getLanguagePath(language),
        canonicalLanguage: getCanonicalLanguage(language),
        canonicalPath: getCanonicalPath(language),
        dir: RTL_LANGUAGES.has(language) ? 'rtl' : 'ltr',
        title: buildSeoTitle({
          appTitle: ui.app?.title ?? ui.html?.modal?.title ?? ui.html?.meta?.ogTitle ?? 'Universe Scale',
          ogTitle: ui.html?.meta?.ogTitle ?? ui.html?.modal?.title ?? ui.app?.title ?? 'Universe Scale',
          description: ui.html?.meta?.description ?? ui.html?.meta?.ogDescription ?? '',
        }),
        description: buildSeoDescription({
          description: ui.html?.meta?.description ?? '',
          ogDescription: ui.html?.meta?.ogDescription ?? '',
          objectHint: ui.html?.modal?.objectHint ?? '',
          zoomHint: ui.html?.modal?.zoomHint ?? '',
        }),
        ogTitle: buildSeoTitle({
          appTitle: ui.app?.title ?? ui.html?.modal?.title ?? ui.html?.meta?.ogTitle ?? 'Universe Scale',
          ogTitle: ui.html?.meta?.ogTitle ?? ui.html?.modal?.title ?? ui.app?.title ?? 'Universe Scale',
          description: ui.html?.meta?.description ?? ui.html?.meta?.ogDescription ?? '',
        }),
        ogDescription: buildSeoDescription({
          description: ui.html?.meta?.description ?? '',
          ogDescription: ui.html?.meta?.ogDescription ?? '',
          objectHint: ui.html?.modal?.objectHint ?? '',
          zoomHint: ui.html?.modal?.zoomHint ?? '',
        }),
        ogImage: getOgImageUrl(language),
        appTitle: ui.app?.title ?? ui.html?.modal?.title ?? 'Universe Scale',
        manifestFileName: getManifestFileName(language),
        ogLocale: OG_LOCALE_MAP[language] ?? 'en_US',
        hreflangs: [],
      };
    }),
  ).then((locales) =>
    locales.map((locale) => ({
      ...locale,
      hreflangs: locales
        .filter((candidate) => candidate.canonicalPath === locale.canonicalPath)
        .map((candidate) => candidate.language),
    })),
  );
};

const buildAlternateLinks = (locales) =>
  [
    ...locales
      .filter((locale) => locale.language === locale.canonicalLanguage)
      .flatMap((locale) =>
        locale.hreflangs.map(
          (hreflang) =>
            `<link rel="alternate" hreflang="${hreflang}" href="${APP_ORIGIN}${locale.canonicalPath}" />`,
        ),
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
  localizedHtml = replaceLinkHref(localizedHtml, 'canonical', `${APP_ORIGIN}${locale.canonicalPath}`);
  localizedHtml = replaceLinkHref(localizedHtml, 'manifest', `/${locale.manifestFileName}`);
  localizedHtml = localizedHtml.replace('<!-- SEO_ALTERNATES -->', buildAlternateLinks(locales));

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
    .filter((locale) => locale.language === locale.canonicalLanguage)
    .map((locale) => {
      const alternates = locale.hreflangs
        .map(
          (hreflang) =>
            `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${APP_ORIGIN}${locale.canonicalPath}" />`,
        )
        .join('\n');

      return `  <url>\n    <loc>${APP_ORIGIN}${locale.canonicalPath}</loc>\n${alternates}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${APP_ORIGIN}/" />\n  </url>`;
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
