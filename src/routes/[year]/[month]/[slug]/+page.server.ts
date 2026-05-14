import { error } from '@sveltejs/kit';
import { getPost } from '$lib/posts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const post = await getPost(params.year, params.month, params.slug);
  if (!post) error(404, 'Post not found');
  return { post };
};
