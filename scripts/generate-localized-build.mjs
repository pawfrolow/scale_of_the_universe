import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const localesDir = path.join(projectRoot, 'public', 'locales');
const dataDir = path.join(projectRoot, 'public', 'data');
const manifestSourcePath = path.join(projectRoot, 'public', 'manifest.webmanifest');
const itemsSourcePath = path.join(dataDir, 'items.json');
const packageSourcePath = path.join(projectRoot, 'package.json');

const APP_ORIGIN = 'https://universe.pavelfrolov.com';
const DEFAULT_LANGUAGE = 'ru';
const LASTMOD = new Date().toISOString().slice(0, 10);
const COPYRIGHT_YEAR = '2026';
const CREDIT_LINKS = {
  webDev: 'https://github.com/matttt/scale_of_the_universe',
  copyright: 'https://www.htwins.net/scale2/',
  pawfrolow: 'https://github.com/pawfrolow/scale_of_the_universe',
};
const DONATE_LINK = 'https://boosty.to/pawfrolow/donate';
const CONTACT_EMAIL = 'paw.frolow@gmail.com';
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
const OBJECT_SCALE_GROUPS = [
  {
    minSize: 0,
    maxSize: 1e-24,
    ruLabel: 'Субатомные масштабы',
    enLabel: 'Subatomic scales',
  },
  {
    minSize: 1e-24,
    maxSize: 1e-18,
    ruLabel: 'Частицы',
    enLabel: 'Particles',
  },
  {
    minSize: 1e-18,
    maxSize: 1e-12,
    ruLabel: 'Атомы и молекулы',
    enLabel: 'Atoms and molecules',
  },
  {
    minSize: 1e-12,
    maxSize: 1e-6,
    ruLabel: 'Микромир',
    enLabel: 'Microworld',
  },
  {
    minSize: 1e-6,
    maxSize: 1e-3,
    ruLabel: 'Миллиметры и сантиметры',
    enLabel: 'Millimeters and centimeters',
  },
  {
    minSize: 1e-3,
    maxSize: 1e3,
    ruLabel: 'Человеческие масштабы',
    enLabel: 'Human scales',
  },
  {
    minSize: 1e3,
    maxSize: 1e6,
    ruLabel: 'Здания и ландшафты',
    enLabel: 'Buildings and landscapes',
  },
  {
    minSize: 1e6,
    maxSize: 1e9,
    ruLabel: 'Планеты',
    enLabel: 'Planets',
  },
  {
    minSize: 1e9,
    maxSize: 1e12,
    ruLabel: 'Звезды',
    enLabel: 'Stars',
  },
  {
    minSize: 1e12,
    maxSize: 1e16,
    ruLabel: 'Солнечная система',
    enLabel: 'Solar system',
  },
  {
    minSize: 1e16,
    maxSize: 1e22,
    ruLabel: 'Межзвездные масштабы',
    enLabel: 'Interstellar scales',
  },
  {
    minSize: 1e22,
    maxSize: Infinity,
    ruLabel: 'Галактики и Вселенная',
    enLabel: 'Galaxies and the Universe',
  },
];

let appVersion = '';

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

const getObjectIndexPath = (language) => {
  const segment = getLanguagePathSegment(language);

  return segment ? `/${segment}/objects/` : '/objects/';
};

const getAboutPath = (language) => {
  const segment = getLanguagePathSegment(language);

  return segment ? `/${segment}/about/` : '/about/';
};

const getObjectPath = (language, id) => {
  const segment = getLanguagePathSegment(language);

  return segment ? `/${segment}/objects/${id}/` : `/objects/${id}/`;
};

const getManifestFileName = (language) => {
  const segment = getLanguagePathSegment(language);

  return segment ? `manifest.${segment}.webmanifest` : 'manifest.webmanifest';
};

const getOgImageUrl = (language) =>
  `${APP_ORIGIN}/img/${language === DEFAULT_LANGUAGE ? 'ogimage.png' : 'ogimage_en.png'}`;

const normalizeId = (id) => String(id).padStart(3, '0');

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

const loadJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'));

