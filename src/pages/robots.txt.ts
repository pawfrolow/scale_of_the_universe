import type { APIRoute } from 'astro';

import { APP_ORIGIN } from '@/services/seo-static.service';

export const GET: APIRoute = () =>
  new Response(
    `User-agent: *
Allow: /

Sitemap: ${APP_ORIGIN}/sitemap.xml
`,
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    },
  );
