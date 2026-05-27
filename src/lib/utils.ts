import { renderMarkdown } from './markdown/render';
import { SITE_LOCALE } from '$lib/config';
import type { PostSummary } from '$lib/types';

export async function markdownToHtml(content: string): Promise<string> {
  return renderMarkdown(content);
}

export function isoFromValue(value: unknown, fallback?: string): string {
  // gray-matter parses bare YAML dates as UTC midnight Date objects
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'string' && value) return value.slice(0, 10);
  return fallback ?? '';
}

// Parses YYYY-MM-DD as UTC to avoid timezone shift from bare date string parsing.
export function parseUtcDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatDate(iso: string): string {
  return parseUtcDate(iso).toLocaleDateString(SITE_LOCALE, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatShortDate(iso: string): string {
  return parseUtcDate(iso).toLocaleDateString(SITE_LOCALE, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function toRFC822(iso: string): string {
  return parseUtcDate(iso).toUTCString();
}

export function toISODateTime(iso: string): string {
  return iso + 'T00:00:00Z';
}

/** Returns the canonical relative URL for a post, e.g. /2026/05/spring-dryland/ */
export function postUrl(post: Pick<PostSummary, 'year' | 'month' | 'slug'>): string {
  return `/${post.year}/${post.month}/${post.slug}/`;
}

/** Returns the canonical relative URL for a tag page, e.g. /tags/training/ */
export function tagUrl(tag: string): string {
  return `/tags/${tag}/`;
}