const loadOptionalJson = async (filePath) => {
  try {
    return await loadJson(filePath);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
};

const resolveItemsManifest = (baseManifest, override) => {
  const baseFrames = baseManifest.frames ?? {};
  const resultFrames = { ...baseFrames };

  if (!override) {
    return {
      ...baseManifest,
      frames: resultFrames,
    };
  }

  for (const rawId of override.remove ?? []) {
    delete resultFrames[normalizeId(rawId)];
  }

  for (const [rawId, frame] of Object.entries(override.replace ?? {})) {
    resultFrames[normalizeId(rawId)] = frame;
  }

  for (const [rawId, frame] of Object.entries(override.add ?? {})) {
    resultFrames[normalizeId(rawId)] = frame;
  }

  return {
    ...baseManifest,
    frames: Object.fromEntries(
      Object.entries(resultFrames).sort(([left], [right]) => Number(left) - Number(right)),
    ),
  };
};

const getTextureSource = (id, language, override) =>
  override?.textures?.[id]
    ? `/img/textures/overrides/${language}/items/${id}.webp`
    : `/img/textures/items/${id}.webp`;

const formatNumber = (language, value) =>
  new Intl.NumberFormat(language, {
    maximumFractionDigits: 6,
  }).format(value);

const formatSizeText = (language, size, units) => {
  const meterShort = units.units?.meterShort ?? 'm';

  return `${formatNumber(language, size.coeff)} x 10^${size.exponent} ${meterShort}`;
};

const buildSizeHtml = (sizeText) => {
  const match = sizeText.match(/^(.*?) x 10\^(-?\d+) (.*)$/u);

  if (!match) {
    return escapeHtml(sizeText);
  }

  const [, coeff, exponent, unit] = match;

  return `${escapeHtml(coeff)} &times; 10<sup>${escapeHtml(exponent)}</sup> ${escapeHtml(unit)}`;
};

const buildPowerOfTenRangeHtml = (group, units) => {
  const meterShort = units.units?.meterShort ?? 'm';

  if (group.maxSize === Infinity) {
    const minExponent = Math.log10(group.minSize);

    return `10<sup>${escapeHtml(minExponent)}</sup>+ ${escapeHtml(meterShort)}`;
  }

  if (group.minSize === 0) {
    return `&lt; 10<sup>${escapeHtml(Math.log10(group.maxSize))}</sup> ${escapeHtml(meterShort)}`;
  }

  const minExponent = Math.log10(group.minSize);

  return `10<sup>${escapeHtml(minExponent)}</sup> - 10<sup>${escapeHtml(Math.log10(group.maxSize))}</sup> ${escapeHtml(meterShort)}`;
};

const getObjectScaleGroupLabel = (language, group) =>
  language === DEFAULT_LANGUAGE ? group.ruLabel : group.enLabel;

const getObjectScaleGroup = (object) =>
  OBJECT_SCALE_GROUPS.find(
    (group) => object.sizeMeters >= group.minSize && object.sizeMeters < group.maxSize,
  ) ?? OBJECT_SCALE_GROUPS.at(-1);

const getFallbackNavLabels = (language) =>
  language === DEFAULT_LANGUAGE
    ? {
        about: 'О проекте',
        objects: 'Объекты',
        language: 'Язык',
        donate: 'Поддержать',
      }
    : {
        about: 'About',
        objects: 'Objects',
        language: 'Language',
        donate: 'Support',
      };

const getNavLabels = (language, ui) => {
  const fallback = getFallbackNavLabels(language);

  return {
    about: normalizeText(ui.html?.nav?.about ?? fallback.about),
    objects: normalizeText(ui.html?.nav?.objects ?? fallback.objects),
    language: normalizeText(ui.html?.nav?.language ?? fallback.language),
    donate: normalizeText(ui.html?.nav?.donate ?? ui.html?.donate?.title ?? fallback.donate),
  };
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

const buildCommonHeadLinks = (manifestFileName) => `
    <meta name="robots" content="index,follow,max-image-preview:large" />
    <meta name="theme-color" content="#171933" />
    <link rel="manifest" href="/${escapeHtml(manifestFileName)}" />
    <link href="https://fonts.googleapis.com/css?family=Roboto&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Raleway:ital,wght@1,900&display=swap" rel="stylesheet" />
    <link rel="shortcut icon" href="/favicon.ico" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" type="image/svg+xml" href="/img/favicon/favicon.svg" />
    <link rel="icon" type="image/png" sizes="96x96" href="/img/favicon/favicon-96x96.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/img/favicon/apple-touch-icon.png" />`;

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

const buildObjectStructuredData = (locale, object) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: object.title,
    url: object.url,
    description: object.description,
    inLanguage: locale.language,
    isPartOf: {
      '@type': 'WebSite',
      name: locale.appTitle,
      url: `${APP_ORIGIN}${locale.path}`,
    },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: `${APP_ORIGIN}${object.imageSrc}`,
    },
  };

  return `<script type="application/ld+json">${escapeJsonForHtml(JSON.stringify(structuredData))}</script>`;
};

const buildObjectIndexStructuredData = (locale) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: locale.appTitle,
    url: `${APP_ORIGIN}${locale.objectIndexPath}`,
    description: locale.metaDescription,
    inLanguage: locale.language,
  };

  return `<script type="application/ld+json">${escapeJsonForHtml(JSON.stringify(structuredData))}</script>`;
};

const getLocalizedPagePath = (locale, page) => {
  switch (page.type) {
    case 'about':
      return locale.aboutPath;
    case 'object':
      return locale.objectsById.get(page.id)?.path ?? locale.objectIndexPath;
    case 'objects':
      return locale.objectIndexPath;
    default:
      return locale.path;
  }
};

const buildStaticLanguageLinks = (locales, page) =>
  locales
    .filter((locale) => page.type !== 'object' || locale.objectsById.has(page.id))
    .map((locale) => {
      const path = getLocalizedPagePath(locale, page);

      return `<a href="${escapeHtml(path)}" lang="${escapeHtml(locale.language)}">${escapeHtml(locale.language)}</a>`;
    })
    .join('\n          ');

