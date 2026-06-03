// The site's one delivery content layer. Everything public (home, tags, feeds, sitemap,
// the catch-all route) reads content through here. It globs the markdown and hands the
// adapter to createSiteIndexes, which builds the typed per-concept indexes and the site
// resolver, and exposes a link resolver for the cairn: tokens the renderer threads.
import { createSiteIndexes, buildLinkResolver } from '@glw907/cairn-cms/delivery';
import { parseSiteConfig } from '@glw907/cairn-cms';
import { cairn } from './cairn.config.js';
import siteYaml from './site.config.yaml?raw';
import { SITE_URL, SITE_DESCRIPTION as DESC } from './config.js';

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

const siteConfig = parseSiteConfig(siteYaml);
const indexes = createSiteIndexes(cairn, siteConfig, { posts: postsRaw, pages: pagesRaw });

export const site = indexes.site;
export const posts = indexes.posts;
export const pages = indexes.pages;
export const ORIGIN = SITE_URL;
export const SITE_DESCRIPTION = DESC;

/** A post as the home and archive lists render it: the engine summary plus the authored
 *  description (ContentSummary carries a derived excerpt, not the authored summary field). */
export interface PostListItem {
  id: string;
  slug: string;
  permalink: string;
  title: string;
  date: string;
  tags: string[];
  description: string;
}

/** Map a post entry to a PostListItem, re-reading the authored description from the typed entry. */
function toItem(s: { id: string }): PostListItem {
  const e = posts.byId(s.id)!;
  return {
    id: e.id,
    slug: e.slug,
    permalink: e.permalink,
    title: e.title,
    date: e.date ?? '',
    tags: e.tags,
    description: e.frontmatter.description ?? '',
  };
}

/** All non-draft posts, newest first, as the home and archive lists consume them. */
export function postList(): PostListItem[] {
  return posts.all().map(toItem);
}

/** Non-draft posts carrying the given tag, newest first, as list items. */
export function postListByTag(tag: string): PostListItem[] {
  return posts.byTag(tag).map(toItem);
}

/** The resolver the home featured render and the feeds thread so cairn: links resolve. */
export const linkResolver = buildLinkResolver(site);
