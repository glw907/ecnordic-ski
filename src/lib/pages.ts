import matter from 'gray-matter';
import type { StaticPage } from './types.js';
import { markdownToHtml } from './utils.js';
import { validatePageFrontmatter } from './content-schema.js';

const rawFiles = import.meta.glob<string>('/src/content/pages/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
});

const _cachedPages = new Map<string, StaticPage>();

/** Every page slug, derived from the bundled content filenames. Drives prerender entries(). */
export function getPageSlugs(): string[] {
  return Object.keys(rawFiles).map((path) => path.split('/').pop()!.replace('.md', ''));
}

export async function getPage(slug: string): Promise<StaticPage | null> {
  if (_cachedPages.has(slug)) return _cachedPages.get(slug)!;

  const filepath = `/src/content/pages/${slug}.md`;
  const raw = rawFiles[filepath];
  if (!raw) return null;

  const { data, content } = matter(raw);
  const page: StaticPage = {
    slug,
    ...validatePageFrontmatter(data, filepath),
    html: await markdownToHtml(content),
  };
  _cachedPages.set(slug, page);
  return page;
}
