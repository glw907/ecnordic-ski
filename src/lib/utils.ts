import { SITE_LOCALE } from '$lib/config';
import type { PostSummary, CalendarEvent } from '$lib/types';

// Parses YYYY-MM-DD as UTC — avoids timezone shift from bare date string parsing.
function parseUtcDate(iso: string): Date {
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

/** Returns a formatted date range string for a calendar event. */
export function eventDateRange(event: CalendarEvent): string {
  if (event.start === event.end) return formatDate(event.start);
  return `${formatDate(event.start)} – ${formatDate(event.end)}`;
}
