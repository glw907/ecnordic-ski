import type { PageServerLoad, EntryGenerator } from './$types';
import { createPublicRoutes } from '@glw907/cairn-cms/delivery';
import { site, ORIGIN, SITE_DESCRIPTION } from '$lib/content';
import { cairn } from '$lib/cairn.config';

export const prerender = true;

const routes = createPublicRoutes({
  site,
  render: cairn.render,
  origin: ORIGIN,
  siteName: cairn.siteName,
  description: SITE_DESCRIPTION,
  feeds: { rss: ORIGIN + '/feed.xml', json: ORIGIN + '/feed.json' },
});

export const entries: EntryGenerator = () => routes.entries();

export const load: PageServerLoad = async ({ url }) => {
  const data = await routes.entryLoad({ url });
  // EntryData carries no concept; a dated entry is a post, an undated one a page.
  const concept = data.entry.date ? 'posts' : 'pages';
  return {
    concept,
    slug: data.entry.slug,
    title: data.entry.title,
    date: data.entry.date ?? '',
    tags: data.entry.tags,
    html: data.html,
    seo: data.seo,
  };
};
