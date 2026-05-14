import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import type { StaticPage } from './types.js';

const rawFiles = import.meta.glob<string>('/src/content/pages/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
});

export async function getPage(slug: string): Promise<StaticPage | null> {
  const filepath = `/src/content/pages/${slug}.md`;
  const raw = rawFiles[filepath];
  if (!raw) return null;

  const { data, content } = matter(raw);
  const processed = await remark().use(remarkGfm).use(remarkHtml).process(content);

  return {
    slug,
    title: String(data.title ?? slug),
    html: processed.toString(),
  };
}
