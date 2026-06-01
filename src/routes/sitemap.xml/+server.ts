import type { RequestHandler } from './$types';
import { buildSitemap, type SitemapUrl } from '@glw907/cairn-cms';
import { allPosts, allTags, contentPermalinks } from '$lib/content';
import { SITE_URL } from '$lib/config';

export const prerender = true;

export const GET: RequestHandler = () => {
  const lastmodByPermalink = new Map(allPosts().map((p) => [p.permalink, p.date]));

  const urls: SitemapUrl[] = [
    { loc: SITE_URL + '/' },
    { loc: SITE_URL + '/tags' },
    { loc: SITE_URL + '/contact' },
    { loc: SITE_URL + '/waiver' },
    ...contentPermalinks().map((path) => {
      const lastmod = lastmodByPermalink.get(path);
      return lastmod ? { loc: SITE_URL + path, lastmod } : { loc: SITE_URL + path };
    }),
    ...allTags().map(({ tag }) => ({ loc: `${SITE_URL}/tags/${tag}` })),
  ];

  return new Response(buildSitemap(urls), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
