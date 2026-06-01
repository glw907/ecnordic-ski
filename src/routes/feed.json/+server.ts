import type { RequestHandler } from './$types';
import { buildJsonFeed } from '@glw907/cairn-cms';
import { feedItems } from '$lib/content';
import { SITE_TITLE, SITE_URL, SITE_DESCRIPTION, SITE_AUTHOR } from '$lib/config';

export const prerender = true;

export const GET: RequestHandler = async () => {
  const json = buildJsonFeed(
    {
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      siteUrl: SITE_URL,
      feedUrl: SITE_URL + '/feed.json',
      author: { name: SITE_AUTHOR },
    },
    await feedItems(),
  );

  return new Response(json, {
    headers: { 'Content-Type': 'application/feed+json; charset=utf-8' },
  });
};
