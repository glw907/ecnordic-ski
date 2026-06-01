import type { PageServerLoad } from './$types';
import { allTags, postsByTag } from '$lib/content';
import { error } from '@sveltejs/kit';

export function entries() {
  return allTags().map(({ tag }) => ({ tag }));
}

export const load: PageServerLoad = ({ params }) => {
  const posts = postsByTag(params.tag);
  if (posts.length === 0) error(404, 'Tag not found');
  return { tag: params.tag, posts };
};
