import { error } from '@sveltejs/kit';
import { buildSeoMeta } from '@glw907/cairn-cms';
import type { PageServerLoad, EntryGenerator } from './$types';
import { resolvePermalink, contentPermalinks, render } from '$lib/content';
import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION } from '$lib/config';

export const prerender = true;

export const entries: EntryGenerator = () =>
  contentPermalinks().map((p) => ({ path: p.replace(/^\//, '') }));

export const load: PageServerLoad = async ({ params }) => {
  const hit = resolvePermalink('/' + params.path);
  if (!hit) error(404, 'Not found');

  const { concept, entry } = hit;
  const html = await render(entry.body);
  const description =
    (entry.frontmatter.description as string) || entry.excerpt || SITE_DESCRIPTION;

  const seo = buildSeoMeta({
    title: entry.title,
    description,
    canonicalUrl: SITE_URL + entry.permalink,
    siteName: SITE_TITLE,
    type: concept === 'posts' ? 'article' : 'website',
    ...(concept === 'posts' && entry.date ? { published: entry.date } : {}),
    feeds: { rss: SITE_URL + '/feed.xml', json: SITE_URL + '/feed.json' },
  });

  return {
    concept,
    slug: entry.slug,
    title: entry.title,
    date: entry.date ?? '',
    tags: entry.tags,
    html,
    seo,
  };
};