const buildStaticSidebarLanguageLinks = (locales, page) =>
  locales
    .filter((locale) => page.type !== 'object' || locale.objectsById.has(page.id))
    .map((locale) => {
      const path = getLocalizedPagePath(locale, page);

      return `<a href="${escapeHtml(path)}" lang="${escapeHtml(locale.language)}">${escapeHtml(locale.language)}</a>`;
    })
    .join('\n              ');

const buildStaticHeaderScript = () => `<script>
      (() => {
        const header = document.currentScript?.previousElementSibling;

        if (!header) {
          return;
        }

        const openButton = header.querySelector('[data-menu-open]');
        const closeButtons = header.querySelectorAll('[data-menu-close]');
        const shell = header.querySelector('[data-menu-shell]');

        if (!openButton || !shell) {
          return;
        }

        const setOpen = (isOpen) => {
          shell.classList.toggle('is-open', isOpen);
          shell.setAttribute('aria-hidden', String(!isOpen));
          openButton.setAttribute('aria-expanded', String(isOpen));
        };

        openButton.addEventListener('click', () => setOpen(true));
        closeButtons.forEach((button) => {
          button.addEventListener('click', () => setOpen(false));
        });
        shell.querySelectorAll('a').forEach((link) => {
          link.addEventListener('click', () => setOpen(false));
        });
        document.addEventListener('keydown', (event) => {
          if (event.key === 'Escape') {
            setOpen(false);
          }
        });
      })();
    </script>`;

const buildStaticHeader = (locale, locales, page) => `<header class="site-header-band">
      <div class="site-header">
        <a class="site-brand" href="${escapeHtml(locale.path)}"><img src="/img/favicon/favicon.svg" width="24" height="24" alt="" aria-hidden="true" /><span>${escapeHtml(locale.appTitle)}</span></a>
        <nav class="site-nav" aria-label="Primary">
          <a href="${escapeHtml(locale.aboutPath)}">${escapeHtml(locale.navLabels.about)}</a>
          <a href="${escapeHtml(locale.objectIndexPath)}">${escapeHtml(locale.navLabels.objects)}</a>
          <details class="language-menu">
            <summary>${escapeHtml(locale.navLabels.language)}</summary>
            <div>
            ${buildStaticLanguageLinks(locales, page)}
            </div>
          </details>
          <a href="${escapeHtml(DONATE_LINK)}" target="_blank" rel="noreferrer">${escapeHtml(locale.navLabels.donate)}</a>
        </nav>
        <button class="site-menu-button" type="button" aria-label="Open menu" aria-controls="site-nav-sidebar" aria-expanded="false" data-menu-open>
          <img src="/img/icons/menu.svg" width="20" height="20" alt="" aria-hidden="true" />
        </button>
        <div class="site-nav-sidebar-shell" aria-hidden="true" data-menu-shell>
          <button class="site-nav-sidebar-backdrop" type="button" aria-label="Close menu" data-menu-close></button>
          <aside id="site-nav-sidebar" class="site-nav-sidebar" aria-label="Primary">
            <button class="site-nav-sidebar-close" type="button" aria-label="Close menu" data-menu-close><span aria-hidden="true">&times;</span></button>
            <nav class="site-nav-sidebar-links" aria-label="Primary">
              <a href="${escapeHtml(locale.aboutPath)}">${escapeHtml(locale.navLabels.about)}</a>
              <a href="${escapeHtml(locale.objectIndexPath)}">${escapeHtml(locale.navLabels.objects)}</a>
              <div class="site-nav-sidebar-languages" aria-label="${escapeHtml(locale.navLabels.language)}">
                <span>${escapeHtml(locale.navLabels.language)}</span>
                <div>
                ${buildStaticSidebarLanguageLinks(locales, page)}
                </div>
              </div>
              <a href="${escapeHtml(DONATE_LINK)}" target="_blank" rel="noreferrer">${escapeHtml(locale.navLabels.donate)}</a>
            </nav>
          </aside>
        </div>
      </div>
    </header>
    ${buildStaticHeaderScript()}`;

const buildLinkedCreatedByHtml = (createdBy) => {
  const colonIndex = Math.max(createdBy.indexOf(':'), createdBy.indexOf('：'));

  if (colonIndex === -1) {
    return `<a href="${CREDIT_LINKS.copyright}" target="_blank" rel="noreferrer">${escapeHtml(createdBy)}</a>`;
  }

  const label = createdBy.slice(0, colonIndex + 1);
  const authors = createdBy.slice(colonIndex + 1).trim();

  return `${escapeHtml(label)} <a href="${CREDIT_LINKS.copyright}" target="_blank" rel="noreferrer">${escapeHtml(authors)}</a>`;
};

const buildAboutCreditLinkHtml = (label, href) =>
  `${escapeHtml(label)} <a href="${href}" target="_blank" rel="noreferrer">github.com</a>`;

const getOriginalRepositoryCredit = (locale) =>
  locale.language === DEFAULT_LANGUAGE
    ? 'Оригинальный репозиторий: Мэтью Мартори'
    : locale.startScreen.credits.webDev;

