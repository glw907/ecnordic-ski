import type { RequestHandler } from './$types';
import { buildRssFeed } from '@glw907/cairn-cms';
import { feedItems } from '$lib/content';
import { SITE_TITLE, SITE_URL, SITE_DESCRIPTION, SITE_AUTHOR } from '$lib/config';

export const prerender = true;

export const GET: RequestHandler = async () => {
  const xml = buildRssFeed(
    {
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      siteUrl: SITE_URL,
      feedUrl: SITE_URL + '/feed.xml',
      author: { name: SITE_AUTHOR },
    },
    await feedItems(),
  );

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
