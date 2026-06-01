import { renderMarkdown } from './markdown/render';
import { sanitizeHtml } from './markdown/sanitize';
import { SITE_LOCALE } from '$lib/config';

// The public page and the admin preview both render through here. renderMarkdown runs the
// directive engine (with rehype-raw passthrough); sanitizeHtml is the security floor over its
// output, allowlisting the directive vocabulary and the authored download-link anchor.
export async function markdownToHtml(content: string): Promise<string> {
  return sanitizeHtml(await renderMarkdown(content));
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

/** Returns the canonical relative URL for a tag page, e.g. /tags/training */
export function tagUrl(tag: string): string {
  return `/tags/${tag}`;
}
