import type { PageServerLoad } from './$types';
import { allPosts, postBody, render } from '$lib/content';

export const load: PageServerLoad = async () => {
  const posts = allPosts();
  const first = posts[0];
  const featured = first
    ? {
        permalink: first.permalink,
        title: first.title,
        date: first.date,
        tags: first.tags,
        html: await render(postBody(first.id)),
      }
    : null;
  return { posts, featured };
};