const buildAboutCreditsHtml = (locale) => `<div class="about-credits">
        <p>${buildLinkedCreatedByHtml(locale.startScreen.credits.createdBy)}</p>
        <p>${buildAboutCreditLinkHtml(getOriginalRepositoryCredit(locale), CREDIT_LINKS.webDev)}</p>
        <p>${buildAboutCreditLinkHtml(locale.startScreen.credits.translationAndDev, CREDIT_LINKS.pawfrolow)}</p>
        <p>Email: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
      </div>`;

const buildStaticFooter = (locale) => `<footer class="site-footer-band">
      <div class="site-footer">
        <nav class="site-footer-links" aria-label="Footer">
          <a href="${escapeHtml(locale.aboutPath)}">${escapeHtml(locale.navLabels.about)}</a>
          <a href="${escapeHtml(locale.objectIndexPath)}">${escapeHtml(locale.navLabels.objects)}</a>
        </nav>
        <div class="footer-meta">
          <span>v${escapeHtml(appVersion)}</span>
          <span>&copy; ${COPYRIGHT_YEAR}</span>
        </div>
      </div>
    </footer>`;

const buildStaticSeoContent = (locale, locales) => {
  const introParagraphs = locale.startScreen.introParagraphs
    .map(
      (paragraph) =>
        `    <p style="margin:0 0 14px;font-size:1.0625rem;line-height:1.7;color:#1f2937;">${escapeHtml(paragraph)}</p>`,
    )
    .join('\n');

  return `<div data-seo-static="true" class="seo-static-shell">
  ${buildStaticPageStyles()}
  ${buildStaticHeader(locale, locales, { type: 'home' })}
  <main class="page">
    <section style="margin:0 0 20px;">
      <h1 style="margin:0 0 16px;font-size:clamp(2rem,5vw,3.5rem);line-height:1.05;font-weight:800;color:#0f172a;">${escapeHtml(locale.startScreen.title)}</h1>
${introParagraphs}
    </section>
    <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin:0 0 24px;">
      <article style="padding:20px;border:1px solid rgba(15,23,42,0.08);border-radius:24px;background:rgba(255,255,255,0.88);box-sizing:border-box;">
        <p style="margin:0;font-size:1rem;line-height:1.6;color:#1f2937;">${escapeHtml(locale.startScreen.zoomHint)}</p>
      </article>
      <article style="padding:20px;border:1px solid rgba(15,23,42,0.08);border-radius:24px;background:rgba(255,255,255,0.88);box-sizing:border-box;">
        <p style="margin:0;font-size:1rem;line-height:1.6;color:#1f2937;">${escapeHtml(locale.startScreen.objectHint)}</p>
      </article>
    </section>
  </main>
  ${buildStaticFooter(locale)}
</div>`;
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

const createSeoObjects = ({ language, manifest, objectTranslations, units, override }) => {
  const frames = manifest.frames ?? {};
  const translatedObjects = objectTranslations.items ?? {};

  return Object.entries(frames)
    .map(([id, frame]) => {
      const objectText = translatedObjects[id];

      if (!frame.size || !objectText?.title || !objectText?.description) {
        return null;
      }

      const title = normalizeText(objectText.title);
      const description = normalizeText(objectText.description);
      const path = getObjectPath(language, id);

      return {
        id,
        title,
        description,
        path,
        url: `${APP_ORIGIN}${path}`,
        imageSrc: getTextureSource(id, language, override),
        sizeMeters: frame.size.coeff * 10 ** frame.size.exponent,
        sizeText: formatSizeText(language, frame.size, units),
      };
    })
    .filter(Boolean)
    .sort((left, right) => Number(left.id) - Number(right.id));
};

const loadLocales = async (baseItemsManifest) => {
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
      const objectsPath = path.join(localesDir, language, 'objects.json');
      const unitsPath = path.join(localesDir, language, 'units.json');
      const overridePath = path.join(dataDir, 'overrides', language, 'items.override.json');
      const ui = await loadJson(uiPath);
      const objectTranslations = await loadJson(objectsPath);
      const units = await loadJson(unitsPath);
      const override = await loadOptionalJson(overridePath);
      const manifest = resolveItemsManifest(baseItemsManifest, override);
      const appTitle = normalizeText(ui.app?.title ?? ui.html?.modal?.title ?? 'Universe Scale');
      const title = normalizeText(ui.html?.meta?.title ?? ui.html?.meta?.ogTitle ?? appTitle);
      const description = normalizeText(ui.html?.meta?.description ?? ui.html?.meta?.ogDescription ?? '');
      const ogTitle = normalizeText(ui.html?.meta?.ogTitle ?? title);
      const ogDescription = normalizeText(ui.html?.meta?.ogDescription ?? description);
      const introParagraphs = dedupeTexts([normalizeText(ui.html?.meta?.intro ?? description)]);
      const navLabels = getNavLabels(language, ui);
      const objects = createSeoObjects({
        language,
        manifest,
        objectTranslations,
        units,
        override,
      });
      const objectsById = new Map(objects.map((object) => [object.id, object]));

      return {
        language,
        path: getLanguagePath(language),
        objectIndexPath: getObjectIndexPath(language),
        aboutPath: getAboutPath(language),
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
        units,
        objects,
        objectsById,
        navLabels,
        startScreen: {
          title: normalizeText(ui.html?.modal?.title ?? appTitle),
          startText: normalizeText(ui.html?.modal?.startButton ?? ui.app?.start ?? 'Start'),
          startLoadingText: normalizeText(ui.html?.modal?.startLoading ?? 'Loading...'),
          introParagraphs,
          zoomHint: normalizeText(ui.html?.modal?.zoomHint ?? ui.app?.zoomHint ?? ''),
          objectHint: normalizeText(ui.html?.modal?.objectHint ?? ui.app?.objectHint ?? ''),
          homePath: getLanguagePath(language),
          aboutPath: getAboutPath(language),
          objectIndexPath: getObjectIndexPath(language),
          navLabels,
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

const buildObjectAlternateLinks = (locales, id) => {
  const objectLocales = locales.filter((locale) => locale.objectsById.has(id));
  const defaultLocale = objectLocales.find((locale) => locale.language === DEFAULT_LANGUAGE);

  return [
    ...objectLocales.map((locale) => {
      const object = locale.objectsById.get(id);

      return `<link rel="alternate" hreflang="${locale.language}" href="${object.url}" />`;
    }),
    defaultLocale
      ? `<link rel="alternate" hreflang="x-default" href="${defaultLocale.objectsById.get(id).url}" />`
      : null,
  ]
    .filter(Boolean)
    .join('\n    ');
};

const buildObjectIndexAlternateLinks = (locales) =>
  [
    ...locales.map(
      (locale) =>
        `<link rel="alternate" hreflang="${locale.language}" href="${APP_ORIGIN}${locale.objectIndexPath}" />`,
    ),
    `<link rel="alternate" hreflang="x-default" href="${APP_ORIGIN}/objects/" />`,
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
  localizedHtml = localizedHtml.replace('<!-- SEO_STATIC_CONTENT -->', buildStaticSeoContent(locale, locales));
  localizedHtml = localizedHtml.replace('<!-- SEO_LOCALE_DATA -->', buildSeoLocaleDataScript(locale));

  return localizedHtml;
};

const getLocaleOutputPath = (locale, ...segments) =>
  locale.language === DEFAULT_LANGUAGE
    ? path.join(distDir, ...segments)
    : path.join(distDir, getLanguagePathSegment(locale.language), ...segments);

const writeLocalizedPages = async (template, locales) => {
  for (const locale of locales) {
    const localizedHtml = localizeHtml(template, locale, locales);
    const targetPath = getLocaleOutputPath(locale, 'index.html');

    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, localizedHtml);
  }
};

const buildStaticPageStyles = () => `<style>
      * { box-sizing: border-box; }
      body { min-height: 100dvh; margin: 0; display: flex; flex-direction: column; font-family: Roboto, system-ui, sans-serif; color: #111827; background: radial-gradient(circle at top, #f8fafc 0%, #e5e7eb 46%, #d1d5db 100%); }
      a { color: #172554; }
      .seo-static-shell { min-height: 100dvh; display: flex; flex-direction: column; font-family: Roboto, system-ui, sans-serif; color: #111827; }
      .page { flex: 1; width: min(1120px, 100%); margin: 0 auto; padding: 28px 24px 44px; }
      .site-header-band { flex-shrink: 0; width: 100%; border-bottom: 1px solid rgba(15,23,42,0.08); background: rgba(255,255,255,0.76); }
      .site-header { width: min(1120px, 100%); margin: 0 auto; padding: 16px 24px 12px; display: flex; align-items: center; justify-content: space-between; gap: 18px; }
      .site-brand { display: inline-flex; align-items: center; gap: 10px; min-width: 0; color: #0f172a; font-size: 1.0625rem; line-height: 1.25; font-weight: 800; text-decoration: none; }
      .site-brand img { display: block; flex-shrink: 0; width: 24px; height: 24px; }
      .site-brand span { min-width: 0; word-break: break-word; }
      .site-nav { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 14px; }
      .site-nav a, .site-nav summary { display: inline-flex; align-items: center; justify-content: center; min-height: 32px; padding: 4px 0; color: #111827; font-size: 0.875rem; line-height: 1.2; text-decoration: none; white-space: nowrap; cursor: pointer; }
      .site-nav a:hover, .site-nav summary:hover { color: #1d4ed8; }
      .site-menu-button { display: none; align-items: center; justify-content: center; flex-shrink: 0; width: 40px; height: 40px; padding: 0; border: 0; border-radius: 50%; background: rgba(255,255,255,0.78); cursor: pointer; }
      .site-menu-button img { display: block; width: 20px; height: 20px; }
      .language-menu { position: relative; }
      .language-menu > div { position: absolute; right: 0; z-index: 2; display: grid; grid-template-columns: repeat(2, minmax(56px, 1fr)); gap: 6px; min-width: 150px; margin-top: 8px; padding: 8px; border: 1px solid rgba(15,23,42,0.12); border-radius: 14px; background: rgba(255,255,255,0.98); box-shadow: 0 12px 36px rgba(15,23,42,0.12); }
      .language-menu > div a { min-height: 30px; padding: 6px 8px; }
      .site-nav-sidebar-shell { position: fixed; inset: 0; z-index: 20; pointer-events: none; }
      .site-nav-sidebar-shell.is-open { pointer-events: auto; }
      .site-nav-sidebar-backdrop { position: absolute; inset: 0; width: 100%; height: 100%; padding: 0; border: 0; background: rgba(15,23,42,0.42); opacity: 0; cursor: pointer; transition: opacity 0.18s ease; }
      .site-nav-sidebar-shell.is-open .site-nav-sidebar-backdrop { opacity: 1; }
      .site-nav-sidebar { position: absolute; top: 0; right: 0; display: flex; flex-direction: column; gap: 24px; width: min(320px, calc(100vw - 48px)); height: 100%; padding: 18px; background: rgba(255,255,255,0.98); box-shadow: -18px 0 48px rgba(15,23,42,0.18); transform: translateX(100%); transition: transform 0.2s ease; }
      .site-nav-sidebar-shell.is-open .site-nav-sidebar { transform: translateX(0); }
      .site-nav-sidebar-close { align-self: flex-end; display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; padding: 0; border: 0; border-radius: 50%; background: rgba(15,23,42,0.06); color: #111827; font-size: 28px; line-height: 1; cursor: pointer; }
      .site-nav-sidebar-links { display: flex; flex-direction: column; gap: 4px; }
      .site-nav-sidebar-links a { display: flex; align-items: center; min-height: 44px; padding: 8px 2px; color: #111827; font-size: 1.125rem; line-height: 1.25; text-decoration: none; word-break: break-word; }
      .site-nav-sidebar-links a:hover { color: #1d4ed8; }
      .site-nav-sidebar-languages { display: flex; flex-direction: column; gap: 8px; padding: 12px 2px; color: rgba(17,24,39,0.72); font-size: 0.875rem; line-height: 1.3; }
      .site-nav-sidebar-languages > span { font-weight: 700; }
      .site-nav-sidebar-languages > div { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px 8px; }
      .site-nav-sidebar-languages a { min-height: 34px; padding: 6px 0; font-size: 0.9375rem; }
      .hero { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(220px, 0.75fr); gap: 28px; align-items: center; }
      h1 { margin: 0 0 16px; font-size: clamp(2.25rem, 6vw, 4.5rem); line-height: 1.03; color: #0f172a; }
      h2 { margin: 34px 0 16px; font-size: 1.4rem; color: #0f172a; }
      p { font-size: 1.0625rem; line-height: 1.7; margin: 0 0 16px; }
      .size { font-size: 1.3rem; font-weight: 800; color: #1e3a8a; }
      .image-wrap { display: flex; align-items: center; justify-content: center; min-height: 260px; padding: 24px; border: 1px solid rgba(15,23,42,0.1); border-radius: 24px; background: rgba(255,255,255,0.72); }
      .image-wrap img { display: block; width: min(100%, 360px); max-height: 360px; object-fit: contain; }
      .object-section { margin-top: 34px; }
      .object-section-header { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; margin-bottom: 12px; border-bottom: 1px solid rgba(15,23,42,0.1); padding-bottom: 8px; }
      .object-section-title { margin: 0; color: #0f172a; font-size: 1.25rem; line-height: 1.25; }
      .object-section-range { flex-shrink: 0; color: rgba(17,24,39,0.62); font-size: 0.875rem; line-height: 1.3; }
      .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; }
      .card { display: flex; flex-direction: column; justify-content: center; gap: 6px; min-height: 72px; padding: 12px 14px; border: 1px solid rgba(15,23,42,0.12); border-radius: 14px; background: rgba(255,255,255,0.82); color: #172554; text-decoration: none; line-height: 1.35; }
      .card-title { color: #172554; font-size: 1rem; line-height: 1.35; word-break: break-word; }
      .card-size { color: rgba(17,24,39,0.68); font-size: 0.8125rem; line-height: 1.3; }
      .button { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; margin-top: 8px; padding: 12px 22px; border-radius: 999px; background: #5c7aff; color: #fff; text-decoration: none; font-weight: 800; }
      .about-credits { display: flex; flex-direction: column; gap: 2px; min-width: 0; margin: 24px 0 16px; color: rgba(17,24,39,0.78); font-size: 0.9375rem; line-height: 1.5; }
      .about-credits p { margin: 0; font-size: inherit; line-height: inherit; }
      .about-credits a { color: inherit; text-underline-offset: 2px; }
      .site-footer-band { flex-shrink: 0; width: 100%; border-top: 1px solid rgba(15,23,42,0.08); background: rgba(255,255,255,0.78); }
      .site-footer { width: min(1120px, 100%); margin: 0 auto; padding: 22px 24px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
      .site-footer-links { display: flex; align-items: center; flex-wrap: wrap; gap: 16px; min-width: 0; }
      .site-footer-links a { color: rgba(17,24,39,0.8); font-size: 0.875rem; line-height: 1.4; text-decoration: none; word-break: break-word; }
      .site-footer-links a:hover { color: #1d4ed8; }
      .footer-meta { display: flex; align-items: center; gap: 10px; flex-shrink: 0; color: rgba(17,24,39,0.72); font-size: 0.8125rem; line-height: 1.4; }
      @media (max-width: 767px) { .page { padding: 22px 16px 32px; } .site-header { padding: 12px 16px 10px; align-items: center; gap: 10px; } .site-nav { display: none; } .site-menu-button { display: inline-flex; } .hero { grid-template-columns: 1fr; } .image-wrap { min-height: 200px; } .object-section { margin-top: 28px; } .object-section-header { flex-direction: column; align-items: flex-start; gap: 4px; } .site-footer { padding: 8px 16px 18px; flex-direction: column; align-items: stretch; gap: 12px; } .footer-meta { justify-content: space-between; } }
    </style>`;

const buildObjectPageHtml = (locale, locales, object) => {
  const title = `${object.title} | ${locale.appTitle}`;
  const description = trimToLength(`${object.title}. ${object.description}`, 155);
  const imageUrl = `${APP_ORIGIN}${object.imageSrc}`;

  return `<!doctype html>
<html lang="${locale.language}" dir="${locale.dir}">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${escapeHtml(description)}" />${buildCommonHeadLinks(locale.manifestFileName)}
    <link rel="canonical" href="${object.url}" />
    ${buildObjectAlternateLinks(locales, object.id)}
    ${buildObjectStructuredData(locale, object)}
    <title>${escapeHtml(title)}</title>
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${object.url}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:locale" content="${locale.ogLocale}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${imageUrl}" />
    ${buildStaticPageStyles()}
  </head>
  <body>
    ${buildStaticHeader(locale, locales, { type: 'object', id: object.id })}
    <main class="page">
      <section class="hero">
        <div>
          <h1>${escapeHtml(object.title)}</h1>
          <p class="size">${buildSizeHtml(object.sizeText)}</p>
          <p>${escapeHtml(object.description)}</p>
          <a class="button" href="${escapeHtml(locale.path)}">${escapeHtml(locale.startScreen.startText)}</a>
        </div>
        <div class="image-wrap">
          <img src="${escapeHtml(object.imageSrc)}" alt="${escapeHtml(object.title)}" loading="eager" />
        </div>
      </section>
    </main>
    ${buildStaticFooter(locale)}
  </body>
</html>
`;
};

const buildObjectIndexHtml = (locale, locales) => {
  const title = `${locale.appTitle} | ${locale.startScreen.objectHint}`;
  const description = trimToLength(`${locale.metaDescription} ${locale.startScreen.objectHint}`, 155);
  const sortedObjects = [...locale.objects].sort(
    (left, right) => left.sizeMeters - right.sizeMeters || Number(left.id) - Number(right.id),
  );
  const objectSections = OBJECT_SCALE_GROUPS.map((group) => {
    const groupObjects = sortedObjects.filter((object) => getObjectScaleGroup(object) === group);

    if (!groupObjects.length) {
      return null;
    }

    const groupLabel = getObjectScaleGroupLabel(locale.language, group);
    const objectLinks = groupObjects
      .map(
        (object) =>
          `<a class="card" href="${escapeHtml(object.path)}"><span class="card-title">${escapeHtml(object.title)}</span><span class="card-size">${buildSizeHtml(object.sizeText)}</span></a>`,
      )
      .join('\n          ');

    return `<section class="object-section">
        <div class="object-section-header">
          <h2 class="object-section-title">${escapeHtml(groupLabel)}</h2>
          <span class="object-section-range">${buildPowerOfTenRangeHtml(group, locale.units)}</span>
        </div>
        <nav class="grid" aria-label="${escapeHtml(groupLabel)}">
          ${objectLinks}
        </nav>
      </section>`;
  })
    .filter(Boolean)
    .join('\n      ');

  return `<!doctype html>
<html lang="${locale.language}" dir="${locale.dir}">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${escapeHtml(description)}" />${buildCommonHeadLinks(locale.manifestFileName)}
    <link rel="canonical" href="${APP_ORIGIN}${locale.objectIndexPath}" />
    ${buildObjectIndexAlternateLinks(locales)}
    ${buildObjectIndexStructuredData(locale)}
    <title>${escapeHtml(title)}</title>
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${APP_ORIGIN}${locale.objectIndexPath}" />
    <meta property="og:image" content="${locale.ogImage}" />
    <meta property="og:locale" content="${locale.ogLocale}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${locale.ogImage}" />
    ${buildStaticPageStyles()}
  </head>
  <body>
    ${buildStaticHeader(locale, locales, { type: 'objects' })}
    <main class="page">
      <h1>${escapeHtml(locale.startScreen.objectHint)}</h1>
      <p>${escapeHtml(locale.metaDescription)}</p>
      ${objectSections}
    </main>
    ${buildStaticFooter(locale)}
  </body>
</html>
`;
};

const buildAboutStructuredData = (locale) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `${locale.navLabels.about} | ${locale.appTitle}`,
    url: `${APP_ORIGIN}${locale.aboutPath}`,
    description: locale.metaDescription,
    inLanguage: locale.language,
    isPartOf: {
      '@type': 'WebSite',
      name: locale.appTitle,
      url: `${APP_ORIGIN}${locale.path}`,
    },
  };

  return `<script type="application/ld+json">${escapeJsonForHtml(JSON.stringify(structuredData))}</script>`;
};

const buildAboutAlternateLinks = (locales) =>
  [
    ...locales.map(
      (locale) =>
        `<link rel="alternate" hreflang="${locale.language}" href="${APP_ORIGIN}${locale.aboutPath}" />`,
    ),
    `<link rel="alternate" hreflang="x-default" href="${APP_ORIGIN}/about/" />`,
  ].join('\n    ');

const buildAboutPageHtml = (locale, locales) => {
  const title = `${locale.navLabels.about} | ${locale.appTitle}`;
  const description = trimToLength(`${locale.metaDescription} ${locale.startScreen.credits.createdBy}`, 155);
  const introParagraphs = locale.startScreen.introParagraphs
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join('\n      ');

  return `<!doctype html>
<html lang="${locale.language}" dir="${locale.dir}">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${escapeHtml(description)}" />${buildCommonHeadLinks(locale.manifestFileName)}
    <link rel="canonical" href="${APP_ORIGIN}${locale.aboutPath}" />
    ${buildAboutAlternateLinks(locales)}
    ${buildAboutStructuredData(locale)}
    <title>${escapeHtml(title)}</title>
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${APP_ORIGIN}${locale.aboutPath}" />
    <meta property="og:image" content="${locale.ogImage}" />
    <meta property="og:locale" content="${locale.ogLocale}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${locale.ogImage}" />
    ${buildStaticPageStyles()}
  </head>
  <body>
    ${buildStaticHeader(locale, locales, { type: 'about' })}
    <main class="page">
      <h1>${escapeHtml(locale.navLabels.about)}</h1>
      ${introParagraphs}
      ${buildAboutCreditsHtml(locale)}
      <a class="button" href="${escapeHtml(locale.objectIndexPath)}">${escapeHtml(locale.navLabels.objects)}</a>
    </main>
    ${buildStaticFooter(locale)}
  </body>
</html>
`;
};

const writeObjectPages = async (locales) => {
  for (const locale of locales) {
    const indexPath = getLocaleOutputPath(locale, 'objects', 'index.html');
    await mkdir(path.dirname(indexPath), { recursive: true });
    await writeFile(indexPath, buildObjectIndexHtml(locale, locales));

    for (const object of locale.objects) {
      const targetPath = getLocaleOutputPath(locale, 'objects', object.id, 'index.html');

      await mkdir(path.dirname(targetPath), { recursive: true });
      await writeFile(targetPath, buildObjectPageHtml(locale, locales, object));
    }
  }
};

const writeAboutPages = async (locales) => {
  for (const locale of locales) {
    const targetPath = getLocaleOutputPath(locale, 'about', 'index.html');

    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, buildAboutPageHtml(locale, locales));
  }
};

