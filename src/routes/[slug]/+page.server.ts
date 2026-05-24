import { error } from '@sveltejs/kit';
import { getPage, getPageSlugs } from '$lib/pages';
import type { PageServerLoad, EntryGenerator } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => getPageSlugs().map((slug) => ({ slug }));

export const load: PageServerLoad = async ({ params }) => {
  const page = await getPage(params.slug);
  if (!page) error(404, 'Page not found');
  return { page };
};
