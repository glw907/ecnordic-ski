import type { RequestHandler } from './$types';
import { jsonFeedResponse, type FeedItem } from '@glw907/cairn-cms/delivery';
import { posts, linkResolver } from '$lib/content';
import { cairn } from '$lib/cairn.config';
import { SITE_TITLE, SITE_URL, SITE_DESCRIPTION, SITE_AUTHOR, FEED_MAX_ITEMS } from '$lib/config';

export const prerender = true;

/** Posts as feed entries, newest first, capped at FEED_MAX_ITEMS (0 means all). The summary is
 *  the authored description re-read from the entry, not the derived excerpt, to match the old feed. */
async function feedItems(): Promise<FeedItem[]> {
  const all = posts.all();
  const capped = FEED_MAX_ITEMS > 0 ? all.slice(0, FEED_MAX_ITEMS) : all;
  return Promise.all(
    capped.map(async (p) => {
      const entry = posts.byId(p.id)!;
      return {
        title: p.title,
        url: SITE_URL + p.permalink,
        date: p.date,
        summary: entry.frontmatter.description ?? '',
        contentHtml: await cairn.render(entry.body, { resolve: linkResolver }),
        tags: p.tags,
      };
    }),
  );
}

export const GET: RequestHandler = async () => {
  return jsonFeedResponse(
    {
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      siteUrl: SITE_URL,
      feedUrl: SITE_URL + '/feed.json',
      author: { name: SITE_AUTHOR },
    },
    await feedItems(),
  );
};
