import { describe, it, expect } from 'vitest';
import {
  allPosts,
  allTags,
  postsByTag,
  resolvePermalink,
  contentPermalinks,
} from '$lib/content';

describe('content layer', () => {
  it('lists posts with the frontmatter description and the engine permalink', () => {
    const posts = allPosts();
    const welcome = posts.find((p) => p.id === '2026-05-welcome');
    expect(welcome).toBeDefined();
    expect(welcome!.permalink).toBe('/2026/05/welcome');
    expect(welcome!.slug).toBe('welcome');
    expect(welcome!.date).toBe('2026-05-14');
    expect(typeof welcome!.description).toBe('string');
    expect(welcome!.description.length).toBeGreaterThan(0);
  });

  it('resolves a post permalink to its entry', () => {
    const hit = resolvePermalink('/2026/05/welcome');
    expect(hit?.concept).toBe('posts');
    expect(hit?.entry.id).toBe('2026-05-welcome');
    expect(typeof hit?.entry.body).toBe('string');
  });

  it('resolves a page permalink to its entry', () => {
    const hit = resolvePermalink('/about');
    expect(hit?.concept).toBe('pages');
    expect(hit?.entry.id).toBe('about');
  });

  it('returns undefined for an unknown path', () => {
    expect(resolvePermalink('/no/such/path')).toBeUndefined();
  });

  it('lists every content permalink for prerender and the sitemap', () => {
    const all = contentPermalinks();
    expect(all).toContain('/2026/05/welcome');
    expect(all).toContain('/about');
    expect(all).toContain('/training');
  });

  it('exposes tags with counts and posts by tag', () => {
    expect(allTags()).toContainEqual({ tag: 'announcements', count: 1 });
    expect(postsByTag('announcements').some((p) => p.id === '2026-05-welcome')).toBe(true);
  });
});
