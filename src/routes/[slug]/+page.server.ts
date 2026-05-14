import { error } from '@sveltejs/kit';
import { getPage } from '$lib/pages';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const page = await getPage(params.slug);
  if (!page) error(404, 'Page not found');
  return { page };
};
