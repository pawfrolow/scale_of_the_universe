import type { APIRoute } from 'astro';

import { APP_ORIGIN, getLocales, isSeoPageIndexable } from '@/services/seo-static.service';

const SITEMAP_LASTMOD = '2026-08-15';

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const buildSitemapUrl = (url: string, lastmod: string) => `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;

export const GET: APIRoute = async () => {
  const locales = await getLocales();
  const urls = [
    ...locales.map((locale) => `${APP_ORIGIN}${locale.path}`),
    ...locales
      .filter((locale) => isSeoPageIndexable(locale, { type: 'about' }))
      .map((locale) => `${APP_ORIGIN}${locale.aboutPath}`),
    ...locales.map((locale) => `${APP_ORIGIN}${locale.objectIndexPath}`),
    ...locales
      .filter((locale) => isSeoPageIndexable(locale, { type: 'object', id: '' }))
      .flatMap((locale) => locale.objects.map((object) => object.url)),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...new Set(urls)].map((url) => buildSitemapUrl(url, SITEMAP_LASTMOD)).join('\n')}
</urlset>
`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
