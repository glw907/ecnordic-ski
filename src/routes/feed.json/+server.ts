import type { RequestHandler } from './$types';
import { buildJsonFeed, type FeedItem } from '@glw907/cairn-cms';
import { allPosts, postBody, render } from '$lib/content';
import { SITE_TITLE, SITE_URL, SITE_DESCRIPTION, SITE_AUTHOR, FEED_MAX_ITEMS } from '$lib/config';

export const prerender = true;

export const GET: RequestHandler = async () => {
  const posts = FEED_MAX_ITEMS > 0 ? allPosts().slice(0, FEED_MAX_ITEMS) : allPosts();
  const items: FeedItem[] = await Promise.all(
    posts.map(async (p) => ({
      title: p.title,
      url: SITE_URL + p.permalink,
      date: p.date,
      summary: p.description,
      contentHtml: await render(postBody(p.id)),
      tags: p.tags,
    })),
  );

  const json = buildJsonFeed(
    {
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      siteUrl: SITE_URL,
      feedUrl: SITE_URL + '/feed.json',
      author: { name: SITE_AUTHOR },
    },
    items,
  );

  return new Response(json, {
    headers: { 'Content-Type': 'application/feed+json; charset=utf-8' },
  });
};
