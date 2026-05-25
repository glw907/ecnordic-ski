import type { LayoutServerLoad } from './$types';

// The admin surface is dynamic and must never be prerendered, indexed, or Pagefind-crawled.
export const prerender = false;

export const load: LayoutServerLoad = ({ locals }) => {
  return { editor: locals.editor };
};
