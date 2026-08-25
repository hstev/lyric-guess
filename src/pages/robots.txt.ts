import type { APIRoute } from 'astro';
import { withBase } from '../utils/paths';

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL('https://hstev.github.io');
  const sitemap = new URL(`${withBase('/sitemap-index.xml')}`, origin).toString();
  const body = `User-agent: *\nAllow: /\nSitemap: ${sitemap}\n`;
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
