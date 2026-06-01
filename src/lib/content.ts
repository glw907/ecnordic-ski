// The site's one delivery content layer. Everything public (home, tags, feeds, sitemap,
// the catch-all route) reads content through here. It builds a per-concept ContentIndex
// from the engine, using descriptors derived from the same inputs the runtime uses.
import {
  fromGlob,
  createContentIndex,
  normalizeConcepts,
  urlPolicyFrom,
  type ContentEntry,
  type ContentIndex,
  type FeedItem,
} from '@glw907/cairn-cms';
import { cairn } from './cairn.config.js';
import { siteConfig, SITE_URL, FEED_MAX_ITEMS } from './config.js';
import { markdownToHtml } from './utils.js';

export type ConceptId = 'posts' | 'pages';

/** A post as the home, archive, and tag lists consume it: summary fields plus the
 *  authored frontmatter description (ContentSummary carries a derived excerpt, not it). */
export interface PostListItem {
  id: string;
  slug: string;
  permalink: string;
  title: string;
  date: string;
  tags: string[];
  description: string;
}

const concepts = normalizeConcepts(cairn.content, urlPolicyFrom(siteConfig));
const postDesc = concepts.find((c) => c.id === 'posts')!;
const pageDesc = concepts.find((c) => c.id === 'pages')!;

const postsRaw = import.meta.glob('/src/content/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;
const pagesRaw = import.meta.glob('/src/content/pages/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const postsIndex: ContentIndex = createContentIndex(fromGlob(postsRaw), postDesc);
const pagesIndex: ContentIndex = createContentIndex(fromGlob(pagesRaw), pageDesc);

// permalink to {concept, id}, built once across both concepts. The byPermalink resolver.
const byPermalink = new Map<string, { concept: ConceptId; id: string }>();
for (const s of postsIndex.all()) byPermalink.set(s.permalink, { concept: 'posts', id: s.id });
for (const s of pagesIndex.all()) byPermalink.set(s.permalink, { concept: 'pages', id: s.id });

function toListItem(id: string): PostListItem {
  const entry = postsIndex.byId(id)!;
  return {
    id: entry.id,
    slug: entry.slug,
    permalink: entry.permalink,
    title: entry.title,
    date: entry.date ?? '',
    tags: entry.tags,
    description: (entry.frontmatter.description as string) ?? '',
  };
}

/** All non-draft posts, newest first (the index already sorts), as list items. */
export function allPosts(): PostListItem[] {
  return postsIndex.all().map((s) => toListItem(s.id));
}

/** A post's raw markdown body by id, for the home featured render and the feeds. */
export function postBody(id: string): string {
  return postsIndex.byId(id)?.body ?? '';
}

/** Posts as feed entries, newest first, capped at FEED_MAX_ITEMS (0 means all).
 *  Both feed routes render from this one list so they never drift apart. */
export async function feedItems(): Promise<FeedItem[]> {
  const posts = FEED_MAX_ITEMS > 0 ? allPosts().slice(0, FEED_MAX_ITEMS) : allPosts();
  return Promise.all(
    posts.map(async (p) => ({
      title: p.title,
      url: SITE_URL + p.permalink,
      date: p.date,
      summary: p.description,
      contentHtml: await render(postBody(p.id)),
      tags: p.tags,
    })),
  );
}

/** Non-draft posts carrying the given tag, newest first. */
export function postsByTag(tag: string): PostListItem[] {
  return postsIndex.byTag(tag).map((s) => toListItem(s.id));
}

/** Every tag across non-draft posts, with counts. */
export function allTags(): { tag: string; count: number }[] {
  return postsIndex.allTags();
}

/** Resolve a request path (with leading slash, no trailing slash) to its entry. */
export function resolvePermalink(
  path: string,
): { concept: ConceptId; entry: ContentEntry } | undefined {
  const hit = byPermalink.get(path);
  if (!hit) return undefined;
  const index = hit.concept === 'posts' ? postsIndex : pagesIndex;
  const entry = index.byId(hit.id);
  return entry ? { concept: hit.concept, entry } : undefined;
}

/** Every content permalink (posts and pages), for the catch-all entries() and the sitemap. */
export function contentPermalinks(): string[] {
  return [...byPermalink.keys()];
}

/** The site's renderer. Same function the adapter's render uses. */
export function render(md: string): Promise<string> {
  return markdownToHtml(md);
}