const writeManifests = async (locales) => {
  const baseManifest = await loadJson(manifestSourcePath);

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

const buildSitemapUrl = (url) => `  <url>
    <loc>${escapeHtml(url)}</loc>
    <lastmod>${LASTMOD}</lastmod>
  </url>`;

const writeSitemap = async (locales) => {
  const urls = [
    ...locales.map((locale) => `${APP_ORIGIN}${locale.path}`),
    ...locales.map((locale) => `${APP_ORIGIN}${locale.aboutPath}`),
    ...locales.map((locale) => `${APP_ORIGIN}${locale.objectIndexPath}`),
    ...locales.flatMap((locale) => locale.objects.map((object) => object.url)),
  ];
  const uniqueUrls = [...new Set(urls)];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls.map(buildSitemapUrl).join('\n')}
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

const validateSeoOutput = (locales) => {
  const homeUrls = new Set(locales.map((locale) => `${APP_ORIGIN}${locale.path}`));
  const objectUrls = new Set(
    locales.flatMap((locale) => locale.objects.map((object) => object.url)),
  );

  if (homeUrls.size !== locales.length) {
    throw new Error('Duplicate localized home URLs detected');
  }

  if (!objectUrls.size) {
    throw new Error('No object SEO pages were generated');
  }

  for (const locale of locales) {
    for (const object of locale.objects) {
      if (!object.title || !object.description || !object.sizeText || !object.imageSrc) {
        throw new Error(`Incomplete object SEO data for ${locale.language}/${object.id}`);
      }
    }
  }
};

const main = async () => {
  const packageJson = await loadJson(packageSourcePath);
  const baseItemsManifest = await loadJson(itemsSourcePath);
  appVersion = normalizeText(packageJson.version ?? '');
  const locales = await loadLocales(baseItemsManifest);
  const template = await readFile(path.join(distDir, 'index.html'), 'utf8');

  validateSeoOutput(locales);

  await writeLocalizedPages(template, locales);
  await writeAboutPages(locales);
  await writeObjectPages(locales);
  await writeManifests(locales);
  await writeSitemap(locales);
  await writeRobots();
};

await main();
