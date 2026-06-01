import type { RequestHandler } from './$types';
import { buildRobots } from '@glw907/cairn-cms';
import { SITE_URL } from '$lib/config';

export const prerender = true;

export const GET: RequestHandler = () => {
  return new Response(buildRobots({ sitemapUrl: SITE_URL + '/sitemap.xml', disallow: ['/admin'] }), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
