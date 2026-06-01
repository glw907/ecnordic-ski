import type { PageServerLoad } from './$types';
import { allTags } from '$lib/content';

export const load: PageServerLoad = () => {
  return { tags: allTags() };
};
