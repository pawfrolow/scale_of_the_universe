import http from 'node:http';
import https from 'node:https';

const TARGET_ORIGIN = process.env.SEO_CHECK_ORIGIN ?? 'http://localhost:4321';
const CANONICAL_ORIGIN = process.env.SEO_CANONICAL_ORIGIN ?? 'https://universe.pavelfrolov.com';
const HOSTNAME = new URL(TARGET_ORIGIN).hostname;
const TIMEOUT_MS = 10000;
const EXPECTED_SITEMAP_URL_COUNT = 665;

const countOccurrences = (value, pattern) => value.match(pattern)?.length ?? 0;

const redirectChecks = [
  {
    name: 'HTTP redirects to HTTPS',
    url: `http://${HOSTNAME}/`,
    expect: ({ statusCode, headers }) =>
      [301, 308].includes(statusCode) && headers.location?.startsWith(TARGET_ORIGIN),
  },
  {
    name: 'www redirects to canonical host',
    url: `https://www.${HOSTNAME}/`,
    expect: ({ statusCode, headers }) =>
      [301, 308].includes(statusCode) && headers.location?.startsWith(`${TARGET_ORIGIN}/`),
  },
  {
    name: '/index.html redirects to /',
    url: `${TARGET_ORIGIN}/index.html`,
    expect: ({ statusCode, headers }) =>
      [301, 308].includes(statusCode) && headers.location === `${TARGET_ORIGIN}/`,
  },
];

const contentChecks = [
  {
    name: 'root page has self canonical and navigation',
    url: `${TARGET_ORIGIN}/`,
    expect: ({ statusCode, body }) =>
      statusCode === 200 &&
      body.includes(`<link rel="canonical" href="${CANONICAL_ORIGIN}/"`) &&
      body.includes('href="/about/"') &&
      body.includes('href="/objects/"'),
  },
  {
    name: 'about page has self canonical',
    url: `${TARGET_ORIGIN}/about/`,
    expect: ({ statusCode, body }) =>
      statusCode === 200 &&
      body.includes(`<link rel="canonical" href="${CANONICAL_ORIGIN}/about/"`) &&
      body.includes('<meta name="robots" content="index,follow,max-image-preview:large">') &&
      body.includes('github.com/matttt/scale_of_the_universe') &&
      body.includes('paw.frolow@icloud.com'),
  },
  {
    name: 'localized about page has self canonical',
    url: `${TARGET_ORIGIN}/en/about/`,
    expect: ({ statusCode, body }) =>
      statusCode === 200 &&
      body.includes(`<link rel="canonical" href="${CANONICAL_ORIGIN}/en/about/"`) &&
      body.includes('<meta name="robots" content="index,follow,max-image-preview:large">') &&
      body.includes('The Scale of the Universe is an interactive visualization'),
  },
  {
    name: 'localized object page has self canonical and layout chrome',
    url: `${TARGET_ORIGIN}/en/objects/lcd-pixel/`,
    expect: ({ statusCode, body }) =>
      statusCode === 200 &&
      body.includes(`<link rel="canonical" href="${CANONICAL_ORIGIN}/en/objects/lcd-pixel/"`) &&
      body.includes('<meta name="robots" content="index,follow,max-image-preview:large">') &&
      body.includes(`<link rel="alternate" hreflang="ru" href="${CANONICAL_ORIGIN}/objects/lcd-pixel/"`) &&
      body.includes(`<link rel="alternate" hreflang="en" href="${CANONICAL_ORIGIN}/en/objects/lcd-pixel/"`) &&
      !body.includes(`href="${CANONICAL_ORIGIN}/tr/objects/lcd-pixel/"`) &&
      body.includes('>LCD Pixel</h1>') &&
      body.includes('<header') &&
      body.includes('<footer'),
  },
  {
    name: 'non-priority localized about page is noindex without hreflang alternates',
    url: `${TARGET_ORIGIN}/tr/about/`,
    expect: ({ statusCode, body }) =>
      statusCode === 200 &&
      body.includes(`<link rel="canonical" href="${CANONICAL_ORIGIN}/tr/about/"`) &&
      body.includes('<meta name="robots" content="noindex,follow">') &&
      !body.includes('rel="alternate"'),
  },
  {
    name: 'non-priority localized object page is noindex without hreflang alternates',
    url: `${TARGET_ORIGIN}/tr/objects/lcd-pixel/`,
    expect: ({ statusCode, body }) =>
      statusCode === 200 &&
      body.includes(`<link rel="canonical" href="${CANONICAL_ORIGIN}/tr/objects/lcd-pixel/"`) &&
      body.includes('<meta name="robots" content="noindex,follow">') &&
      !body.includes('rel="alternate"'),
  },
  {
    name: 'object index page does not expose empty search text in static HTML',
    url: `${TARGET_ORIGIN}/en/objects/`,
    expect: ({ statusCode, body }) => statusCode === 200 && !body.includes('No objects found.'),
  },
  {
    name: 'sitemap is reachable and includes only indexable URLs',
    url: `${TARGET_ORIGIN}/sitemap.xml`,
    expect: ({ statusCode, body }) =>
      statusCode === 200 &&
      body.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">') &&
      countOccurrences(body, /<url>/g) === EXPECTED_SITEMAP_URL_COUNT &&
      body.includes(`<loc>${CANONICAL_ORIGIN}/about/</loc>`) &&
      body.includes(`<loc>${CANONICAL_ORIGIN}/en/about/</loc>`) &&
      body.includes(`<loc>${CANONICAL_ORIGIN}/objects/lcd-pixel/</loc>`) &&
      body.includes(`<loc>${CANONICAL_ORIGIN}/en/objects/lcd-pixel/</loc>`) &&
      !body.includes(`<loc>${CANONICAL_ORIGIN}/tr/about/</loc>`) &&
      !body.includes(`<loc>${CANONICAL_ORIGIN}/tr/objects/lcd-pixel/</loc>`) &&
      body.includes('<lastmod>2026-08-15</lastmod>'),
  },
];

const checks =
  HOSTNAME === 'universe.pavelfrolov.com' ? [...redirectChecks, ...contentChecks] : contentChecks;

const request = (url) =>
  new Promise((resolve, reject) => {
    const requestUrl = new URL(url);
    const client = requestUrl.protocol === 'http:' ? http : https;
    const req = client.request(
      requestUrl,
      {
        headers: {
          'User-Agent': 'scale-of-the-universe-seo-check/1.0',
        },
        timeout: TIMEOUT_MS,
      },
      (res) => {
        let body = '';

        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode ?? 0,
            headers: res.headers,
            body,
          });
        });
      },
    );

    req.on('timeout', () => {
      req.destroy(new Error(`Request timed out after ${TIMEOUT_MS}ms`));
    });
    req.on('error', reject);
    req.end();
  });

let hasFailure = false;

for (const check of checks) {
  try {
    const result = await request(check.url);
    const isPassed = check.expect(result);

    if (isPassed) {
      console.log(`PASS ${check.name}`);
    } else {
      hasFailure = true;
      console.error(`FAIL ${check.name}: ${result.statusCode} ${check.url}`);
    }
  } catch (error) {
    hasFailure = true;
    console.error(`FAIL ${check.name}: ${error.message}`);
  }
}

if (hasFailure) {
  process.exitCode = 1;
}
