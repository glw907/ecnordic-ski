import matter from 'gray-matter';
import type { PostDetail, PostSummary } from './types.js';
import { markdownToHtml } from './utils.js';
import { validatePostFrontmatter } from './content-schema.js';

// Bundled at build time — no runtime filesystem access needed.
// Keys are absolute paths like "/src/content/posts/2026-03-early-march.md"
const rawFiles = import.meta.glob<string>('/src/content/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
});

let _cachedPosts: PostSummary[] | null = null;

function parseFilepath(filepath: string): Pick<PostSummary, 'year' | 'month' | 'slug'> {
  const filename = filepath.split('/').pop()!.replace('.md', '');
  const [year, month, ...slugParts] = filename.split('-');
  return { year, month, slug: slugParts.join('-') };
}

function buildSummary(
  coords: Pick<PostSummary, 'year' | 'month' | 'slug'>,
  data: Record<string, unknown>,
  source: string
): PostSummary {
  return { ...coords, ...validatePostFrontmatter(data, source) };
}

/** Returns all non-draft posts sorted newest-first. */
export function getAllPosts(includeDrafts = false): PostSummary[] {
  if (!includeDrafts && _cachedPosts) return _cachedPosts;

  const posts: PostSummary[] = [];
  for (const [filepath, raw] of Object.entries(rawFiles)) {
    const coords = parseFilepath(filepath);
    const { data } = matter(raw);
    if (!includeDrafts && data.draft) continue;
    posts.push(buildSummary(coords, data, filepath));
  }
  const sorted = posts.sort((a, b) => b.date.localeCompare(a.date));

  if (!includeDrafts) _cachedPosts = sorted;
  return sorted;
}

/** Returns all unique tags across non-draft posts, sorted alphabetically with counts. */
export function getAllTags(): { tag: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const post of getAllPosts()) {
    for (const tag of post.tags) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
}

/** Returns all non-draft posts with the given tag, sorted newest-first. */
export function getPostsByTag(tag: string): PostSummary[] {
  return getAllPosts().filter(p => p.tags.includes(tag));
}

/** Returns a single post with rendered HTML, or null if not found. */
export async function getPost(
  year: string,
  month: string,
  slug: string
): Promise<PostDetail | null> {
  const filepath = `/src/content/posts/${year}-${month}-${slug}.md`;
  const raw = rawFiles[filepath];
  if (!raw) return null;

  const { data, content } = matter(raw);

  return {
    ...buildSummary({ year, month, slug }, data, filepath),
    html: await markdownToHtml(content)
  };
}
